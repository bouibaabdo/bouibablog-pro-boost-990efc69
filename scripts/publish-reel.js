import dotenv from "dotenv";
dotenv.config();

const PAGE_ID = process.env.FACEBOOK_PAGE_ID || "559362324530470";
const RAW_TOKEN =
  process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
  "EAANZCxw0Ra20BSBoriWSmG8e68Pf5jjKu9jvKZBhSF2N3UMP9TAs94fWQFeYJPWZAbiPuoGjZBnMZBExYBZCieoh05pjF6lZBYj6Gy002yc2AzcG13adB11NEL32X6VqpJ04ZB9wR8Di9Ig4bRDx3iHETugs7Ch1qCAxnc3sHRrcU4n91QSb313EBDjWnbiWQkWMZAmMLq7ADZChKxRk6TZC2OXfCSrZA4w38D9Hvq7srOOt07UnPiTFIOBfehaY6834VCGTXVkPaz1CAvkP5xSNsXrCZAvrL4pJJ6wZC8SAZDZD";

const REEL_CAPTION = `🚀 كفاش تخدم بأقوى نماذج الذكاء الاصطناعي فـ PC ديالك فابور 100% وبلا إنترنت؟ 🇲🇦✨

تعلّم استخدام أداة Ollama المجانية لربط وتوافق نماذج Llama 3 و DeepSeek محلياً فـ جهازك بدون اشتراكات وبدون الحاجة لـ APIs مدفوعة! 💻⚡

👇 الشرح العملي الكامل وخطوات التثبيت تجدونها ميثبتة فـ أول تعليق (Comment 💬) 📌

#BouibaAcademy #الذكاء_الاصطناعي #Ollama #n8n #تكنولوجيا_المغرب #تقنية #MoroccoTech #برمجة`;

const REEL_COMMENT = `🔗 اقرأ الشرح العملي الكامل وخطوات التثبيت مجاناً من هنا:
https://www.bouibacademy.me/posts/how-to-connect-ollama-with-n8n-locally`;

const REEL_COVER_URL = "https://www.bouibacademy.me/facebook-images/reels-ollama-morocco.png";

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

async function main() {
  console.log("=========================================");
  console.log("🚀 Publishing Moroccan AI Reel Post to Facebook Page...");
  console.log("=========================================\n");

  const pageToken = await resolvePageToken(RAW_TOKEN, PAGE_ID);

  let createdPostId = null;
  let createdPhotoId = null;

  // 1. Post Photo & Caption to Page Feed
  try {
    const photoApiUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`;
    const res = await fetch(photoApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: REEL_COVER_URL,
        caption: REEL_CAPTION,
        access_token: pageToken,
      }),
    });

    const data = await res.json();
    if (res.ok && !data.error) {
      createdPhotoId = data.id;
      createdPostId = data.post_id || data.id;
      console.log(`✅ Reel Photo Post published successfully! Post ID: ${createdPostId}`);
    } else {
      console.warn(`⚠️ Photo endpoint response:`, data.error?.message || JSON.stringify(data));
    }
  } catch (err) {
    console.warn(`⚠️ Photo endpoint failed:`, err.message);
  }

  // 2. Try Feed Endpoint if photo endpoint was skipped
  if (!createdPostId) {
    try {
      const feedApiUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`;
      const res = await fetch(feedApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: REEL_CAPTION,
          access_token: pageToken,
        }),
      });

      const data = await res.json();
      if (res.ok && !data.error) {
        createdPostId = data.id;
        console.log(`✅ Text Post published successfully! Post ID: ${createdPostId}`);
      } else {
        throw new Error(data.error?.message || JSON.stringify(data));
      }
    } catch (err) {
      console.error(`❌ Facebook Publishing Failed:`, err.message);
      return;
    }
  }

  // 3. Post First Comment
  if (createdPostId || createdPhotoId) {
    const targets = [createdPostId, createdPhotoId].filter(Boolean);
    for (const targetId of targets) {
      try {
        const commentApiUrl = `https://graph.facebook.com/v19.0/${targetId}/comments`;
        const commentRes = await fetch(commentApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: REEL_COMMENT,
            access_token: pageToken,
          }),
        });

        const commentData = await commentRes.json();
        if (commentRes.ok && !commentData.error) {
          console.log(
            `✅ First comment posted successfully on target ${targetId}! Comment ID: ${commentData.id}`,
          );
          break;
        } else {
          console.warn(
            `⚠️ First comment notice on ${targetId}:`,
            commentData.error?.message || JSON.stringify(commentData),
          );
        }
      } catch (cErr) {
        console.warn(`⚠️ Comment failed on ${targetId}:`, cErr.message);
      }
    }
  }

  console.log("\n=========================================");
  console.log(`🎉 Reel Publishing Complete!`);
  console.log(`📌 Post URL: https://facebook.com/${createdPostId}`);
  console.log("=========================================\n");
}

main().catch(console.error);
