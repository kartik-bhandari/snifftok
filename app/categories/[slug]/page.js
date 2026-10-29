import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageOpen } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import WhatsAppRequestBanner from "@/components/WhatsAppRequestBanner";
import { fetchCategories, fetchCategory } from "@/lib/categories";
import { fetchProducts } from "@/lib/products";
import { themeFor, GRAIN } from "@/lib/scentThemes";

/** Pre-render all 5 families at build time */
export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cat = await fetchCategory(slug);
  if (!cat) return { title: "Category Not Found | snifftok" };
  return {
    title:       `${cat.name} Fragrances | snifftok`,
    description: cat.smellsLike ?? `Shop ${cat.name} fragrances at snifftok.`,
  };
}

/**
 * `params` and the data fetches are read inside <Suspense> so client
 * navigations show the skeleton instantly instead of blocking.
 */
export default function CategoryPage({ params }) {
  return (
    <main className="min-h-screen bg-[#EFEFEF] pb-40 md:pb-16">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryContent params={params} />
      </Suspense>
    </main>
  );
}

async function CategoryContent({ params }) {
  const { slug } = await params;
  const [cat, products, all] = await Promise.all([
    fetchCategory(slug),
    fetchProducts({ category: slug, limit: 100 }),
    fetchCategories(),
  ]);

  if (!cat) notFound();

  const { icon: Icon, gradient, tint } = themeFor(cat.slug);
  const items = products.data ?? [];
  const others = all.filter((c) => c.slug !== cat.slug);

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-20 md:pt-24 px-4">
        <div className="relative overflow-hidden rounded-[28px] max-w-7xl mx-auto text-white">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
          <div className="absolute inset-0 opacity-[0.14] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
          <Icon className="absolute -right-10 -bottom-10 w-64 h-64 md:w-96 md:h-96 text-white opacity-[0.10] stroke-[0.6]" />

          <div className="relative z-10 p-5 sm:p-8 md:p-10">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/80 hover:text-white bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All families
            </Link>

            <div className="mt-6 md:mt-8 max-w-2xl">
              {cat.aka && (
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/60 mb-1">{cat.aka}</p>
              )}
              <h1 className="font-wordmark text-[48px] md:text-[72px] leading-[0.95]">{cat.name}</h1>
              {cat.smellsLike && (
                <p className="text-[14px] md:text-[17px] text-white/90 mt-3 leading-snug">{cat.smellsLike}</p>
              )}
            </div>

            <dl className="mt-6 md:mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
              {cat.notes?.length > 0 && (
                <Detail label="Common notes">
                  <Chips items={cat.notes} />
                </Detail>
              )}
              {cat.subfamilies?.length > 0 && (
                <Detail label="Subfamilies">
                  <Chips items={cat.subfamilies} />
                </Detail>
              )}
              {cat.bestFor && (
                <Detail label="Best for">
                  <p className="text-[13px] text-white/90 leading-snug">{cat.bestFor}</p>
                </Detail>
              )}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Products ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 mt-8 md:mt-10">
        <div className="flex items-baseline justify-between gap-3 mb-4 md:mb-6">
          <h2 className="text-[18px] sm:text-[22px] font-bold text-[#0A0A0A] tracking-tight">
            {cat.name} fragrances
          </h2>
          <span className="text-[12px] sm:text-[13px] text-[#8A8A8A] tabular-nums">
            {products.total ?? items.length} {(products.total ?? items.length) === 1 ? "item" : "items"}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#E8E8E8] px-6 py-14 text-center">
            <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center ${tint}`}>
              <PackageOpen className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#0A0A0A]">No {cat.name.toLowerCase()} fragrances yet</p>
            <p className="text-xs text-[#8A8A8A] mt-1">New bottles land often — check another family meanwhile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Other families ──────────────────────────────────────── */}
      {others.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-12">
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#8A8A8A] mb-3">
            Explore other families
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {others.map((o) => {
              const { icon: OIcon, tint: oTint } = themeFor(o.slug);
              return (
                <Link
                  key={o._id}
                  href={`/categories/${o.slug}`}
                  className="shrink-0 inline-flex items-center gap-2 bg-white rounded-full border border-[#E8E8E8] pl-1.5 pr-4 py-1.5 hover:border-[#0A0A0A]/20 transition-colors"
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center ${oTint}`}>
                    <OIcon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[13px] font-medium text-[#0A0A0A]">{o.name}</span>
                  <span className="text-[11px] text-[#8A8A8A] tabular-nums">{o.productCount ?? 0}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <WhatsAppRequestBanner />
      </div>
    </>
  );
}

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/60 mb-1.5">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Chips({ items }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="text-[11px] font-medium text-white/90 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {t}
        </span>
      ))}
    </div>
  );
}

/** Mirrors the page layout so nothing jumps when content arrives */
function CategorySkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading category" className="animate-pulse">
      <div className="pt-20 md:pt-24 px-4">
        <div className="h-[340px] md:h-[400px] rounded-[28px] bg-[#E2E2E2] max-w-7xl mx-auto" />
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-10">
        <div className="h-5 w-48 rounded bg-[#E2E2E2] mb-5" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-[16px] bg-[#E2E2E2]" />
          ))}
        </div>
      </div>
    </div>
  );
}
