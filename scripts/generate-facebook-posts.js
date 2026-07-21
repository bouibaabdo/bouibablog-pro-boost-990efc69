import fs from "fs";
import path from "path";

const BLOGGER_FEED_URL = "https://academybouiba.blogspot.com/feeds/posts/default?alt=json&max-results=500";
const LOCAL_POSTS_DIR = path.join(process.cwd(), "content", "posts");
const OUTPUT_DIR = path.join(process.cwd(), "content", "facebook-posts");
const JSON_OUTPUT_PATH = path.join(OUTPUT_DIR, "facebook-posts.json");
const CSV_OUTPUT_PATH = path.join(OUTPUT_DIR, "facebook-posts.csv");

// Helper to strip HTML tags and sanitize text
function cleanHtmlText(html = "") {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Generate Moroccan / Arab developer friendly hashtags
function generateHashtags(category, title) {
  const baseTags = ["#BouibaAcademy", "#Bouiba_Academy", "#تقنية", "#تطوير_الويب"];
  const text = (category + " " + title).toLowerCase();

  if (text.includes("ai") || text.includes("ذكاء") || text.includes("ollama")) {
    baseTags.push("#الذكاء_الاصطناعي", "#AI", "#ArtificialIntelligence");
  }
  if (text.includes("n8n") || text.includes("أتمتة") || text.includes("automation") || text.includes("make")) {
    baseTags.push("#أتمتة", "#Automation", "#n8n", "#NoCode");
  }
  if (text.includes("web") || text.includes("تطوير") || text.includes("برمجة") || text.includes("react")) {
    baseTags.push("#برمجة", "#WebDev", "#تكوين_تقني");
  }
  if (text.includes("seo") || text.includes("سيو")) {
    baseTags.push("#سيو", "#SEO", "#تسويق_رقمي");
  }
  if (text.includes("تطبيقات") || text.includes("آيفون") || text.includes("أندرويد")) {
    baseTags.push("#تطبيقات", "#Android", "#iOS");
  }

  return Array.from(new Set(baseTags)).join(" ");
}

// Determine Category
function mapCategory(labels = [], title = "") {
  const combined = (labels.join(" ") + " " + title).toLowerCase();
  if (combined.includes("n8n") || combined.includes("أتمتة") || combined.includes("automation")) return "أتمتة الذكاء الاصطناعي (AI Automation)";
  if (combined.includes("ollama") || combined.includes("ai") || combined.includes("ذكاء")) return "الذكاء الاصطناعي (Artificial Intelligence)";
  if (combined.includes("seo") || combined.includes("سيو")) return "SEO وتقنيات البحث";
  if (combined.includes("تطبيقات") || combined.includes("أندرويد") || combined.includes("آيفون")) return "تطبيقات وأجهزة ذكية";
  if (combined.includes("ويندوز") || combined.includes("حاسوب") || combined.includes("رام")) return "أنظمة التشغيل والعتاد";
  return "تقنية وتطوير الويب";
}

// Generate Facebook Arabic Post Text
function generateFacebookPostAr(title, excerpt, url, category) {
  const hashtags = generateHashtags(category, title);
  
  return `🔥 ${title}

💡 ${excerpt.slice(0, 180)}...

🚀 دليل عملي وسهل للجميع لتطوير مهاراتك وتقنياتك اليوم مع Bouiba Academy!

👇 اقرأ المقال الشامل والتطبيق العملي من هنا:
🔗 ${url}

${hashtags}`;
}

// Generate French/English Short Excerpt
function generateFacebookPostFrEn(title, excerpt, url) {
  return `📌 ${title}
Discover this practical tech guide on Bouiba Academy:
👉 ${url}`;
}

// Generate Arabic Image Description
function generateArabicImageDescription(title, category) {
  return `تصميم تقني عصري وأنيق يجسد موضوع "${title}" بنمط 3D داكن مع إضاءة نيون زرقاء وأرجوانية وشاشة برمجية تفاعلية تعكس التكنولوجيا والابتكار.`;
}

// Generate AI Image Prompt in English for Midjourney / Dall-E / Antigravity Image Generator
function generateAiImagePromptEn(title, category) {
  const topicClean = title.replace(/[^\w\s]/gi, "").trim() || "modern AI automation workspace";
  
  return `A high-end, professional 3D tech illustration representing "${topicClean}". Modern minimalist style with glowing neon blue and purple accents, sleek dark futuristic workspace interface, subtle holographic data nodes and code elements on glass screen. Clean composition, cinematic lighting, octane render, 8k resolution, photorealistic tech aesthetic, no text or typography inside image --ar 4:5`;
}

// Extract Local Posts
function getLocalPosts() {
  const posts = [];
  if (!fs.existsSync(LOCAL_POSTS_DIR)) return posts;

  const dirs = fs.readdirSync(LOCAL_POSTS_DIR);
  for (const d of dirs) {
    const metaPath = path.join(LOCAL_POSTS_DIR, d, "meta.json");
    const mdPath = path.join(LOCAL_POSTS_DIR, d, "post.md");

    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        let body = meta.excerpt || "";
        if (fs.existsSync(mdPath)) {
          body = cleanHtmlText(fs.readFileSync(mdPath, "utf-8"));
        }
        posts.push({
          id: meta.slug || d,
          title: meta.title,
          slug: meta.slug || d,
          url: `https://www.bouibacademy.me/posts/${meta.slug || d}`,
          published: meta.created_at || new Date().toISOString(),
          category: meta.category || "تقنية",
          labels: meta.tags || [meta.category || "تقنية"],
          excerpt: meta.excerpt || body.slice(0, 200),
          thumbnail: meta.thumbnail || "",
          source: "local",
        });
      } catch (e) {
        console.error(`Error reading local post ${d}:`, e.message);
      }
    }
  }
  return posts;
}

