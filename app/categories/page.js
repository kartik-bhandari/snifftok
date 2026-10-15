"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sun, Moon, Coffee, Waves, Wind, Flame, Leaf,
  Sparkles, Cloud, Snowflake, FlowerIcon, Star, Gift,
  Heart, TreePine, ChevronRight,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "occasion",
    label: "Occasion",
    categories: [
      {
        id: "date-night",
        name: "Date Night",
        tagline: "Magnetic & Alluring",
        gradient: "from-rose-950 via-rose-800 to-pink-700",
        icon: Heart,
        tags: ["Vanilla", "Amber", "Rose"],
      },
      {
        id: "morning",
        name: "Morning Ritual",
        tagline: "Fresh & Invigorating",
        gradient: "from-amber-500 via-orange-400 to-yellow-300",
        icon: Sun,
        tags: ["Bergamot", "Green Tea", "Citrus"],
      },
      {
        id: "office",
        name: "Office Wear",
        tagline: "Clean & Professional",
        gradient: "from-slate-700 via-slate-600 to-slate-400",
        icon: Coffee,
        tags: ["White Musk", "Cedar", "Vetiver"],
      },
      {
        id: "evening-out",
        name: "Evening Out",
        tagline: "Bold & Commanding",
        gradient: "from-violet-950 via-purple-800 to-indigo-700",
        icon: Moon,
        tags: ["Oud", "Spice", "Tonka"],
      },
      {
        id: "casual",
        name: "Casual Everyday",
        tagline: "Effortless & Easy",
        gradient: "from-sky-600 via-cyan-500 to-teal-400",
        icon: Wind,
        tags: ["Aquatic", "Sandalwood", "Floral"],
      },
      {
        id: "beach",
        name: "Beach & Vacation",
        tagline: "Tropical & Carefree",
        gradient: "from-cyan-500 via-blue-400 to-teal-300",
        icon: Waves,
        tags: ["Sea Salt", "Coconut", "Frangipani"],
      },
      {
        id: "festive",
        name: "Festive & Celebrations",
        tagline: "Opulent & Grand",
        gradient: "from-amber-800 via-yellow-600 to-amber-400",
        icon: Sparkles,
        tags: ["Saffron", "Tuberose", "Frankincense"],
      },
      {
        id: "gifting",
        name: "Gifts & Discovery",
        tagline: "Thoughtful & Curated",
        gradient: "from-pink-700 via-fuchsia-600 to-purple-500",
        icon: Gift,
        tags: ["Sampler Sets", "Gift Boxes", "Discovery Kits"],
      },
    ],
  },
  {
    id: "seasonal",
    label: "Season",
    categories: [
      {
        id: "summer",
        name: "Summer",
        tagline: "Cooling & Sparkling",
        gradient: "from-orange-400 via-yellow-300 to-lime-300",
        icon: Sun,
        tags: ["Bergamot", "Aquatic", "Mandarin"],
      },
      {
        id: "winter",
        name: "Winter",
        tagline: "Warm & Cocooning",
        gradient: "from-blue-900 via-indigo-700 to-slate-600",
        icon: Snowflake,
        tags: ["Oud", "Vanilla", "Incense"],
      },
      {
        id: "spring",
        name: "Spring",
        tagline: "Blooming & Optimistic",
        gradient: "from-green-500 via-emerald-400 to-lime-300",
        icon: FlowerIcon,
        tags: ["Peony", "Green Notes", "Peach"],
      },
      {
        id: "autumn",
        name: "Autumn",
        tagline: "Earthy & Transitional",
        gradient: "from-orange-700 via-amber-600 to-yellow-500",
        icon: Leaf,
        tags: ["Cedarwood", "Amber", "Fig"],
      },
    ],
  },
  {
    id: "scent-families",
    label: "Scent Family",
    categories: [
      {
        id: "floral",
        name: "Floral",
        tagline: "Rose · Jasmine · Tuberose",
        gradient: "from-pink-600 via-rose-500 to-red-400",
        icon: FlowerIcon,
        tags: ["Rose", "Jasmine", "Tuberose"],
      },
      {
        id: "woody",
        name: "Woody & Earthy",
        tagline: "Oud · Sandalwood · Vetiver",
        gradient: "from-stone-700 via-amber-800 to-yellow-900",
        icon: TreePine,
        tags: ["Oud", "Sandalwood", "Vetiver"],
      },
      {
        id: "fresh-citrus",
        name: "Fresh & Citrus",
        tagline: "Bergamot · Lime · Aquatic",
        gradient: "from-lime-400 via-green-400 to-cyan-400",
        icon: Cloud,
        tags: ["Bergamot", "Lime", "Sea Spray"],
      },
      {
        id: "oriental-amber",
        name: "Oriental & Amber",
        tagline: "Resinous · Warm · Spiced",
        gradient: "from-red-900 via-orange-800 to-amber-600",
        icon: Flame,
        tags: ["Labdanum", "Spice", "Benzoin"],
      },
      {
        id: "gourmand",
        name: "Gourmand & Sweet",
        tagline: "Vanilla · Caramel · Coffee",
        gradient: "from-amber-700 via-yellow-600 to-orange-400",
        icon: Star,
        tags: ["Vanilla", "Tonka", "Coffee"],
      },
      {
        id: "musk",
        name: "Musk & Clean",
        tagline: "Skin-like · Intimate · Pure",
        gradient: "from-zinc-500 via-slate-400 to-gray-300",
        icon: Sparkles,
        tags: ["White Musk", "Ambrette", "Cotton"],
      },
    ],
  },
];

