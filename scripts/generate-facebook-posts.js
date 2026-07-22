import fs from "fs";
import path from "path";

const BLOGGER_FEED_URL = "https://academybouiba.blogspot.com/feeds/posts/default?alt=json&max-results=500";
const LOCAL_POSTS_DIR = path.join(process.cwd(), "content", "posts");
const OUTPUT_DIR = path.join(process.cwd(), "content", "facebook-posts");
const JSON_OUTPUT_PATH = path.join(OUTPUT_DIR, "facebook-posts.json");
const CSV_OUTPUT_PATH = path.join(OUTPUT_DIR, "facebook-posts.csv");

// Interactive Platform Tools on Bouiba Academy
const PLATFORM_TOOLS = [
  {
    slug: "tool-image-gen",
    title: "أداة تحويل النص إلى صورة بالذكاء الاصطناعي 🖼️",
    desc: "أنشئ صوراً وتصاميم احترافية عالية الجودة من وصف نصي بالعربية أو الإنجليزية مجاناً بضغطة زر واحدة.",
    url: "https://www.bouibacademy.me/tools/image",
    category: "أدوات الذكاء الاصطناعي (AI Tools)",
    promptName: "Text to Image AI Generator Tool",
  },
  {
    slug: "tool-roadmap-ai",
    title: "مستشار مسارات التعلم التفاعلي (AI Learning Roadmap) 🗺️",
    desc: "أدخل أي تخصص أو تقنية وسيولد لك الذكاء الاصطناعي خريطة طريق تفاعلية ممتازة للتعلم مع مصادر مجانية.",
    url: "https://www.bouibacademy.me/tools/roadmap",
    category: "أدوات الذكاء الاصطناعي (AI Tools)",
    promptName: "AI Learning Roadmap Consultant Tool",
  },
  {
    slug: "tool-prompt-architect",
    title: "مُصمم ومُحسن البرومبت الذكي (Smart Prompt Architect) ✨",
    desc: "حوّل أوامرك البسيطة إلى Prompts احترافية ومواصفات هندسية دقيقة للحصول على أفضل نتائج من ChatGPT و Midjourney.",
    url: "https://www.bouibacademy.me/tools/prompt",
    category: "أدوات الذكاء الاصطناعي (AI Tools)",
    promptName: "Smart Prompt Architect Tool",
  },
  {
    slug: "tool-code-assistant",
    title: "مساعد البرمجة وشرح الأكواد والـ Debugging 💻",
    desc: "الصق أي كود برمجي بلغة Python أو JS أو C++ وسيشرحه لك الذكاء الاصطناعي مع اكتشاف الثغرات وتصحيح الأخطاء فورياً.",
    url: "https://www.bouibacademy.me/tools/code",
    category: "أدوات الذكاء الاصطناعي (AI Tools)",
    promptName: "AI Code Assistant and Debugger Tool",
  },
  {
    slug: "tool-summarizer-ai",
    title: "أداة تلخيص المقالات والوثائق الطويلة 📄",
    desc: "احصل على ملخص عربي مكثف وواضح لأطول المقالات والبحوث التقنية في نقاط سريعة خلال ثوانٍ معدودة.",
    url: "https://www.bouibacademy.me/tools/summarize",
    category: "أدوات الذكاء الاصطناعي (AI Tools)",
    promptName: "AI Article Summarizer Tool",
  },
  {
    slug: "tool-idea-generator",
    title: "مولّد أفكار المقالات والمحتوى الجذاب 💡",
    desc: "أدخل أي موضوع تقني وسيقوم الذكاء الاصطناعي بتوليد عشرات العناوين والمحاور التسويقية المحسنة لمسارات البحث.",
    url: "https://www.bouibacademy.me/tools/ideas",
    category: "أدوات الذكاء الاصطناعي (AI Tools)",
    promptName: "AI Article Ideas Generator Tool",
  },
  {
    slug: "tool-translator-ai",
    title: "مُترجم النصوص والوثائق التقنية الاحترافي 🌐",
    desc: "ترجمة دقيقة وطبيعية بين العربية والإنجليزية والفرنسية مصممة خصيصاً للمصطلحات البرمجية والتقنية دون ترجمة حرفية.",
    url: "https://www.bouibacademy.me/tools/translate",
    category: "أدوات الذكاء الاصطناعي (AI Tools)",
    promptName: "AI Technical Translator Tool",
  },
  {
    slug: "tool-seo-assistant",
    title: "مساعد السيو (SEO) والكلمات المفتاحية العربي 🔍",
    desc: "احصل على عناوين متوافقة مع محركات البحث، Meta Descriptions، وكلمات مفتاحية مستهدفة لرفع ترتيب موقعك على جوجل.",
    url: "https://www.bouibacademy.me/tools/seo",
    category: "أدوات الذكاء الاصطناعي (AI Tools)",
    promptName: "Arabic SEO Assistant Tool",
  },
];

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
  const baseTags = ["#BouibaAcademy", "#Bouiba_Academy", "#أدوات_الذكاء_الاصطناعي", "#تقنية"];
  const text = (category + " " + title).toLowerCase();

  if (text.includes("ai") || text.includes("ذكاء") || text.includes("ollama") || text.includes("صورة")) {
    baseTags.push("#الذكاء_الاصطناعي", "#AI", "#ArtificialIntelligence");
  }
  if (text.includes("n8n") || text.includes("أتمتة") || text.includes("automation") || text.includes("make")) {
    baseTags.push("#أتمتة", "#Automation", "#n8n", "#NoCode");
  }
  if (text.includes("code") || text.includes("كود") || text.includes("برمجة") || text.includes("تطوير")) {
    baseTags.push("#برمجة", "#WebDev", "#تكوين_تقني");
  }
  if (text.includes("seo") || text.includes("سيو")) {
    baseTags.push("#سيو", "#SEO", "#تسويق_رقمي");
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
  return "أدوات وتقنيات";
}

