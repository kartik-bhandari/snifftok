# snifftok Storefront

A mobile-first e-commerce storefront for luxury artisanal perfume brand **snifftok** (always lowercase). Built with Next.js (App Router), React, Tailwind CSS, and Framer Motion.

Designed primarily for a 390px mobile viewport (iPhone standard) scaling gracefully to a centered ~480px frame on tablet and desktop.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm (or yarn / pnpm / bun)

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```
This number powers the floating concierge WhatsApp button (`wa.me` integration).

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Testing Viewport**: Open Chrome DevTools (`F12`), toggle the Device Toolbar (`Ctrl+Shift+M` / `Cmd+Shift+M`), and select **iPhone 12/13/14 (390 × 844)**.

---

## 📂 Architecture & Directory Structure

```
snifftok/
├── app/
│   ├── globals.css          # Design tokens, fonts, glassmorphism utilities
│   ├── layout.js             # Root layout, Google Fonts (Inter + Syne), AppShell wrapper
│   ├── page.js               # Home page (Hero, New Arrivals, Best Sellers, Testers)
│   ├── product/[slug]/page.js# Product Detail Page (Gallery, Fragrance Guide, Variant toggle, Tabs)
│   └── wishlist/page.js      # Bookmarked perfumes page
├── components/
│   ├── AppShell.js           # Responsive 390-480px mobile frame, global providers & drawers
│   ├── Header.js             # Sticky frosted pill header with morphing +/× icon
│   ├── BottomNav.js          # Scroll-triggered floating nav with blue ring & 4 icons
│   ├── ChatButton.js         # Floating WhatsApp concierge button (wa.me)
│   ├── Hero.js               # Full-bleed perfume visual with underlined 'Shop now' link
│   ├── ProductCard.js        # 2-column card with 16px radius, dots carousel, quick-add
│   ├── FeatureSection.js     # 24px white container with horizontal scroll cards
│   ├── MenuOverlay.js        # Full-screen light-grey accordion navigation overlay
│   ├── CartSheet.js          # Bag drawer with steppers, subtotal & shipping calculator
│   ├── SearchOverlay.js      # Full-screen live fragrance search with instant filtering
│   ├── FragranceGuideModal.js# Olfactive pyramid, concentration & longevity guide modal
│   ├── QuickAddSheet.js      # Fast size selection & instant Add-to-Bag sheet
│   └── Footer.js             # Minimal brand footer with contact, policy & social links
├── context/
│   └── StoreContext.js       # Persistent cart, wishlist & overlay state (localStorage)
├── data/
│   └── products.json         # Mock data shaped identically to production API response
├── lib/
│   └── shipping.js           # Shipping rule engine (bottles ₹80 each, testers ₹80/5 bundle)
└── public/
    └── images/               # Luxury perfume campaign & product assets
```

---

## 🔄 How to Swap Mock Data for an Express/MongoDB Backend

The mock data in `/data/products.json` is shaped specifically to match a future MongoDB document schema:

### 1. Future Backend Schema Example (Mongoose / MongoDB)
```js
const ProductSchema = new mongoose.Schema({
  id: String,
  slug: { type: String, unique: true },
  name: String,
  category: String,
  notesCategory: String,
  brand: String,
  headline: String,
  isNewArrival: Boolean,
  isBestSeller: Boolean,
  isTester: Boolean,
  images: [String],
  variants: {
    bottle: {
      type: { type: String, default: 'Bottle' },
      sizes: [{ ml: String, price: String, priceRaw: Number, inStock: Boolean }]
    },
    tester: {
      type: { type: String, default: 'Tester' },
      sizes: [{ ml: String, price: String, priceRaw: Number, inStock: Boolean }]
    }
  },
  notes: {
    top: [String],
    heart: [String],
    base: [String]
  },
  details: {
    concentration: String,
    longevity: String,
    sillage: String,
    origin: String,
    gender: String
  },
  description: String,
  care: String,
  shipping: String
});
```

### 2. Transitioning to API Calls
1. **API Client (`/lib/api.js`)**:
   Create a helper to fetch products from your backend URL:
   ```javascript
   const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

   export async function getProducts() {
     const res = await fetch(`${API_BASE}/products`, { next: { revalidate: 60 } });
     if (!res.ok) throw new Error('Failed to fetch products');
     return res.json();
   }

   export async function getProductBySlug(slug) {
     const res = await fetch(`${API_BASE}/products/${slug}`, { next: { revalidate: 60 } });
     if (!res.ok) return null;
     return res.json();
   }
   ```

2. **Replace Static Imports in Pages**:
   - In `app/page.js`, replace `import productsData from "@/data/products.json"` with an asynchronous fetch `const productsData = await getProducts()`.
   - In `app/product/[slug]/page.js`, fetch the product via `const product = await getProductBySlug(slug)`.
   - Client components (`SearchOverlay`) can either receive products as props or query an endpoint (`GET /api/products/search?q=...`).

---

## 📦 Shipping Rules Engine (`/lib/shipping.js`)

Per brand requirements:
- **Bottles**: ₹80 flat shipping per bottle.
- **Testers**: ₹80 flat shipping per bundle of up to 5 testers (`Math.ceil(testersCount / 5) * 80`).
- **Nudge**: When testers are in the bag, users receive dynamic feedback on how many testers are needed to maximize bundle savings.

---

## 🎨 Design Tokens

- **Page Background**: `#EFEFEF` (Light grey)
- **Cards & Sheets**: `#FFFFFF` (Pure white)
- **Primary Text**: `#0A0A0A` (Near black)
- **Secondary Text**: `#8A8A8A` (Medium grey)
- **Accent Ring**: `#2F80FF` (Blue ring on bottom nav action button)
- **Curvatures**: `16px` (`rounded-2xl`) for product cards, `24px` (`rounded-3xl`) for feature containers and sheets, `9999px` (`rounded-full`) for pills.
