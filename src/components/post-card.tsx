import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { optimizeBloggerImage, type BloggerPost } from "@/lib/blogger.functions";
import { Tilt3DCard } from "@/components/interactive-3d-card";
import { useLang } from "@/hooks/use-lang";

function formatDate(iso: string, lang: "ar" | "fr" | "en") {
  try {
    const locale =
      lang === "fr" ? "fr-FR" : lang === "en" ? "en-US" : "ar-EG-u-nu-latn";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Detect likely language from post labels */
function detectPostLang(
  post: BloggerPost,
): "ar" | "fr" | "en" {
  const labels = post.labels.map((l) => l.toLowerCase());
  if (labels.includes("english") || labels.includes("en")) return "en";
  if (labels.includes("français") || labels.includes("french") || labels.includes("fr"))
    return "fr";
  return "ar";
}

export function PostCard({
  post,
  featured = false,
  priority = false,
}: {
  post: BloggerPost;
  featured?: boolean;
  priority?: boolean;
}) {
  const { t, lang } = useLang();
  const w = featured ? 1200 : 800;
  const h = featured ? 675 : 500;
  const src = optimizeBloggerImage(post.thumbnail, w, h);
  const src2x = optimizeBloggerImage(post.thumbnail, w * 2, h * 2);
  const postLang = detectPostLang(post);
  const showLangBadge = postLang !== "ar"; // Show badge only for non-AR posts

  return (
    <Tilt3DCard maxDegree={5} depth={10} className={featured ? "md:col-span-2 md:row-span-2" : ""}>
      <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md h-full flex flex-col justify-between card-hover">
        <Link to="/posts/$id" params={{ id: post.slug }} className="block flex-1 flex flex-col">
          {post.thumbnail && (
            <div
              className={`overflow-hidden bg-surface-muted border-b border-border/60 ${
                featured ? "aspect-[16/9]" : "aspect-[16/10]"
              }`}
            >
              <img
                src={src}
                srcSet={src && src2x ? `${src} ${w}w, ${src2x} ${w * 2}w` : undefined}
                width={w}
                height={h}
                alt={post.title}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding={priority ? "sync" : "async"}
                sizes={
                  featured ? "(min-width: 768px) 800px, 100vw" : "(min-width: 768px) 400px, 100vw"
                }
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
            </div>
          )}

          <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
            <div>
              {/* Labels row: category + optional lang badge */}
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                {post.labels[0] && (
                  <span className="inline-block text-[11px] font-bold text-primary bg-accent border border-primary/20 px-2.5 py-1 rounded-md">
                    {post.labels[0]}
                  </span>
                )}
                {showLangBadge && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide
                      ${postLang === "fr" ? "lang-fr" : "lang-en"}
                    `}
                  >
                    {postLang === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
                  </span>
                )}
              </div>

              <h3
                className={`font-display font-extrabold leading-snug text-foreground group-hover:text-primary transition-colors ${
                  featured ? "text-2xl md:text-3xl" : "text-base md:text-lg"
                }`}
              >
                {post.title}
              </h3>

              <p
                className={`text-muted-foreground mt-2 text-xs md:text-sm leading-relaxed ${
                  featured ? "line-clamp-3" : "line-clamp-2"
                }`}
              >
                {post.excerpt}
              </p>
            </div>

            {/* Meta row */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(post.published, lang)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingMinutes} {t("card.minutes")}
              </span>
            </div>
          </div>
        </Link>
      </article>
    </Tilt3DCard>
  );
}
