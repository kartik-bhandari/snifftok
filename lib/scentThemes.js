/**
 * lib/scentThemes.js
 * Visual theme per scent family — colours and icon only (`accent` tints the
 * home-page hero glow when a family is hovered). The family's name and
 * description come from the API (see lib/categories.js).
 */

import { Flower2, Flame, TreePine, Waves, Cookie, Sparkles } from "lucide-react";

export const SCENT_THEMES = {
  floral: {
    icon: Flower2,
    gradient: "from-[#5c1a33] via-[#a8325e] to-[#e88aa8]",
    tint: "bg-[#fbe9ef] text-[#8a2449]",
    accent: "#f29bb8",
  },
  amber: {
    icon: Flame,
    gradient: "from-[#3d1206] via-[#8a3209] to-[#e08a2e]",
    tint: "bg-[#fdf0e1] text-[#8a3a09]",
    accent: "#f0a04b",
  },
  woody: {
    icon: TreePine,
    gradient: "from-[#1f1a14] via-[#4a3a28] to-[#8c7350]",
    tint: "bg-[#f1ece4] text-[#4a3a28]",
    accent: "#c4a274",
  },
  fresh: {
    icon: Waves,
    gradient: "from-[#0b3a52] via-[#127a96] to-[#5fd0d6]",
    tint: "bg-[#e3f5f7] text-[#0e5f75]",
    accent: "#6fd8e0",
  },
  gourmand: {
    icon: Cookie,
    gradient: "from-[#2a160c] via-[#6b3a1e] to-[#c98a52]",
    tint: "bg-[#f6ece3] text-[#6b3a1e]",
    accent: "#d9a06a",
  },
};

const FALLBACK = {
  icon: Sparkles,
  gradient: "from-[#1a1a1a] via-[#3a3a3a] to-[#6a6a6a]",
  tint: "bg-[#EFEFEF] text-[#0A0A0A]",
  accent: "#f3c98b",
};

export function themeFor(slug) {
  return SCENT_THEMES[slug] ?? FALLBACK;
}

/** Subtle film-grain overlay used on the gradient panels */
export const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";
