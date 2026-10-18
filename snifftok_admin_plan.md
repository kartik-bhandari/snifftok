# snifftok Admin Panel — Implementation Plan

> [!IMPORTANT]
> This is the plan only. **No code is written until you approve.**
> Reply "approved" or with change requests.

---

## Tech Setup

| Tool | Version | Purpose |
|---|---|---|
| Vite + React 18 | latest | Build tooling |
| TypeScript | 5.x | Type safety |
| React Router v6 | latest | Routing + route guards |
| Tailwind CSS v3 | latest | Styling |
| shadcn/ui | latest | UI components (built on Radix) |
| TanStack Query v5 | latest | Data fetching + cache |
| TanStack Table v8 | latest | Tables |
| React Hook Form + zod | latest | Forms + validation |
| Recharts | latest | Charts |
| MSW v2 | latest | API mocking |
| date-fns-tz | latest | Kolkata timezone formatting |

**Location:** `d:\codes\snifftok-admin\`

---

## Folder Structure

```
snifftok-admin/
├── public/
│   └── mockServiceWorker.js    # MSW browser worker (generated)
├── src/
│   ├── api/                    # All API calls — typed functions
│   │   ├── client.ts           # fetch wrapper (credentials:"include", base URL)
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── variants.ts
│   │   ├── orders.ts
│   │   ├── inventory.ts
│   │   ├── customers.ts
│   │   ├── reports.ts
│   │   ├── settings.ts
│   │   ├── whatsapp.ts
│   │   ├── dashboard.ts
│   │   └── import.ts
│   │
│   ├── components/             # Shared UI components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # Sidebar + BottomBar + outlet
│   │   │   ├── Sidebar.tsx       # Desktop left nav
│   │   │   ├── BottomBar.tsx     # Mobile bottom tab bar
│   │   │   ├── TopBar.tsx        # Page title + global search trigger
│   │   │   └── AccountMenu.tsx   # Avatar dropdown → logout
│   │   ├── ui/                   # shadcn/ui re-exports + extensions
│   │   ├── MoneyText.tsx         # ₹ formatter with Indian grouping
│   │   ├── DateText.tsx          # Kolkata-aware date formatter
│   │   ├── StatusBadge.tsx       # Order/stock status chip
│   │   ├── ConfirmDialog.tsx     # Reusable destructive action dialog
│   │   ├── EmptyState.tsx        # Icon + message + CTA
│   │   ├── ErrorState.tsx        # Error + retry button
│   │   ├── TableSkeleton.tsx     # Loading skeleton for tables
│   │   ├── CardSkeleton.tsx      # Loading skeleton for stat cards
│   │   ├── GlobalSearch.tsx      # Cmd+K search overlay
│   │   └── UnsavedChangesGuard.tsx
│   │
│   ├── features/               # Feature-specific components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── products/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── VariantRow.tsx
│   │   │   ├── PricingPreview.tsx   ← key widget
│   │   │   ├── NoteInput.tsx        # tag input for notes
│   │   │   └── ImageUpload.tsx      # drag-drop with reorder
│   │   ├── inventory/
│   │   │   ├── StockTable.tsx
│   │   │   ├── StockInForm.tsx
│   │   │   ├── AdjustmentForm.tsx
│   │   │   ├── LedgerTable.tsx
│   │   │   └── RestockList.tsx
│   │   ├── orders/
│   │   │   ├── OrderList.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── OrderTimeline.tsx
│   │   │   ├── StatusActions.tsx
│   │   │   ├── PackingSlip.tsx      # print view
│   │   │   └── ProfitPanel.tsx
│   │   ├── quick-order/
│   │   ├── whatsapp/
│   │   ├── customers/
│   │   ├── reports/
│   │   ├── bulk-import/
│   │   └── settings/
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRole.ts            # role-based UI gating
│   │   ├── useDebounce.ts
│   │   ├── usePricingPreview.ts  # debounced preview call
│   │   ├── useGlobalSearch.ts    # Cmd+K
│   │   └── useUnsavedChanges.ts
│   │
│   ├── lib/
│   │   ├── money.ts              # formatMoney(paise) → "₹1,23,456"
│   │   ├── date.ts               # formatDate in Asia/Kolkata
│   │   ├── queryClient.ts        # TanStack Query client config
│   │   └── zod-schemas.ts        # shared zod schemas
│   │
│   ├── mocks/                   # MSW handlers + seed data
│   │   ├── browser.ts            # MSW browser setup
│   │   ├── handlers/
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   ├── inventory.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── customers.ts
│   │   │   ├── reports.ts
│   │   │   ├── whatsapp.ts
│   │   │   └── settings.ts
│   │   └── seed/
│   │       ├── products.ts
│   │       ├── orders.ts
│   │       └── customers.ts
│   │
│   ├── pages/                   # Page components (thin — delegate to features)
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductEditPage.tsx
│   │   ├── BulkImportPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── StockInPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── OrderDetailPage.tsx
│   │   ├── QuickOrderPage.tsx
│   │   ├── WhatsAppInboxPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── CustomerDetailPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── routes/
│   │   ├── index.tsx             # createBrowserRouter
│   │   ├── AuthGuard.tsx         # redirects to /login if no session
│   │   └── RoleGuard.tsx         # hides/redirects staff from cost/reports/settings
│   │
│   └── types/
│       ├── api.ts                # All API response shapes (mirrors backend models)
│       ├── forms.ts              # Form field types
│       └── roles.ts              # "superadmin" | "ops" | "staff"
│
├── .env.example
├── README.md
└── vite.config.ts
```

---

## Page Map

```
/login                          → LoginPage (public)

