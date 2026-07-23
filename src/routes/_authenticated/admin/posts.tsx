/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPosts, optimizeBloggerImage } from "@/lib/blogger.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ExternalLink,
  Pencil,
  Loader2,
  Plus,
  Search,
  Eye,
  Check,
  FileText,
  ImageIcon,
  Sparkles,
  Heading,
  Bold,
  Italic,
  Code,
  List,
  Quote,
  ArrowRight,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/posts")({
  component: AdminPosts,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0621-\u064A\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function AdminPosts() {
  const [posts, setPosts] = useState<any[] | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "editor">("list");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Editor State (WordPress-style)
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("n8n");
  const [tagsInput, setTagsInput] = useState("n8n, أتمتة, AI");
  const [excerpt, setExcerpt] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [previewMode, setPreviewMode] = useState<"editor" | "split" | "preview">("split");

  useEffect(() => {
    fetchPostsList();
  }, []);

  const fetchPostsList = () => {
    getPosts({ data: { max: 50 } })
      .then((p: any) => setPosts(Array.isArray(p) ? p : (p?.posts ?? [])))
      .catch(() => setPosts([]));
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPostId) {
      setSlug(slugify(val));
    }
  };

  const openNewPostEditor = () => {
    setEditingPostId(null);
    setTitle("");
    setSlug("");
    setCategory("الذكاء الاصطناعي");
    setTagsInput("AI, أتمتة, دروس");
    setExcerpt("");
    setThumbnail("");
    setContentHtml(`# اكتب عنوان المقال الفرعي هنا\n\nاكتب محتوى المقال التعليمي باللغة العربية مع تفاصيل عملية ونقاط واضحة.`);
    setActiveTab("editor");
  };

  const editPost = (post: any) => {
    try {
      setEditingPostId(post.id || null);
      setTitle(post.title || "");
      setSlug(post.slug || slugify(post.title || ""));
      const labels = Array.isArray(post.labels) ? post.labels : [];
      setCategory(labels[0] || "الذكاء الاصطناعي");
      setTagsInput(labels.length > 0 ? labels.join(", ") : "AI, أتمتة");
      setExcerpt(post.excerpt || "");
      setThumbnail(post.thumbnail || "");
      setContentHtml(post.contentHtml || post.excerpt || "");
      setActiveTab("editor");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      toast.error("تعذر فتح المقال للتعديل");
    }
  };

  const insertMarkdownSyntax = (prefix: string, suffix: string = "") => {
    setContentHtml((prev) => `${prev}\n${prefix}نص التنسيق${suffix}\n`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const ext = file.name.split(".").pop() || "png";
      const fileName = `post-covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("lessons").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("lessons").getPublicUrl(fileName);
      if (data?.publicUrl) {
        setThumbnail(data.publicUrl);
        toast.success("تم رفع صورة غلاف المقال بنجاح!");
      }
    } catch (err: any) {
      toast.error("حدث خطأ في رفع الصورة: " + (err.message || err));
    } finally {
      setUploadingImage(false);
    }
  };

  const savePost = async () => {
    if (!title.trim()) {
      toast.error("يرجى كتابة عنوان المقال أولاً.");
      return;
    }
    try {
      setLoading(true);

      // Build a formatted Markdown meta+content bundle for the user to copy
      const metaJson = JSON.stringify(
        {
          slug: slug || slugify(title),
          title,
          category,
          tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
          excerpt,
          thumbnail,
          created_at: new Date().toISOString(),
        },
        null,
        2,
      );

      const fullBundle = `=== meta.json ===\n${metaJson}\n\n=== post.md ===\n${contentHtml}`;

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullBundle);
        toast.success("تم نسخ محتوى المقال (meta.json + post.md) إلى الحافظة — الصقه في مجلد content/posts/");
      } else {
        toast.success("تم تجهيز المقال! انسخ المحتوى من المحرر وضعه في content/posts/" + (slug || slugify(title)) + "/");
      }

      fetchPostsList();
      setActiveTab("list");
    } catch (err: any) {
      toast.error("خطأ في حفظ المقال: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = (posts || []).filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase()) ||
      p.labels?.some((l: string) => l.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Mode Switches */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            إدارة المقالات (WordPress Style Editor)
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            أنشئ وعدّل المقالات محلياً وعبر Blogger مع معاينة مباشرة وتخصيص صور الغلاف والعناوين.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "list" ? (
            <>
              <Button onClick={openNewPostEditor} className="gap-2 font-bold shadow-soft">
                <Plus className="h-4 w-4" />
                مقال جديد (New Post)
              </Button>
              <Button asChild variant="outline">
                <a href="https://www.blogger.com/" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ExternalLink className="h-4 w-4 text-amber-500" />
                  Blogger Dashboard
                </a>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setActiveTab("list")} className="gap-1.5">
                <ArrowRight className="h-4 w-4" /> العودة للقائمة
              </Button>
              <Button onClick={savePost} disabled={loading} className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                حفظ ونشر المقال
              </Button>
            </>
          )}
        </div>
      </div>

      {activeTab === "list" ? (
        /* LIST TAB */
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث في المقالات والعناوين والتصنيفات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>سجل المقالات ({filteredPosts.length})</span>
                <span className="text-xs text-muted-foreground font-normal">مزامنة فورية مع السيرفر</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {posts === null ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                  <span className="text-sm text-muted-foreground">جاري تحميل قائمة المقالات...</span>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  لا توجد مقالات مطابقة للبحث.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {filteredPosts.map((p: any) => (
                    <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                      <div className="flex items-start gap-3.5 min-w-0">
                        {p.thumbnail ? (
                          <img
                            src={optimizeBloggerImage(p.thumbnail, 120, 80)}
                            alt=""
                            className="w-16 h-12 rounded-lg object-cover bg-surface-muted shrink-0 border border-border/60"
                          />
                        ) : (
                          <div className="w-16 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <h4 className="font-bold text-sm md:text-base leading-tight truncate">{p.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="rounded bg-primary/10 text-primary px-2 py-0.5 font-semibold">
                              {p.labels?.[0] || "عام"}
                            </span>
                            <span>{formatDate(p.published)}</span>
                            {p.readingMinutes && <span>• {p.readingMinutes} دقائق</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => editPost(p)} className="gap-1.5 font-semibold">
                          <Pencil className="h-3.5 w-3.5 text-primary" />
                          تعديل باللوحة
                        </Button>

                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={p.url || `/posts/${p.slug || p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gap-1 text-xs font-semibold"
                          >
                            <Eye className="h-3.5 w-3.5 text-sky-500" />
                            معاينة
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* WORDPRESS-STYLE EDITOR TAB */
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="space-y-6 lg:col-span-8">
            <Card className="p-6 space-y-4 shadow-card">
              <div>
                <Label className="text-sm font-bold mb-1.5 block">عنوان المقال (Title)</Label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="أدخل عنوان المقال الشامل والجذاب..."
                  className="text-lg font-bold py-6"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-1 block">رابط المقال الصديق (SEO URL Slug)</Label>
                <div className="flex items-center rounded-md border border-border bg-muted/30 px-3 py-2 text-xs font-mono">
                  <span className="text-muted-foreground dir-ltr">https://www.bouibacademy.me/posts/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="bg-transparent font-bold outline-none flex-1 text-primary dir-ltr px-1"
                    placeholder="post-slug-here"
                  />
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-2 mb-3">
                  <Label className="text-sm font-bold">محتوى المقال (Markdown / HTML)</Label>
                  <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg">
                    <Button
                      size="sm"
                      variant={previewMode === "editor" ? "secondary" : "ghost"}
                      className="h-7 text-xs px-2.5"
                      onClick={() => setPreviewMode("editor")}
                    >
                      محرر
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === "split" ? "secondary" : "ghost"}
                      className="h-7 text-xs px-2.5"
                      onClick={() => setPreviewMode("split")}
                    >
                      مزدوج
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === "preview" ? "secondary" : "ghost"}
                      className="h-7 text-xs px-2.5"
                      onClick={() => setPreviewMode("preview")}
                    >
                      معاينة حية
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-wrap bg-muted/40 p-2 rounded-t-xl border border-border border-b-0 text-xs">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => insertMarkdownSyntax("## ")}>
                    <Heading className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => insertMarkdownSyntax("**", "**")}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => insertMarkdownSyntax("*", "*")}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => insertMarkdownSyntax("```javascript\n", "\n```")}>
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => insertMarkdownSyntax("- ")}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => insertMarkdownSyntax("> ")}>
                    <Quote className="h-4 w-4" />
                  </Button>
                </div>

                <div className={`grid gap-4 ${previewMode === "split" ? "md:grid-cols-2" : "grid-cols-1"}`}>
                  {previewMode !== "preview" && (
                    <Textarea
                      value={contentHtml}
                      onChange={(e) => setContentHtml(e.target.value)}
                      placeholder="اكتب المحتوى بتنسيق Markdown أو HTML..."
                      rows={18}
                      className="font-mono text-sm leading-relaxed rounded-t-none border-t-0 resize-y"
                    />
                  )}

                  {previewMode !== "editor" && (
                    <div className="border border-border rounded-xl p-5 bg-card/60 overflow-y-auto max-h-[500px] prose-ar">
                      <div className="text-xs font-bold text-primary mb-3 pb-2 border-b border-border flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> المعاينة الحية المباشرة
                      </div>
                      {/* Render markdown through parser — do NOT render raw user input as HTML */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: contentHtml
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/\n/g, "<br />")
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Settings (Featured Image, Category, Excerpt) */}
          <div className="space-y-6 lg:col-span-4">
            <Card className="p-5 space-y-4 shadow-card">
              <h3 className="font-bold text-sm border-b border-border/60 pb-2">إعدادات النشر والغلاف</h3>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label className="text-xs font-bold">صورة الغلاف (Featured Image)</Label>
                {thumbnail ? (
                  <div className="relative rounded-xl overflow-hidden border border-border aspect-video group">
                    <img src={thumbnail} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setThumbnail("")}
                      className="absolute top-2 left-2 bg-destructive text-destructive-foreground p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                    >
                      حذف الصورة
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center space-y-2 hover:border-primary/50 transition-colors bg-muted/20">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">اختر صورة غلاف المقال</p>
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90">
                      {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      رفع صورة جديدة
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                )}
                <Input
                  type="text"
                  placeholder="أو ضع رابط الصورة المباشر URL..."
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="text-xs mt-2"
                />
              </div>

              {/* Category */}
              <div>
                <Label className="text-xs font-bold mb-1.5 block">التصنيف الرئيسي (Category)</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="مثال: الذكاء الاصطناعي, n8n, أتمتة..."
                  className="text-xs"
                />
              </div>

              {/* Tags */}
              <div>
                <Label className="text-xs font-bold mb-1.5 block">الوسوم (Tags)</Label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="فصل بين الوسوم بفاصلة..."
                  className="text-xs"
                />
              </div>

              {/* Excerpt */}
              <div>
                <Label className="text-xs font-bold mb-1.5 block">ملخص المقال (Excerpt / SEO Meta Description)</Label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="ملخص قصير ومقنع للمقال يظهر في جوجل والبطاقات..."
                  rows={4}
                  className="text-xs"
                />
              </div>

              <div className="pt-2">
                <Button onClick={savePost} disabled={loading} className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  حفظ المقال ونشره
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
