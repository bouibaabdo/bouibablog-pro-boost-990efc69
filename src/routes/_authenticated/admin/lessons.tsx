import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Loader2,
  Trash2,
  Upload,
  PlayCircle,
  UploadCloud,
  CheckCircle2,
  X,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/lessons")({
  component: AdminLessons,
});

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500 MB

type UploadStage = "idle" | "uploading" | "uploaded" | "publishing" | "done";

function AdminLessons() {
  const [items, setItems] = useState<any[] | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function refresh() {
    const list = await adminListLessons();
    setItems(list as any[]);
  }
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const acceptFile = useCallback((f: File | null | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      toast.error("يُرجى اختيار ملف فيديو صالح");
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      toast.error(
        `حجم الملف ${(f.size / (1024 * 1024)).toFixed(1)}MB يتجاوز 500MB. اضغطه إلى 720p.`,
      );
      return;
    }
    setFile(f);
    setStage("idle");
    setProgress(0);
    setUploadedPath(null);
    setDuration(null);
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  }

  function resetAll() {
    setFile(null);
    setPreviewUrl(null);
    setStage("idle");
    setProgress(0);
    setUploadedPath(null);
    setDuration(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function onUpload() {
    if (!file) return toast.error("اختر ملف فيديو");
    setStage("uploading");
    setProgress(0);

    // Fake smooth progress (Supabase JS v2 doesn't expose progress events reliably)
    const timer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(1, Math.round((95 - p) / 15)) : p));
    }, 400);

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

      // Read duration
      let dur: number | null = null;
      try {
        dur = await new Promise<number>((resolve, reject) => {
          const v = document.createElement("video");
          v.preload = "metadata";
          v.onloadedmetadata = () => resolve(Math.round(v.duration));
          v.onerror = () => reject();
          v.src = URL.createObjectURL(file);
        });
      } catch {}

      setUploadedPath(path);
      setDuration(dur);
      setProgress(100);
      setStage("uploaded");
      toast.success("تم رفع الفيديو. أكمل التفاصيل ثم اضغط نشر.");
    } catch (e: any) {
      toast.error(e?.message ?? "فشل الرفع");
      setStage("idle");
      setProgress(0);
    } finally {
      clearInterval(timer);
    }
  }

  async function onPublish() {
    if (!uploadedPath) return toast.error("ارفع الفيديو أولًا");
    if (!title.trim()) return toast.error("أضف عنوانًا للدرس");
    setStage("publishing");
    try {
      await createLesson({
        data: {
          title: title.trim(),
          description: description.trim() || null,
          category: category.trim() || null,
          video_path: uploadedPath,
          thumbnail_url: thumbnailUrl.trim() || null,
          duration_seconds: duration,
          sort_order: 0,
          published: true,
        },
      });
      toast.success("تم نشر الدرس");
      setStage("done");
      setTitle("");
      setDescription("");
      setCategory("");
      setThumbnailUrl("");
      resetAll();
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "فشل النشر");
      setStage("uploaded");
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

  const uploading = stage === "uploading";
  const publishing = stage === "publishing";
  const readyToPublish = stage === "uploaded" || stage === "publishing";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">دروس الفيديو</h2>
        <p className="text-muted-foreground text-sm mt-1">
          اسحب الفيديو، ارفعه، ثم أضف التفاصيل واضغط نشر.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">إضافة درس جديد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !file && fileInput.current?.click()}
            className={cn(
              "relative rounded-xl border-2 border-dashed transition-colors",
              "p-6 sm:p-8 text-center cursor-pointer",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/60 hover:bg-muted/40",
              file && "cursor-default",
            )}
          >
            <input
              ref={fileInput}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />

            {!file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 grid place-items-center">
                  <UploadCloud className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold">اسحب وأفلت الفيديو هنا</p>
                <p className="text-sm text-muted-foreground">
                  أو اضغط لاختيار ملف من جهازك (حتى 500MB)
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-center text-start">
                {previewUrl && (
                  <video
                    src={previewUrl}
                    className="h-28 w-44 rounded-lg bg-black object-cover shrink-0"
                    muted
                    playsInline
                  />
                )}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                        {duration ? ` · ${Math.round(duration / 60)} د` : ""}
                      </p>
                    </div>
                    {stage === "idle" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetAll();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {readyToPublish && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="h-4 w-4" /> تم الرفع
                      </span>
                    )}
                  </div>
                  {(uploading || readyToPublish) && (
                    <div className="mt-3 space-y-1">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {uploading ? `جارٍ الرفع... ${progress}%` : "جاهز للنشر"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {file && stage === "idle" && (
            <Button onClick={onUpload} className="gap-2 w-full sm:w-auto">
              <Upload className="h-4 w-4" />
              رفع الفيديو
            </Button>
          )}

          {uploading && (
            <Button disabled className="gap-2 w-full sm:w-auto">
              <Loader2 className="h-4 w-4 animate-spin" />
              جارٍ الرفع...
            </Button>
          )}

          {/* Details — enabled after upload */}
          <div
            className={cn(
              "space-y-4 transition-opacity",
              !readyToPublish && "opacity-50 pointer-events-none",
            )}
          >
            <div className="grid gap-2">
              <Label>العنوان *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: مقدمة في ChatGPT"
              />
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

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={onPublish}
                disabled={!readyToPublish || publishing || !title.trim()}
                className="gap-2"
                size="lg"
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {publishing ? "جارٍ النشر..." : "نشر الدرس"}
              </Button>
              {readyToPublish && !publishing && (
                <Button variant="ghost" onClick={resetAll}>
                  إلغاء
                </Button>
              )}
            </div>
          </div>
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
                      {l.category ?? "—"}
                      {l.duration_seconds ? ` · ${Math.round(l.duration_seconds / 60)} د` : ""}
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
