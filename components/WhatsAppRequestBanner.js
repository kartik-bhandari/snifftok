import { MessageCircle, ArrowRight } from "lucide-react";
import { whatsappUrl, outOfStockMessage, WHATSAPP_MESSAGES } from "@/lib/whatsapp";

/**
 * "Can't find it? Ask us on WhatsApp" — shown where shoppers may be looking
 * for something specific (home page, shop and family listings, empty search).
 *
 * compact: a single-line version for tight spaces like the search overlay.
 */
export default function WhatsAppRequestBanner({ compact = false, className = "" }) {
  const href = whatsappUrl(WHATSAPP_MESSAGES.notFound);

  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex items-center gap-3 bg-white rounded-[18px] px-4 py-3 hover:shadow-sm transition-shadow text-left ${className}`}
      >
        <span className="w-9 h-9 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center shrink-0">
          <MessageCircle className="w-4 h-4 fill-white stroke-none" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-semibold text-[#0A0A0A]">Can&apos;t find what you&apos;re looking for?</span>
          <span className="block text-[12px] text-[#8A8A8A]">Message us on WhatsApp and we&apos;ll help you find it.</span>
        </span>
        <ArrowRight className="w-4 h-4 text-[#0A0A0A] shrink-0 transition-transform group-hover:translate-x-0.5" />
      </a>
    );
  }

  return (
    <section aria-label="Request a fragrance on WhatsApp" className={`w-full ${className}`}>
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-[#0A0A0A] text-white px-5 py-6 sm:px-8 sm:py-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
        {/* Soft glow */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(closest-side,rgba(243,201,139,0.28),transparent)]" />

        <div className="relative flex items-start gap-4 flex-1 min-w-0">
          <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white stroke-none" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[17px] sm:text-[20px] font-bold tracking-tight">
              Can&apos;t find the fragrance you&apos;re looking for?
            </h2>
            <p className="text-[13px] sm:text-[14px] text-white/70 mt-1 leading-snug">
              Tell us what you&apos;re after on WhatsApp and we&apos;ll help you find it.
            </p>
          </div>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group inline-flex items-center justify-center gap-2 bg-white text-[#0A0A0A] text-[13px] sm:text-[14px] font-semibold px-5 py-3 rounded-full hover:scale-[1.03] active:scale-95 transition-transform shrink-0"
        >
          Message us on WhatsApp
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}

/**
 * Shown on a product page when the selected size is out of stock — the
 * WhatsApp message is pre-filled with the product and size.
 *
 * otherSizesInStock: hint that another size can be bought right away.
 */
export function OutOfStockBanner({ productName, variantLabel, otherSizesInStock = false, className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-[20px] bg-[#0A0A0A] text-white p-4 sm:p-5 ${className}`}>
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-12 w-48 h-48 rounded-full bg-[radial-gradient(closest-side,rgba(243,201,139,0.25),transparent)]" />
      <div className="relative flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 fill-white stroke-none" />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] sm:text-[15px] font-semibold leading-snug">
            {variantLabel ? `The ${variantLabel} is out of stock` : "This fragrance is out of stock"}
          </p>
          <p className="text-[12px] sm:text-[13px] text-white/70 mt-0.5 leading-snug">
            Message us on WhatsApp and we&apos;ll let you know when it&apos;s back.
            {otherSizesInStock && " Other sizes above are available now."}
          </p>
        </div>
      </div>
      <a
        href={whatsappUrl(outOfStockMessage(productName, variantLabel))}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group mt-4 w-full inline-flex items-center justify-center gap-2 whitespace-nowrap bg-white text-[#0A0A0A] text-[13px] font-semibold px-5 py-3 rounded-full hover:bg-white/90 active:scale-[0.98] transition-all"
      >
        Ask on WhatsApp
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}
