import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Radio, Pin, Heart, Loader2, ArrowRight, Settings, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminStats>> | null>(null);
  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const cards = [
    {
      title: "أدوات AI المتاحة",
      value: stats?.toolsCount ?? 0,
      icon: Sparkles,
      color: "text-purple-500",
      bg: "from-purple-500/10 to-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-extrabold font-display">مرحباً بك في لوحة التحكم 👋</h2>
          <p className="text-muted-foreground text-sm mt-1">
            نظرة سريعة على آخر الإحصائيات والمستجدات وإدارة محتوى الأكاديمية.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card
            key={c.title}
            className="overflow-hidden hover:shadow-elegant hover:-translate-y-0.5 transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">
                {c.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${c.bg}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight">
                {stats === null ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  c.value
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            روابط سريعة وإجراءات إدارية
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Link
            to="/admin/tools"
            className="group rounded-xl border p-4 hover:bg-muted/40 hover:border-primary/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <Sparkles className="h-4 w-4" />
                <span>إدارة أدوات الذكاء الاصطناعي</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                تفعيل أو تعطيل الأدوات الذكية المعروضة للزوار بما فيها الأداة الجديدة (مسارات
                التعلم).
              </p>
            </div>
            <span className="text-xs font-bold text-primary mt-4 flex items-center gap-1 group-hover:translate-x-[-3px] transition-transform origin-right">
              إدارة الأدوات ←
            </span>
          </Link>

          <Link
            to="/tools/roadmap"
            className="group rounded-xl border p-4 hover:bg-muted/40 hover:border-primary/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-indigo-500 font-bold">
                <Eye className="h-4 w-4" />
                <span>معاينة مسار التعلم الذكي (Roadmap)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                تجربة ومعاينة أداة توليد الخرائط الذهنية ومسارات التعلم التفاعلية الجديدة مباشرة.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-500 mt-4 flex items-center gap-1 group-hover:translate-x-[-3px] transition-transform origin-right">
              معاينة الأداة ←
            </span>
          </Link>

          <a
            href="https://www.blogger.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border p-4 hover:bg-muted/40 hover:border-primary/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-foreground font-bold">
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                <span>نشر وإدارة مقالات المدونة</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                افتح لوحة Blogger لإنشاء وتعديل ونشر مقالات المدونة لتظهر على الموقع فوراً.
              </p>
            </div>
            <span className="text-xs font-bold text-foreground mt-4 flex items-center gap-1 group-hover:translate-x-[-3px] transition-transform origin-right">
              فتح Blogger ←
            </span>
          </a>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border p-4 hover:bg-muted/40 hover:border-primary/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-foreground font-bold">
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                <span>Google Search Console</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                متابعة حركة المرور والأرشفة وتصدر نتائج البحث لموقعك بشكل رسمي.
              </p>
            </div>
            <span className="text-xs font-bold text-foreground mt-4 flex items-center gap-1 group-hover:translate-x-[-3px] transition-transform origin-right">
              فتح Search Console ←
            </span>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
