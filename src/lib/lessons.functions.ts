import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SIGN_EXPIRY = 60 * 60 * 24; // 24h

async function signUrls<T extends { video_path: string }>(
  supabase: any,
  rows: T[],
): Promise<Array<T & { video_url: string | null }>> {
  return Promise.all(
    rows.map(async (r) => {
      const { data } = await supabase.storage
        .from("lessons")
        .createSignedUrl(r.video_path, SIGN_EXPIRY);
      return { ...r, video_url: data?.signedUrl ?? null };
    }),
  );
}

// Public list
export const listLessons = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(process.env.SUPABASE_URL!, key, {
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
    .select("id, title, description, category, video_path, thumbnail_url, duration_seconds, created_at")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return signUrls(supabase, data ?? []);
});

async function assertAdmin(context: { supabase: any; userId: string }) {
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
    return signUrls(context.supabase, data ?? []);
  });

export const createLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional().nullable(),
        category: z.string().max(80).optional().nullable(),
        video_path: z.string().min(1),
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
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(2000).optional().nullable(),
        category: z.string().max(80).optional().nullable(),
        thumbnail_url: z.string().url().optional().nullable(),
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
  .inputValidator((d) => z.object({ id: z.string().uuid(), video_path: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.storage.from("lessons").remove([data.video_path]);
    const { error } = await context.supabase.from("lessons").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
