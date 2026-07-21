import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { checkIsAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  FileText,
  Video,
  Sparkles,
  BarChart3,
  LogOut,
  Home,
  ShieldAlert,
  Loader2,
  Tags,
  ChevronLeft,
  Youtube,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV_ITEMS = [
  { title: "نظرة عامة (Dashboard)", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "المقالات (Posts)", url: "/admin/posts", icon: FileText },
  { title: "دورات YouTube والفيديو", url: "/admin/lessons", icon: Youtube },
  { title: "أدوات الذكاء الاصطناعي", url: "/admin/tools", icon: Sparkles },
  { title: "التحليلات والإحصائيات", url: "/admin/analytics", icon: BarChart3 },
];

function AdminLayout() {
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    checkIsAdmin()
      .then((r) => setState(r.isAdmin ? "ok" : "denied"))
      .catch(() => setState("denied"));
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium">جاري التحقق من صلاحية المشرف...</span>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="max-w-md text-center space-y-4 border border-slate-800 bg-slate-900 p-8 rounded-3xl shadow-2xl">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
          <h1 className="text-2xl font-black">الوصول مرفوض (Access Denied)</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            هذه اللوحة مخصصة لإدارة Bouiba Academy فقط. يرجى تسجيل الدخول بحساب المشرف الرئيسي.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg hover:opacity-90 transition-all"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-primary/30" dir="rtl">
      {/* WordPress / Enterprise Dark Sidebar */}
      <aside className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 select-none hidden md:flex">
        <div>
          {/* Header Branding */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold font-display text-base tracking-tight truncate text-white">
                Bouiba Academy
              </h2>
              <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Super Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              القائمة الرئيسية (WordPress Navigation)
            </div>

            {NAV_ITEMS.map((item) => {
              const active = isActive(item.url, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${active ? "text-primary-foreground" : "text-slate-400"}`} />
                    <span>{item.title}</span>
                  </div>
                  {active && <ChevronLeft className="h-4 w-4 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Home className="h-4 w-4 text-slate-400" />
            <span>عرض الموقع المباشر</span>
          </Link>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/auth";
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background text-foreground">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border/80 bg-card px-6 flex items-center justify-between sticky top-0 z-30 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <Link to="/admin" className="font-bold text-sm text-primary">
                لوحة التحكم
              </Link>
            </div>
            <h1 className="font-display text-base font-extrabold text-foreground hidden sm:block">
              لوحة التحكم الاحترافية — Bouiba Academy
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-semibold hidden md:inline">
              مرحباً بك، المشرف الرئيسي (abouiba93@gmail.com)
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold hover:border-primary transition-all shadow-soft"
            >
              <Home className="h-3.5 w-3.5" />
              <span>الموقع</span>
            </Link>
          </div>
        </header>

        {/* Main Outlet */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
