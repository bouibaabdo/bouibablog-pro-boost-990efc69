import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

const SIGN_EXPIRY = 60 * 60 * 24; // 24h

type LessonRow = {
  id?: string;
  title?: string;
  description?: string | null;
  category?: string | null;
  video_path: string;
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  created_at?: string;
  published?: boolean;
  sort_order?: number | null;
};

type SignedLessonRow = LessonRow & {
  video_url: string | null;
  thumbnail_url: string | null;
};

async function resolveGCSOrSupabaseUrl(
  storageClient: SupabaseClient<Database>,
  bucketName: string,
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;

  // 1. External HTTP/HTTPS URLs
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 2. Google Cloud Storage (GCS) URLs: gcs://bucket-name/object-path
  if (path.startsWith("gcs://")) {
    const match = path.match(/^gcs:\/\/([^\/]+)\/(.+)$/);
    if (match) {
      const [_, gcsBucket, objectPath] = match;
      const clientEmail = process.env.GCS_CLIENT_EMAIL;
      const privateKey = process.env.GCS_PRIVATE_KEY;

      if (!clientEmail || !privateKey) {
        // Fallback to CDN or public URL
        const cdnDomain = process.env.GCS_CDN_DOMAIN;
        return cdnDomain
          ? `https://${cdnDomain}/${objectPath}`
          : `https://storage.googleapis.com/${gcsBucket}/${objectPath}`;
      }

      try {
        const { Storage } = await import("@google-cloud/storage");
        const storage = new Storage({
          credentials: {
            client_email: clientEmail,
            private_key: privateKey.replace(/\\n/g, "\n"),
          },
        });
        const [url] = await storage
          .bucket(gcsBucket)
          .file(objectPath)
          .getSignedUrl({
            version: "v4",
            action: "read",
            expires: Date.now() + SIGN_EXPIRY * 1000,
          });
        return url;
      } catch (err) {
        console.warn("GCS URL sign failed, falling back to public url:", err);
        return `https://storage.googleapis.com/${gcsBucket}/${objectPath}`;
      }
    }
  }

  // 3. Supabase Storage URLs
  try {
    const res = await storageClient.storage
      .from(bucketName)
      .createSignedUrl(path, SIGN_EXPIRY)
      .catch(() => ({ data: { signedUrl: path } }));
    return res.data?.signedUrl ?? path;
  } catch (err) {
    console.warn(`Supabase Storage sign failed for bucket ${bucketName}:`, err);
    return path;
  }
}

async function signRows(storageClient: SupabaseClient<Database>, rows: LessonRow[]) {
  return Promise.all(
    rows.map(async (r) => {
      const [videoUrl, thumbnailUrl] = await Promise.all([
        resolveGCSOrSupabaseUrl(storageClient, "lessons", r.video_path),
        resolveGCSOrSupabaseUrl(storageClient, "lessons", r.thumbnail_path),
      ]);

      return {
        ...r,
        video_url: videoUrl ?? r.video_path ?? null,
        thumbnail_url: thumbnailUrl ?? r.thumbnail_url ?? null,
      } satisfies SignedLessonRow;
    }),
  );
}

// Public list
export const listLessons = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, title, description, category, video_path, thumbnail_path, thumbnail_url, duration_seconds, created_at",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return signRows(supabase, data ?? []);
});

async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

// Admin list (all)
export const adminListLessons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("lessons")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return signRows(context.supabase, data ?? []);
  });

export const createLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z
      .object({
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional().nullable(),
        category: z.string().max(80).optional().nullable(),
        video_path: z.string().min(1),
        thumbnail_path: z.string().optional().nullable(),
        thumbnail_url: z.string().url().optional().nullable(),
        duration_seconds: z.number().int().nonnegative().optional().nullable(),
        sort_order: z.number().int().default(0),
        published: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("lessons").insert(data);
    if (error) throw error;
    return { ok: true };
  });

export const updateLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(2000).optional().nullable(),
        category: z.string().max(80).optional().nullable(),
        thumbnail_url: z.string().url().optional().nullable(),
        thumbnail_path: z.string().optional().nullable(),
        duration_seconds: z.number().int().nonnegative().optional().nullable(),
        sort_order: z.number().int().optional(),
        published: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("lessons").update(patch).eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z
      .object({
        id: z.string().uuid(),
        video_path: z.string(),
        thumbnail_path: z.string().optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const paths = [data.video_path, data.thumbnail_path].filter(
      (p): p is string =>
        !!p && !p.startsWith("gcs://") && !p.startsWith("http://") && !p.startsWith("https://"),
    );
    if (paths.length > 0) {
      await context.supabase.storage.from("lessons").remove(paths);
    }
    const { error } = await context.supabase.from("lessons").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
