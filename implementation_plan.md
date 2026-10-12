# Implementation Plan: snifftok E-Commerce Storefront

## 1. Project Overview & Architectural Vision
**snifftok** is a luxury, mobile-first perfume storefront designed specifically for a 390px mobile viewport (iPhone standard) scaling seamlessly to desktop via a centered ~480px app frame (or full responsive canvas with centered mobile container). It faithfully recreates the layout rhythm, frosted-glass ergonomics, fluid interactions, and minimal brutalist elegance of the reference storefront, tailored for high-end artisanal perfumery.

---

## 2. Design Tokens & Styling Strategy

| Token | Specification / Value | Usage |
| :--- | :--- | :--- |
| **Page Canvas Background** | `#EFEFEF` (Light Grey) | Body & base container background |
| **Surface Cards & Sheets** | `#FFFFFF` (Pure White) | Product detail card, feature sections, sheets, drawers |
| **Primary Text** | `#0A0A0A` (Near Black) | Headings, bold links, active states |
| **Secondary Text** | `#8A8A8A` (Muted Grey) | Prices, breadcrumbs, notes details, inactive icons |
| **Accent Color** | `#2F80FF` (Electric Blue) | Exclusively for the active ring on the bottom nav left action button |
| **Primary UI Font** | `Inter`, -apple-system, sans-serif | UI controls, labels, body copy |
| **Brand Display Font** | `Syne` / `Unbounded` (700/800 weight) | Text-only `"snifftok"` wordmark (lowercase) |
| **Border Radii** | `16px` (`rounded-2xl`) on product cards/galleries, `24px` (`rounded-3xl`) on major white sections, `9999px` (`rounded-full`) for pills | Matches reference curvature exactly |
| **Frosted Glass** | `backdrop-blur-md bg-white/70 border border-white/50 shadow-sm` | Top header pill, bottom navigation bar, quick floating buttons |
| **Currency Display** | `₹5,800` (Indian Rupee symbol, formatted with commas, small grey text) | Sub-heading price styling under product names |

---

## 3. Mock Data Structure (`/data/products.json`)
Data will be structured to mirror a production Express/MongoDB backend response:
```json
[
  {
    "id": "snf-01",
    "slug": "santal-velvet",
    "name": "Santal Velvet",
    "brand": "snifftok Private Blend",
    "headline": "Creamy sandalwood enveloped in cardamom & warm amber smoke.",
    "isNewArrival": true,
    "isBestSeller": true,
    "isTester": false,
    "rating": 4.9,
    "reviewsCount": 42,
    "images": [
      "/images/products/santal-velvet-1.svg",
      "/images/products/santal-velvet-2.svg"
    ],
    "variants": {
      "bottle": {
        "sizes": [
          { "ml": "30ml", "price": "₹3,400", "priceRaw": 3400, "inStock": true },
          { "ml": "50ml", "price": "₹5,800", "priceRaw": 5800, "inStock": true },
          { "ml": "100ml", "price": "₹9,200", "priceRaw": 9200, "inStock": true }
        ]
      },
      "tester": {
        "sizes": [
          { "ml": "2ml", "price": "₹450", "priceRaw": 450, "inStock": true },
          { "ml": "5ml", "price": "₹850", "priceRaw": 850, "inStock": true },
          { "ml": "10ml", "price": "₹1,400", "priceRaw": 1400, "inStock": false }
        ]
      }
    },
    "notes": {
      "top": ["Cardamom", "Violet Leaf", "Papyrus"],
      "heart": ["Iris", "Cedarwood", "Ambrox"],
      "base": ["Australian Sandalwood", "Leather", "Smoke Amber"]
    },
    "details": {
      "concentration": "Extrait de Parfum (30% oil)",
      "longevity": "10-14 hours on skin",
      "sillage": "Intimate to Moderate",
      "origin": "Grasse, France",
      "gender": "Unisex"
    },
    "description": "An intoxicating, velvety composition celebrating creamy sandalwood, laced with the crisp spice of fresh cardamom and an addictive dry-down of ambered leather.",
    "care": "Store in a cool, dark sanctuary away from direct sunlight and fluctuating humidity.",
    "shipping": "Complimentary express shipping on bottle orders above ₹5,000. Ships in 24-48 hours with insured delivery."
  }
]
```

---

## 4. Component Tree

