import { Link } from "@tanstack/react-router";
import { Clock, ArrowLeft } from "lucide-react";
import { optimizeBloggerImage, type BloggerPost } from "@/lib/blogger.functions";
import { Tilt3DCard } from "@/components/interactive-3d-card";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
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
  const w = featured ? 1200 : 800;
  const h = featured ? 675 : 500;
  const src = optimizeBloggerImage(post.thumbnail, w, h);
  const src2x = optimizeBloggerImage(post.thumbnail, w * 2, h * 2);

  return (
    <Tilt3DCard maxDegree={5} depth={10} className={featured ? "md:col-span-2 md:row-span-2" : ""}>
      <article
        className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md h-full flex flex-col justify-between"
      >
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
              {post.labels[0] && (
                <span className="inline-block text-[11px] font-bold text-primary bg-accent border border-primary/20 px-2.5 py-1 rounded-md mb-2.5">
                  {post.labels[0]}
                </span>
              )}
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

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(post.published)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingMinutes} دقائق
              </span>
            </div>
          </div>
        </Link>
      </article>
    </Tilt3DCard>
  );
}
