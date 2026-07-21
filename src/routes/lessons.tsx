import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  PlayCircle,
  Clock,
  Sparkles,
  Download,
  BookOpen,
  Video,
  Layers3,
  FileText,
  ChevronRight,
} from "lucide-react";
import { listLessons } from "@/lib/lessons.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { YOUTUBE_AI_MASTERY } from "@/lib/course-manifests/youtube-ai-mastery";

type LessonItem = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
};

const lessonsQO = queryOptions({
  queryKey: ["lessons", "public"],
  queryFn: async () => (await listLessons()) as LessonItem[],
  staleTime: 5 * 60_000,
});

export const Route = createFileRoute("/lessons")({
  loader: ({ context }) => context.queryClient.ensureQueryData(lessonsQO),
  head: () => ({
    meta: [
      { title: "دورات — Bouiba Academy" },
      {
        name: "description",
        content: "مكتبة دورات فيديو حول الذكاء الاصطناعي وأدواته باللغة العربية.",
        key: "description",
      },
      { property: "og:title", content: "دورات — Bouiba Academy", key: "og:title" },
      {
        property: "og:description",
        content: "دورات عربية حول الذكاء الاصطناعي.",
        key: "og:description",
      },
      { property: "og:url", content: "https://www.bouibacademy.me/lessons", key: "og:url" },
    ],
    links: [{ rel: "canonical", href: "https://www.bouibacademy.me/lessons" }],
  }),
  component: LessonsPage,
});

