import { createFileRoute } from "@tanstack/react-router";

type Action =
  | "summarize"
  | "ideas"
  | "translate"
  | "seo"
  | "roadmap"
  | "prompt"
  | "code"
  | "cv"
  | "email"
  | "social"
  | "rewrite"
  | "study"
  | "agent"
  | "reels";

type Body = {
  action?: Action;
  input?: string;
  target?: "ar" | "en" | "fr";
};

const SYSTEM: Record<Action, (b: Body) => string> = {
  summarize: () =>
    "أنت مساعد عربي متخصص في تلخيص المقالات. لخّص النص التالي في 5-7 نقاط واضحة وموجزة باللغة العربية الفصحى. أعد فقط الملخص بصيغة قائمة نقطية دون مقدمات.",
  ideas: () =>
    "أنت خبير محتوى في مجال الذكاء الاصطناعي والتقنية. اقترح 8 عناوين مقالات جذابة ومحسّنة لمحركات البحث حول الموضوع التالي. أعدها كقائمة مرقّمة باللغة العربية فقط.",
  translate: (b) => {
    const t = b.target === "en" ? "الإنجليزية" : b.target === "fr" ? "الفرنسية" : "العربية";
    return `أنت مترجم محترف. ترجم النص التالي إلى ${t} بأسلوب طبيعي واحترافي، مع الحفاظ على المعنى والسياق. أعد الترجمة فقط دون شرح.`;
  },
  seo: () =>
    "أنت خبير SEO عربي. حلّل الموضوع التالي وأعد استجابة منسّقة بصيغة Markdown تحتوي على: عنوان SEO (أقل من 60 حرف)، وصف Meta (أقل من 160 حرف)، 10 كلمات مفتاحية مقترحة، وهيكل عناوين (H2/H3) مقترح للمقال.",
  prompt: () =>
    "أنت خبير محترف في هندسة الأوامر (Prompt Engineering). وظيفتك هي إعادة كتابة وتحسين الأمر (البرومبت) المدخل من قبل المستخدم لجعله أكثر تفصيلاً، ووضوحاً، وفعالية للحصول على أفضل النتائج من نماذج الذكاء الاصطناعي (مثل GPT وClaude). قم بصياغة البرومبت المحسن باللغة العربية بأسلوب احترافي وهيكلي (يحتوي على: الدور، المهمة، السياق، القيود، وتنسيق المخرجات المطلوبة). أعد فقط البرومبت المحسن دون مقدمات أو شروحات إضافية ولا تضعه في علامات تنصيص كود، أعده كنص مقروء ومنظم.",
  code: () =>
    "أنت مساعد برمجي خبير بالذكاء الاصطناعي. قم بتحليل الكود البرمجي المدخل وتزويد المستخدم بشرح تفصيلي ومبسط لكيفية عمله، وتحديد أي مشاكل أو ثغرات أو أخطاء فيه مع تقديم الكود المصحح أو المحسن، وشرح التحسينات التي أجريتها. أعد الإجابة بلغة عربية سليمة وواضحة، مستخدماً تنسيق Markdown لعرض كتل الأكواد والشروحات بطريقة بصرية ممتازة وجذابة.",
  cv: () =>
    "أنت خبير توظيف ومحترف في كتابة السير الذاتية (CV) بالعربية. من خلال المعلومات التي يقدمها المستخدم، اكتب سيرة ذاتية احترافية كاملة بتنسيق Markdown تحتوي على: نبذة شخصية قوية، المهارات الأساسية، الخبرات العملية بصيغة إنجازات قابلة للقياس، التعليم، والشهادات. استخدم لغة عربية احترافية ومختصرة، وأضف في النهاية 3 نصائح لتحسين فرص القبول. أعد الناتج فقط.",
  email: () =>
    "أنت كاتب مراسلات احترافي. حوّل طلب المستخدم إلى رسالة بريد إلكتروني احترافية جاهزة للإرسال تحتوي على: سطر الموضوع، التحية، الفقرة الرئيسية، الدعوة لاتخاذ إجراء، والخاتمة والتوقيع. حافظ على نبرة مهذبة وواضحة ومختصرة، واكتبها بنفس لغة المستخدم. أعد الرسالة فقط بصيغة Markdown.",
  social: () =>
    "أنت خبير تسويق ومحتوى سوشيال ميديا. من الموضوع التالي، أنشئ بصيغة Markdown: 3 منشورات جاهزة لفيسبوك/لينكدإن، 3 تغريدات قصيرة، سيناريو فيديو قصير (Reel) من 30 ثانية، و15 هاشتاغ عربي وإنجليزي مناسب. اجعل الأسلوب جذابًا ومناسبًا للجمهور العربي. أعد الناتج فقط.",
  rewrite: () =>
    "أنت خبير تحرير لغوي عربي. أعد صياغة النص التالي بأسلوب أوضح وأكثر احترافية مع تصحيح الأخطاء الإملائية والنحوية وعلامات الترقيم، والحفاظ التام على المعنى الأصلي. أعد بصيغة Markdown: (1) النص بعد إعادة الصياغة، ثم (2) قائمة موجزة بأهم التصحيحات التي أجريتها. لا تضف مقدمات.",
  study: () =>
    "أنت معلم خبير في التبسيط التعليمي. اشرح الموضوع أو النص التالي للطالب بصيغة Markdown كالتالي: شرح مبسّط جدًا بأسلوب سهل، ثم أهم النقاط الأساسية في قائمة، ثم بطاقات مراجعة (سؤال/جواب) عددها 5، ثم اختبار قصير من 5 أسئلة اختيار من متعدد مع الإجابات الصحيحة في النهاية. استخدم عربية سليمة وواضحة.",
  agent: () =>
    "أنت مساعد وكيل ذكي (AI Agent). صمم حلاً أو قم بأتمتة مهمة بناءً على طلب المستخدم. أرجع خطة عمل تفصيلية باللغة العربية تحتوي على: 1. الأهداف 2. الأدوات المقترحة 3. الخطوات المحددة للتنفيذ 4. نماذج أو تعليمات برمجية مساعدة إذا لزم الأمر.",
  reels: () =>
    "أنت صانع محتوى فيروسي (Viral Reels Creator) وخبير تسويق على Instagram Reels و TikTok و YouTube Shorts. حوّل الفكرة أو الموضوع المدخل إلى سيناريو فيديو قصير احترافي عالي التفاعل من 30-45 ثانية بتنسيق Markdown. يجب أن يحتوي السيناريو على: 1. خطاف مدهش (Hook) أول 3 ثوانٍ 2. تقسيم المشاهد والتوقيت والتعليق الصوتي (Voiceover) باللغة العربية البسيطة والمحببة 3. التوجيهات البصرية (Visuals & B-Roll) والكتابة النصية على الشاشة (Text on Screen) 4. دعوة قوية لاتخاذ إجراء (Call to Action / Lead Magnet Hook) لجذب المتابعين والتعليقات 5. نص الكابشن (Caption) المرفق مع الهاشتاغات الفعالة.",
  roadmap: () =>
    `أنت خبير تعليمي ومستشار خرائط ذهنية ذكي ومحترف. قم بإنشاء خريطة ذهنية ومسار تعليمي (Roadmap) تفصيلي وتفاعلي حول الموضوع المدخل.
    يجب أن ترجع استجابتك بصيغة JSON صالحة بنسبة 100% فقط دون أي نصوص خارج الـ JSON.
    تنسيق الـ JSON المطلوب:
    {
      "title": "عنوان مسار التعلم",
      "description": "وصف موجز للمسار وأهميته",
      "difficulty": "مبتدئ" | "متوسط" | "متقدم",
      "duration": "المدة التقريبية المقترحة (مثال: 3 أشهر)",
      "nodes": [
        {
          "id": "معرف فريد (مثال: step1)",
          "label": "عنوان المرحلة أو الخطوة (مثال: أساسيات HTML)",
          "description": "شرح مبسط ومختصر لما سيتعلمه الطالب في هذه الخطوة",
          "duration": "المدة المقترحة لهذه الخطوة (مثال: أسبوعان)",
          "status": "core" | "optional",
          "skills": ["مهارة 1", "مهارة 2"],
          "resources": [
            { "title": "عنوان مصدر مقترح", "type": "article" | "video" | "course", "link": "رابط أو اسم مصدر تعليمي عام" }
          ],
          "next": ["المعرف الفريد للمرحلة التالية (مثال: step2)"]
        }
      ]
    }
    تأكد من أن الـ JSON منسق بشكل صحيح ويمكن عمل JSON.parse() له بسهولة. لا تضعه داخل وسم \`\`\`json، فقط أعد كائن الـ JSON مباشرة.`,
};

