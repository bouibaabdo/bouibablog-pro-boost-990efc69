import fs from "fs";
import path from "path";

const BLOGGER_FEED_URL = "https://academybouiba.blogspot.com/feeds/posts/default?alt=json&max-results=500";
const LOCAL_POSTS_DIR = path.join(process.cwd(), "content", "posts");
const OUTPUT_DIR = path.join(process.cwd(), "content", "omni-social-posts");
const JSON_OUTPUT_PATH = path.join(OUTPUT_DIR, "omni-posts.json");
const CSV_OUTPUT_PATH = path.join(OUTPUT_DIR, "omni-posts.csv");
const LEGACY_FB_JSON = path.join(process.cwd(), "content", "facebook-posts", "facebook-posts.json");

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to clean HTML text
function cleanHtmlText(html = "") {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Generate platform-tailored hashtags
function generateHashtags(category, title, platform = "facebook") {
  const text = (category + " " + title).toLowerCase();
  
  if (platform === "x") {
    const tags = ["#BouibaAcademy", "#AI", "#Tech"];
    if (text.includes("n8n") || text.includes("أتمتة")) tags.push("#Automation", "#n8n");
    if (text.includes("seo") || text.includes("سيو")) tags.push("#SEO");
    if (text.includes("ollama") || text.includes("deepseek")) tags.push("#LocalAI");
    if (text.includes("أمن") || text.includes("cyber")) tags.push("#CyberSecurity");
    return tags.join(" ");
  }

  if (platform === "linkedin") {
    const tags = ["#BouibaAcademy", "#ArtificialIntelligence", "#SoftwareEngineering", "#TechTrends"];
    if (text.includes("n8n") || text.includes("أتمتة")) tags.push("#Automation", "#NoCode", "#DevOps");
    if (text.includes("seo") || text.includes("سيو")) tags.push("#SearchEngineOptimization", "#WebPerformance");
    if (text.includes("ollama") || text.includes("deepseek")) tags.push("#MachineLearning", "#LLM");
    if (text.includes("أمن") || text.includes("cyber")) tags.push("#CyberSecurity", "#InfoSec");
    return tags.join(" ");
  }

  // Standard Facebook / Telegram hashtags
  const baseTags = ["#BouibaAcademy", "#Bouiba_Academy", "#أدوات_الذكاء_الاصطناعي", "#تقنية"];
  if (text.includes("ai") || text.includes("ذكاء") || text.includes("ollama")) baseTags.push("#الذكاء_الاصطناعي", "#AI");
  if (text.includes("n8n") || text.includes("أتمتة")) baseTags.push("#أتمتة", "#Automation", "#n8n");
  if (text.includes("برمجة") || text.includes("code") || text.includes("vps")) baseTags.push("#برمجة", "#تطوير_المواقع");
  if (text.includes("seo") || text.includes("سيو")) baseTags.push("#سيو", "#SEO");
  return Array.from(new Set(baseTags)).join(" ");
}

// Generate Multi-Platform Post Package for an article/tool
function formatMultiPlatformPackage(item) {
  const title = item.title.trim();
  const summary = item.desc || item.excerpt || "";
  const url = item.url;
  const thumbnail = item.thumbnail || "https://www.bouibacademy.me/og-banner.png";
  const category = item.category || "تقنية وذكاء اصطناعي";

  // 1. Facebook Post Format
  const fbTags = generateHashtags(category, title, "facebook");
  const facebook_post = `📌 ${title}

💡 ${summary}

🔥 أهم النقاط والفوائد العملية:
• شرح عملي بالخطوات والصور 💻
• حماية الخصوصية ومجاني 100% 🔒
• روابط تنفيدية وأكواد جاهزة الاستخدام 🚀

👇 رابط الشرح الكامل والأدوات في أول تعليق:
🔗 ${url}

${fbTags}`;

  // 2. X / Twitter Format (Tweet 1 & Tweet 2 Thread)
  const xTags = generateHashtags(category, title, "x");
  const x_tweet_1 = `📌 ${title.slice(0, 120)}

💡 ${summary.slice(0, 110)}...

👇 تفاصيل الدليل والرابط:
${xTags}`;

  const x_tweet_2 = `🚀 رابط الشرح والتطبيقات المباشرة:
🔗 ${url}

#BouibaAcademy 🇲🇦⚡`;

  // 3. LinkedIn Professional Format
  const linkedInTags = generateHashtags(category, title, "linkedin");
  const linkedin_post = `🌟 [دليل تقني جديد من Bouiba Academy]
  
📌 ${title}

💡 ملخص المحتوى:
${summary}

🔑 المحاور الرئيسية:
• خطوات تطبيقية عملية للشركات والمطورين
• تقليل التكاليف والاستفادة من الحلول المفتوحة المصدر
• تحسين الأداء والأمان وفق أفضل الممارسات الدولية

📖 اقرأ المقال كاملاً عبر الرابط التالي:
🔗 ${url}

${linkedInTags}`;

  // 4. Telegram Channel Rich Markdown Format
  const telegram_post = `🔥 *${title}*

💡 _${summary}_

⚡ *أبرز المميزات والأدوات:*
• شرح خطوة بخطوة باللغة العربية 🇲🇦
• روابط الكود والموارد المباشرة 🛠️
• مجاني بالكامل وبدون قيود 🚀

📖 *اقرأ الشرح الكامل الآن:*
[اضغط هنا لقراءة المقال على الأكاديمية](${url})

#BouibaAcademy #${category.replace(/[^a-zA-Z0-9أ-ي]/g, "_")}`;

  // 5. Pinterest Pin Package
  const pinterest_title = title.slice(0, 95);
  const pinterest_description = `${summary.slice(0, 480)}... اقرأ الشرح الكامل مجاناً على Bouiba Academy: ${url}`;

  // 6. Reddit / Dev.to Summary Format
  const reddit_post = `### 🚀 ${title}

**TL;DR:** ${summary}

#### Key Takeaways:
- Step-by-step practical guide with real code snippets.
- Open-source, free tools and cloud integrations.
- Production-ready best practices.

[Read full guide on Bouiba Academy](${url})`;

  return {
    id: item.slug || item.id,
    slug: item.slug || item.id,
    title,
    category,
    url,
    thumbnail,
    created_at: item.created_at || new Date().toISOString().split("T")[0],
    
    // Multi-Platform Tailored Texts
    facebook: {
      post_text: facebook_post,
      comment_link: url,
      direct_share_url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    twitter: {
      tweet_1: x_tweet_1,
      tweet_2: x_tweet_2,
      direct_share_url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`📌 ${title}\n\n${url}`)}&hashtags=BouibaAcademy,AI,Tech`,
    },
    linkedin: {
      post_text: linkedin_post,
      direct_share_url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    telegram: {
      post_markdown: telegram_post,
      direct_share_url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`📌 ${title}`)}`,
    },
    pinterest: {
      title: pinterest_title,
      description: pinterest_description,
      direct_share_url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(thumbnail)}&description=${encodeURIComponent(title)}`,
    },
    reddit: {
      post_markdown: reddit_post,
      direct_share_url: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
  };
}

async function main() {
  console.log("=========================================");
  console.log("🚀 Bouiba Academy — Omni-Channel Social Posts Generator");
  console.log("=========================================");

  const allOmniItems = [];

  // 1. Process Local Posts
  if (fs.existsSync(LOCAL_POSTS_DIR)) {
    const postFolders = fs.readdirSync(LOCAL_POSTS_DIR);
    for (const folder of postFolders) {
      const folderPath = path.join(LOCAL_POSTS_DIR, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const metaPath = path.join(folderPath, "meta.json");
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
            const slug = meta.slug || folder;
            const url = `https://www.bouibacademy.me/posts/${slug}`;
            const pkg = formatMultiPlatformPackage({
              slug,
              title: meta.title,
              desc: meta.excerpt || meta.meta_description,
              url,
              thumbnail: meta.thumbnail,
              category: meta.category,
              created_at: meta.created_at,
            });
            allOmniItems.push(pkg);
          } catch (e) {
            console.warn(`Error reading ${metaPath}:`, e.message);
          }
        }
      }
    }
  }

  // 2. Fetch Remote Blogger Feed Articles if available
  try {
    const res = await fetch(BLOGGER_FEED_URL);
    if (res.ok) {
      const data = await res.json();
      const entries = data.feed?.entry || [];
      for (const entry of entries) {
        const title = entry.title?.$t || "";
        const rawContent = entry.content?.$t || entry.summary?.$t || "";
        const cleanDesc = cleanHtmlText(rawContent).slice(0, 180);
        
        let link = entry.link?.find((l) => l.rel === "alternate")?.href || "";
        if (!link) continue;

        // Ensure canonical domain
        if (link.includes("academybouiba.blogspot.com")) {
          const match = link.match(/\/(\d{4})\/(\d{2})\/([^\/]+)\.html/);
          if (match) {
            const slug = match[3];
            link = `https://www.bouibacademy.me/posts/${slug}`;
          }
        }

        // Avoid duplicate local posts
        if (!allOmniItems.some((item) => item.url === link || item.title === title)) {
          let thumbnail = "https://www.bouibacademy.me/og-banner.png";
          if (entry.media$thumbnail?.url) {
            thumbnail = entry.media$thumbnail.url.replace(/\/s72-c\//, "/s1600/");
          }
          const pkg = formatMultiPlatformPackage({
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            title,
            desc: cleanDesc,
            url: link,
            thumbnail,
            category: "مقالات تقنية",
            created_at: entry.published?.$t?.split("T")[0] || new Date().toISOString().split("T")[0],
          });
          allOmniItems.push(pkg);
        }
      }
    }
  } catch (e) {
    console.warn("Could not fetch remote Blogger feed, proceeding with local posts:", e.message);
  }

  // Sort newest first
  allOmniItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Save JSON
  fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(allOmniItems, null, 2), "utf-8");

  // Legacy compatibility for facebook-posts.json
  const legacyFbList = allOmniItems.map((item) => ({
    id: item.id,
    title: item.title,
    facebook_post_ar: item.facebook.post_text,
    facebook_comment_link: item.url,
    thumbnail: item.thumbnail,
    category: item.category,
    created_at: item.created_at,
  }));
  fs.writeFileSync(LEGACY_FB_JSON, JSON.stringify(legacyFbList, null, 2), "utf-8");

  // Save CSV
  let csv = "ID,Title,Category,URL,Thumbnail,Facebook_Post,Twitter_Post,LinkedIn_Post,Telegram_Markdown,Pinterest_Title,Pinterest_Desc\n";
  for (const item of allOmniItems) {
    const esc = (txt = "") => `"${String(txt).replace(/"/g, '""')}"`;
    csv += `${esc(item.id)},${esc(item.title)},${esc(item.category)},${esc(item.url)},${esc(item.thumbnail)},${esc(item.facebook.post_text)},${esc(item.twitter.tweet_1)},${esc(item.linkedin.post_text)},${esc(item.telegram.post_markdown)},${esc(item.pinterest.title)},${esc(item.pinterest.description)}\n`;
  }
  fs.writeFileSync(CSV_OUTPUT_PATH, csv, "utf-8");

  console.log(`=========================================`);
  console.log(`🎉 Generated Omni-Channel Post Packages for ${allOmniItems.length} articles!`);
  console.log(`📄 Saved JSON: ${JSON_OUTPUT_PATH}`);
  console.log(`📊 Saved CSV: ${CSV_OUTPUT_PATH}`);
  console.log(`=========================================`);
}

main().catch(console.error);
