/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Share2,
  Copy,
  Check,
  Search,
  Sparkles,
  ExternalLink,
  Download,
  FileSpreadsheet,
  FileCode,
  ImageIcon,
  Tag,
} from "lucide-react";
import facebookPostsData from "../../../../content/facebook-posts/facebook-posts.json";

export const Route = createFileRoute("/_authenticated/admin/facebook")({
  component: AdminFacebook,
});

function AdminFacebook() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

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
            أتمتة منشورات فيسبوك والصور (Facebook Content Automation)
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            محتوى جاهز للنشر على فيسبوك مع أوامر توليد الصور بالذكاء الاصطناعي وهاشتاغات مخصصة.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          إجمالي منشورات فيسبوك المجهزة: <span className="text-primary font-black">{filteredPosts.length}</span> / {posts.length}
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
                    <Share2 className="h-3.5 w-3.5 text-sky-400" /> نص بوست فيسبوك (عربي)
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

            <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground truncate">{p.url}</span>
              <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs">
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
