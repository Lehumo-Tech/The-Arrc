"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * BentoGrid — a CSS-grid layout of varied-size cells, popularized by Apple's
 * product pages. Cells can span multiple columns/rows via the `span` prop.
 *
 * Based on the bento-grid design language skill: uniform gap, rounded corners,
 * mixed content types, staggered entrance animation.
 *
 * @example
 * <BentoGrid>
 *   <BentoCell span="large" variant="dark">…</BentoCell>
 *   <BentoCell span="wide">…</BentoCell>
 *   <BentoCell>…</BentoCell>
 *   <BentoCell span="tall">…</BentoCell>
 * </BentoGrid>
 */

type GridVariant = "default" | "3col" | "auto";
type CellSpan = "default" | "wide" | "tall" | "large" | "full" | "wide-3";
type CellVariant = "default" | "glass" | "glass-dark" | "glass-gold" | "glass-frost" | "plain";

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GridVariant;
  children: ReactNode;
}

const gridVariantClass: Record<GridVariant, string> = {
  default: "bento-grid",
  "3col": "bento-grid bento-grid-3",
  auto: "bento-grid-auto",
};

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(gridVariantClass[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BentoGrid.displayName = "BentoGrid";

interface BentoCellProps extends HTMLAttributes<HTMLDivElement> {
  span?: CellSpan;
  variant?: CellVariant;
  interactive?: boolean;
  shimmer?: boolean;
  children: ReactNode;
}

const spanClass: Record<CellSpan, string> = {
  default: "",
  wide: "bento-wide",
  tall: "bento-tall",
  large: "bento-large",
  full: "bento-full",
  "wide-3": "bento-wide-3",
};

const variantClass: Record<CellVariant, string> = {
  default: "liquid-glass-dark",
  glass: "liquid-glass",
  "glass-dark": "liquid-glass-dark",
  "glass-gold": "liquid-glass-gold",
  "glass-frost": "liquid-glass-frost",
  plain: "",
};

export const BentoCell = forwardRef<HTMLDivElement, BentoCellProps>(
  (
    {
      span = "default",
      variant = "default",
      interactive = false,
      shimmer = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      "bento-cell",
      spanClass[span],
      variantClass[variant],
      interactive ? "liquid-glass-interactive" : "",
      shimmer ? "liquid-glass-shimmer" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);
BentoCell.displayName = "BentoCell";

/**
 * BentoStat — a stat/metric cell for dashboards and highlights.
 * Shows a big value, a label, and an optional icon.
 */
interface BentoStatProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  accent?: "gold" | "emerald" | "blue";
  className?: string;
}

const accentBg: Record<string, string> = {
  gold: "bg-arrc-gold/20 text-arrc-gold",
  emerald: "bg-emerald-500/20 text-emerald-400",
  blue: "bg-blue-500/20 text-blue-400",
};

export function BentoStat({
  value,
  label,
  icon,
  accent = "gold",
  className,
}: BentoStatProps) {
  return (
    <div className={cn("bento-stat", className)}>
      {icon && (
        <div className={cn("bento-stat-icon", accentBg[accent])}>{icon}</div>
      )}
      <div>
        <div className="bento-stat-value gradient-text">{value}</div>
        <div className="bento-stat-label">{label}</div>
      </div>
    </div>
  );
}
