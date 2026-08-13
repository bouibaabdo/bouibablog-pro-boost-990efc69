import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookOpen, Target, Users, Zap } from "lucide-react";
import { useLang } from "@/hooks/use-lang";


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن الأكاديمية — Bouiba Academy" },
      {
        name: "description",
        content: "تعرّف على Bouiba Academy — منصة عربية متخصصة في محتوى الذكاء الاصطناعي.",
        key: "description",
      },
      { property: "og:title", content: "عن الأكاديمية — Bouiba Academy", key: "og:title" },
      {
        property: "og:description",
        content:
          "منصة عربية مستقلة لتعليم الذكاء الاصطناعي: دروس عملية، مراجعات نزيهة، وأخبار موثوقة بلغة واضحة.",
        key: "og:description",
      },
      { property: "og:url", content: "https://www.bouibacademy.me/about", key: "og:url" },
      {
        property: "og:image",
        content: "https://www.bouibacademy.me/og-about.png",
        key: "og:image",
      },
      { property: "og:image:width", content: "1200", key: "og:image:width" },
      { property: "og:image:height", content: "630", key: "og:image:height" },
      { property: "og:image:alt", content: "عن الأكاديمية — Bouiba Academy", key: "og:image:alt" },
      { name: "twitter:card", content: "summary_large_image", key: "twitter:card" },
      { name: "twitter:title", content: "عن الأكاديمية — Bouiba Academy", key: "twitter:title" },
      {
        name: "twitter:description",
        content: "تعرّف على Bouiba Academy — منصة عربية متخصصة في تعليم ومحتوى الذكاء الاصطناعي.",
        key: "twitter:description",
      },
      {
        name: "twitter:image",
        content: "https://www.bouibacademy.me/og-about.png",
        key: "twitter:image",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.bouibacademy.me/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Bouiba Academy",
          url: "https://www.bouibacademy.me",
          description: "منصة عربية متخصصة في تعليم ومحتوى الذكاء الاصطناعي.",
          sameAs: ["https://www.bouibacademy.me"],
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { lang } = useLang();

  const heroBadge =
    lang === "fr" ? "À propos" : lang === "en" ? "About Us" : "من نحن";
  const heroTitle =
    lang === "fr"
      ? "Votre académie pour l’Intelligence Artificielle"
      : lang === "en"
      ? "Your Academy for Artificial Intelligence"
      : "أكاديميتك في عالم الذكاء الاصطناعي";
  const heroSub =
    lang === "fr"
      ? "Une plateforme arabe indépendante proposant du contenu éducatif pratique, des analyses objectives et des actualités fiables sur l’IA."
      : lang === "en"
      ? "An independent Arabic platform delivering practical educational content, unbiased reviews, and reliable AI news in a clear, accessible language."
      : "منصة عربية مستقلة نقدّم من خلالها محتوى تعليمي عملي، مراجعات نزيهة، وأخبار موثوقة عن الذكاء الاصطناعي.";

  const VALUES = [
    {
      icon: Target,
      title: lang === "fr" ? "Notre mission" : lang === "en" ? "Our Mission" : "رسالتنا",
      desc:
        lang === "fr"
          ? "Permettre à la communauté arabophone de comprendre et d’utiliser les outils d’IA en toute confiance, et fournir un contenu éducatif comparable à ce qui se fait de mieux dans le monde."
          : lang === "en"
          ? "Empowering the Arabic-speaking community to understand and use AI tools with confidence, delivering educational content that rivals the best published globally."
          : "تمكين المجتمع العربي من فهم واستخدام أدوات الذكاء الاصطناعي بثقة، وتوفير محتوى تعليمي يوازي أفضل ما يُنشر عالميًا.",
    },
    {
      icon: BookOpen,
      title: lang === "fr" ? "Contenu fiable" : lang === "en" ? "Trusted Content" : "محتوى موثوق",
      desc:
        lang === "fr"
          ? "Chaque leçon et article est relu avant publication, en s’appuyant sur des sources officielles et vérifiées."
          : lang === "en"
          ? "Every lesson and article goes through review before publishing, relying on official and tested sources."
          : "كل درس ومقال يمرّ بمراجعة قبل النشر، مع الاعتماد على مصادر رسمية ومختبرة.",
    },
    {
      icon: Zap,
      title: lang === "fr" ? "Mise à jour quotidienne" : lang === "en" ? "Daily Updates" : "تحديث يومي",
      desc:
        lang === "fr"
          ? "Nous suivons les évolutions rapides de l’IA et vous proposons des résumés et tutoriels simplifiés."
          : lang === "en"
          ? "We track the fast-moving AI landscape and deliver simplified summaries and explanations."
          : "نلاحق التطورات المتسارعة في مجال الـ AI ونقدّم لك ملخصات وشروحات مبسّطة.",
    },
    {
      icon: Users,
      title: lang === "fr" ? "Communauté active" : lang === "en" ? "Active Community" : "مجتمع متفاعل",
      desc:
        lang === "fr"
          ? "Nous construisons une communauté d’apprenants arabes passionnés de technologie — apprenez, partagez et grandissez avec nous."
          : lang === "en"
          ? "We are building a community of Arabic learners passionate about technology — learn, share, and grow with us."
          : "نبني مجتمعًا من المتعلمين العرب المتحمّسين للتقنية — تعلّم، شارك، ونمُ معنا.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="hero-bg border-b border-border">
          <div className="container-page py-16 md:py-24 text-center max-w-3xl">
            <p className="text-sm font-semibold text-primary mb-3">{heroBadge}</p>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight">
              <span className="gradient-text">Bouiba Academy</span>
              <br />
              {heroTitle}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {heroSub}
            </p>
          </div>
        </section>

        <section className="container-page py-16 md:py-24">
          <div className="grid gap-6 md:grid-cols-2">
            {VALUES.map((v, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-8 shadow-card">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary mb-4">
                  <v.icon className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-bold">{v.title}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
