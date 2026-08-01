import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Ensure .env variables are loaded if present
try {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value.trim();
      }
    });
  }
} catch {
  // Ignore env loading errors
}

const API_KEY = process.env.GEMINI_API_KEY;
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

// 1. Get existing post slugs to avoid duplicate content
const existingSlugs = fs
  .readdirSync(POSTS_DIR, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

console.log(`📌 Found ${existingSlugs.length} existing articles in content/posts.`);

// 2. High-value topics list to pick from
const TOPIC_DOMAINS = [
  "أتمتة العمليات والمهام باستخدام n8n و Make والذكاء الاصطناعي",
  "نماذج الذكاء الاصطناعي المحلية والفرص باستخدام Ollama و DeepSeek و Llama 3",
  "بناء وكلاء الذكاء الاصطناعي (AI Agents) والأتمتة الذكية للشركات",
  "أدوات الذكاء الاصطناعي المجانية والسيرفرات السحابية المجانية للمطورين",
  "تقنيات السيو البرمجي (Technical SEO) وتحسين سرعة وأداء المواقع",
  "الأمن السيبراني وحماية السيرفرات والتطبيقات للمطورين",
  "بناء تطبيقات الويب الحديثة باستخدام React و Tailwind و Python و Webhooks",
];

const selectedDomain = TOPIC_DOMAINS[Math.floor(Math.random() * TOPIC_DOMAINS.length)];

const systemPrompt = `أنت كاتب تقني خبير لمدونة Bouiba Academy (أكاديمية بويبة للتقنية والذكاء الاصطناعي).
مهمتك هي كتابة مقال تقني عربي ممتاز وعالي الجودة ومجرب عملياً حول مجال: "${selectedDomain}".

قائمة السلاجز (Slugs) الموجودة مسبقاً في الموقع لمنع التكرار:
${JSON.stringify(existingSlugs.slice(0, 10))}

شروط المقال:
1. يجب اختيار موضوع فريد لم يكتب عنه مسبقاً في قائمة السلاجز أعلاه.
2. اكتب المقال بأسلوب عملي، مباشر، احترافي، بدون حشو إرشادي، باللغة العربية الفصحى.
3. يجب أن يحتوي الكود/المحتوى على خطوة بخطوة عملياً، أمثلة حقيقية، وكود محدد إن أمكن.
4. يجب إعادة الإجابة فقط بصيغة JSON صالح بالبنية التالية تماماً ودون أي نص خارجي أو علامات تنصيص Markdown كود:
{
  "title": "عنوان المقال الجذاب والمحسّن للسيو بالعربية",
  "slug": "unique-english-kebab-case-slug",
  "category": "AI & Automation",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "excerpt": "ملخص مميز للمقال في 2-3 جمل كحد أقصى باللغة العربية",
  "meta_description": "وصف Meta للسيو يصف المحتوى بوضوح وأقل من 160 حرف",
  "target_keywords": ["كلمة مفتاحية 1", "كلمة مفتاحية 2", "كلمة مفتاحية 3", "كلمة مفتاحية 4"],
  "cover_prompt": "An English prompt describing a futuristic, sleek technology illustration for this article",
  "content_markdown": "# عنوان H1 المقال\\n\\nمقدمة حماسية مباشرة...\\n\\n## قسم 1...\\n\\n## قسم 2...\\n\\n## الأسئلة الشائعة (FAQ)\\n\\n### س1...\\n"
}`;

async function fetchFromGemini() {
  console.log("🤖 Generating article using Gemini API...");
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(API_KEY)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API HTTP Error ${response.status}: ${errText}`);
  }

  const resData = await response.json();
  const textContent = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) throw new Error("Empty response from Gemini API");
  return textContent;
}

function getLocalFallbackArticle() {
  console.log(
    "ℹ️ GEMINI_API_KEY not found in local environment. Generating mock daily article template for local verification...",
  );
  const timestamp = Date.now().toString().slice(-4);
  return JSON.stringify({
    title: `أفضل الممارسات المتقدمة لبناء وكلاء الذكاء الاصطناعي والأتمتة لعام 2026 (${timestamp})`,
    slug: `ai-agents-best-practices-guide-${timestamp}`,
    category: "AI & Automation",
    tags: ["AI Agents", "n8n", "Automation", "LLM"],
    excerpt:
      "دليل عملي شامل لاستعراض أحدث تقنيات أتمتة المهام وتصميم وكلاء الذكاء الاصطناعي للشركات والمطورين مع أمثلة وسيناريوهات حقيقية.",
    meta_description:
      "دليل أفضل الممارسات لبناء وتصميم وكلاء الذكاء الاصطناعي وأنظمة الأتمتة المتقدمة للشركات والمطورين لعام 2026.",
    target_keywords: ["وكلاء الذكاء الاصطناعي", "أتمتة المهام", "n8n AI Agents", "AI Automation"],
    cover_prompt:
      "High-tech 3D render of autonomous AI agents working in a futuristic automated workflow ecosystem, neon lighting, 8k resolution",
    content_markdown: `# أفضل الممارسات المتقدمة لبناء وكلاء الذكاء الاصطناعي والأتمتة لعام 2026\n\nأصبحت **أتمتة المهام المعقدة** باستخدام وكلاء الذكاء الاصطناعي (AI Agents) الركيزة الأساسية للمطورين والشركات التقنية التي تسعى لزيادة الإنتاجية وتقليل التكاليف التشغيلية.\n\n## 1. ما هو وكيل الذكاء الاصطناعي (AI Agent)؟\n\nعلى عكس الشات بوت التقليدي، يمتلك الوكيل الذكي القدرة على اتخاذ القرارات، استخدام الأدوات الخارجية (Tools)، واستدعاء APIs تنفيذية لإكمال مهمة محددة بشكل مستقل.\n\n### أهم المكونات الأساسية:\n- **الذاكرة (Memory):** تتبع السياق والتفاعلات السابقة.\n- **الأدوات (Tools):** ربط الوكيل بقواعد البيانات والـ Webhooks.\n- **التخطيط (Planning):** تقسيم المهمة الكبيرة إلى خطوات منطقية صغيرة.\n\n## 2. خطوات بناء سير عمل مؤتمت بالكامل\n\n1. حدد المهمة والهدف النهائي بدقة.\n2. اختر النموذج المناسب (مثل Gemini 2.5 Flash أو DeepSeek R1).\n3. قم بربط المحفزات (Triggers) في منصات مثل n8n أو Make.\n4. اختبر سير العمل وتأكد من وجود نظام معالجة الأخطاء (Error Handling).\n\n## الأسئلة الشائعة (FAQ)\n\n### هل يمكن تشغيل الوكلاء محلياً بدون تكاليف سحابية؟\nنعم، يمكنك استخدام نماذج محليّة عبر Ollama مع n8n لتنفيذ المهام دون الحاجة لاشتراكات مدفوعة.\n\n### ما هي أفضل المنصات لبدء أتمتة العمليات؟\nتعد منصة n8n الخيار المفضل للمطورين بفضل دعمها للمحلي والسحابي وتوفر أكثر من 400 عقدة جاهزة.\n`,
  });
}