/ (AuthGuard)
├── /                           → DashboardPage
├── /products                   → ProductsPage (list)
├── /products/new               → ProductEditPage
├── /products/:id/edit          → ProductEditPage
├── /products/import            → BulkImportPage
├── /inventory                  → InventoryPage (tabs: Overview / Stock In / Adjustments / Ledger / Restock)
├── /inventory/stock-in         → StockInPage
├── /orders                     → OrdersPage (tabs by status)
├── /orders/:id                 → OrderDetailPage
├── /quick-order                → QuickOrderPage
├── /whatsapp                   → WhatsAppInboxPage
├── /customers                  → CustomersPage
├── /customers/:id              → CustomerDetailPage
├── /reports                    → ReportsPage  (RoleGuard: staff cannot access)
└── /settings                   → SettingsPage (RoleGuard: staff cannot access)
```

---

## Navigation Structure

### Mobile (≤768px) — Bottom Tab Bar (5 tabs)
| Tab | Icon | Route |
|---|---|---|
| Dashboard | BarChart2 | / |
| Orders | ShoppingBag | /orders |
| Products | Package | /products |
| Stock | Boxes | /inventory |
| More | MoreHorizontal | → slide-up sheet: Customers, Reports, Quick Order, WhatsApp, Settings, Logout |

### Desktop (>768px) — Left Sidebar
Full nav with all pages grouped:
- Overview: Dashboard
- Sales: Orders, Quick Order, WhatsApp Inbox
- Catalogue: Products, Bulk Import
- Operations: Inventory, Customers
- Insights: Reports
- System: Settings, Account

---

## Component Tree (key pages)

### AppShell
```
AppShell
├── Sidebar (desktop)
│   ├── Logo
│   ├── NavGroup × N (items with active state)
│   └── AccountMenu (avatar + role chip, logout)
├── TopBar
│   ├── HamburgerMenu (mobile)
│   ├── PageTitle
│   └── GlobalSearchTrigger (Cmd+K)
├── <Outlet /> (page content)
└── BottomBar (mobile only)
    └── TabButton × 5