// Generate Facebook Arabic Post Text (Link ONLY in first comment to avoid FB reach penalty)
function generateFacebookPostAr(title, desc, url, category) {
  const hashtags = generateHashtags(category, title);

  return `🛠️ ${title}

💡 ${desc.slice(0, 190)}...

🚀 جرب هذه الأداة/المقال مجاناً اليوم وطوّر إنتاجيتك بنقرة واحدة مع Bouiba Academy!

👇 رابط الاستخدام والشرح المباشر تجدونه في أول تعليق (Comment 💬) 📌

${hashtags}`;
}

// Generate First Comment Link Text
function generateFacebookCommentLink(url) {
  return `🔗 رابط التجربة والقراءة المباشرة من هنا:\n${url}`;
}

// Generate French/English Short Excerpt
function generateFacebookPostFrEn(title, desc, url) {
  return `📌 ${title}
Try this free interactive AI tool on Bouiba Academy:
👉 Link in first comment 💬`;
}

// Generate Arabic Image Description
function generateArabicImageDescription(title, category) {
  return `تصميم تقني عصري بنمط 3D داكن يعكس أداة "${title}" مع شاشة تفاعلية وإضاءة نيون أرجوانية وزرقاء تعبر عن التكنولوجيا والذكاء الاصطناعي.`;
}

// Generate AI Image Prompt in English
function generateAiImagePromptEn(titleName) {
  const clean = titleName.replace(/[^\w\s]/gi, "").trim() || "modern AI tool UI workspace";

  return `A sleek high-end 3D tech render representing "${clean}". Modern dark glass user interface, glowing neon blue and gold elements, developer desktop workspace, floating AI holographic icons, octane render, 8k resolution, minimalist style, no text --ar 4:5`;
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
    "Facebook_Comment_Link",
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
    escapeCsv(r.facebook_comment_link),
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
  console.log("🚀 Bouiba Academy — Tools & Posts Facebook Automation");
  console.log("=========================================\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const records = [];

  // 1. Process Interactive Platform Tools
  console.log("🛠️ Processing Interactive Platform AI Tools...");
  for (const tool of PLATFORM_TOOLS) {
    const fbPostAr = generateFacebookPostAr(tool.title, tool.desc, tool.url, tool.category);
    const fbCommentLink = generateFacebookCommentLink(tool.url);
    const fbPostFrEn = generateFacebookPostFrEn(tool.title, tool.desc, tool.url);
    const imgDescAr = generateArabicImageDescription(tool.title, tool.category);
    const imgPromptEn = generateAiImagePromptEn(tool.promptName);

    records.push({
      id: tool.slug,
      title: tool.title,
      slug: tool.slug,
      url: tool.url,
      category: tool.category,
      labels: ["أدوات_الموقع", "ذكاء_اصطناعي"],
      published: new Date().toISOString().split("T")[0],
      excerpt: tool.desc,
      thumbnail: "https://www.bouibacademy.me/og-banner.png",
      facebook_post_ar: fbPostAr,
      facebook_comment_link: fbCommentLink,
      facebook_post_fr_en: fbPostFrEn,
      image_description_ar: imgDescAr,
      image_prompt_en: imgPromptEn,
      created_at: new Date().toISOString(),
    });
  }

  // 2. Process Blog Articles
  console.log("🔍 Extracting published blog posts (Local + Blogger)...");
  const [localPosts, bloggerPosts] = await Promise.all([getLocalPosts(), getBloggerPosts()]);
  const allArticles = [...localPosts, ...bloggerPosts];

  console.log(`📦 Retrieved total ${allArticles.length} articles.`);

  for (const article of allArticles) {
    const cat = mapCategory(article.labels, article.title);
    const fbPostAr = generateFacebookPostAr(article.title, article.excerpt, article.url, cat);
    const fbCommentLink = generateFacebookCommentLink(article.url);
    const fbPostFrEn = generateFacebookPostFrEn(article.title, article.excerpt, article.url);
    const imgDescAr = generateArabicImageDescription(article.title, cat);
    const imgPromptEn = generateAiImagePromptEn(article.title);

    records.push({
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
      facebook_comment_link: fbCommentLink,
      facebook_post_fr_en: fbPostFrEn,
      image_description_ar: imgDescAr,
      image_prompt_en: imgPromptEn,
      created_at: new Date().toISOString(),
    });
  }

  // Save JSON & CSV
  fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(records, null, 2), "utf-8");
  saveCsv(records);

  console.log("\n=========================================");
  console.log(`🎉 Facebook Content Generation Finished!`);
  console.log(`🛠️ Included ${PLATFORM_TOOLS.length} Interactive AI Tools.`);
  console.log(`📁 Total processed posts & tools: ${records.length}`);
  console.log(`📄 Saved to JSON: ${JSON_OUTPUT_PATH}`);
  console.log(`📊 Saved to CSV: ${CSV_OUTPUT_PATH}`);
  console.log("=========================================\n");
}

main().catch(console.error);