```mermaid
graph TD
    App[Root Layout: /app/layout.js] --> AppShell[AppShell / Mobile Viewport Wrapper]
    AppShell --> Header[Header: Frosted Pill + Brand Wordmark + Wishlist & Bag Badge]
    AppShell --> BottomNav[BottomNav: Blue-Ring Left Button + 4-Icon Frosted Pill]
    AppShell --> ChatButton[WhatsApp Floating Action Button]
    AppShell --> MenuOverlay[MenuOverlay: Full-screen Accordion & Navigation]
    AppShell --> CartSheet[CartSheet: Slide-over Drawer + Shipping Calculator]
    AppShell --> SearchOverlay[SearchOverlay: Live Search & Filter Grid]
    AppShell --> FragranceGuideModal[FragranceGuideModal: Notes & Longevity Explainer]
    AppShell --> QuickAddSheet[QuickAddSheet: Fast Size Selection & Add to Bag]

    AppShell --> PageRouter{Next.js App Router}
    
    PageRouter --> HomePage[/app/page.js]
    HomePage --> Hero[Hero: Full-bleed Media + Shop Now Link + Next Peek]
    HomePage --> NewArrivalsSection[Section: 'New arrivals' Title + 'Discover more' Pill]
    NewArrivalsSection --> ProductGrid[2-Column Grid: ProductCard x N]
    HomePage --> FeatureSectionBestsellers[FeatureSection: 'Best sellers' Horizontal Carousel]
    HomePage --> FeatureSectionTesters[FeatureSection: 'Testers' Horizontal Carousel]
    HomePage --> Footer[Footer: Minimal Links, Badges, Socials]

    PageRouter --> ProductPage[/app/product/[slug]/page.js]
    ProductPage --> Breadcrumb[Breadcrumbs: Home > Category > Name]
    ProductPage --> ImageGallery[ImageGallery: Swipe Carousel + 3 Dots]
    ProductPage --> ProductDetailCard[ProductDetailCard: 24px White Card]
    ProductDetailCard --> TitleRow[Product Name + Bookmark + Fragrance Guide Chip]
    ProductDetailCard --> PriceRow[Precomputed Price Text]
    ProductDetailCard --> TypeToggle[Type Toggle: Bottle / Tester Segmented Control]
    ProductDetailCard --> SizeChips[SizeChips: 5-Col Wrapping Grid + Stock State]
    ProductDetailCard --> TesterNudge[Tester Promo Banner: Buy 5+ get discounted shipping]
    ProductDetailCard --> ActionButtons[ADD TO BAG Outlined Pill + BUY NOW Solid Pill]
    ProductPage --> ProductTabs[ProductTabs: Details & Notes / Care / Shipping with Animated Tab Indicator]
    ProductPage --> RelatedSection[Related Products: 2-Column Grid]

    PageRouter --> WishlistPage[/app/wishlist/page.js]
    WishlistPage --> WishlistGrid[Saved Fragrances Grid]
```

---

## 5. Phased Implementation Roadmap

### Phase 1: Environment & Global Shell
- Initialize Next.js (App Router, JS mode, Tailwind CSS).
- Install `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`.
- Configure Tailwind with exact custom tokens (`#EFEFEF`, `#0A0A0A`, `#8A8A8A`, `#2F80FF`, custom border radii, frosted glass utilities).
- Set up Google Fonts (`Inter` and `Syne`/`Unbounded`) in `layout.js`.
- Build **Header**:
  - Left frosted pill containing circular `+` button and `snifftok` bold wordmark.
  - Right icons: Bookmark (Wishlist count link) and Bag with notification badge.
  - Sticky glassmorphic behavior (`backdrop-blur-md bg-white/75`).
  - Circular `+` morphs smoothly into `×` when Menu is active.
- Build **Floating Bottom Nav**:
  - Hidden at top of page, smoothly animates in as user scrolls past the hero (via Framer Motion & window scroll listener).
  - Left separate circular button with vibrant `#2F80FF` border/ring.
  - Right frosted-glass pill with 4 icons: Explore (compass), Account (person), Stores/Contact (map pin), Search (magnifier).
- Build **WhatsApp Floating Action Button**:
  - Fixed dark circle (~52px) with white chat bubble icon, anchored bottom-right above bottom nav, linked to `https://wa.me/{NEXT_PUBLIC_WHATSAPP_NUMBER}`.

### Phase 2: Home Page Experience
- **Full-Screen Hero**:
  - High-impact perfume visual with soft vertical gradient overlay.
  - Centered underlined `"Shop now"` link in lower third.
  - Lower edge reveals the top peek of the "New arrivals" section.
