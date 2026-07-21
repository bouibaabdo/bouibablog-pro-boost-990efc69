/* eslint-disable @typescript-eslint/no-explicit-any, no-empty */
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
import { YOUTUBE_AI_MASTERY } from "@/lib/course-manifests/youtube-ai-mastery";
import {
  Loader2,
  Trash2,
  Upload,
  PlayCircle,
  UploadCloud,
  CheckCircle2,
  X,
  RefreshCw,
  Pencil,
  Youtube,
  Plus,
  Video,
  FileText,
  ExternalLink,
  Sparkles,
  BookOpen,
  Layers3,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/lessons")({
  component: AdminLessons,
});

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500 MB

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

async function captureThumb(file: File, atSec: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.src = url;
    const cleanup = () => URL.revokeObjectURL(url);
    v.onloadedmetadata = () => {
      const target = Math.min(Math.max(0.1, atSec), Math.max(0.1, v.duration - 0.1));
      v.currentTime = target;
    };
    v.onseeked = () => {
      try {
        const w = 640;
        const h = Math.round((v.videoHeight / v.videoWidth) * w) || 360;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return (resolve(null), cleanup());
        ctx.drawImage(v, 0, 0, w, h);
        canvas.toBlob(
          (b) => {
            cleanup();
            resolve(b);
          },
          "image/jpeg",
          0.82,
        );
      } catch {
        cleanup();
        resolve(null);
      }
    };
    v.onerror = () => {
      cleanup();
      resolve(null);
    };
  });
}

