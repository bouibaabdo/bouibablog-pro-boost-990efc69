import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Sparkles, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({
    meta: [
      { title: "محتواي المفضّل | Bouiba Academy" },
      {
        name: "description",
        content: "استعرض الدروس والمقالات التي قمت بحفظها ومتابعتها في Bouiba Academy.",
        key: "description",
      },
      { name: "robots", content: "noindex", key: "robots" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const qc = useQueryClient();
  const router = useRouter();

  async function signOut() {
    const { supabase } = await import("@/integrations/supabase/client");
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container-page py-12 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-border/60 pb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Bookmark className="h-8 w-8 text-primary" />
              محتواي المفضّل
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              مركزك الشخصي للوصول السريع إلى الدروس والمقالات المحفوظة.
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-xs font-semibold px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            تسجيل الخروج
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mb-12">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-primary font-bold mb-3">
                <BookOpen className="h-5 w-5" />
                <span>المقالات والشروحات</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                تصفّح أحدث المقالات والدلائل العملية المخصصة في الذكاء الاصطناعي والأتمتة.
              </p>
            </div>
            <Link
              to="/posts"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
            >
              <span>تصفّح المقالات</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-primary font-bold mb-3">
                <GraduationCap className="h-5 w-5" />
                <span>الدروس والمسارات التعليمية</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                انتقل مباشرة للدروس التطبيقية ومسارات التعلم التفاعلية لبناء مشاريعك الخاصة.
              </p>
            </div>
            <Link
              to="/lessons"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
            >
              <span>تصفّح الدروس</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