```

### PricingPreview (critical widget)
```
PricingPreview
├── usePricingPreview(cost, profit, type) → debounced POST
├── LoadingState (skeleton)
├── ErrorState (message + "cannot save" warning)
└── PreviewCard
    ├── PriceDisplay (large, primary)     ← grandTotal
    ├── BreakdownTable
    │   ├── Row: Purchase cost
    │   ├── Row: Min profit (green)
    │   ├── Row: Delivery cost
    │   ├── Row: Subtotal (before tax)
    │   ├── Row: GST (18%, included)
    │   ├── Row: Gateway fee (2%)
    │   └── Row: GST on gateway fee
    └── PackComparison (tester only)
        ├── SingleUnitPrice
        └── Pack5Price (with "cheaper!" badge)
```

### OrderDetail
```
OrderDetail
├── OrderHeader (number, status badge, channel, date)
├── CustomerCard (name, phone→call/WA links, address + copy)
├── ItemsTable (SKU, name, qty, unit price, line total)
├── TotalsPanel (lines, shipping, grand total)
├── ProfitPanel (hidden behind toggle — cost snap, fees, net profit)
├── PaymentCard (method, Razorpay IDs, paid at)
├── StatusActions (context-aware: next valid step only)
├── NotificationPanel (messages sent, status, resend)
├── ActivityTimeline (created, paid, packed…)
└── InternalNotes (textarea + save)
```

---

## Design Tokens

| Token | Light | Dark |
|---|---|---|
| Background | `gray-50` | `gray-950` |
| Card | `white` | `gray-900` |
| Border | `gray-200` | `gray-800` |
| Text primary | `gray-900` | `gray-50` |
| Text muted | `gray-500` | `gray-400` |
| Accent | `gray-900` | `gray-50` |
| Destructive | `red-600` | `red-500` |
| Success | `emerald-600` | `emerald-500` |
| Warning | `amber-500` | `amber-400` |

One accent colour only (near-black on light / near-white on dark). No brand colours bleeding into the admin.

---

## API Layer Design

All calls go through `src/api/client.ts`:
```ts
// Throws ApiError with { status, message } on non-2xx
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T>
```

Every API module exports typed async functions:
```ts
// src/api/orders.ts
export async function getOrders(params: OrderListParams): Promise<PaginatedResponse<Order>>
export async function getOrder(id: string): Promise<Order>
export async function updateOrderStatus(id: string, action: StatusAction): Promise<Order>
```

---

## MSW Strategy

Enabled when `VITE_USE_MOCKS=true`.
- Seed data: 12 products with multiple variants, 50 orders across all statuses, 20 customers, 6 months of daily revenue.
- Handlers simulate realistic latency (150–400ms random).
- Stateful mocks: creating/editing/deleting a product mutates the in-memory seed so navigation back shows the change.
- Auth mock: `admin@snifftok.com / admin123` and `staff@snifftok.com / staff123`.

---

## Build Phases

| Phase | Deliverables |
|---|---|
| **1** | Project scaffold, Tailwind + shadcn setup, routing skeleton, AuthGuard + RoleGuard, Login page, AppShell (sidebar + bottom bar), `lib/money.ts` + `lib/date.ts`, MSW browser setup |
| **2** | Dashboard — stat cards, revenue chart, attention panel, top products. Mock dashboard endpoints |
| **3** | Products list + filters + search. Add/Edit form with variant rows, note tag inputs, image upload (preview only). **PricingPreview widget** wired to mock. Duplicate + archive actions |
| **4** | Bulk Import — CSV template, upload, preview table with validation + editable fixes, confirm + result summary |
| **5** | Inventory — Stock overview table, Stock In form with cost-change modal, Adjustments with confirmation, Ledger timeline, Restock list |
| **6** | Orders — list with status tabs, Order Detail with all panels, status actions, print packing slip |
| **7** | Quick Order form + WhatsApp Inbox |
| **8** | Customers, Reports, Settings (pricing + notifications + staff), Global Search (Cmd+K), dark mode, accessibility pass |

---

## Backend Endpoints Still Needed

These do not exist in the Express API yet. They will be mocked with MSW and I will build backend implementations after.

| Endpoint | Method | Request | Response |
|---|---|---|---|
| `/api/admin/dashboard/summary` | GET | `?period=today\|7d\|30d` | `{ revenue, netProfit, orders, aov, unitsSold, byChannel: {web,wa,admin}, chartData: [{date, revenue, netProfit}[]}` |
| `/api/admin/dashboard/attention` | GET | — | `{ awaitingDetails: Order[], expiringSoon: Order[], lowStock: Variant[], failedNotifications: Notification[] }` |
| `/api/admin/pricing/preview` | POST | `{ type, costPrice, minProfit }` (paise) | Full breakdown from `previewPricing()` |
| `/api/cart/quote` | POST | `{ lines: [{sku,qty}] }` | `{ lines[{sku,unitPrice}], shipping, grandTotal }` |
| `/api/admin/orders/quick` | POST | `{ customer, address, lines, paymentMode }` | `Order` |
| `/api/admin/orders/:id/timeline` | GET | — | `{ events: [{type, actor, note, at}] }` |
| `/api/admin/orders/:id/notes` | POST | `{ text }` | `{ note }` |
| `/api/admin/notifications/resend` | POST | `{ orderId, type }` | `{ ok }` |
| `/api/admin/stock/purchases` | GET | pagination, filters | `PaginatedResponse<Purchase>` |
| `/api/admin/stock/purchases` | POST | `{ date, invoiceRef, lines[{sku,qty,unitCost}], extraCosts, notes }` | `Purchase` |
| `/api/admin/customers` | GET | pagination, search | `PaginatedResponse<Customer>` |
| `/api/admin/customers/:id` | GET | — | `Customer & { orders: Order[] }` |
| `/api/admin/whatsapp/inbox` | GET | — | `{ messages: WaMessage[] }` |
| `/api/admin/whatsapp/:id/handled` | PATCH | `{ note? }` | `{ ok }` |
| `/api/admin/reports/sales` | GET | `?from&to` | `{ byDay, byProduct, byBrand, byChannel, byType }` |
| `/api/admin/staff` | GET | — | `AdminUser[]` |
| `/api/admin/staff` | POST | `{ email, password, role }` | `AdminUser` |
| `/api/admin/staff/:id` | DELETE | — | `{ ok }` |
| `/api/admin/import/template` | GET | — | CSV file download |
| `/api/admin/import/preview` | POST | `multipart: file` | `{ rows: ImportRow[] }` |
| `/api/admin/import/commit` | POST | `{ rows: ImportRow[] }` | `{ created, updated, skipped, errors }` |

---

## Money Formatter (shared, critical)

```ts
// lib/money.ts
export function formatMoney(paise: number): string {
  // ₹1,23,456 — Indian digit grouping via Intl
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
```

---

## Acceptance Check Coverage by Phase

| Check | Phase |
|---|---|
| ₹2,889 live price preview for bottle C=₹2000 P=₹300 | 3 |
| All flows completable at 390px | 3, 5, 6, 7 |
| Staff role cannot see cost/profit/reports/settings | 1 (route guards) + 3, 6 (UI hiding) |
| Bulk import shows prices + errors before save | 4 |
| Every destructive action has confirmation | 3, 5, 6 (ongoing) |
| Loading/empty/error states on every list | every phase |
| Lighthouse 90+ accessibility | 8 (final pass) |

---

## Open Questions

1. **Separate repo?** Plan puts the admin at `d:\codes\snifftok-admin\`. Confirm or specify.
2. **Image upload:** mock only (return a fake URL), or wire to a real storage bucket (S3/Cloudflare R2)?
3. **Print stylesheet:** CSS-only print view for packing slip, or a PDF generation library?
4. **COD toggle:** The Quick Order form mentions "COD if enabled" — should this be a Settings toggle I need to add?
5. **Staff password reset:** Admin panel only, or self-service email flow too?
