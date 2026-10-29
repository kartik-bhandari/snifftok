/**
 * lib/whatsapp.js
 * The store's WhatsApp number and wa.me links — the only place the number lives.
 * Override per environment with NEXT_PUBLIC_WHATSAPP_NUMBER (digits, with
 * country code, e.g. 918898513239).
 */

export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918898513239").replace(/\D/g, "");

export const WHATSAPP_MESSAGES = {
  general: "Hello snifftok, I would like to inquire about fragrance recommendations.",
  notFound: "Hi snifftok, I'm looking for a fragrance I couldn't find on your site: ",
};

/** Pre-filled message for an out-of-stock product, e.g. "… Oud Royale (50ml bottle) …" */
export function outOfStockMessage(productName, variantLabel) {
  return `Hi snifftok, I'm interested in ${productName}${variantLabel ? ` (${variantLabel})` : ""}, which is out of stock on your site. Can you let me know when it's available?`;
}

/** wa.me link, optionally with a pre-filled message */
export function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