function formatDuration(s?: number | null) {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function formatLessonLabel(name: string) {
  return name.replace(/\.(mp4|txt|pdf|md)$/i, "");
}

function LessonsPage() {
  const { data: lessons } = useSuspenseQuery(lessonsQO);
  const [active, setActive] = useState<string | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  const featuredCourse = YOUTUBE_AI_MASTERY;
  const totalPublishedVideos =
    featuredCourse.stats.find((s) => s.label === "الفيديوهات")?.value ?? "0";

  const categories = useMemo(() => {
    const s = new Set<string>();
    lessons.forEach((l) => l.category && s.add(l.category));
    return Array.from(s);
  }, [lessons]);

  const filtered = cat ? lessons.filter((l) => l.category === cat) : lessons;
  const current = active ? lessons.find((l) => l.id === active) : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="hero-bg border-b border-border">
          <div className="container-page py-12 md:py-16 text-center">
            <p className="text-sm font-semibold text-primary mb-2">تعلم بالفيديو</p>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold">دورات</h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              مكتبة دورات فيديو حول الذكاء الاصطناعي وأدواته باللغة العربية.
            </p>
          </div>
        </section>

        <div className="container-page py-8">
          <section className="mb-10 overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 shadow-elegant">
            <div className="grid gap-0 lg:grid-cols-12">
              <div className="relative lg:col-span-5">
                <img
                  src={featuredCourse.cover}
                  alt={featuredCourse.title}
                  className="h-full w-full object-cover min-h-[280px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute left-5 bottom-5 right-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                    دورة مختارة للنشر
                  </div>
                  <h2 className="mt-3 font-display text-2xl md:text-3xl font-extrabold text-white leading-tight">
                    {featuredCourse.title}
                  </h2>
                  <p className="mt-2 text-sm md:text-base text-white/80 leading-relaxed">
                    {featuredCourse.subtitle}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 p-6 md:p-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold text-primary">
                    <BookOpen className="h-3.5 w-3.5" />
                    فيديوهات + وثائق + تنسيق حديث
                  </div>
                  <h3 className="mt-4 font-display text-2xl md:text-3xl font-bold text-foreground">
                    عرض احترافي جاهز للنشر داخل موقعك
                  </h3>
                  <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                    {featuredCourse.description}
                  </p>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {featuredCourse.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-border bg-background/70 p-4 text-center"
                      >
                        <div className="text-2xl font-extrabold gradient-text">{stat.value}</div>
                        <div className="mt-1 text-[11px] font-semibold text-muted-foreground">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="#course-modules"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:opacity-90"
                    >
                      ابدأ الاستعراض
                      <ChevronRight className="h-4 w-4" />
                    </a>
                    <a
                      href="#course-resources"
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:text-primary"
                    >
                      الوثائق المرفقة
                      <Download className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {featuredCourse.modules.map((module) => (
                      <span
                        key={module.title}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground"
                      >
                        <Layers3 className="h-3.5 w-3.5 text-primary" />
                        {module.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="course-modules" className="mb-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">
                  هيكل الدورة والملفات المرفقة
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  تنظيم حديث يسهّل على الزائر متابعة الفيديوهات والموارد.
                </p>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                <Video className="h-3.5 w-3.5" />
                {totalPublishedVideos} فيديو
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {featuredCourse.modules.map((module, index) => (
                <div
                  key={module.title}
                  className="rounded-3xl border border-border bg-card p-5 md:p-6 shadow-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg md:text-xl font-bold">{module.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {module.summary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {module.lessons.map((lesson) => {
                      const isDoc = /\.(txt|md|pdf)$/i.test(lesson);
                      const fileUrl = `/courses/youtube-ai-mastery/${encodeURIComponent(lesson)}`;
                      return (
                        <a
                          key={lesson}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition-all hover:border-primary/40 hover:bg-card hover:shadow-soft group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              {isDoc ? (
                                <FileText className="h-4 w-4" />
                              ) : (
                                <PlayCircle className="h-4 w-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {formatLessonLabel(lesson)}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {isDoc ? "تحميل / عرض الوثيقة المرفقة" : "تشغيل الفيديو التعليمي"}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold rounded-full bg-primary/10 px-2.5 py-1 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {isDoc ? "عرض الملف" : "تشغيل الآن"}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="course-resources" className="mb-10">
            <div className="mb-5">
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                الوثائق القابلة للتحميل
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                المرفقات منظمة بشكل احترافي لتبدو مثل حزمة دورة جاهزة.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {featuredCourse.resources.map((resource) => (
                <a
                  key={resource.href}
                  href={resource.href}
                  download
                  className="group rounded-3xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant hover:border-primary/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-purple-500/10 text-primary">
                      <Download className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold">{resource.title}</h3>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {resource.type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {resource.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        تنزيل المرفق
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {current && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-border bg-card shadow-elegant">
              <video
                key={current.id}
                src={current.video_url ?? undefined}
                poster={current.thumbnail_url ?? undefined}
                controls
                autoPlay
                playsInline
                className="w-full aspect-video bg-black"
              />
              <div className="p-4 md:p-6">
                <h2 className="font-display text-xl md:text-2xl font-bold">{current.title}</h2>
                {current.description && (
                  <p className="mt-2 text-muted-foreground whitespace-pre-line">
                    {current.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setCat(null)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                  !cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface border-border"
                }`}
              >
                الكل
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                    cat === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">لا توجد دروس منشورة بعد.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setActive(l.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group text-right rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-elegant transition-all hover:-translate-y-0.5"
                >
                  <div className="relative aspect-video bg-surface-muted overflow-hidden">
                    {l.thumbnail_url ? (
                      <img
                        src={l.thumbnail_url}
                        alt={l.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center bg-gradient-to-br from-primary/20 to-accent">
                        <PlayCircle className="h-14 w-14 text-primary" />
                      </div>
                    )}
                    <div className="absolute inset-0 grid place-items-center bg-black/0 group-hover:bg-black/30 transition-colors">
                      <PlayCircle className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {l.duration_seconds && (
                      <span className="absolute bottom-2 left-2 rounded bg-black/70 text-white text-xs px-1.5 py-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(l.duration_seconds)}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {l.category && (
                      <span className="inline-block text-xs font-semibold text-primary bg-accent px-2 py-0.5 rounded mb-2">
                        {l.category}
                      </span>
                    )}
                    <h3 className="font-display font-bold leading-snug line-clamp-2">{l.title}</h3>
                    {l.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {l.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
