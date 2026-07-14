import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  adminListLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/lib/lessons.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/lessons")({
  component: AdminLessons,
});

function AdminLessons() {
  const [items, setItems] = useState<any[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  async function refresh() {
    const list = await adminListLessons();
    setItems(list as any[]);
  }
  useEffect(() => {
    refresh();
  }, []);

  const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500 MB

  async function onUpload() {
    if (!file) return toast.error("اختر ملف فيديو");
    if (!title.trim()) return toast.error("أضف عنوانًا");
    if (file.size > MAX_UPLOAD_BYTES) {
      return toast.error(
        `حجم الملف ${(file.size / (1024 * 1024)).toFixed(1)}MB يتجاوز الحد الأقصى 500MB. يُنصح بضغط الفيديو إلى 720p.`
      );
    }
    setUploading(true);
    setProgress(0);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("lessons")
        .upload(path, file, {
          contentType: file.type || "video/mp4",
          upsert: false,
        });
      if (error) throw error;
      setProgress(100);

      // Try to read duration
      let duration_seconds: number | null = null;
      try {
        duration_seconds = await new Promise<number>((resolve, reject) => {
          const v = document.createElement("video");
          v.preload = "metadata";
          v.onloadedmetadata = () => resolve(Math.round(v.duration));
          v.onerror = () => reject();
          v.src = URL.createObjectURL(file);
        });
      } catch {}

      await createLesson({
        data: {
          title: title.trim(),
          description: description.trim() || null,
          category: category.trim() || null,
          video_path: path,
          thumbnail_url: thumbnailUrl.trim() || null,
          duration_seconds,
          sort_order: 0,
          published: true,
        },
      });
      toast.success("تم رفع الدرس");
      setTitle("");
      setDescription("");
      setCategory("");
      setThumbnailUrl("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "فشل الرفع");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function onTogglePublish(l: any) {
    try {
      await updateLesson({ data: { id: l.id, published: !l.published } });
      await refresh();
    } catch {
      toast.error("فشل التحديث");
    }
  }

  async function onDelete(l: any) {
    if (!confirm(`حذف "${l.title}" نهائيًا؟`)) return;
    try {
      await deleteLesson({ data: { id: l.id, video_path: l.video_path } });
      toast.success("تم الحذف");
      await refresh();
    } catch {
      toast.error("فشل الحذف");
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">دروس الفيديو</h2>
        <p className="text-muted-foreground text-sm mt-1">
          ارفع فيديوهات من جهازك وستظهر مباشرة في صفحة{" "}
          <code className="text-primary">/lessons</code>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">إضافة درس جديد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>العنوان *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مقدمة في ChatGPT" />
          </div>
          <div className="grid gap-2">
            <Label>الوصف</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="وصف مختصر عن محتوى الدرس"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>التصنيف</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثال: ChatGPT، Midjourney..."
              />
            </div>
            <div className="grid gap-2">
              <Label>رابط الصورة المصغّرة (اختياري)</Label>
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>ملف الفيديو *</Label>
            <Input
              ref={fileInput}
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} — {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            )}
          </div>
          <Button onClick={onUpload} disabled={uploading} className="gap-2">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? `جارٍ الرفع... ${progress}%` : "رفع ونشر"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">الدروس المنشورة</CardTitle>
        </CardHeader>
        <CardContent>
          {items === null ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد دروس بعد.</p>
          ) : (
            <div className="divide-y">
              {items.map((l) => (
                <div key={l.id} className="py-3 flex items-center gap-3">
                  <div className="h-14 w-24 rounded overflow-hidden bg-muted shrink-0 grid place-items-center">
                    {l.thumbnail_url ? (
                      <img src={l.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <PlayCircle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {l.category ?? "—"} · {l.duration_seconds ? `${Math.round(l.duration_seconds / 60)} د` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch checked={l.published} onCheckedChange={() => onTogglePublish(l)} />
                      <span className="text-xs text-muted-foreground">
                        {l.published ? "منشور" : "مخفي"}
                      </span>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(l)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
