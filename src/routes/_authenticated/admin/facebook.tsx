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

  // Credentials State
  const [pageId, setPageId] = useState("559362324530470");
  const [pageToken, setPageToken] = useState("");
  const [hasServerToken, setHasServerToken] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishedResults, setPublishedResults] = useState<Record<string, string>>({});
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

    toast.success("تم حفظ إعدادات المفاتيح بنجاح!");
  };

  const posts = (facebookPostsData as any[]) || [];

  const copyToClipboard = (text: string, id: string, type: "post" | "prompt") => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    if (type === "post") {
      setCopiedId(id);
      toast.success("تم نسخ النص بنجاح!");
      setTimeout(() => setCopiedId(null), 2500);
    } else {
      setCopiedPromptId(id);
      toast.success("تم نسخ Prompt الصورة بنجاح!");
      setTimeout(() => setCopiedPromptId(null), 2500);
    }
  };

  // Live Server Action Publishing to Facebook Page (Mobile Optimized)
  const publishDirectToFacebook = async (post: any) => {
    const activePageId = pageId.trim();
    const activeToken = pageToken.trim();

    try {
      setPublishingId(post.id);
      toast.info(`جاري النشر على الجوال/السيرفر (${post.title})...`);

      const res = await publishPostToFacebookFn({
        data: {
          postId: post.id,
          pageId: activePageId || undefined,
          pageToken: activeToken || undefined,
          postPayload: {
            id: post.id,
            title: post.title,
            facebook_post_ar: post.facebook_post_ar,
            facebook_comment_link: post.facebook_comment_link,
            thumbnail: post.thumbnail,
          },
        },
      });

      if (res.success) {
        const publishedUrl = res.postUrl || `https://facebook.com/${res.postId}`;
        setPublishedResults((prev) => ({ ...prev, [post.id]: publishedUrl }));
        toast.success(res.message || "🎉 تم النشر بنجاح على فيسبوك!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("فشل النشر: " + (err.message || err));
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
    <div className="space-y-6 pb-12">
      {/* Mobile-Friendly Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary shrink-0" />
            أداة النشر على فيسبوك (Publisher Studio)
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            انشر المقالات فوراً على صفحتك في فيسبوك من الجوال أو الحاسوب بنقرة واحدة.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)} className="gap-1.5 font-bold text-xs min-h-[40px] flex-1 sm:flex-initial">
            <Settings2 className="h-4 w-4 text-primary" />
            {showConfig ? "إخفاء الإعدادات" : "إعدادات المفاتيح"}
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2 font-bold text-xs min-h-[40px]">
            <a href="/content/facebook-posts/facebook-posts.csv" download>
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              CSV
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2 font-bold text-xs min-h-[40px]">
            <a href="/content/facebook-posts/facebook-posts.json" download>
              <FileCode className="h-4 w-4 text-amber-500" />
              JSON
            </a>
          </Button>
        </div>
      </div>

      {/* Facebook Credentials Box */}
      {(showConfig || !hasServerToken || !pageToken) && (
        <Card className="border-2 border-primary/30 bg-primary/5 p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary shrink-0" />
              <h3 className="font-bold text-sm sm:text-base">إعدادات الربط على الجوال (Meta API)</h3>
            </div>
            {hasServerToken || pageToken ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" /> التوكن نشط 🟢
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                يرجى إدخال التوكن
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Facebook Page ID</Label>
              <Input
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                placeholder="559362324530470"
                className="dir-ltr text-xs font-mono min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Page Access Token</Label>
              <Input
                type="password"
                value={pageToken}
                onChange={(e) => setPageToken(e.target.value)}
                placeholder="EAANZCxw0Ra20BS..."
                className="dir-ltr text-xs font-mono min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
            <p className="text-[11px] text-muted-foreground">
              يتم النشر بأمان عبر السيرفر دون مشاكل الجوال.
            </p>
            <Button onClick={saveCredentials} className="gap-2 font-bold text-xs bg-primary hover:opacity-90 min-h-[44px] px-6">
              <Check className="h-4 w-4" />
              حفظ المفاتيح
            </Button>
          </div>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-md w-full">
          <Search className="h-4 w-4 absolute right-3 top-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث في منشورات فيسبوك والعناوين..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 text-xs min-h-[44px]"
          />
        </div>
        <div className="text-xs text-muted-foreground font-bold">
          المنشورات: <span className="text-primary font-black">{filteredPosts.length}</span> / {posts.length}
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
                  <CardTitle className="text-sm sm:text-base font-bold leading-tight line-clamp-2">{p.title}</CardTitle>
                </div>
                {p.thumbnail && (
                  <img src={p.thumbnail} alt="" className="w-14 h-12 rounded object-cover border shrink-0 bg-muted" />
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4 flex-1">
              {/* Facebook Post Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5 text-sky-400" /> نص بوست فيسبوك
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(p.facebook_post_ar, p.id, "post")}
                    className="h-8 px-2.5 text-xs font-bold gap-1 text-sky-400 hover:bg-sky-500/10 min-h-[36px]"
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
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> الرابط للتعليق الأول
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(p.facebook_comment_link || p.url, p.id + "-comment", "post")}
                    className="h-8 px-2.5 text-xs font-bold gap-1 text-emerald-400 hover:bg-emerald-500/10 min-h-[36px]"
                  >
                    {copiedId === p.id + "-comment" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedId === p.id + "-comment" ? "تم النسخ!" : "نسخ للتعليق"}
                  </Button>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300 dir-rtl select-all break-all">
                  {p.facebook_comment_link || `🔗 اقرأ المقال الكامل من هنا:\n${p.url}`}
                </div>
              </div>

              {/* Inline Published Feedback Banner for Mobile */}
              {publishedResults[p.id] && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    تم النشر بنجاح على فيسبوك!
                  </span>
                  <a
                    href={publishedResults[p.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline text-sky-400 hover:text-sky-300"
                  >
                    شاهد البوست المنشور ↗
                  </a>
                </div>
              )}

              {/* AI Image Prompt */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" /> أمر الصورة (AI Prompt)
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(p.image_prompt_en, p.id, "prompt")}
                    className="h-8 px-2.5 text-xs font-bold gap-1 text-purple-400 hover:bg-purple-500/10 min-h-[36px]"
                  >
                    {copiedPromptId === p.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedPromptId === p.id ? "تم النسخ!" : "نسخ Prompt"}
                  </Button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/20 text-[11px] font-mono text-purple-200 dir-ltr select-all leading-relaxed break-all">
                  {p.image_prompt_en}
                </div>
              </div>
            </CardContent>

            {/* Mobile Action Bar */}
            <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-2 text-xs flex-wrap">
              <Button
                onClick={() => publishDirectToFacebook(p)}
                disabled={publishingId === p.id}
                className="gap-2 font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-soft min-h-[44px] flex-1 sm:flex-initial"
              >
                {publishingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                نشر الآن على صفحة فيسبوك
              </Button>

              <Button size="sm" variant="ghost" asChild className="h-11 px-3 text-xs min-h-[44px]">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <ExternalLink className="h-4 w-4" />
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