- **"New arrivals" Section**:
  - Left title `"New arrivals"`, right white pill `"Discover more"`.
  - 2-Column Product Grid:
    - 4:5 portrait media card with 16px radius.
    - Top-right bookmark toggle (instant localStorage persistence with heart/bookmark fill).
    - Bottom-center carousel dots (`...`) with swipe/hover image swap.
    - Title, small grey price, and small `+` icon for quick-add sheet.
- **Feature Sections ("Best sellers" & "Testers")**:
  - Large 24px radius white container.
  - Title with black pill `"Discover more"` button.
  - Smooth horizontally scrollable carousel card row with subtle scrollbar hiding.
- **Minimal Footer**:
  - Clean newsletter input, brand note, policy links, copyright.

### Phase 3: Menu Overlay (Screenshot 4 Fidelity)
- Full-screen `#EFEFEF` overlay rendered via Framer Motion with exit animations.
- Scroll locking on `document.body`.
- Close triggers: Tap on `×`, tap on centered bottom `"Close"` button, press `Escape`, or route navigation.
- Navigation hierarchy:
  - **Top Bold Links**: New Arrivals, Best Sellers, Trending, Testers.
  - **Middle Accordions**: Shop by Brand, Shop by Notes (Oud, Musk, Amber, Floral, Fresh), Shop by Gender, Support (smooth height animation with `+` rotating to `−`).
  - **Bottom Links**: Our Story, Contact, Shipping & Returns.
  - Bottom centered pill line indicator + `"Close"` text.

### Phase 4: Product Detail Page (Screenshots 5 & 6)
- **Breadcrumb**: `Home > Best Seller > Santal Velvet`.
- **Large Image Gallery**: 16px radius, swipeable portrait carousel with active dot indicators.
- **24px White Detail Card**:
  - Product name + Bookmark toggle + `"Fragrance Guide"` chip opening notes/concentration guide modal.
  - Precomputed grey price reflecting current variant selection.
  - **Type Toggle**: Segmented pill control (`"Bottle"` vs `"Tester"`). Updates available sizes and stock.
  - **Size Chips**: 5-column grid of outlined pills. Active chip is filled black with white text; out-of-stock chips are struck-through and disabled.
  - **Tester Shipping Nudge**: Active when Tester is selected (*"Buy 5 or more testers and get discounted shipping."*).
  - **CTA Buttons**: Full-width outlined `"ADD TO BAG"` pill and full-width solid black `"BUY NOW"` pill.
- **Interactive Tabs**:
  - `"Details & Notes"`, `"Care"`, `"Shipping"`.
  - Dark sliding underline indicator using Framer Motion `layoutId`.
  - Content rendered in a smooth rounded grey container with structured pyramid notes (Top, Heart, Base).
- **"You may also like" Grid**: Reusable 2-column product grid with quick-add functionality.

### Phase 5: Cart, Search, Shipping Logic & State Management
- **Context / Hooks**:
  - `useCart`: Add, remove, update quantities, drawer open/close, persisted in localStorage.
  - `useWishlist`: Toggle item, check status, persisted in localStorage.
- **Shipping Rule Engine (`/lib/shipping.js`)**:
  - Bottles: ₹80 each.
  - Testers: ₹80 per bundle of 5 (i.e. `Math.ceil(testersCount / 5) * 80`).
  - Tester tier promo alert when cart has < 5 testers.
- **Cart Sheet**:
  - Sliding side/bottom sheet with frosted backdrop.
  - Product thumbnail, variant, size, price, quantity stepper, subtotal, delivery line item, checkout CTA.
- **Search Overlay**:
  - Full-screen search dialog with instant auto-filter by fragrance name, note (e.g. "Oud"), brand, and category.
- **Wishlist Page**:
  - View bookmarked perfumes with direct "Move to Bag" or view actions.

---

## 6. Verification & Quality Assurance Plan
1. **Responsive Viewport Validation**:
   - Test in Chrome at 390px × 844px (iPhone 12/13/14 viewport) and 430px (iPhone Pro Max).
   - Test desktop centering (clean mobile frame with subtle desktop background).
2. **Visual Comparison against Reference Screenshots**:
   - Compare Header pill styling, '+' to '×' transformation, bottom nav floating behavior, product card proportions, and product page tabs.
3. **Interactive & Ergonomic Polish**:
   - Button press scale effect (`scale: 0.98`), keyboard ESC traps, body scroll locking, framer-motion stagger animations.
4. **Data Integrity Check**:
   - Verify prices are strictly read from `price` fields and never computed on the client.
   - Verify shipping calculation conforms to bottle and tester bundle rules.