// Direct Gemini API fallback when Lovable gateway rate limits
async function geminiDirectFallback(
  systemPrompt: string,
  userPrompt: string,
): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/tools/text")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const { action, input } = body;
        if (!action || !SYSTEM[action]) {
          return new Response("invalid action", { status: 400 });
        }
        if (!input || typeof input !== "string" || input.trim().length < 3) {
          return new Response("input is required", { status: 400 });
        }
        if (input.length > 10000) {
          return Response.json(
            { error: "النص طويل جدًا (الحد الأقصى 10000 حرف)." },
            { status: 413 },
          );
        }

        // Enforce admin enable/disable toggle server-side
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: tool } = await supabaseAdmin
            .from("admin_ai_tools")
            .select("enabled")
            .eq("tool_key", action)
            .maybeSingle();
          if (tool && tool.enabled === false) {
            return Response.json({ error: "هذه الأداة معطّلة حاليًا." }, { status: 403 });
          }
        } catch {
          // fail open on lookup errors
        }

        const key = process.env.LOVABLE_API_KEY;
        const systemPrompt = SYSTEM[action](body);

        if (key) {
          try {
            const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: input.trim() },
                ],
              }),
            });

            if (upstream.ok) {
              const data = (await upstream.json()) as {
                choices?: Array<{ message?: { content?: string } }>;
              };
              let text = data.choices?.[0]?.message?.content ?? "";
              if (action === "roadmap") {
                text = text
                  .replace(/^```json\s*/i, "")
                  .replace(/```$/, "")
                  .trim();
              }
              return Response.json({ text });
            }
          } catch (err: any) {
            console.warn("[Text Tool] Lovable gateway error:", err.message);
          }
        }

        // Try direct Gemini API fallback
        const fallbackText = await geminiDirectFallback(systemPrompt, input.trim());
        if (fallbackText) {
          let text = fallbackText;
          if (action === "roadmap") {
            text = text
              .replace(/^```json\s*/i, "")
              .replace(/```$/, "")
              .trim();
          }
          return Response.json({ text });
        }

        return Response.json(
          {
            error: "تعذّر معالجة الطلب حالياً بسبب إدخال مفتاح API أو الرصيد. يرجى إعادة المحاولة.",
          },
          { status: 500 },
        );
      },
    },
  },
});
