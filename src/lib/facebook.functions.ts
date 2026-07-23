import { createServerFn } from "@tanstack/react-start";
import facebookPostsData from "../../content/facebook-posts/facebook-posts.json";

// Security: Never hardcode tokens in source. Set FACEBOOK_PAGE_ACCESS_TOKEN in .env / Cloudflare secrets.
const DEFAULT_PAGE_ID = "559362324530470";
const DEFAULT_PAGE_TOKEN = ""; // Must be provided via env or UI — see .env file

// Helper to resolve real Page Access Token if User Token is provided
async function resolvePageToken(token: string, pageId: string): Promise<string> {
  try {
    const url = `https://graph.facebook.com/v19.0/${pageId}?fields=access_token,name&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok && data.access_token) {
      console.log(`[Facebook Server] Resolved Page Access Token for "${data.name || pageId}"!`);
      return data.access_token;
    }
  } catch (e: any) {
    console.warn("[Facebook Server] Could not fetch page token automatically:", e.message);
  }
  return token;
}

export const getFacebookSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  const pageId = process.env.FACEBOOK_PAGE_ID || DEFAULT_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || DEFAULT_PAGE_TOKEN;
  const hasToken = token.length > 10;

  return {
    pageId,
    hasToken,
    tokenValue: token,
  };
});

export const publishPostToFacebookFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      postId?: string;
      pageId?: string;
      pageToken?: string;
      postPayload?: {
        id?: string;
        title?: string;
        facebook_post_ar?: string;
        facebook_comment_link?: string;
        thumbnail?: string;
      };
    }) => data,
  )
  .handler(async ({ data }) => {
    let pageId = (data.pageId || process.env.FACEBOOK_PAGE_ID || DEFAULT_PAGE_ID).trim();
    let rawToken = (data.pageToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || DEFAULT_PAGE_TOKEN).trim();

    if (!pageId || !rawToken) {
      throw new Error("يرجى إدخال Facebook Page Access Token في إعدادات اللوحة على الجوال.");
    }

    const posts = (facebookPostsData as any[]) || [];
    const post =
      data.postPayload ||
      posts.find((p) => p.id === data.postId) ||
      posts[0];

    if (!post || !post.facebook_post_ar) {
      throw new Error("المنشور المحدد غير موجود أو لا يحتوي على نص.");
    }

    // Resolve true Page Access Token from Meta API
    let pageToken = await resolvePageToken(rawToken, pageId);

    let createdPostId: string | null = null;
    let createdPhotoId: string | null = null;
    let lastErrorMessage = "";

    // Fix photo URL format
    let photoUrl = post.thumbnail || "https://www.bouibacademy.me/og-banner.png";
    if (photoUrl.startsWith("/")) {
      photoUrl = `https://www.bouibacademy.me${photoUrl}`;
    }

    // 1. Try Photo Post Endpoint (/photos)
    try {
      const photoApiUrl = `https://graph.facebook.com/v19.0/${pageId}/photos`;

      const postRes = await fetch(photoApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: photoUrl,
          caption: post.facebook_post_ar,
          access_token: pageToken,
        }),
      });

      const postData = await postRes.json();

      if (postRes.ok && !postData.error) {
        createdPhotoId = postData.id;
        createdPostId = postData.post_id || postData.id;
      } else {
        lastErrorMessage = postData.error?.message || "Photo error";
        console.warn("[Facebook Server] Photo endpoint error:", lastErrorMessage);
      }
    } catch (err: any) {
      console.warn("[Facebook Server] Photo endpoint skipped:", err.message);
    }

    // 2. Try Feed Post Endpoint (/feed) if Photo endpoint was skipped
    if (!createdPostId) {
      const feedApiUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
      const feedRes = await fetch(feedApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: post.facebook_post_ar,
          access_token: pageToken,
        }),
      });

      const feedData = await feedRes.json();
      if (feedRes.ok && !feedData.error) {
        createdPostId = feedData.id;
      } else {
        const errorMsg = feedData.error?.message || lastErrorMessage || "فشل النشر على فيسبوك عبر Meta API";
        if (errorMsg.includes("expired") || errorMsg.includes("Session has expired") || errorMsg.includes("validate")) {
          throw new Error("انتهت صلاحية توكن فيسبوك (Token Expired). يرجى لصق توكن جديد من Graph API Explorer في الإعدادات أعلى اللوحة.");
        }
        throw new Error(errorMsg);
      }
    }

    // 3. Add First Comment with Article Link
    let commentSuccess = false;
    if (post.facebook_comment_link) {
      const targets = [createdPostId, createdPhotoId].filter(Boolean) as string[];

      for (const targetId of targets) {
        try {
          const commentApiUrl = `https://graph.facebook.com/v19.0/${targetId}/comments`;
          const commentRes = await fetch(commentApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: post.facebook_comment_link,
              access_token: pageToken,
            }),
          });
          const commentData = await commentRes.json();

          if (commentRes.ok && !commentData.error) {
            console.log(`[Facebook Server] First comment posted successfully on ${targetId}!`);
            commentSuccess = true;
            break;
          }
        } catch {
          // fail open on comment lookup
        }
      }
    }

    return {
      success: true,
      postId: createdPostId,
      commentSuccess,
      postUrl: `https://facebook.com/${createdPostId}`,
      message: commentSuccess
        ? "🎉 تم نشر المنشور والتعليق الأول للرابط بنجاح على فيسبوك!"
        : "🎉 تم نشر المنشور بنجاح على صفحة فيسبوك!",
    };
  });
