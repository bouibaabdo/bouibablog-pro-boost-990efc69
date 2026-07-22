import { createServerFn } from "@tanstack/react-start";
import fs from "fs";
import path from "path";

const JSON_INPUT_PATH = path.join(process.cwd(), "content", "facebook-posts", "facebook-posts.json");

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
  const pageId = process.env.FACEBOOK_PAGE_ID || "559362324530470";
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "";
  const hasToken = token.length > 10;

  return {
    pageId,
    hasToken,
    tokenValue: token,
  };
});

export const publishPostToFacebookFn = createServerFn({ method: "POST" })
  .validator((data: { postId: string; pageId?: string; pageToken?: string }) => data)
  .handler(async ({ data }) => {
    let pageId = (data.pageId || process.env.FACEBOOK_PAGE_ID || "559362324530470").trim();
    let rawToken = (data.pageToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "").trim();
    const envToken = (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "").trim();

    if (!rawToken && envToken) {
      rawToken = envToken;
    }

    if (!pageId || !rawToken) {
      throw new Error("يرجى إدخال Facebook Page ID و Page Access Token في الإعدادات أو في ملف .env أولاً.");
    }

    if (!fs.existsSync(JSON_INPUT_PATH)) {
      throw new Error("ملف منشورات فيسبوك غير موجود.");
    }

    const posts = JSON.parse(fs.readFileSync(JSON_INPUT_PATH, "utf-8")) as any[];
    const post = posts.find((p) => p.id === data.postId) || posts[0];

    if (!post) {
      throw new Error("المنشور المحدد غير موجود.");
    }

    // Resolve true Page Access Token from Meta API
    let pageToken = await resolvePageToken(rawToken, pageId);

    let createdPostId: string | null = null;
    let createdPhotoId: string | null = null;

    // 1. Try Photo Post Endpoint (/photos)
    try {
      const photoUrl = post.thumbnail || "https://www.bouibacademy.me/n8n-workflows-cover.png";
      const photoApiUrl = `https://graph.facebook.com/v19.0/${pageId}/photos`;

      let postRes = await fetch(photoApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: photoUrl,
          caption: post.facebook_post_ar,
          access_token: pageToken,
        }),
      });

      let postData = await postRes.json();

      // If provided client token failed, retry with server envToken
      if ((!postRes.ok || postData.error) && envToken && envToken !== rawToken) {
        console.log("[Facebook Server] Client token failed, retrying with server env token...");
        const envPageToken = await resolvePageToken(envToken, pageId);
        postRes = await fetch(photoApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: photoUrl,
            caption: post.facebook_post_ar,
            access_token: envPageToken,
          }),
        });
        postData = await postRes.json();
        if (postRes.ok && !postData.error) {
          pageToken = envPageToken;
        }
      }

      if (postRes.ok && !postData.error) {
        createdPhotoId = postData.id;
        createdPostId = postData.post_id || postData.id;
      } else {
        console.warn("[Facebook Server] Photo endpoint error:", postData.error?.message);
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
        throw new Error(feedData.error?.message || "فشل النشر على فيسبوك عبر Meta API");
      }
    }

    // 3. Add First Comment with Article Link
    if (post.facebook_comment_link) {
      const commentTargetId = createdPhotoId || createdPostId;
      if (commentTargetId) {
        try {
          const commentApiUrl = `https://graph.facebook.com/v19.0/${commentTargetId}/comments`;
          await fetch(commentApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: post.facebook_comment_link,
              access_token: pageToken,
            }),
          });
        } catch {
          // fail open on comment lookup
        }
      }
    }

    return {
      success: true,
      postId: createdPostId,
      postUrl: `https://facebook.com/${createdPostId}`,
      message: "🎉 تم نشر المنشور بنجاح على صفحة فيسبوك!",
    };
  });