function AdminLessons() {
  const [items, setItems] = useState<any[] | null>(null);
  const [addMode, setAddMode] = useState<"youtube" | "upload">("youtube");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("دورات الذكاء الاصطناعي");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Edit dialog state
  const [editing, setEditing] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editVideoPath, setEditVideoPath] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Upload video file state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [thumbPath, setThumbPath] = useState<string | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [thumbBlob, setThumbBlob] = useState<Blob | null>(null);
  const [thumbAt, setThumbAt] = useState(1);
  const [duration, setDuration] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function refresh() {
    try {
      const list = await adminListLessons();
      setItems(list as any[]);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const acceptFile = useCallback((f: File | null | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      toast.error("يُرجى اختيار ملف فيديو صالح");
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      toast.error(`حجم الملف ${(f.size / (1024 * 1024)).toFixed(1)}MB يتجاوز 500MB.`);
      return;
    }
    setFile(f);
    setProgress(0);
    setUploadedPath(null);
  }, []);

  useEffect(() => {
    if (!file) return;
    (async () => {
      try {
        const dur = await new Promise<number>((resolve, reject) => {
          const v = document.createElement("video");
          v.preload = "metadata";
          v.onloadedmetadata = () => resolve(Math.round(v.duration));
          v.onerror = () => reject();
          v.src = URL.createObjectURL(file);
        });
        setDuration(dur);
        const at = Math.min(2, Math.max(0.5, dur / 20));
        setThumbAt(at);
        const b = await captureThumb(file, at);
        if (b) {
          setThumbBlob(b);
          setThumbPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(b);
          });
        }
      } catch {}
    })();
  }, [file]);

  // Publish YouTube Course Lesson
  async function publishYouTubeLesson() {
    if (!youtubeUrl.trim()) return toast.error("يرجى وضع رابط فيديو YouTube أولاً");
    if (!title.trim()) return toast.error("يرجى كتابة عنوان الدرس");

    const ytId = extractYouTubeId(youtubeUrl.trim());
    if (!ytId) return toast.error("رابط YouTube غير صحيح، يرجى التأكد من الرابط");

    const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

    setPublishing(true);
    try {
      await createLesson({
        data: {
          title: title.trim(),
          description: description.trim() || null,
          category: category.trim() || "دورات YouTube",
          video_path: youtubeUrl.trim(),
          thumbnail_path: null,
          thumbnail_url: thumbUrl,
          duration_seconds: duration || 600,
          sort_order: 0,
          published: true,
        },
      });
      toast.success("تم نشر دورة YouTube بنجاح!");
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "فشل نشر الدرس");
    } finally {
      setPublishing(false);
    }
  }

  // Publish Uploaded Video Lesson
  async function publishUploadedLesson() {
    if (!file) return toast.error("اختر ملف الفيديو أولاً");
    if (!title.trim()) return toast.error("أدخل عنوان الدرس");

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const base = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const path = `${base}.${ext}`;

      const { error } = await supabase.storage.from("lessons").upload(path, file, {
        contentType: file.type || "video/mp4",
        upsert: false,
      });
      if (error) throw error;

      let tPath: string | null = null;
      if (thumbBlob) {
        tPath = `thumbs/${base}.jpg`;
        await supabase.storage.from("lessons").upload(tPath, thumbBlob, { contentType: "image/jpeg", upsert: true });
      }

      await createLesson({
        data: {
          title: title.trim(),
          description: description.trim() || null,
          category: category.trim() || "دروس فيديو",
          video_path: path,
          thumbnail_path: tPath,
          thumbnail_url: null,
          duration_seconds: duration,
          sort_order: 0,
          published: true,
        },
      });

      toast.success("تم رفع ونشر الدرس بنجاح!");
      setTitle("");
      setDescription("");
      setFile(null);
      setUploadedPath(null);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "فشل الرفع والنشر");
    } finally {
      setUploading(false);
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
    if (!confirm(`حذف الدرس "${l.title}" نهائياً؟`)) return;
    try {
      await deleteLesson({
        data: { id: l.id, video_path: l.video_path, thumbnail_path: l.thumbnail_path },
      });
      toast.success("تم حذف الدرس");
      await refresh();
    } catch {
      toast.error("فشل الحذف");
    }
  }

  function openEdit(l: any) {
    setEditing(l);
    setEditTitle(l.title ?? "");
    setEditDescription(l.description ?? "");
    setEditCategory(l.category ?? "");
    setEditVideoPath(l.video_path ?? "");
    setEditPublished(!!l.published);
  }

  async function onSaveEdit() {
    if (!editing) return;
    if (!editTitle.trim()) return toast.error("العنوان مطلوب");
    setSavingEdit(true);
    try {
      await updateLesson({
        data: {
          id: editing.id,
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          category: editCategory.trim() || null,
          published: editPublished,
        },
      });
      toast.success("تم حفظ التعديلات بنجاح!");
      setEditing(null);
      await refresh();
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight flex items-center gap-2">
            <Youtube className="h-6 w-6 text-rose-500" />
            إدارة دورات YouTube وفيديوهات الدروس
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            أضف وعدّل دورات YouTube ورفع الدروس والفيديوهات والوثائق المصاحبة بكل سهولة.
          </p>
        </div>
      </div>

      {/* Course Creator Form */}
      <Card className="p-6 shadow-card border border-border/80">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
          <Button
            variant={addMode === "youtube" ? "default" : "outline"}
            onClick={() => setAddMode("youtube")}
            className="gap-2 font-bold"
          >
            <Youtube className="h-4 w-4 text-rose-500" />
            إضافة عبر رابط YouTube
          </Button>
          <Button
            variant={addMode === "upload" ? "default" : "outline"}
            onClick={() => setAddMode("upload")}
            className="gap-2 font-bold"
          >
            <UploadCloud className="h-4 w-4 text-primary" />
            رفع فيديو مباشر (Up to 500MB)
          </Button>
        </div>

        <div className="space-y-4 max-w-3xl">
          {addMode === "youtube" ? (
            <div className="space-y-2">
              <Label className="text-xs font-bold">رابط فيديو YouTube (Direct YouTube Link)</Label>
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=XXXXXX أو https://youtu.be/XXXXXX"
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  const ytId = extractYouTubeId(e.target.value);
                  if (ytId && !title) {
                    setTitle(`درس جديد - YouTube`);
                  }
                }}
                className="dir-ltr text-sm font-mono"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs font-bold">ملف الفيديو (Video File)</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => acceptFile(e.target.files?.[0])}
                className="text-xs"
              />
              {file && (
                <p className="text-xs text-emerald-600 font-bold">
                  تم اختيار: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold">عنوان الدرس / الدورة *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان الدرس الجذاب..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">اسم الدورة / التصنيف</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثال: دورة n8n الشاملة, دورة الذكاء الاصطناعي..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold">وصف الدرس والوثائق المصاحبة</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب شرحاً مختصراً للدرس وروابط المرفقات والملفات..."
              rows={3}
            />
          </div>

          <div className="pt-2">
            {addMode === "youtube" ? (
              <Button
                onClick={publishYouTubeLesson}
                disabled={publishing}
                className="gap-2 font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                نشر دورة YouTube فوراً
              </Button>
            ) : (
              <Button
                onClick={publishUploadedLesson}
                disabled={uploading}
                className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                رفع ونشر الدرس
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Featured Course Modules (#course-modules) */}
      <Card className="shadow-card border border-border/80">
        <CardHeader className="py-4 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-primary" />
              <span>هيكل ووحدات الدورة الرئيسية (Featured Course Modules — #course-modules)</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {YOUTUBE_AI_MASTERY.title}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-muted border border-border/60">
            <div className="space-y-1">
              <h3 className="font-bold text-lg">{YOUTUBE_AI_MASTERY.title}</h3>
              <p className="text-xs text-muted-foreground">{YOUTUBE_AI_MASTERY.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" asChild className="gap-1.5 font-semibold text-xs">
                <a href="/lessons#course-modules" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                  معاينة صفحة العرض الحية
                </a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {YOUTUBE_AI_MASTERY.modules.map((mod, idx) => (
              <div key={mod.title} className="rounded-2xl border border-border/70 p-4 space-y-3 bg-card shadow-soft">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm leading-tight">{mod.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.summary}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  {mod.lessons.map((les) => {
                    const isDoc = /\.(txt|md|pdf)$/i.test(les);
                    return (
                      <div key={les} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-muted/30">
                        <span className="flex items-center gap-1.5 truncate">
                          {isDoc ? <FileText className="h-3.5 w-3.5 text-amber-500" /> : <Video className="h-3.5 w-3.5 text-rose-500" />}
                          <span className="truncate">{les}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                          {isDoc ? "مستند" : "فيديو"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className="pt-4 border-t border-border/60">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">الوثائق والملفات المرفقة (Course Resources)</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {YOUTUBE_AI_MASTERY.resources.map((res) => (
                <div key={res.title} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold">{res.title}</p>
                    <p className="text-[11px] text-muted-foreground">{res.description}</p>
                  </div>
                  <Button size="sm" variant="ghost" asChild className="h-7 px-2">
                    <a href={res.href} download target="_blank" rel="noopener noreferrer" className="gap-1 text-[11px] font-bold">
                      <Download className="h-3.5 w-3.5 text-primary" />
                      تنزيل
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses & Lessons Catalog */}
      <Card className="shadow-card border border-border/80">
        <CardHeader className="py-4 border-b border-border/60">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>سجل الدورات والدروس المتاحة ({items?.length ?? 0})</span>
            <span className="text-xs text-muted-foreground font-normal">يتم تحديث الجلسات فورياً</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items === null ? (
            <div className="p-10 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <span className="text-sm text-muted-foreground">جاري تحميل الدورات والدروس...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              لا توجد دورات أو دروس مضافة حالياً.
            </div>
          ) : (
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((l: any) => (
                <div
                  key={l.id}
                  className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-border/60 group">
                      {l.thumbnail_url ? (
                        <img src={l.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Video className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="h-10 w-10 text-white" />
                      </div>
                      {l.published ? (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                          منشور
                        </span>
                      ) : (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                          مسودة
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="inline-block text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {l.category || "عام"}
                      </span>
                      <h4 className="font-bold text-base leading-snug line-clamp-2">{l.title}</h4>
                      {l.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {l.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => openEdit(l)} className="h-8 px-2.5 text-xs font-bold gap-1">
                        <Pencil className="h-3.5 w-3.5 text-primary" />
                        تعديل
                      </Button>

                      {l.video_url && (
                        <Button size="sm" variant="ghost" asChild className="h-8 px-2 text-xs">
                          <a href={l.video_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                            مشاهدة
                          </a>
                        </Button>
                      )}
                    </div>

                    <Button size="sm" variant="ghost" onClick={() => onDelete(l)} className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">تعديل تفاصيل الدرس / الدورة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold">العنوان *</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">التصنيف / اسم الدورة</Label>
              <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">الوصف وروابط الوثائق المصاحبة</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} />
            </div>

            <div className="flex items-center justify-between border p-3 rounded-xl">
              <Label className="text-xs font-bold">نشر الدرس وتفعيله على الموقع</Label>
              <Switch checked={editPublished} onCheckedChange={setEditPublished} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              إلغاء
            </Button>

            <Button onClick={onSaveEdit} disabled={savingEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
              {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
