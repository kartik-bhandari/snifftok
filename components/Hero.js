"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GRAIN } from "@/lib/scentThemes";
// Imported (not referenced by path) so the URL carries a content hash — replacing
// the file busts every cache automatically, and Next adds a blur placeholder.
import heroImage from "@/public/images/hero.png";

const WORDS = ["Signature.", "Mood.", "Story."];
const ACCENT = "#f3c98b";   // warm gold for the glow and the rotating word

/**
 * Home page hero. Kept light: CSS keyframes instead of an animation library,
 * pointer parallax written straight to CSS variables (no re-renders), and all
 * motion off for prefers-reduced-motion.
 */
export default function Hero() {
  const sectionRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);

  // Rotate the last word of the headline (skipped for reduced motion)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setWordIndex((i) => (i + 1) % WORDS.length), 2800);
    return () => clearInterval(id);
  }, []);

  // Pointer parallax — mouse/trackpad only, batched per animation frame
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const fine    = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let frame = 0;
    let x = 0, y = 0;
    const apply = () => {
      frame = 0;
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 2 - 1;   // -1 … 1
      y = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => { x = 0; y = 0; if (!frame) frame = requestAnimationFrame(apply); };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Welcome to snifftok"
      // Full screen on every device; svh = the visible height on mobile browsers
      className="relative w-full h-svh min-h-[520px] overflow-hidden select-none bg-[#1a1714]"
      style={{ "--mx": 0, "--my": 0, "--hero-accent": ACCENT }}
    >
      {/* ── Photo (drifts against the pointer) ─────────────────── */}
      <div
        className="hero-parallax absolute -inset-[3%] transition-transform duration-500 ease-out will-change-transform"
        style={{ transform: "translate3d(calc(var(--mx) * -14px), calc(var(--my) * -10px), 0)" }}
      >
        <Image
          src={heroImage}
          alt="snifftok luxury fragrance campaign"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="hero-zoom object-cover object-[68%_center] sm:object-center"
        />
      </div>

      {/* ── Atmosphere ─────────────────────────────────────────── */}
      {/* Legibility: dim the whole photo, a little more at the edges and behind the copy */}
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_center,rgba(0,0,0,0.35),transparent_75%)] pointer-events-none" />
      {/* Soft warm glow that follows the pointer */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-60"
        style={{
          background:
            "radial-gradient(55vmax circle at calc(50% + var(--mx) * 22%) calc(42% + var(--my) * 18%), color-mix(in srgb, var(--hero-accent) 75%, transparent), transparent 62%)",
        }}
      />
      {/* Slow-drifting mist */}
      <div
        aria-hidden
        className="hero-drift absolute -top-1/4 -left-1/4 w-[70%] h-[70%] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--hero-accent) 45%, transparent), transparent)" }}
      />
      <div
        aria-hidden
        className="hero-drift absolute -bottom-1/3 -right-1/4 w-[75%] h-[75%] rounded-full pointer-events-none opacity-30 [animation-delay:-7s]"
        style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--hero-accent) 40%, transparent), transparent)" }}
      />
      {/* Film grain + vignette */}
      <div aria-hidden className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" style={{ backgroundImage: GRAIN }} />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.35)_100%)] pointer-events-none" />

      {/* ── Copy (drifts with the pointer, slightly) ───────────── */}
      <div
        className="hero-parallax relative z-20 h-full flex flex-col items-center justify-center px-5 text-center transition-transform duration-500 ease-out"
        style={{ transform: "translate3d(calc(var(--mx) * 8px), calc(var(--my) * 6px), 0)" }}
      >
        <span
          className="hero-rise text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.07] backdrop-blur-sm"
          style={{ animationDelay: "120ms" }}
        >
          Artisanal Extraits · Grasse &amp; Dubai
        </span>

        <h1
          className="hero-rise mt-6 text-white font-bold tracking-tight leading-[1.04] drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]"
          style={{ fontSize: "clamp(2.6rem, 8.5vw, 6rem)", animationDelay: "220ms" }}
        >
          Wear Your
          <br />
          {/* Rotating word — a live region would be noisy, so screen readers get the full phrase once */}
          <span className="sr-only">Signature, mood and story.</span>
          <span aria-hidden className="relative inline-block min-h-[1.1em]">
            <span
              key={wordIndex}
              className="hero-word italic font-light bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-[var(--hero-accent)] transition-colors"
            >
              {WORDS[wordIndex]}
            </span>
          </span>
        </h1>

        <p
          className="hero-rise mt-4 text-white/80 text-[13px] sm:text-[16px] max-w-[300px] sm:max-w-[440px] leading-relaxed"
          style={{ animationDelay: "380ms" }}
        >
          Curated luxury fragrances from the world&apos;s finest perfume houses — discover yours.
        </p>

        <div className="hero-rise mt-7 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "520ms" }}>
          <Link
            href="/shop"
            id="hero-shop-now-link"
            className="group inline-flex items-center gap-2 bg-white text-[#0A0A0A] text-[13px] sm:text-[14px] font-semibold pl-6 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-200"
          >
            Shop the collection
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center text-white text-[13px] sm:text-[14px] font-medium px-6 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all duration-200"
          >
            Explore scent families
          </Link>
        </div>
      </div>

    </section>
  );
}
