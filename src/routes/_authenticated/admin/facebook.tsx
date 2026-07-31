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
  AlertTriangle,
  Video,
  Download,
  Globe,
  SendHorizontal,
} from "lucide-react";
import omniPostsData from "../../../../content/omni-social-posts/omni-posts.json";
import { getFacebookSettingsFn, publishPostToFacebookFn } from "@/lib/facebook.functions";
import { publishToTelegramFn, triggerMultiPlatformWebhookFn } from "@/lib/publisher.functions";

export const Route = createFileRoute("/_authenticated/admin/facebook")({
  component: AdminPublisherStudio,
});

type PlatformTab =
  "all" | "facebook" | "telegram" | "linkedin" | "twitter" | "pinterest" | "reddit";

function AdminPublisherStudio() {
  const [activeTab, setActiveTab] = useState<PlatformTab>("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Credentials State
  const [pageId, setPageId] = useState("559362324530470");
  const [pageToken, setPageToken] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("@bouibacademy");
  const [webhookUrl, setWebhookUrl] = useState("");

  const [hasServerToken, setHasServerToken] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishingTelegramId, setPublishingTelegramId] = useState<string | null>(null);
  const [publishingWebhookId, setPublishingWebhookId] = useState<string | null>(null);

  const [tokenError, setTokenError] = useState(false);
  const [publishedResults, setPublishedResults] = useState<Record<string, string>>({});
  const [telegramResults, setTelegramResults] = useState<Record<string, string>>({});
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    // 1. Check local storage
    const savedPageId = localStorage.getItem("fb_page_id");
    const savedToken = localStorage.getItem("fb_page_token");
    const savedTgToken = localStorage.getItem("tg_bot_token");
    const savedTgChat = localStorage.getItem("tg_chat_id");
    const savedWebhook = localStorage.getItem("omni_webhook_url");

    if (savedPageId) setPageId(savedPageId);
    if (savedToken) setPageToken(savedToken);
    if (savedTgToken) setTelegramToken(savedTgToken);
    if (savedTgChat) setTelegramChatId(savedTgChat);
    if (savedWebhook) setWebhookUrl(savedWebhook);

    // 2. Fetch server environment status
    getFacebookSettingsFn()
      .then((res) => {
        if (res.pageId && !savedPageId) setPageId(res.pageId);
        if (res.hasToken) {
          setHasServerToken(true);
          if (res.tokenValue && !savedToken) setPageToken(res.tokenValue);
        }
      })
      .catch(() => {});
  }, []);

  const saveCredentials = () => {
    if (pageId.trim()) localStorage.setItem("fb_page_id", pageId.trim());
    if (pageToken.trim()) localStorage.setItem("fb_page_token", pageToken.trim());
    if (telegramToken.trim()) localStorage.setItem("tg_bot_token", telegramToken.trim());
    if (telegramChatId.trim()) localStorage.setItem("tg_chat_id", telegramChatId.trim());
    if (webhookUrl.trim()) localStorage.setItem("omni_webhook_url", webhookUrl.trim());

    setTokenError(false);
    toast.success("تم حفظ مفاتيح المنصات الجديدة بنجاح!");
  };

  const posts = (omniPostsData as any[]) || [];

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
      toast.success("تم نسخ نص المنشور بنجاح!");
      setTimeout(() => setCopiedId(null), 2500);
    } else {
      setCopiedPromptId(id);
      toast.success("تم نسخ Prompt الصورة بنجاح!");
      setTimeout(() => setCopiedPromptId(null), 2500);
    }
  };

  // 1-Click Direct Server Publish to Facebook Page
  const publishDirectToFacebook = async (post: any) => {
    const activePageId = pageId.trim();
    const activeToken = pageToken.trim();

    try {
      setPublishingId(post.id);
      toast.info(`جاري النشر على فيسبوك (${post.title})...`);

      const res = await publishPostToFacebookFn({
        data: {
          postId: post.id,
          pageId: activePageId || undefined,
          pageToken: activeToken || undefined,
          postPayload: {
            id: post.id,
            title: post.title,
            facebook_post_ar: post.facebook?.post_text || post.facebook_post_ar || post.title,
            facebook_comment_link:
              post.facebook?.comment_link || post.facebook_comment_link || post.url,
            thumbnail: post.thumbnail,
          },
        },
      });

      if (res.success) {
        setTokenError(false);
        const publishedUrl = res.postUrl || `https://facebook.com/${res.postId}`;
        setPublishedResults((prev) => ({ ...prev, [post.id]: publishedUrl }));
        toast.success(res.message || "🎉 تم النشر بنجاح على فيسبوك!");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || String(err);
      if (msg.includes("expired") || msg.includes("Expired") || msg.includes("validate")) {
        setTokenError(true);
        setShowConfig(true);
        toast.error("انتهت صلاحية توكن فيسبوك! يرجى لصق توكن جديد.");
      } else {
        toast.error("فشل النشر على فيسبوك: " + msg);
      }
    } finally {
      setPublishingId(null);
    }
  };

  // 1-Click Direct Server Publish to Telegram Channel
  const publishDirectToTelegram = async (post: any) => {
    try {
      setPublishingTelegramId(post.id);
      toast.info(`جاري النشر على تليجرام (${post.title})...`);

      const res = await publishToTelegramFn({
        data: {
          botToken: telegramToken.trim() || undefined,
          chatId: telegramChatId.trim() || undefined,
          postId: post.id,
          markdownText: post.telegram?.post_markdown,
          photoUrl: post.thumbnail,
        },
      });

      if (res.success) {
        setTelegramResults((prev) => ({ ...prev, [post.id]: `Message ID: ${res.messageId}` }));
        toast.success(`🎉 تم النشر بنجاح على قناة تليجرام (${res.chat})!`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("فشل النشر على تليجرام: " + (err.message || String(err)));
    } finally {
      setPublishingTelegramId(null);
    }
  };

  // Trigger Multi-Platform Automation Webhook
  const triggerAutomationWebhook = async (post: any) => {
    if (!webhookUrl.trim()) {
      setShowConfig(true);
      toast.error("يرجى إدخال رابط Webhook أتمتة n8n/Make في الإعدادات أولاً.");
      return;
    }

    try {
      setPublishingWebhookId(post.id);
      toast.info(`جاري استدعاء Webhook الأتمتة الشاملة...`);

      const res = await triggerMultiPlatformWebhookFn({
        data: {
          webhookUrl: webhookUrl.trim(),
          postId: post.id,
        },
      });

      if (res.success) {
        toast.success(res.message);
      }
    } catch (err: any) {
      toast.error("فشل استدعاء الـ Webhook: " + err.message);
    } finally {
      setPublishingWebhookId(null);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.facebook?.post_text?.toLowerCase().includes(search.toLowerCase()) ||
      p.telegram?.post_markdown?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary shrink-0" />
            مركز النشر الشامل لجميع المنصات (Omni-Channel Publisher)
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            أنشئ، وانشر، وشارك المقالات والأدوات بنقرة واحدة عبر فيسبوك، تليجرام، لينكد إن، إكس
            (تويتر)، بينتريست وريديت!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="gap-1.5 font-bold text-xs min-h-[40px] flex-1 sm:flex-initial"
          >
            <Settings2 className="h-4 w-4 text-primary" />
            {showConfig ? "إخفاء الإعدادات" : "مفاتيح المنصات والـ APIs"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 font-bold text-xs min-h-[40px]"
          >
            <a href="/content/omni-social-posts/omni-posts.csv" download>
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              تنزيل CSV الشامل
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 font-bold text-xs min-h-[40px]"
          >
            <a href="/content/omni-social-posts/omni-posts.json" download>
              <FileCode className="h-4 w-4 text-amber-500" />
              JSON
            </a>
          </Button>
        </div>
      </div>

      {/* Platform Selector Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/40 scrollbar-none">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("all")}
          className="gap-1.5 font-bold text-xs shrink-0 rounded-full"
        >
          <Globe className="h-4 w-4 text-emerald-400" /> جميع المنصات ({posts.length})
        </Button>
        <Button
          variant={activeTab === "facebook" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("facebook")}
          className="gap-1.5 font-bold text-xs shrink-0 rounded-full"
        >
          🔵 فيسبوك (Facebook)
        </Button>
        <Button
          variant={activeTab === "telegram" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("telegram")}
          className="gap-1.5 font-bold text-xs shrink-0 rounded-full"
        >
          ✈️ تليجرام (Telegram)
        </Button>
        <Button
          variant={activeTab === "linkedin" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("linkedin")}
          className="gap-1.5 font-bold text-xs shrink-0 rounded-full"
        >
          🔷 لينكد إن (LinkedIn)
        </Button>
        <Button
          variant={activeTab === "twitter" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("twitter")}
          className="gap-1.5 font-bold text-xs shrink-0 rounded-full"
        >
          🖤 إكس (Twitter/X)
        </Button>
        <Button
          variant={activeTab === "pinterest" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("pinterest")}
          className="gap-1.5 font-bold text-xs shrink-0 rounded-full"
        >
          📌 بينتريست (Pinterest)
        </Button>
        <Button
          variant={activeTab === "reddit" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("reddit")}
          className="gap-1.5 font-bold text-xs shrink-0 rounded-full"
        >
          🤖 ريديت (Reddit / Dev.to)
        </Button>
      </div>

      {/* Credentials Configuration Box */}
      {(showConfig || !hasServerToken || tokenError) && (
        <Card className="border-2 border-primary/30 bg-primary/5 p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary shrink-0" />
              <h3 className="font-bold text-sm sm:text-base">
                إعدادات الربط المباشر والـ APIs لجميع المنصات
              </h3>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Facebook Settings */}
            <div className="space-y-2 border p-3.5 rounded-xl bg-card">
              <Label className="text-xs font-bold text-sky-400">
                🔵 Facebook Page ID & Access Token
              </Label>
              <Input
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                placeholder="Page ID"
                className="dir-ltr text-xs font-mono mb-2"
              />
              <Input
                type="password"
                value={pageToken}
                onChange={(e) => setPageToken(e.target.value)}
                placeholder="Meta Page Access Token"
                className="dir-ltr text-xs font-mono"
              />
            </div>

            {/* Telegram Settings */}
            <div className="space-y-2 border p-3.5 rounded-xl bg-card">
              <Label className="text-xs font-bold text-sky-400">
                ✈️ Telegram Bot Token & Channel Chat ID
              </Label>
              <Input
                type="password"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                placeholder="123456789:ABCdefGHI..."
                className="dir-ltr text-xs font-mono mb-2"
              />
              <Input
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="@bouibacademy"
                className="dir-ltr text-xs font-mono"
              />
            </div>

            {/* Webhook Automation Settings */}
            <div className="space-y-2 border p-3.5 rounded-xl bg-card col-span-full lg:col-span-1">
              <Label className="text-xs font-bold text-emerald-400">
                ⚡ Webhook URL (n8n / Zapier / Make)
              </Label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://n8n.your-domain.com/webhook/publish"
                className="dir-ltr text-xs font-mono mb-2"
              />
              <p className="text-[11px] text-muted-foreground leading-tight">
                يستدعي سيناريو الأتمتة لنشر المنشور على كل حساباتك بنقرة واحدة!
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              onClick={saveCredentials}
              className="gap-2 font-bold text-xs bg-primary hover:opacity-90 min-h-[44px] px-6"
            >
              <Check className="h-4 w-4" />
              حفظ كل المفاتيح
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
            placeholder="ابحث في جميع المنشورات والمواضيع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 text-xs min-h-[44px]"
          />
        </div>
        <div className="text-xs text-muted-foreground font-bold">
          عرض <span className="text-primary font-black">{filteredPosts.length}</span> من إجمالي{" "}
          {posts.length} منشور
        </div>
      </div>

      {/* Posts Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {filteredPosts.map((p) => {
          const isFbActive = activeTab === "all" || activeTab === "facebook";
          const isTgActive = activeTab === "all" || activeTab === "telegram";
          const isLiActive = activeTab === "all" || activeTab === "linkedin";
          const isXActive = activeTab === "all" || activeTab === "twitter";
          const isPinActive = activeTab === "all" || activeTab === "pinterest";
          const isRedActive = activeTab === "all" || activeTab === "reddit";

          return (
            <Card
              key={p.id}
              className="shadow-card border border-border/80 flex flex-col justify-between overflow-hidden group"
            >
              <CardHeader className="py-4 border-b border-border/60 bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <span className="inline-block text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {p.category}
                    </span>
                    <CardTitle className="text-sm sm:text-base font-bold leading-tight line-clamp-2">
                      {p.title}
                    </CardTitle>
                  </div>
                  {p.thumbnail && (
                    <img
                      src={p.thumbnail}
                      alt=""
                      className="w-14 h-12 rounded object-cover border shrink-0 bg-muted"
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4 flex-1">
                {/* 1. Facebook Format */}
                {isFbActive && p.facebook && (
                  <div className="space-y-2 border-b border-border/40 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                        🔵 منشور فيسبوك (Facebook Post)
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(p.facebook.post_text, p.id + "-fb", "post")
                          }
                          className="h-8 px-2.5 text-xs font-bold gap-1 text-sky-400 hover:bg-sky-500/10 min-h-[36px]"
                        >
                          {copiedId === p.id + "-fb" ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copiedId === p.id + "-fb" ? "تم النسخ!" : "نسخ النص"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="h-8 text-[11px] font-bold border-sky-500/30 text-sky-300"
                        >
                          <a
                            href={p.facebook.direct_share_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3 ml-1" /> مشاركة
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-sans leading-relaxed text-slate-200 whitespace-pre-line dir-rtl select-all">
                      {p.facebook.post_text}
                    </div>
                  </div>
                )}

                {/* 2. Telegram Format */}
                {isTgActive && p.telegram && (
                  <div className="space-y-2 border-b border-border/40 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                        ✈️ منشور تليجرام (Telegram Markdown)
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(p.telegram.post_markdown, p.id + "-tg", "post")
                          }
                          className="h-8 px-2.5 text-xs font-bold gap-1 text-sky-300 hover:bg-sky-500/10 min-h-[36px]"
                        >
                          {copiedId === p.id + "-tg" ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copiedId === p.id + "-tg" ? "تم النسخ!" : "نسخ Telegram"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="h-8 text-[11px] font-bold border-sky-400/30 text-sky-300"
                        >
                          <a
                            href={p.telegram.direct_share_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <SendHorizontal className="h-3 w-3 ml-1" /> إرسال
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs font-mono leading-relaxed text-sky-200 whitespace-pre-line dir-rtl select-all">
                      {p.telegram.post_markdown}
                    </div>
                  </div>
                )}

                {/* 3. LinkedIn Format */}
                {isLiActive && p.linkedin && (
                  <div className="space-y-2 border-b border-border/40 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                        🔷 منشور لينكد إن (LinkedIn Professional)
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(p.linkedin.post_text, p.id + "-li", "post")
                          }
                          className="h-8 px-2.5 text-xs font-bold gap-1 text-blue-400 hover:bg-blue-500/10 min-h-[36px]"
                        >
                          {copiedId === p.id + "-li" ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copiedId === p.id + "-li" ? "تم النسخ!" : "نسخ LinkedIn"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="h-8 text-[11px] font-bold border-blue-500/30 text-blue-300"
                        >
                          <a
                            href={p.linkedin.direct_share_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3 ml-1" /> نشر على LinkedIn
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs font-sans leading-relaxed text-blue-100 whitespace-pre-line dir-rtl select-all">
                      {p.linkedin.post_text}
                    </div>
                  </div>
                )}

                {/* 4. Twitter / X Format */}
                {isXActive && p.twitter && (
                  <div className="space-y-2 border-b border-border/40 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        🖤 تغريدة إكس (X / Twitter Thread)
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(
                              `${p.twitter.tweet_1}\n\n${p.twitter.tweet_2}`,
                              p.id + "-tw",
                              "post",
                            )
                          }
                          className="h-8 px-2.5 text-xs font-bold gap-1 text-slate-200 hover:bg-slate-500/10 min-h-[36px]"
                        >
                          {copiedId === p.id + "-tw" ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copiedId === p.id + "-tw" ? "تم النسخ!" : "نسخ Tweet"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="h-8 text-[11px] font-bold border-slate-700 text-slate-200"
                        >
                          <a
                            href={p.twitter.direct_share_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3 ml-1" /> تغريد الان
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-sans leading-relaxed text-slate-200 whitespace-pre-line dir-rtl select-all">
                      {p.twitter.tweet_1}
                      {"\n\n--- التغريدة الثانية ---\n\n"}
                      {p.twitter.tweet_2}
                    </div>
                  </div>
                )}

                {/* 5. Pinterest Format */}
                {isPinActive && p.pinterest && (
                  <div className="space-y-2 border-b border-border/40 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                        📌 بينتريست (Pinterest Pin)
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-8 text-[11px] font-bold border-rose-500/30 text-rose-300"
                      >
                        <a
                          href={p.pinterest.direct_share_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 ml-1" /> إنشاء Pin
                        </a>
                      </Button>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200 space-y-1">
                      <p className="font-bold">{p.pinterest.title}</p>
                      <p className="text-[11px] text-muted-foreground">{p.pinterest.description}</p>
                    </div>
                  </div>
                )}

                {/* Feedback Banners */}
                {publishedResults[p.id] && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" /> تم النشر على فيسبوك!
                    </span>
                    <a
                      href={publishedResults[p.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline text-sky-400"
                    >
                      مشاهدة ↗
                    </a>
                  </div>
                )}

                {telegramResults[p.id] && (
                  <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-2 text-xs text-sky-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <SendHorizontal className="h-4 w-4 text-sky-400" /> تم النشر على تليجرام! (
                      {telegramResults[p.id]})
                    </span>
                  </div>
                )}
              </CardContent>

              {/* Action Buttons Bar */}
              <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-2 text-xs flex-wrap">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  <Button
                    onClick={() => publishDirectToFacebook(p)}
                    disabled={publishingId === p.id}
                    size="sm"
                    className="gap-1.5 font-bold bg-sky-600 hover:bg-sky-700 text-white min-h-[40px]"
                  >
                    {publishingId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    نشر على فيسبوك
                  </Button>

                  <Button
                    onClick={() => publishDirectToTelegram(p)}
                    disabled={publishingTelegramId === p.id}
                    size="sm"
                    variant="secondary"
                    className="gap-1.5 font-bold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 min-h-[40px]"
                  >
                    {publishingTelegramId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizontal className="h-4 w-4" />
                    )}
                    نشر على تليجرام
                  </Button>

                  {webhookUrl && (
                    <Button
                      onClick={() => triggerAutomationWebhook(p)}
                      disabled={publishingWebhookId === p.id}
                      size="sm"
                      variant="outline"
                      className="gap-1.5 font-bold border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 min-h-[40px]"
                    >
                      {publishingWebhookId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                      )}
                      أتمتة شاملة n8n
                    </Button>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="h-10 px-3 text-xs min-h-[40px]"
                >
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    <ExternalLink className="h-4 w-4" /> المقال
                  </a>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
