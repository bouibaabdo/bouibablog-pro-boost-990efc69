import { createServerFn } from "@tanstack/react-start";
import omniPostsData from "../../content/omni-social-posts/omni-posts.json";

export interface OmniPostPackage {
  id: string;
  slug: string;
  title: string;
  category: string;
  url: string;
  thumbnail: string;
  created_at: string;
  facebook: {
    post_text: string;
    comment_link: string;
    direct_share_url: string;
  };
  twitter: {
    tweet_1: string;
    tweet_2: string;
    direct_share_url: string;
  };
  linkedin: {
    post_text: string;
    direct_share_url: string;
  };
  telegram: {
    post_markdown: string;
    direct_share_url: string;
  };
  pinterest: {
    title: string;
    description: string;
    direct_share_url: string;
  };
  reddit: {
    post_markdown: string;
    direct_share_url: string;
  };
}

// 1. Get all omni-channel posts
export const getOmniPostsFn = createServerFn({ method: "GET" }).handler(async () => {
  return (omniPostsData as OmniPostPackage[]) || [];
});

// 2. Publish to Telegram Channel via Telegram Bot API
export const publishToTelegramFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      botToken?: string;
      chatId?: string;
      postId?: string;
      markdownText?: string;
      photoUrl?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const botToken = (data.botToken || process.env.TELEGRAM_BOT_TOKEN || "").trim();
    const chatId = (data.chatId || process.env.TELEGRAM_CHAT_ID || "").trim();

    if (!botToken || !chatId) {
      throw new Error("يرجى توفير Telegram Bot Token و Chat ID في الإعدادات أو ملف البيئة .env");
    }

    const posts = (omniPostsData as OmniPostPackage[]) || [];
    const post = posts.find((p) => p.id === data.postId) || posts[0];
    const text = data.markdownText || post?.telegram?.post_markdown || "";
    const photo = data.photoUrl || post?.thumbnail || "";

    try {
      let telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      let bodyData: any = {
        chat_id: chatId,
        photo: photo,
        caption: text,
        parse_mode: "Markdown",
      };

      let res = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      let resJson = await res.json();

      if (!res.ok || !resJson.ok) {
        // Fallback to text message if photo fails
        telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        res = await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: "Markdown",
          }),
        });
        resJson = await res.json();
      }

      if (!res.ok || !resJson.ok) {
        throw new Error(resJson.description || "فشل إرسال المنشور إلى تليجرام.");
      }

      return {
        success: true,
        messageId: resJson.result?.message_id,
        chat: resJson.result?.chat?.title || chatId,
      };
    } catch (e: any) {
      throw new Error(`خطأ أثناء النشر على تليجرام: ${e.message}`);
    }
  });

// 3. Webhook Multi-Platform Trigger (Triggers n8n / Zapier / Make automation for all social channels)
export const triggerMultiPlatformWebhookFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      webhookUrl: string;
      postId: string;
      targetPlatforms?: string[];
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!data.webhookUrl) {
      throw new Error("يرجى إدخال رابط الـ Webhook الخاص بأتمتة n8n أو Make.");
    }

    const posts = (omniPostsData as OmniPostPackage[]) || [];
    const post = posts.find((p) => p.id === data.postId);

    if (!post) {
      throw new Error("المنشور المحدد غير موجود.");
    }

    try {
      const res = await fetch(data.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "omni_publish_request",
          platforms: data.targetPlatforms || ["facebook", "twitter", "linkedin", "telegram", "pinterest", "reddit"],
          post,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error(`تعذر الاتصال بالـ Webhook (${res.status} ${res.statusText})`);
      }

      return {
        success: true,
        message: "تم إرسال حمولة المنشور الشاملة لجميع المنصات إلى الـ Webhook بنجاح! 🚀",
      };
    } catch (e: any) {
      throw new Error(`فشل استدعاء Webhook: ${e.message}`);
    }
  });
