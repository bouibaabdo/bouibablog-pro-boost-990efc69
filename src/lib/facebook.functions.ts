import { createServerFn } from "@tanstack/react-start";
import facebookPostsData from "../../content/facebook-posts/facebook-posts.json";

// Security: Default Page ID & fallback server environment token
const DEFAULT_PAGE_ID = "559362324530470";

// Helper to resolve real Page Access Token if User Token is provided
async function resolvePageToken(token: string, pageId: string): Promise<string> {
  if (!token) return token;
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
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "";
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
    const pageId = (data.pageId || process.env.FACEBOOK_PAGE_ID || DEFAULT_PAGE_ID).trim();

    // Priority order for token: 1. Server env token (most reliable) -> 2. Client passed token
    const envToken = (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "").trim();
    const rawToken = envToken || (data.pageToken || "").trim();

    if (!pageId || !rawToken) {
      throw new Error("يرجى إدخال Facebook Page Access Token في إعدادات اللوحة.");
    }

    const posts = (facebookPostsData as any[]) || [];
    const post = data.postPayload || posts.find((p) => p.id === data.postId) || posts[0];

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

    // Helper to attempt posting with a specific token
    async function attemptPost(activeToken: string): Promise<boolean> {
      // 1. Try Photo Post Endpoint (/photos)
      try {
        const photoApiUrl = `https://graph.facebook.com/v19.0/${pageId}/photos`;
        const postRes = await fetch(photoApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: photoUrl,
            caption: post.facebook_post_ar,
            published: true,
            access_token: activeToken,
          }),
        });

        const postData = await postRes.json();

        if (postRes.ok && !postData.error) {
          createdPhotoId = postData.id;
          createdPostId = postData.post_id || postData.id;
          return true;
        } else {
          lastErrorMessage = postData.error?.message || "Photo error";
          console.warn("[Facebook Server] Photo endpoint error:", lastErrorMessage);
        }
      } catch (err: any) {
        console.warn("[Facebook Server] Photo endpoint skipped:", err.message);
      }

      // 2. Try Feed Post Endpoint (/feed)
      try {
        const feedApiUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
        const feedRes = await fetch(feedApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: post.facebook_post_ar,
            published: true,
            access_token: activeToken,
          }),
        });

        const feedData = await feedRes.json();
        if (feedRes.ok && !feedData.error) {
          createdPostId = feedData.id;
          return true;
        } else {
          lastErrorMessage = feedData.error?.message || lastErrorMessage || "فشل النشر على فيسبوك";
        }
      } catch (err: any) {
        lastErrorMessage = err.message;
      }

      return false;
    }

    // First Attempt with Primary Token
    let success = await attemptPost(pageToken);

    // Backup Attempt with Server Env Token if primary failed and env token differs
    if (!success && envToken && envToken !== rawToken && envToken !== pageToken) {
      console.log("[Facebook Server] Primary token failed, trying Server ENV token...");
      const backupToken = await resolvePageToken(envToken, pageId);
      success = await attemptPost(backupToken);
      if (success) {
        pageToken = backupToken; // Update token for comment
      }
    }

    if (!success || !createdPostId) {
      if (
        lastErrorMessage.includes("expired") ||
        lastErrorMessage.includes("Session has expired") ||
        lastErrorMessage.includes("validate")
      ) {
        throw new Error(
          "انتهت صلاحية توكن فيسبوك (Token Expired). يرجى لصق توكن جديد من Meta Graph Explorer.",
        );
      }
      throw new Error(lastErrorMessage || "فشل النشر على صفحة فيسبوك عبر Meta API.");
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
