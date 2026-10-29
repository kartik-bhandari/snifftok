import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchCategories } from "@/lib/categories";
import { themeFor, GRAIN } from "@/lib/scentThemes";

export const metadata = {
  title: "Scent Families | snifftok",
  description: "Shop fragrances by scent family — Floral, Amber, Woody, Fresh and Gourmand.",
};

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <main className="min-h-screen bg-[#EFEFEF] pb-40 md:pb-16">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="pt-24 md:pt-28 px-5 pb-8 max-w-5xl mx-auto">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8A8A8A] mb-2">
          Browse
        </p>
        <h1 className="font-wordmark text-[#0A0A0A] text-[32px] md:text-[44px] leading-[1.02]">
          scent families
        </h1>
        <p className="text-[13px] md:text-[15px] text-[#666666] mt-2 max-w-md leading-relaxed">
          Every fragrance belongs to one of five families. Pick the mood — we&apos;ll show you the bottles.
        </p>
      </div>

      {/* ── Families ───────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4">
        {categories.length === 0 ? (
          <p className="text-center text-sm text-[#8A8A8A] py-16">
            Categories are unavailable right now. Please try again shortly.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((cat, i) => (
              <FamilyCard
                key={cat._id}
                cat={cat}
                // 5 cards in 2 columns — let the last one span the row
                wide={categories.length % 2 === 1 && i === categories.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function FamilyCard({ cat, wide }) {
  const { icon: Icon, gradient } = themeFor(cat.slug);

  return (
    <Link
      href={`/categories/${cat.slug}`}
      aria-label={`Browse ${cat.name} fragrances`}
      className={`group relative overflow-hidden rounded-[24px] min-h-[260px] md:min-h-[300px] flex flex-col p-5 md:p-6 text-white shadow-sm active:scale-[0.985] transition-transform duration-150 ${wide ? "md:col-span-2" : ""}`}
    >
      {/* Colour + grain */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 opacity-[0.14] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-300" />

      {/* Watermark icon */}
      <Icon className="absolute -right-6 -bottom-6 w-44 h-44 md:w-56 md:h-56 text-white opacity-[0.10] stroke-[0.7] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top row */}
        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-white stroke-[2]" />
        </div>

        {/* Name + description */}
        <div className="mt-6">
          {/* Always takes a line so titles line up across cards in a row */}
          <p
            className={`text-[10px] font-semibold tracking-[0.14em] uppercase text-white/60 mb-1 ${cat.aka ? "" : "invisible"}`}
            aria-hidden={!cat.aka}
          >
            {cat.aka || " "}
          </p>
          <h2 className="font-wordmark text-[34px] md:text-[40px] leading-none">{cat.name}</h2>
          {cat.smellsLike && (
            <p className="text-[13px] md:text-[14px] text-white/85 mt-2 max-w-sm leading-snug">
              {cat.smellsLike}
            </p>
          )}
        </div>

        {/* Notes */}
        {cat.notes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {cat.notes.slice(0, 5).map((note) => (
              <span
                key={note}
                className="text-[11px] font-medium text-white/90 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full"
              >
                {note}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-5 flex items-end justify-between gap-4">
          {cat.bestFor && (
            <p className="text-[11px] text-white/70 leading-snug max-w-[70%]">
              <span className="font-semibold text-white/85">Best for </span>
              {cat.bestFor.charAt(0).toLowerCase() + cat.bestFor.slice(1)}
            </p>
          )}
          <span className="ml-auto shrink-0 w-10 h-10 rounded-full bg-white text-[#0A0A0A] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
