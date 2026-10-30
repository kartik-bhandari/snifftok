/**
 * app/manifest.js — web app manifest (Add to Home Screen on Android).
 * Icons live in public/favicon_io; favicon.ico, icon.png and apple-icon.png in
 * app/ are picked up by Next.js automatically.
 */
export default function manifest() {
  return {
    name: "snifftok — Artisanal Luxury Perfumes",
    short_name: "snifftok",
    description: "Artisanal luxury perfumes and decants.",
    start_url: "/",
    display: "standalone",
    background_color: "#EFEFEF",
    theme_color: "#0A0A0A",
    icons: [
      { src: "/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