// Extract Blogger Feed Posts
async function getBloggerPosts() {
  try {
    const res = await fetch(BLOGGER_FEED_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const entries = data.feed?.entry || [];

    return entries.map((entry) => {
      const title = entry.title?.$t || "";
      const altLink = entry.link?.find((l) => l.rel === "alternate")?.href || "";
      let slug = "";
      try {
        const u = new URL(altLink);
        const match = u.pathname.match(/^\/\d{4}\/\d{2}\/([^/]+)\.html$/);
        slug = match?.[1] ? match[1] : u.pathname.replace(/^\/+|\.html$/g, "");
        slug = decodeURIComponent(slug).replace(/\s+/g, "").trim();
      } catch {
        slug = title.toLowerCase().replace(/[^\w]/g, "-");
      }

      const content = cleanHtmlText(entry.content?.$t || "");
      const excerpt = content.slice(0, 220);
      const thumbnail = entry.media$thumbnail?.url?.replace(/\/s\d+(-c)?\//, "/s1600/") || "";
      const labels = entry.category?.map((c) => c.term) || [];

      return {
        id: slug || entry.id?.$t,
        title,
        slug,
        url: `https://www.bouibacademy.me/posts/${slug}`,
        published: entry.published?.$t || new Date().toISOString(),
        category: labels[0] || "تقنية",
        labels,
        excerpt,
        thumbnail,
        source: "blogger",
      };
    });
  } catch (err) {
    console.error("Failed to fetch Blogger posts:", err.message);
    return [];
  }
}

// Save CSV Helper with UTF-8 BOM
function saveCsv(records) {
  const headers = [
    "ID",
    "Title",
    "URL",
    "Category",
    "Published_Date",
    "Facebook_Post_AR",
    "Facebook_Post_FR_EN",
    "Arabic_Image_Description",
    "AI_Image_Prompt_EN",
    "Thumbnail_URL",
  ];

  const escapeCsv = (str = "") => `"${String(str).replace(/"/g, '""')}"`;

  const rows = records.map((r) => [
    escapeCsv(r.id),
    escapeCsv(r.title),
    escapeCsv(r.url),
    escapeCsv(r.category),
    escapeCsv(r.published),
    escapeCsv(r.facebook_post_ar),
    escapeCsv(r.facebook_post_fr_en),
    escapeCsv(r.image_description_ar),
    escapeCsv(r.image_prompt_en),
    escapeCsv(r.thumbnail),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  fs.writeFileSync(CSV_OUTPUT_PATH, csvContent, "utf-8");
}

// Main Execution
async function main() {
  console.log("=========================================");
  console.log("🚀 Bouiba Academy — Facebook Post Automation");
  console.log("=========================================\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load existing posts for deduplication
  let existingRecords = [];
  const existingIds = new Set();

  if (fs.existsSync(JSON_OUTPUT_PATH)) {
    try {
      existingRecords = JSON.parse(fs.readFileSync(JSON_OUTPUT_PATH, "utf-8"));
      existingRecords.forEach((r) => r.id && existingIds.add(r.id));
      console.log(`📋 Found ${existingRecords.length} previously processed Facebook posts.`);
    } catch {
      existingRecords = [];
    }
  }

  console.log("🔍 Extracting published blog posts (Local + Blogger)...");
  const [localPosts, bloggerPosts] = await Promise.all([getLocalPosts(), getBloggerPosts()]);
  const allArticles = [...localPosts, ...bloggerPosts];

  console.log(`📦 Retrieved total ${allArticles.length} articles.`);

  const newRecords = [];
  let addedCount = 0;

  for (const article of allArticles) {
    if (existingIds.has(article.id) || existingIds.has(article.slug)) {
      continue;
    }

    const cat = mapCategory(article.labels, article.title);
    const fbPostAr = generateFacebookPostAr(article.title, article.excerpt, article.url, cat);
    const fbPostFrEn = generateFacebookPostFrEn(article.title, article.excerpt, article.url);
    const imgDescAr = generateArabicImageDescription(article.title, cat);
    const imgPromptEn = generateAiImagePromptEn(article.title, cat);

    const record = {
      id: article.slug || article.id,
      title: article.title,
      slug: article.slug,
      url: article.url,
      category: cat,
      labels: article.labels,
      published: article.published,
      excerpt: article.excerpt,
      thumbnail: article.thumbnail,
      facebook_post_ar: fbPostAr,
      facebook_post_fr_en: fbPostFrEn,
      image_description_ar: imgDescAr,
      image_prompt_en: imgPromptEn,
      created_at: new Date().toISOString(),
    };

    newRecords.push(record);
    existingIds.add(record.id);
    addedCount++;
    console.log(`✨ Processed new article: "${article.title}"`);
  }

  const finalRecords = [...newRecords, ...existingRecords];

  // Save JSON & CSV
  fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(finalRecords, null, 2), "utf-8");
  saveCsv(finalRecords);

  console.log("\n=========================================");
  console.log(`🎉 Automation Finished Successfully!`);
  console.log(`➕ Added ${addedCount} new Facebook posts.`);
  console.log(`📁 Total saved posts: ${finalRecords.length}`);
  console.log(`📄 Saved to JSON: ${JSON_OUTPUT_PATH}`);
  console.log(`📊 Saved to CSV: ${CSV_OUTPUT_PATH}`);
  console.log("=========================================\n");
}

main().catch(console.error);
