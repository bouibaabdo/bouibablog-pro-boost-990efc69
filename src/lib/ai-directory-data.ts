export interface AIDirectoryTool {
  name: string;
  arabicName?: string;
  description: string;
  category:
    | "writing"
    | "design"
    | "video"
    | "coding"
    | "productivity"
    | "education"
    | "business"
    | "arabic";
  tags: string[];
  pricing: "free" | "freemium" | "paid";
  link: string;
  rating: number;
}

export const CATEGORIES_MAP = {
  writing: "كتابة ونصوص",
  design: "تصميم وصور",
  video: "فيديو وموسيقى",
  coding: "برمجة وتطوير",
  productivity: "إنتاجية وإدارة مهام",
  education: "تعليم وأبحاث",
  business: "أعمال وشركات",
  arabic: "أدوات ومشاريع عربية",
} as const;

export const AI_DIRECTORY_TOOLS: AIDirectoryTool[] = [
  // --- 1. الكتابة والنصوص ---
  {
    name: "ChatGPT",
    arabicName: "شات جي بي تي",
    description:
      "مساعد ذكي رائد من OpenAI لإنشاء المحتوى والكتابة الإبداعية والتحليل البرمجي بأكثر من 90 لغة.",
    category: "writing",
    tags: ["مساعد ذكي", "توليد نصوص", "عصف ذهني"],
    pricing: "freemium",
    link: "https://chatgpt.com",
    rating: 4.9,
  },
  {
    name: "Claude",
    arabicName: "كلود",
    description:
      "نموذج لغوي متقدم من Anthropic يتميز بالدقة الشديدة، التحليل المعمّق للنصوص الطويلة، والأمان العالي.",
    category: "writing",
    tags: ["مساعد ذكي", "تحليل نصوص", "برمجة"],
    pricing: "freemium",
    link: "https://claude.ai",
    rating: 4.9,
  },
  {
    name: "Jasper",
    arabicName: "جاسبر",
    description:
      "منصة كتابة تسويقية متكاملة بالذكاء الاصطناعي مصممة لفرق التسويق وكتاب المحتوى الرقمي.",
    category: "writing",
    tags: ["تسويق", "إعلانات", "مدونات"],
    pricing: "paid",
    link: "https://www.jasper.ai",
    rating: 4.7,
  },
  {
    name: "Copy.ai",
    arabicName: "كوبي إيه آي",
    description:
      "أداة ذكية لتوليد النصوص التسويقية والإعلانية السريعة والمنشورات الاجتماعية باستخدام قوالب جاهزة.",
    category: "writing",
    tags: ["تسويق", "سوشيال ميديا", "نسخ إعلانية"],
    pricing: "freemium",
    link: "https://www.copy.ai",
    rating: 4.6,
  },
  {
    name: "QuillBot",
    arabicName: "كوايل بوت",
    description:
      "أداة رائدة في إعادة صياغة النصوص، التلخيص، والتدقيق الإملائي باللغات المختلفة ومساعد الاقتباس الأكاديمي.",
    category: "writing",
    tags: ["إعادة صياغة", "تدقيق لغوي", "تلخيص"],
    pricing: "freemium",
    link: "https://quillbot.com",
    rating: 4.8,
  },
  {
    name: "Writesonic",
    arabicName: "رايت سونيك",
    description:
      "منصة شاملة لتوليد المحتوى وتحسين محركات البحث SEO وصناعة مقالات طويلة موثوقة بالذكاء الاصطناعي.",
    category: "writing",
    tags: ["SEO", "مدونات", "توليد نصوص"],
    pricing: "freemium",
    link: "https://writesonic.com",
    rating: 4.7,
  },
  {
    name: "Lex",
    description:
      "محرر نصوص حديث وبسيط يعتمد على الذكاء الاصطناعي لمساعدة الكتاب والمدونين في الحفاظ على تدفق الكتابة.",
    category: "writing",
    tags: ["محرر نصوص", "تدفق الكتابة", "أفكار"],
    pricing: "freemium",
    link: "https://lex.page",
    rating: 4.5,
  },

  // --- 2. التصميم والصور ---
  {
    name: "Midjourney",
    arabicName: "ميدجورني",
    description:
      "أداة توليد صور فنية فائقة الجودة والواقعية من الوصف النصي البسيط عبر منصة ديسكورد.",
    category: "design",
    tags: ["توليد صور", "فنون رقمية", "واقعية"],
    pricing: "paid",
    link: "https://www.midjourney.com",
    rating: 4.9,
  },
  {
    name: "DALL-E 3",
    description:
      "أحدث نماذج توليد الصور من OpenAI، مدمج بشكل كامل في ChatGPT ويوفر دقة فائقة في فهم التعليمات المعقدة.",
    category: "design",
    tags: ["توليد صور", "رسوم توضيحية", "OpenAI"],
    pricing: "freemium",
    link: "https://openai.com/dall-e-3",
    rating: 4.8,
  },
  {
    name: "Leonardo AI",
    arabicName: "ليوناردو إيه آي",
    description:
      "منصة توليد وتحرير صور احترافية للغاية توفر أدوات تحكم متقدمة وتدريب نماذج مخصصة للمصممين ومطوري الألعاب.",
    category: "design",
    tags: ["توليد صور", "تحرير بيكسل", "ألعاب"],
    pricing: "freemium",
    link: "https://leonardo.ai",
    rating: 4.8,
  },
  {
    name: "Stable Diffusion",
    description:
      "نموذج توليد صور قوي ومفتوح المصدر يمكن تشغيله وتخصيصه محليًا بالكامل من قبل المطورين والفنانين.",
    category: "design",
    tags: ["مفتوح المصدر", "توليد صور", "تخصيص"],
    pricing: "free",
    link: "https://stability.ai",
    rating: 4.7,
  },
  {
    name: "Canva AI",
    arabicName: "كانفا ذكاء اصطناعي",
    description:
      "مجموعة أدوات سحرية مدمجة في منصة Canva تتيح إزالة العناصر، وتوليد الصور، وتعديل التصاميم بذكاء.",
    category: "design",
    tags: ["تصميم قوالب", "سوشيال ميديا", "تعديل سحري"],
    pricing: "freemium",
    link: "https://www.canva.com",
    rating: 4.6,
  },
  {
    name: "Ideogram",
    arabicName: "أيديوجرام",
    description:
      "أداة رائدة لتوليد الصور تتميز بالقدرة الاستثنائية على كتابة النصوص والكلمات داخل الصور بدقة ووضوح.",
    category: "design",
    tags: ["نصوص في الصور", "تصميم شعارات", "بوسترات"],
    pricing: "freemium",
    link: "https://ideogram.ai",
    rating: 4.7,
  },
  {
    name: "Remove.bg",
    description:
      "أداة فائقة السرعة لإزالة خلفية أي صورة تلقائيًا بدقة استثنائية خلال ثوانٍ معدودة.",
    category: "design",
    tags: ["إزالة خلفية", "تفريغ صور", "سرعة"],
    pricing: "freemium",
    link: "https://www.remove.bg",
    rating: 4.8,
  },

  // --- 3. فيديو وموسيقى ---
  {
    name: "Runway",
    arabicName: "رنواي",
    description:
      "منصة رائدة لتوليد وتحرير مقاطع الفيديو بالذكاء الاصطناعي من نصوص أو صور ثابتة بجودة سينمائية.",
    category: "video",
    tags: ["توليد فيديو", "تحرير سينمائي", "مؤثرات"],
    pricing: "freemium",
    link: "https://runwayml.com",
    rating: 4.8,
  },
  {
    name: "Suno AI",
    arabicName: "سونو إيه آي",
    description:
      "أداة ثورية لإنشاء الأغاني والموسيقى الكاملة والألحان بجودة عالية من وصف نصي بسيط وباللغة العربية أيضًا.",
    category: "video",
    tags: ["توليد أغانٍ", "موسيقى", "صوت"],
    pricing: "freemium",
    link: "https://suno.com",
    rating: 4.9,
  },
  {
    name: "Kling AI",
    arabicName: "كلينغ",
    description:
      "نموذج متقدم لتوليد الفيديو يتميز بالحركات الطبيعية الدقيقة ومحاكاة الفيزياء بجودة عالية ومدة طويلة.",
    category: "video",
    tags: ["فيديو طويل", "محاكاة فيزيائية", "واقعي"],
    pricing: "freemium",
    link: "https://klingai.com",
    rating: 4.7,
  },
  {
    name: "Luma Dream Machine",
    description:
      "أداة ذكية لتوليد الفيديوهات الواقعية والحركية بجودة سينمائية من النصوص والصور بسرعة.",
    category: "video",
    tags: ["توليد فيديو", "ثلاثي الأبعاد", "جودة عالية"],
    pricing: "freemium",
    link: "https://lumalabs.ai/dream-machine",
    rating: 4.6,
  },
  {
    name: "HeyGen",
    arabicName: "هاي جين",
    description:
      "إنشاء فيديوهات احترافية بمقدمين افتراضيين (Avatars) واقعيين للغاية مع ميزة الترجمة والدبلجة الصوتية التلقائية.",
    category: "video",
    tags: ["مقدمون افتراضيون", "دبلجة", "تسويق فيديو"],
    pricing: "freemium",
    link: "https://www.heygen.com",
    rating: 4.8,
  },
  {
    name: "ElevenLabs",
    arabicName: "إيليفن لابس",
    description:
      "أفضل منصة لتوليد الأصوات البشرية وتوليد كلام واقعي للغاية بلهجات متعددة مع ميزة استنساخ الأصوات.",
    category: "video",
    tags: ["تحويل نص لصوت", "استنساخ صوتي", "دبلجة"],
    pricing: "freemium",
    link: "https://elevenlabs.io",
    rating: 4.9,
  },
  {
    name: "Udio",
    arabicName: "يوديو",
    description: "منصة توليد وتأليف الموسيقى الرقمية بجودة إنتاج تشابه الاستوديوهات الاحترافية.",
    category: "video",
    tags: ["إنتاج موسيقي", "ألحان", "صناعة صوت"],
    pricing: "freemium",
    link: "https://www.udio.com",
    rating: 4.7,
  },

  // --- 4. برمجة وتطوير ---
  {
    name: "GitHub Copilot",
    arabicName: "كوبيلوت",
    description:
      "مساعد برمجي مدمج يكتب الأكواد تلقائيًا ويقترح حلولاً وخوارزميات داخل محرر الأكواد بناءً على السياق.",
    category: "coding",
    tags: ["إكمال الكود", "VS Code", "مساعد مبرمج"],
    pricing: "paid",
    link: "https://github.com/features/copilot",
    rating: 4.8,
  },
  {
    name: "Cursor",
    arabicName: "كيرسر",
    description:
      "محرر أكواد ثوري مبني على VS Code مدمج بالكامل مع نماذج لغوية قوية لتطوير وتعديل ملفات الكود بأوامر نصية.",
    category: "coding",
    tags: ["محرر أكواد", "تطوير سريع", "أتمتة الكود"],
    pricing: "freemium",
    link: "https://www.cursor.com",
    rating: 4.9,
  },
  {
    name: "v0.dev",
    description:
      "أداة ثورية من Vercel لتوليد واجهات مستخدم متجاوبة (React, Tailwind, Shadcn) من وصف نصي مباشرة.",
    category: "coding",
    tags: ["واجهات مستخدم", "Vercel", "Tailwind CSS"],
    pricing: "freemium",
    link: "https://v0.dev",
    rating: 4.8,
  },
  {
    name: "Bolt.new",
    description:
      "بيئة تطوير وتشغيل كاملة في المتصفح تتيح بناء تطبيقات ويب كاملة ونشرها فورًا بمجرد وصفها باللغة العربية أو الإنجليزية.",
    category: "coding",
    tags: ["تطبيقات كاملة", "تشغيل فوري", "متصفح"],
    pricing: "freemium",
    link: "https://bolt.new",
    rating: 4.8,
  },
  {
    name: "Lovable.dev",
    arabicName: "لوفابل",
    description:
      "منصة متطورة للغاية تتيح بناء وتطوير تطبيقات ويب متكاملة وإدارتها من خلال التحدث مع الوكيل الذكي باللغة الطبيعية.",
    category: "coding",
    tags: ["تطوير تطبيقات", "بدون كود", "نشر سريع"],
    pricing: "freemium",
    link: "https://lovable.dev",
    rating: 4.9,
  },
  {
    name: "Codeium",
    arabicName: "كوديوم",
    description:
      "بديل قوي ومجاني بالكامل للأفراد لـ GitHub Copilot يوفر إكمال أكواد ذكي وسريع لأكثر من 70 لغة برمجة.",
    category: "coding",
    tags: ["مجاني", "إكمال الكود", "مساعد برمجة"],
    pricing: "freemium",
    link: "https://codeium.com",
    rating: 4.7,
  },
  {
    name: "JetBrains AI Assistant",
    arabicName: "مساعد JetBrains الذكي",
    description:
      "مساعد برمجي ذكي مدمج داخل كافة بيئات تطوير JetBrains وVS Code يقدم إكمال أكواد مخصص، توليد وتوثيق تلقائي، وشرح مفسر للثغرات والأخطاء.",
    category: "coding",
    tags: ["مساعد ذكي", "JetBrains", "إكمال الكود", "توليد توثيق"],
    pricing: "paid",
    link: "https://www.jetbrains.com/ai/",
    rating: 4.8,
  },
  {
    name: "JetBrains WebStorm",
    arabicName: "ويب ستورم",
    description:
      "أقوى بيئة تطوير متكاملة (IDE) مخصصة لـ JavaScript وTypeScript، توفر دعماً استثنائياً لـ React وNode.js وVue وتصحيح الأخطاء الذكي.",
    category: "coding",
    tags: ["JavaScript", "TypeScript", "React", "IDE"],
    pricing: "paid",
    link: "https://www.jetbrains.com/webstorm/",
    rating: 4.9,
  },
  {
    name: "JetBrains PyCharm",
    arabicName: "باايتشارم",
    description:
      "بيئة التطوير القياسية للغة Python، علوم البيانات، الذكاء الاصطناعي، وتطوير الويب باستخدام Django وFastAPI.",
    category: "coding",
    tags: ["Python", "ذكاء اصطناعي", "علوم البيانات", "Django"],
    pricing: "freemium",
    link: "https://www.jetbrains.com/pycharm/",
    rating: 4.9,
  },
  {
    name: "JetBrains PhpStorm",
    arabicName: "بي إتش بي ستورم",
    description:
      "بيئة تطوير احترافية لمطوري PHP وLaravel وSymfony، توفر تحليلاً عميقاً للكود وتصحيح أخطاء فوري وفحوصات أمان.",
    category: "coding",
    tags: ["PHP", "Laravel", "Symfony", "تطوير ويب"],
    pricing: "paid",
    link: "https://www.jetbrains.com/phpstorm/",
    rating: 4.8,
  },
  {
    name: "JetBrains DataGrip",
    arabicName: "داتا جريب",
    description:
      "أداة متقدمة ومتكاملة لإدارة ومطوري قواعد البيانات، تدعم التعامل مع جميع أنظمة SQL وNoSQL مثل PostgreSQL وMySQL وSQLite في واجهة واحدة.",
    category: "coding",
    tags: ["قواعد بيانات", "SQL", "PostgreSQL", "إدارة بيانات"],
    pricing: "paid",
    link: "https://www.jetbrains.com/datagrip/",
    rating: 4.9,
  },
  {
    name: "Windsurf",
    arabicName: "ويند سيرف",
    description:
      "محرر كود حديث يحتوي على وكيل ذكي ثنائي العمل لتنفيذ وتعديل الأكواد البرمجية عبر ملفات متعددة في وقت واحد.",
    category: "coding",
    tags: ["محرر كود", "وكيل برمجي", "متعدد الملفات"],
    pricing: "freemium",
    link: "https://codeium.com/windsurf",
    rating: 4.8,
  },

  // --- 5. إنتاجية وإدارة مهام ---
  {
    name: "Motion",
    arabicName: "موشن",
    description:
      "تطبيق تقويم وجدولة ذكي يعيد ترتيب مهامك اليومية واجتماعاتك تلقائيًا بناءً على الأولويات والأوقات المتاحة.",
    category: "productivity",
    tags: ["جدولة مهام", "تقويم ذكي", "تنظيم وقت"],
    pricing: "paid",
    link: "https://www.usemotion.com",
    rating: 4.6,
  },
  {
    name: "Todoist AI",
    arabicName: "تودويست",
    description:
      "مساعد ذكي مدمج في تطبيق تودويست يقترح خطط عمل للمهام الضخمة ويصنّف أولوياتك تلقائيًا.",
    category: "productivity",
    tags: ["إدارة مهام", "قوائم مهام", "أتمتة"],
    pricing: "freemium",
    link: "https://todoist.com",
    rating: 4.5,
  },
  {
    name: "Zapier AI",
    arabicName: "زابيير",
    description:
      "أداة أتمتة سير العمل التي تسمح بربط التطبيقات المختلفة وبناء أتمتة ذكية بدون الحاجة لكتابة كود.",
    category: "productivity",
    tags: ["أتمتة الأعمال", "ربط تطبيقات", "بدون كود"],
    pricing: "freemium",
    link: "https://zapier.com",
    rating: 4.7,
  },
  {
    name: "tl;dv",
    description:
      "مسجل ومحلل اجتماعات Zoom وGoogle Meet يقوم بنسخ وتلخيص الحوارات واستخراج نقاط العمل تلقائيًا.",
    category: "productivity",
    tags: ["تلخيص اجتماعات", "فيديو", "ملاحظات"],
    pricing: "freemium",
    link: "https://tldv.io",
    rating: 4.8,
  },
  {
    name: "Taskade AI",
    arabicName: "تاسكاد",
    description:
      "مساحة عمل تعاونية تدمج المهام، الخرائط الذهنية، والوثائق المشتركة مع وكلاء ذكاء اصطناعي مخصصين.",
    category: "productivity",
    tags: ["خرائط ذهنية", "مساحة تعاونية", "وكلاء AI"],
    pricing: "freemium",
    link: "https://www.taskade.com",
    rating: 4.6,
  },

  // --- 6. تعليم وأبحاث ---
  {
    name: "Consensus",
    arabicName: "كونسينسس",
    description:
      "محرك بحث أكاديمي يستخرج إجابات موثوقة ومدعومة بأدلة مباشرة من ملايين الأوراق والأبحاث العلمية المحكّمة.",
    category: "education",
    tags: ["بحث علمي", "أوراق أكاديمية", "أدلة"],
    pricing: "freemium",
    link: "https://consensus.app",
    rating: 4.8,
  },
  {
    name: "ChatPDF",
    description:
      "أداة تفاعلية تتيح لك تحميل مستندات PDF الضخمة ومحاورتها واستخلاص المعلومات منها في ثوانٍ.",
    category: "education",
    tags: ["محادثة PDF", "تلخيص كتب", "دراسة"],
    pricing: "freemium",
    link: "https://www.chatpdf.com",
    rating: 4.7,
  },
  {
    name: "NotebookLM",
    description:
      "أداة بحث ودراسة استثنائية من Google تقوم بتحليل مستنداتك وتلخيصها وتحويلها إلى برامج حوارية صوتية شيقة.",
    category: "education",
    tags: ["أداة من جوجل", "تلخيص مستندات", "بودكاست"],
    pricing: "free",
    link: "https://notebooklm.google",
    rating: 4.9,
  },
  {
    name: "Julius AI",
    arabicName: "جوليوس",
    description:
      "مساعد بيانات ذكي يقوم بتحليل جداول Excel وبيانات CSV المرفوعة ورسم رسوم بيانية تفاعلية بالمحادثة.",
    category: "education",
    tags: ["تحليل بيانات", "رسم بياني", "Excel"],
    pricing: "freemium",
    link: "https://julius.ai",
    rating: 4.8,
  },
  {
    name: "Wolfram Alpha",
    description:
      "محرك معرفة حاسوبية قوي يجيب عن مسائل الرياضيات، الفيزياء، والعلوم المتقدمة بدقة متناهية وشرح للخطوات.",
    category: "education",
    tags: ["رياضيات", "حسابات علمية", "فيزياء"],
    pricing: "freemium",
    link: "https://www.wolframalpha.com",
    rating: 4.8,
  },
  {
    name: "SciSpace",
    arabicName: "ساي سبيس",
    description:
      "منصة متطورة لقراءة وفهم الأوراق العلمية المعقدة مع شرح فوري للمصطلحات الرياضية واللغوية الصعبة.",
    category: "education",
    tags: ["تبسيط الأبحاث", "مساعد دراسي", "قراءة"],
    pricing: "freemium",
    link: "https://typeset.io",
    rating: 4.7,
  },

  // --- 7. أعمال وشركات ---
  {
    name: "Zendesk AI",
    arabicName: "زين ديسك",
    description:
      "نظام دعم عملاء ذكي يقوم بتصنيف التذاكر وتوجيهها تلقائيًا للعميل المناسب مع اقتراح ردود ذكية فورية.",
    category: "business",
    tags: ["دعم عملاء", "تذاكر", "أتمتة خدمة"],
    pricing: "paid",
    link: "https://www.zendesk.com",
    rating: 4.5,
  },
  {
    name: "Tidio AI",
    arabicName: "تيديو",
    description:
      "شات بوت خدمة عملاء ذكي مخصص لمتاجر التجارة الإلكترونية يجيب على استفسارات الطلبات والشحن تلقائيًا.",
    category: "business",
    tags: ["دردشة موقع", "تجارة إلكترونية", "خدمة عملاء"],
    pricing: "freemium",
    link: "https://www.tidio.com",
    rating: 4.6,
  },
  {
    name: "Clay",
    arabicName: "كلاي",
    description:
      "أداة مبيعات قوية تجمع بيانات العملاء المحتملين من مصادر متعددة وتكتب لهم رسائل بريدية مخصصة للغاية.",
    category: "business",
    tags: ["تنقيب مبيعات", "بيانات العملاء", "تخصيص رسائل"],
    pricing: "paid",
    link: "https://www.clay.com",
    rating: 4.8,
  },
  {
    name: "Apollo.io",
    arabicName: "أبولو",
    description:
      "منصة استخبارات مبيعات ضخمة تحتوي على بيانات تواصل ملايين المهنيين وتتيح أتمتة حملات البريد الإلكتروني.",
    category: "business",
    tags: ["قواعد بيانات", "تسويق بريدي", "مبيعات"],
    pricing: "freemium",
    link: "https://www.apollo.io",
    rating: 4.7,
  },
  {
    name: "Monday.com AI",
    arabicName: "مونداي",
    description:
      "منصة لإدارة المشاريع وفرق العمل تدعم الذكاء الاصطناعي لتوليد المهام والملخصات وتحديث الحالات تلقائيًا.",
    category: "business",
    tags: ["إدارة مشاريع", "تعاون فرق", "أتمتة"],
    pricing: "paid",
    link: "https://monday.com",
    rating: 4.6,
  },

  // --- 8. أدوات عربية ومحلية ---
  {
    name: "Qalam AI",
    arabicName: "قلم",
    description:
      "أداة تدقيق إملائي ونحوي ذكية مخصصة للغة العربية تساعد على تحسين صياغة المقالات ورسائل البريد.",
    category: "arabic",
    tags: ["تدقيق لغوي", "كتابة عربية", "إملاء"],
    pricing: "freemium",
    link: "https://qalam.ai",
    rating: 4.8,
  },
  {
    name: "Rewaa",
    arabicName: "رواء",
    description:
      "منصة سعودية ذكية لإدارة المخازن ونقاط البيع والفواتير تدعم تجار التجزئة بأدوات تحليل مخزون آلية.",
    category: "arabic",
    tags: ["نقاط بيع", "إدارة مخزون", "سعودية"],
    pricing: "paid",
    link: "https://www.rewaa.com",
    rating: 4.7,
  },
  {
    name: "ALLaM",
    arabicName: "علام",
    description:
      "نموذج لغوي عربي متميز تم تطويره بواسطة الهيئة السعودية للذكاء الاصطناعي (سدايا) لفهم وتوليد المحتوى العربي الفصيح.",
    category: "arabic",
    tags: ["نموذج لغوي", "سدايا", "السعودية"],
    pricing: "free",
    link: "https://sdaia.gov.sa",
    rating: 4.6,
  },
  {
    name: "Jais LLM",
    arabicName: "جيس",
    description:
      "النموذج اللغوي العربي الضخم ثنائي اللغة (العربية والإنجليزية) الحائز على تصنيفات رائدة من تطوير شركة Core42 الإماراتية.",
    category: "arabic",
    tags: ["نموذج لغوي", "إماراتية", "ثنائي اللغة"],
    pricing: "free",
    link: "https://core42.ai/jais.html",
    rating: 4.7,
  },
  {
    name: "Salla",
    arabicName: "سلة",
    description:
      "منصة التجارة الإلكترونية السعودية الرائدة لبناء المتاجر وتهيئتها بالذكاء الاصطناعي لتوليد التوصيات وكتابة أوصاف المنتجات.",
    category: "arabic",
    tags: ["تجارة إلكترونية", "سعودية", "متاجر ذكية"],
    pricing: "paid",
    link: "https://salla.sa",
    rating: 4.9,
  },
  {
    name: "Zid",
    arabicName: "زد",
    description:
      "منصة متكاملة لبناء وتفعيل المتاجر الإلكترونية في العالم العربي مع أدوات نمو وإدارة مبنية بالذكاء الاصطناعي.",
    category: "arabic",
    tags: ["متاجر إلكترونية", "نمو مبيعات", "شحن"],
    pricing: "paid",
    link: "https://zid.sa",
    rating: 4.8,
  },
  {
    name: "Lucidya",
    arabicName: "لوسيديا",
    description:
      "المنصة العربية الأولى لرصد شبكات التواصل الاجتماعي وتحليل مشاعر العملاء وفهم اللهجات العربية بالذكاء الاصطناعي.",
    category: "arabic",
    tags: ["استماع اجتماعي", "تحليل مشاعر", "لهجات عربية"],
    pricing: "paid",
    link: "https://lucidya.com",
    rating: 4.7,
  },
  {
    name: "Mudawala",
    arabicName: "مداولة",
    description:
      "منصة استشارات وتقييم مشاريع ذكية تجمع خبراء افتراضيين لتقديم نصائح وتوجيهات للمشاريع الريادية والناشئة.",
    category: "arabic",
    tags: ["مستشار افتراضي", "ريادة أعمال", "تقييم"],
    pricing: "freemium",
    link: "https://mudawala.com",
    rating: 4.6,
  },
];
