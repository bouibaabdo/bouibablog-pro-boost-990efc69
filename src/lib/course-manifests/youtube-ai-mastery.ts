export const YOUTUBE_AI_MASTERY = {
  slug: "youtube-ai-mastery",
  title: "David Omari — YouTube AI Mastery",
  subtitle: "دورة عملية لإنتاج محتوى يوتيوب بالذكاء الاصطناعي",
  description:
    "حزمة تدريبية حديثة تجمع بين كتابة السكربت، التعليق الصوتي، المونتاج، تصميم الصور المصغرة، وتحسين القناة. مصممة لعرض احترافي داخل بوابة الدورات مع فيديوهات ووثائق مرفقة.",
  cover: "/course-thumbnails/youtube-ai-mastery.svg",
  stats: [
    { label: "الفيديوهات", value: "10" },
    { label: "الوحدات", value: "4" },
    { label: "الوثائق", value: "2" },
    { label: "محاور التطبيق", value: "6" },
  ],
  modules: [
    {
      title: "01 — YouTube Automation with AI",
      summary: "مدخل شامل إلى فكرة أتمتة القناة وبناء خط إنتاج للمحتوى.",
      lessons: ["01-YouTube Automation with AI.mp4"],
    },
    {
      title: "02 — Automating Video Creation",
      summary: "من prompt إلى سكربت، ثم صوت، تحرير، Thumbnail وShorts.",
      lessons: [
        "01-Introduction to video creation with AI.mp4",
        "02-ChatGPT Prompt.txt",
        "02-Script Writing With AI.mp4",
        "03-Voice Over With AI.mp4",
        "04-Video Editing With AI.mp4",
        "05-Thumbnail Designs With AI.mp4",
        "06-YouTube Shorts With AI.mp4",
      ],
    },
    {
      title: "03 — Channel Optimization with AI",
      summary: "تحسين القناة والأدوات العملية لرفع الأداء والوصول.",
      lessons: [
        "01-Introduction to Channel Optimization with AI.mp4",
        "02-Websites and softwares for optimizing YouTube....mp4",
      ],
    },
    {
      title: "04 — Conclusion and Future Prospects",
      summary: "نظرة نهائية على الفرص القادمة وكيفية توسيع المشروع.",
      lessons: ["01-Opportunities.mp4"],
    },
  ],
  resources: [
    {
      title: "ChatGPT Prompt Template",
      description: "قالب جاهز لكتابة Prompt احترافي للفيديوهات",
      href: "/courses/youtube-ai-mastery/chatgpt-prompt.txt",
      type: "TXT",
    },
    {
      title: "Course Outline",
      description: "ملخص منظم للوحدات والفيديوهات داخل الدورة",
      href: "/courses/youtube-ai-mastery/course-outline.md",
      type: "MD",
    },
  ],
} as const;