// ─── Card ───────────────────────────────────────────────────────────────────────
function CategoryCard({ cat, index }) {
  const router = useRouter();
  const Icon = cat.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onClick={() => router.push(`/?category=${cat.id}`)}
      className="group relative w-full text-left overflow-hidden rounded-[20px] active:scale-[0.97] transition-transform duration-150"
      style={{ aspectRatio: "1 / 1" }}
      aria-label={`Browse ${cat.name} fragrances`}
    >
      {/* Gradient fill */}
      <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />

      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Watermark icon */}
      <div className="absolute -right-3 -bottom-3 opacity-[0.12]">
        <Icon className="w-28 h-28 text-white stroke-[0.8]" />
      </div>

      {/* Shine sweep on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/10 group-hover:via-white/5 group-hover:to-white/0 transition-all duration-500" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        {/* Top: icon pill */}
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-[18px] h-[18px] text-white stroke-[2.2]" />
          </div>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/35 transition-colors">
            <ChevronRight className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Bottom: name + tags */}
        <div>
          <p className="text-white/65 text-[11px] font-medium tracking-[0.05em] uppercase mb-1">
            {cat.tagline}
          </p>
          <h3 className="font-wordmark text-white text-base leading-tight mb-2.5">
            {cat.name}
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {cat.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold text-white/85 bg-white/15 backdrop-blur-sm px-2 py-[3px] rounded-full tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  return (
    <>
      <title>Categories — snifftok | Fragrances by Occasion, Season & Scent</title>

      <main className="min-h-screen bg-[#EFEFEF] pb-40 md:pb-16">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="pt-24 md:pt-28 px-5 pb-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8A8A8A] mb-2">
              Browse
            </p>
            <h1 className="font-wordmark text-[#0A0A0A] text-[28px] leading-[1.05]">
              all categories
            </h1>
          </motion.div>
        </div>

        {/* ── Sections ─────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 space-y-10 pb-4">
          {SECTIONS.map((section, si) => (
            <section key={section.id} aria-labelledby={`sec-${section.id}`}>

              {/* Section label — minimal pill */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: si * 0.05 }}
                className="flex items-center gap-3 mb-4"
              >
                <span
                  id={`sec-${section.id}`}
                  className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#8A8A8A]"
                >
                  {section.label}
                </span>
                <div className="flex-1 h-px bg-[#0A0A0A]/8" />
              </motion.div>

              {/* Grid — square cards */}
              <div className="grid grid-cols-2 gap-3">
                {section.categories.map((cat, i) => (
                  <CategoryCard key={cat.id} cat={cat} index={i} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
