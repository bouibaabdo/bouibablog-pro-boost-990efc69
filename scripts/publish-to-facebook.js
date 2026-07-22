import fs from "fs";
import path from "path";

// Load .env automatically
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const JSON_INPUT_PATH = path.join(process.cwd(), "content", "facebook-posts", "facebook-posts.json");
const PAGE_ID = process.env.FACEBOOK_PAGE_ID || "559362324530470";
let PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "";

// Helper to resolve real Page Access Token if User Token is provided
async function resolvePageToken(token, pageId) {
  try {
    const url = `https://graph.facebook.com/v19.0/${pageId}?fields=access_token,name&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok && data.access_token) {
      console.log(`🔑 Automatically fetched Page Access Token for "${data.name || pageId}"!`);
      return data.access_token;
    }
  } catch (e) {
    console.warn("Could not fetch page token automatically:", e.message);
  }
  return token;
}

async function publishPostToFacebook(post) {
  if (!PAGE_ID || !PAGE_ACCESS_TOKEN) {
    console.error("❌ Error: FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN environment variables are required.");
    return false;
  }

  // Resolve true Page Access Token from Meta API
  PAGE_ACCESS_TOKEN = await resolvePageToken(PAGE_ACCESS_TOKEN, PAGE_ID);

  console.log(`\n🚀 Publishing post to Facebook Page (${PAGE_ID})...`);
  console.log(`📌 Article: "${post.title}"`);

  let createdPhotoId = null;
  let createdPostId = null;

  // 1. Try Photo Post Endpoint (/photos)
  try {
    const photoUrl = post.thumbnail || "https://www.bouibacademy.me/n8n-workflows-cover.png";
    const photoApiUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`;

    const postRes = await fetch(photoApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: photoUrl,
        caption: post.facebook_post_ar,
        access_token: PAGE_ACCESS_TOKEN,
      }),
    });

    const postData = await postRes.json();
    if (postRes.ok && !postData.error) {
      createdPhotoId = postData.id;
      createdPostId = postData.post_id || postData.id;
      console.log(`✅ Photo post published successfully! Facebook Post ID: ${createdPostId}`);
    } else {
      console.warn(`⚠️ Photo endpoint skipped:`, postData.error?.message || "Trying feed endpoint...");
    }
  } catch (err) {
    console.warn(`⚠️ Photo endpoint failed:`, err.message);
  }

  // 2. Try Feed Post Endpoint (/feed) if Photo endpoint was skipped
  if (!createdPostId) {
    try {
      const feedApiUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`;
      const feedRes = await fetch(feedApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: post.facebook_post_ar,
          access_token: PAGE_ACCESS_TOKEN,
        }),
      });

      const feedData = await feedRes.json();
      if (feedRes.ok && !feedData.error) {
        createdPostId = feedData.id;
        console.log(`✅ Text post published successfully! Facebook Post ID: ${createdPostId}`);
      } else {
        throw new Error(feedData.error?.message || JSON.stringify(feedData));
      }
    } catch (err) {
      console.error(`❌ Facebook Publishing Failed:`, err.message);
      return false;
    }
  }

  // 3. Add First Comment with Article Link
  if (post.facebook_comment_link) {
    const commentTargetId = createdPhotoId || createdPostId;
    if (commentTargetId) {
      console.log(`💬 Adding first comment with link to ${commentTargetId}...`);
      try {
        const commentApiUrl = `https://graph.facebook.com/v19.0/${commentTargetId}/comments`;
        const commentRes = await fetch(commentApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: post.facebook_comment_link,
            access_token: PAGE_ACCESS_TOKEN,
          }),
        });

        const commentData = await commentRes.json();
        if (commentRes.ok && !commentData.error) {
          console.log(`✅ First comment posted successfully! Comment ID: ${commentData.id}`);
        } else {
          console.warn(`⚠️ First comment warning:`, commentData.error?.message);
        }
      } catch (commentErr) {
        console.warn(`⚠️ Warning: First comment failed:`, commentErr.message);
      }
    }
  }

  return true;
}

async function main() {
  if (!fs.existsSync(JSON_INPUT_PATH)) {
    console.error("❌ No generated Facebook posts found. Run `npm run generate-fb` first.");
    return;
  }

  const posts = JSON.parse(fs.readFileSync(JSON_INPUT_PATH, "utf-8"));
  if (posts.length === 0) {
    console.log("No posts available to publish.");
    return;
  }

  const targetPostIndex = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
  const targetPost = posts[targetPostIndex] || posts[0];

  await publishPostToFacebook(targetPost);
}

main().catch(console.error);
