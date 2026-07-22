/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Share2,
  Copy,
  Check,
  Search,
  Sparkles,
  ExternalLink,
  FileSpreadsheet,
  FileCode,
  Send,
  Loader2,
  Key,
  MessageSquare,
  ShieldCheck,
  Settings2,
} from "lucide-react";
import facebookPostsData from "../../../../content/facebook-posts/facebook-posts.json";
import { getFacebookSettingsFn, publishPostToFacebookFn } from "@/lib/facebook.functions";

export const Route = createFileRoute("/_authenticated/admin/facebook")({
  component: AdminFacebook,
});

function AdminFacebook() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Facebook Credentials State (Persisted in localStorage with server fallback)
  const [pageId, setPageId] = useState("559362324530470");
  const [pageToken, setPageToken] = useState("");
  const [hasServerToken, setHasServerToken] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    // 1. Check local storage
    const savedPageId = localStorage.getItem("fb_page_id");
    const savedToken = localStorage.getItem("fb_page_token");

    if (savedPageId) setPageId(savedPageId);
    if (savedToken) setPageToken(savedToken);

    // 2. Fetch server environment status
    getFacebookSettingsFn()
      .then((res) => {
        if (res.pageId && !savedPageId) setPageId(res.pageId);
        if (res.hasToken) {
          setHasServerToken(true);
          if (res.tokenValue && !savedToken) {
            setPageToken(res.tokenValue);
          }
        }
      })
      .catch(() => {});
  }, []);

  const saveCredentials = () => {
    const cleanId = pageId.trim();
    const cleanToken = pageToken.trim();

    if (cleanId) localStorage.setItem("fb_page_id", cleanId);
    if (cleanToken) localStorage.setItem("fb_page_token", cleanToken);

    toast.success("تم حفظ إعدادات مفاتيح صفحة فيسبوك بنجاح!");
  };

  const posts = (facebookPostsData as any[]) || [];

  const copyToClipboard = (text: string, id: string, type: "post" | "prompt") => {
    navigator.clipboard.writeText(text);
    if (type === "post") {
      setCopiedId(id);
      toast.success("تم نسخ نص بوست فيسبوك بنجاح!");
      setTimeout(() => setCopiedId(null), 2500);
    } else {
      setCopiedPromptId(id);
      toast.success("تم نسخ Prompt الصورة الإنجليزي بنجاح!");
      setTimeout(() => setCopiedPromptId(null), 2500);
    }
  };

  // Direct Live Server Action Publishing to Facebook Page
  const publishDirectToFacebook = async (post: any) => {
    const activePageId = pageId.trim();
    const activeToken = pageToken.trim();

    try {
      setPublishingId(post.id);
      toast.info(`جاري نشر البوست والصورة على صفحة فيسبوك (${post.title})...`);

      const res = await publishPostToFacebookFn({
        data: {
          postId: post.id,
          pageId: activePageId || undefined,
          pageToken: activeToken || undefined,
        },
      });

      if (res.success) {
        toast.success(res.message || "🎉 تم نشر البوست بنجاح على فيسبوك!", {
          action: res.postUrl
            ? {
                label: "عرض البوست",
                onClick: () => window.open(res.postUrl, "_blank"),
              }
            : undefined,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("فشل النشر على فيسبوك: " + (err.message || err));
    } finally {
      setPublishingId(null);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.facebook_post_ar?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            أداة النشر التلقائي على صفحة فيسبوك (Facebook Publisher Studio)
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            انشر المقالات والمنشورات فوراً على صفحتك في فيسبوك بنقرة واحدة، مع حماية الخوارزميات وتوليد صور AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)} className="gap-1.5 font-bold text-xs">
            <Settings2 className="h-4 w-4 text-primary" />
            {showConfig ? "إخفاء الإعدادات" : "إعدادات الربط API"}
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2 font-bold text-xs">
            <a href="/content/facebook-posts/facebook-posts.csv" download>
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              تنزيل ملف CSV
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2 font-bold text-xs">
            <a href="/content/facebook-posts/facebook-posts.json" download>
              <FileCode className="h-4 w-4 text-amber-500" />
              تنزيل ملف JSON
            </a>
          </Button>
        </div>
      </div>

      {/* Facebook API Credentials Box */}
      {(showConfig || !hasServerToken) && (
        <Card className="border-2 border-primary/30 bg-primary/5 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-base">إعدادات ربط صفحة فيسبوك (Meta Graph API)</h3>
            </div>
            {hasServerToken || pageToken ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" /> مفاتيح الربط نشطة ومحفوظة 🟢
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                يرجى حفظ التوكن لتفعيل النشر
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Facebook Page ID (معرف الصفحة)</Label>
              <Input
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                placeholder="559362324530470"
                className="dir-ltr text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Page Access Token (توكن الصفحة)</Label>
              <Input
                type="password"
                value={pageToken}
                onChange={(e) => setPageToken(e.target.value)}
                placeholder="EAANZCxw0Ra20BS..."
                className="dir-ltr text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              يتم استخدام التوكن بأمان من السيرفر لنشر البوست والصورة بنقرة واحدة بدون أي قيود CORS.
            </p>
            <Button onClick={saveCredentials} className="gap-2 font-bold text-xs bg-primary hover:opacity-90">
              <Check className="h-3.5 w-3.5" />
              حفظ المفاتيح
            </Button>
          </div>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-md w-full">
          <Search className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث في منشورات فيسبوك والعناوين والتصنيفات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground font-bold">
          إجمالي المنشورات المتاحة: <span className="text-primary font-black">{filteredPosts.length}</span> / {posts.length}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {filteredPosts.map((p) => (
          <Card key={p.id} className="shadow-card border border-border/80 flex flex-col justify-between overflow-hidden group">
            <CardHeader className="py-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {p.category}
                  </span>
                  <CardTitle className="text-base font-bold leading-tight truncate">{p.title}</CardTitle>
                </div>
                {p.thumbnail && (
                  <img src={p.thumbnail} alt="" className="w-14 h-10 rounded object-cover border shrink-0 bg-muted" />
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 flex-1">
              {/* Facebook Post Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5 text-sky-400" /> نص بوست فيسبوك (متوافق مع الخوارزمية)
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(p.facebook_post_ar, p.id, "post")}
                    className="h-7 px-2 text-xs font-bold gap-1 text-sky-400 hover:bg-sky-500/10"
                  >
                    {copiedId === p.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedId === p.id ? "تم النسخ!" : "نسخ البوست"}
                  </Button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-sans leading-relaxed text-slate-200 whitespace-pre-line dir-rtl select-all">
                  {p.facebook_post_ar}
                </div>
              </div>

              {/* First Comment Link Box */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> الرابط للتعليق الأول (First Comment)
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(p.facebook_comment_link || p.url, p.id + "-comment", "post")}
                    className="h-7 px-2 text-xs font-bold gap-1 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    {copiedId === p.id + "-comment" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedId === p.id + "-comment" ? "تم النسخ!" : "نسخ للتعليق"}
                  </Button>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300 dir-rtl select-all">
                  {p.facebook_comment_link || `🔗 اقرأ المقال الكامل والتطبيقات التوضيحية من هنا:\n${p.url}`}
                </div>
              </div>

              {/* AI Image Prompt */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" /> أمر توليد الصورة بالذكاء الاصطناعي (AI Prompt)
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(p.image_prompt_en, p.id, "prompt")}
                    className="h-7 px-2 text-xs font-bold gap-1 text-purple-400 hover:bg-purple-500/10"
                  >
                    {copiedPromptId === p.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedPromptId === p.id ? "تم النسخ!" : "نسخ Prompt"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">{p.image_description_ar}</p>
                <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/20 text-[11px] font-mono text-purple-200 dir-ltr select-all leading-relaxed">
                  {p.image_prompt_en}
                </div>
              </div>
            </CardContent>

            {/* Action Bar */}
            <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-2 text-xs flex-wrap">
              <Button
                onClick={() => publishDirectToFacebook(p)}
                disabled={publishingId === p.id}
                className="gap-1.5 font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-soft"
              >
                {publishingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                نشر الآن على صفحة فيسبوك
              </Button>

              <Button size="sm" variant="ghost" asChild className="h-8 px-2 text-xs">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  زيارة المقال
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
