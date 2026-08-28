"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * LiquidGlass — a reusable wrapper that applies the liquid-glass surface
 * treatment (frosted, refractive, beveled) from the build-webgl-liquid-glass
 * skill, translated to pure CSS.
 *
 * Variants:
 *   default      — balanced frost + bevel + specular (for cards over images)
 *   frost        — heavier blur (for modals, privacy panels)
 *   clear        — minimal (for nav bars over busy backgrounds)
 *   dark         — navy-tinted (for dark sections / hero overlays)
 *   gold         — gold-tinted (for ARRC premium accents)
 *
 * @example
 * <LiquidGlass variant="dark" interactive shimmer>
 *   <h3>Card content</h3>
 * </LiquidGlass>
 */

type GlassVariant = "default" | "frost" | "clear" | "dark" | "gold";

interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  interactive?: boolean;
  shimmer?: boolean;
  children: ReactNode;
}

const variantClass: Record<GlassVariant, string> = {
  default: "liquid-glass",
  frost: "liquid-glass-frost",
  clear: "liquid-glass-clear",
  dark: "liquid-glass-dark",
  gold: "liquid-glass-gold",
};

export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  (
    {
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
LiquidGlass.displayName = "LiquidGlass";