async function generateArticle() {
  let rawJsonText = "";
  if (API_KEY) {
    try {
      rawJsonText = await fetchFromGemini();
    } catch (e) {
      console.warn("⚠️ Gemini API failed. Using local fallback template...", e);
      rawJsonText = getLocalFallbackArticle();
    }
  } else {
    rawJsonText = getLocalFallbackArticle();
  }

  const cleanedText = rawJsonText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let articleData;
  try {
    articleData = JSON.parse(cleanedText);
  } catch (parseErr) {
    console.error("❌ Failed to parse JSON response:", cleanedText);
    throw parseErr;
  }

  if (!articleData.slug || !articleData.title || !articleData.content_markdown) {
    throw new Error("Generated JSON does not match expected article structure");
  }

  // Ensure slug format
  const cleanSlug = articleData.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const articleDir = path.join(POSTS_DIR, cleanSlug);

  if (fs.existsSync(articleDir)) {
    console.log(`⚠️ Article slug "${cleanSlug}" already exists. Skipping.`);
    return;
  }

  fs.mkdirSync(articleDir, { recursive: true });

  const todayStr = new Date().toISOString().split("T")[0];

  const techImages = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
  ];

  const metaData = {
    title: articleData.title,
    slug: cleanSlug,
    excerpt: articleData.excerpt,
    meta_description: articleData.meta_description,
    target_keywords: articleData.target_keywords || [],
    thumbnail: techImages[Math.floor(Math.random() * techImages.length)],
    category: articleData.category || "AI & Tech",
    tags: articleData.tags || ["AI", "Automation", "Tech"],
    created_at: todayStr,
    language: "ar",
  };

  // 1. Write meta.json
  fs.writeFileSync(path.join(articleDir, "meta.json"), JSON.stringify(metaData, null, 2), "utf8");

  // 2. Write post.md
  fs.writeFileSync(path.join(articleDir, "post.md"), articleData.content_markdown, "utf8");

  // 3. Write cover-prompt.txt
  if (articleData.cover_prompt) {
    fs.writeFileSync(path.join(articleDir, "cover-prompt.txt"), articleData.cover_prompt, "utf8");
  }

  console.log(`✅ Successfully generated new article: "${articleData.title}" (${cleanSlug})`);

  // 4. Update omni social posts
  console.log("🔄 Regenerating omni-social-posts...");
  try {
    execSync("node scripts/generate-omni-social-posts.js", { stdio: "inherit" });
  } catch (err) {
    console.warn("⚠️ Warning: Failed to run generate-omni-social-posts.js", err);
  }
}

generateArticle().catch((err) => {
  console.error("❌ Article Generation Error:", err);
  process.exit(1);
});
