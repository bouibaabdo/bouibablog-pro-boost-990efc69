import fs from "fs";
import path from "path";

const JSON_INPUT_PATH = path.join(process.cwd(), "content", "facebook-posts", "facebook-posts.json");
const PAGE_ID = process.env.FACEBOOK_PAGE_ID || "";
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "";

async function publishPostToFacebook(post) {
  if (!PAGE_ID || !PAGE_ACCESS_TOKEN) {
    console.error("❌ Error: FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN environment variables are required.");
    console.log("\n💡 To publish automatically via API:");
    console.log("1. Add FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN to your .env file or environment.");
    console.log("2. Run: npm run publish-fb\n");
    return false;
  }

  console.log(`\n🚀 Publishing post to Facebook Page (${PAGE_ID})...`);
  console.log(`📌 Article: "${post.title}"`);

  try {
    // 1. Post to Facebook Page Feed / Photo
    const photoUrl = post.thumbnail || "https://www.bouibacademy.me/n8n-workflows-cover.png";
    const postApiUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`;
    
    const postRes = await fetch(postApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: photoUrl,
        caption: post.facebook_post_ar,
        access_token: PAGE_ACCESS_TOKEN,
      }),
    });

    const postData = await postRes.json();

    if (!postRes.ok || postData.error) {
      throw new Error(postData.error?.message || JSON.stringify(postData));
    }

    const createdPostId = postData.post_id || postData.id;
    console.log(`✅ Main post published successfully! Facebook Post ID: ${createdPostId}`);

    // 2. Add First Comment with Article Link
    if (post.facebook_comment_link && createdPostId) {
      console.log(`💬 Adding first comment with link...`);
      const commentApiUrl = `https://graph.facebook.com/v19.0/${createdPostId}/comments`;
      
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
        console.warn(`⚠️ Warning: Could not post first comment:`, commentData.error?.message);
      }
    }

    return true;
  } catch (err) {
    console.error(`❌ Facebook Publishing Failed:`, err.message);
    return false;
  }
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

  // Get index from CLI arg or publish top unpublished post
  const targetPostIndex = process.argv[2] ? parseInt(process.argv[2], 10) : 0;
  const targetPost = posts[targetPostIndex] || posts[0];

  await publishPostToFacebook(targetPost);
}

main().catch(console.error);
