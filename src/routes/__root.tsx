import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import criticalCss from "../critical.css?raw";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">حدث خطأ ما</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          حدث خطأ غير متوقع. حاول تحديث الصفحة أو العودة للرئيسية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            حاول مجددًا
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

const SITE_TITLE = "Bouiba Academy — أكاديميتك العربية للذكاء الاصطناعي";
const SITE_DESC = "دروس عملية، أحدث الأخبار، وأدوات مجانية في الذكاء الاصطناعي — Grok • Claude • Gemini • Llama.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1", key: "viewport" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC, key: "description" },
      { name: "author", content: "Bouiba Academy", key: "author" },
      { property: "og:site_name", content: "Bouiba Academy", key: "og:site_name" },
      { property: "og:title", content: SITE_TITLE, key: "og:title" },
      { property: "og:description", content: SITE_DESC, key: "og:description" },
      { property: "og:type", content: "website", key: "og:type" },
      { property: "og:locale", content: "ar_AR", key: "og:locale" },
      { property: "og:image", content: "https://www.bouibacademy.me/og-banner.png", key: "og:image" },
      { property: "og:image:width", content: "1200", key: "og:image:width" },
      { property: "og:image:height", content: "630", key: "og:image:height" },
      { property: "og:image:alt", content: SITE_TITLE, key: "og:image:alt" },
      { name: "twitter:card", content: "summary_large_image", key: "twitter:card" },
      { name: "twitter:title", content: SITE_TITLE, key: "twitter:title" },
      { name: "twitter:description", content: SITE_DESC, key: "twitter:description" },
      { name: "twitter:image", content: "https://www.bouibacademy.me/og-banner.png", key: "twitter:image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "shortcut icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
    scripts: [
      {
        children: "(function(){var loaded=false;function load(){if(loaded)return;loaded=true;var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6404561979968062';document.head.appendChild(s);}var evts=['scroll','click','touchstart','keydown','mousemove'];evts.forEach(function(e){window.addEventListener(e,load,{once:true,passive:true})});setTimeout(load,4000);})();",
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Bouiba Academy",
          "url": "https://www.bouibacademy.me",
          "description": SITE_DESC,
          "inLanguage": "ar",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.bouibacademy.me/posts?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
        <HeadContent />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:bg-background focus:text-foreground focus:p-4 focus:rounded-lg focus:border focus:shadow-md">
          التخطي إلى المحتوى الرئيسي
        </a>
        <div id="main-content" className="contents">
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
