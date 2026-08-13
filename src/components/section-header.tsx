/**
 * SectionHeader — Bouiba Academy Design System
 * Unified section header component used across all pages.
 *
 * Features:
 * - Animated accent dot + gradient line
 * - Optional badge, subtitle, and CTA link
 * - Responsive text sizing
 * - Supports all brand color variants
 */

import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import type { LucideIcon } from "lucide-react";

type ColorVariant = "primary" | "amber" | "violet" | "cobalt";

interface SectionHeaderProps {
  /** Main heading text */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Optional small badge above the title */
  badge?: string;
  /** Optional icon in the accent dot */
  icon?: LucideIcon;
  /** Link to "view all" */
  ctaTo?: string;
  /** CTA label (defaults to "عرض الكل" / "View All") */
  ctaLabel?: string;
  /** Color variant for accent elements */
  color?: ColorVariant;
  /** Center align instead of start */
  centered?: boolean;
  /** Additional class names */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const colorConfig: Record<
  ColorVariant,
  {
    dot: string;
    badge: string;
    gradientText: string;
    ctaText: string;
    line: string;
  }
> = {
  primary: {
    dot: "bg-primary",
    badge: "badge-primary",
    gradientText: "gradient-text",
    ctaText: "text-primary hover:text-primary/80",
    line: "from-primary/40 to-transparent",
  },
  amber: {
    dot: "bg-amber-400",
    badge: "badge-amber",
    gradientText: "gradient-text-amber",
    ctaText: "text-amber-600 dark:text-amber-400 hover:opacity-80",
    line: "from-amber-400/40 to-transparent",
  },
  violet: {
    dot: "bg-violet",
    badge: "badge-violet",
    gradientText: "gradient-text-violet",
    ctaText: "text-violet-600 dark:text-violet-400 hover:opacity-80",
    line: "from-violet-500/40 to-transparent",
  },
  cobalt: {
    dot: "bg-cobalt",
    badge: "badge-cobalt",
    gradientText: "gradient-text-cobalt",
    ctaText: "text-blue-700 dark:text-blue-400 hover:opacity-80",
    line: "from-blue-600/40 to-transparent",
  },
};

const sizeConfig = {
  sm: { heading: "text-base md:text-lg", subtitle: "text-xs md:text-sm" },
  md: { heading: "text-lg md:text-xl", subtitle: "text-sm md:text-base" },
  lg: { heading: "text-2xl md:text-3xl", subtitle: "text-sm md:text-base" },
};

export function SectionHeader({
  title,
  subtitle,
  badge,
  icon: Icon,
  ctaTo,
  ctaLabel,
  color = "primary",
  centered = false,
  className = "",
  size = "md",
}: SectionHeaderProps) {
  const { isRTL, t } = useLang();
  const cfg = colorConfig[color];
  const sz = sizeConfig[size];
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div
      className={`
        flex flex-col gap-1
        ${centered ? "items-center text-center" : "items-start"}
        ${className}
      `}
    >
      {/* Top row: accent line + badge */}
      <div
        className={`flex items-center gap-2 ${centered ? "justify-center" : ""}`}
      >
        {/* Animated accent dot */}
        <div className="relative flex items-center justify-center">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
          <span
            className={`absolute inline-block h-2.5 w-2.5 rounded-full ${cfg.dot} opacity-40 animate-ping`}
          />
        </div>

        {/* Decorative gradient line */}
        {!centered && (
          <div
            className={`h-px w-16 bg-gradient-to-r ${cfg.line}`}
            aria-hidden="true"
          />
        )}

        {/* Optional badge */}
        {badge && (
          <span className={`${cfg.badge} text-[10px] font-bold tracking-wide`}>
            {badge}
          </span>
        )}
      </div>

      {/* Title row */}
      <div
        className={`flex items-end justify-between gap-4 w-full ${
          centered ? "flex-col items-center" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon
              className={`h-5 w-5 shrink-0 ${
                color === "primary"
                  ? "text-primary"
                  : color === "amber"
                  ? "text-amber-500"
                  : color === "violet"
                  ? "text-violet-500"
                  : "text-blue-600 dark:text-blue-400"
              }`}
              aria-hidden="true"
            />
          )}
          <h2
            className={`
              font-display font-bold tracking-tight text-foreground
              ${sz.heading}
            `}
          >
            {title}
          </h2>
        </div>

        {/* CTA link */}
        {ctaTo && (
          <Link
            to={ctaTo}
            className={`
              shrink-0 inline-flex items-center gap-1
              text-xs font-semibold transition-all
              ${cfg.ctaText}
            `}
          >
            {ctaLabel ?? t("nav.viewAll")}
            <ArrowIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p
          className={`
            text-muted-foreground leading-relaxed
            ${sz.subtitle}
            ${centered ? "max-w-xl" : ""}
          `}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * StatCard — Small metric/stat card used in hero or about sections.
 */
export function StatCard({
  value,
  label,
  icon: Icon,
  color = "primary",
}: {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  color?: ColorVariant;
}) {
  const cfg = colorConfig[color];

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-card/80 border border-border/60 shadow-card text-center">
      {Icon && (
        <Icon
          className={`h-4 w-4 mb-1 ${
            color === "primary"
              ? "text-primary"
              : color === "amber"
              ? "text-amber-500"
              : color === "violet"
              ? "text-violet-500"
              : "text-blue-600 dark:text-blue-400"
          }`}
          aria-hidden="true"
        />
      )}
      <span className={`text-xl font-display font-extrabold ${cfg.gradientText}`}>
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground font-medium leading-tight">
        {label}
      </span>
    </div>
  );
}
