# snifftok Backend — Implementation Plan

> [!IMPORTANT]
> This is Phase 0: Plan only. **No code is written until you approve.**
> Reply "approved" (or with change requests) to proceed to Phase 1.

---

## Architecture Decision

The Express backend lives in **`d:\codes\snifftok-api\`** — a completely separate Node.js service from the Next.js storefront. The frontend calls this API over HTTP. This keeps concerns clean and lets the backend be deployed independently (e.g. Railway, Render, or a VPS).

| Service | Port | Repo |
|---|---|---|
| Next.js storefront | 3000 | `d:\codes\snifftok` |
| Express API | 4000 | `d:\codes\snifftok-api` |

---

## Folder Structure

```
snifftok-api/
├── src/
│   ├── config/
│   │   ├── db.js           # Mongoose connection (Atlas replica set)
│   │   ├── redis.js        # ioredis client for BullMQ
│   │   ├── env.js          # zod-validated env schema
│   │   └── razorpay.js     # Razorpay SDK init
│   │
│   ├── models/
│   │   ├── Settings.js
│   │   ├── Product.js      # embeds Variant sub-schema
│   │   ├── StockMovement.js
│   │   ├── Order.js
│   │   ├── Customer.js
│   │   ├── AdminUser.js
│   │   └── WebhookEvent.js
│   │
│   ├── lib/
│   │   ├── pricing.js      # Pure functions — Phase 1
│   │   ├── orderNumber.js  # Sequential human-friendly number generator
│   │   └── idempotency.js  # Webhook dedup helper
│   │
│   ├── middleware/
│   │   ├── auth.js         # JWT cookie verification
│   │   ├── adminOnly.js
│   │   ├── validate.js     # zod schema wrapper
│   │   ├── rawBody.js      # Save raw body for webhook sig verification
│   │   └── errorHandler.js
│   │
│   ├── routes/
│   │   ├── index.js        # Mount all routers
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── admin/
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── settings.js
│   │   │   └── stock.js
│   │   └── webhooks/
│   │       ├── razorpay.js
│   │       └── whatsapp.js
│   │
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── admin/
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── settings.js
│   │   │   └── stock.js
│   │   └── webhooks/
│   │       ├── razorpay.js
│   │       └── whatsapp.js
│   │
│   ├── services/
│   │   ├── stock.js        # reserve / release / confirm (with ledger, in transaction)
│   │   ├── order.js        # createOrder, confirmOrder, cancelOrder
│   │   ├── payment.js      # Razorpay order creation + verification
│   │   ├── whatsapp.js     # Meta Cloud API outbound messages
│   │   └── pricing.js      # Wraps lib/pricing + Settings lookup
│   │
│   ├── jobs/
│   │   ├── queues.js       # BullMQ queue definitions
│   │   ├── workers.js      # Worker process entry point
│   │   ├── reservationExpiry.js   # Release held stock after holdHours
│   │   ├── webhookProcessor.js    # Async Razorpay/WhatsApp processing
│   │   └── vendorNotify.js        # WhatsApp to vendor on new order
│   │
│   ├── webhooks/
│   │   ├── razorpay.js     # Signature verify + enqueue
│   │   └── whatsapp.js     # Signature verify + enqueue
│   │
│   └── tests/
│       ├── setup.js        # mongodb-memory-server replica set
│       ├── unit/
│       │   └── pricing.test.js
│       ├── integration/
│       │   ├── orders.test.js
│       │   ├── stock.test.js
│       │   └── webhooks.test.js
│       └── fixtures/
│           └── settings.js
│
├── app.js                  # Express app (no listen — for testing)
├── server.js               # Binds port, starts workers
├── package.json
├── .env.example
└── vitest.config.js
```

---

## Data Models (detailed)

### 1. Settings (singleton — always `_id: "global"`)

```js
{
  _id: "global",
  gstRate:              Number, // 0.18
  gatewayFeeRate:       Number, // 0.02
  gatewayFeeGstRate:    Number, // 0.18
  deliveryPerSlab:      Number, // paise — 8000
  testersPerSlab:       Number, // 5
  defaultMinProfit: {
    bottle:             Number, // paise — 30000
    tester:             Number, // paise — 30000
  },
  roundingStep:         Number, // paise — 100
  mixedCartSlabSharing: Boolean,
  reservationHoldHours: Number, // 24
  vendor: {
    name:               String,
    whatsappNumber:     String, // E.164 e.g. "919876543210"
  },
  updatedAt:            Date,
}
```

### 2. Product

```js
{
  name:          String,
  slug:          String,  // unique index
  brand:         String,
  gender:        { type: String, enum: ["male","female","unisex"] },
  description:   String,
  notes: {
    top:         [String],
    heart:       [String],
    base:        [String],
  },
  concentration: String,  // EDP, EDT, Extrait…
  origin:        String,
  longevity:     String,
  images:        [String],
  tags:          [{ type: String, enum: ["trending","best-seller","new"] }],
  isActive:      Boolean,
  variants: [VariantSchema],  // embedded
  createdAt, updatedAt
}
```

### 3. Variant (embedded in Product)

```js
{
  _id:         ObjectId,
  type:        { type: String, enum: ["bottle","tester"] },
  sizeMl:      Number,
  sku:         String,   // unique across all products — compound sparse index
  costPrice:   Number,   // paise
  minProfit:   Number,   // paise — initialized from Settings.defaultMinProfit[type]
  stock:       Number,   // total on hand (integer)
  reserved:    Number,   // held by pending orders (integer)
  vendorSku:   String,
  // Computed and stored on every save when costPrice/minProfit/Settings changes:
  pricing: {
    unitPriceExclDelivery: Number,  // paise
    calculatedAt:          Date,
  }
}
```

> **`available = stock − reserved`** — never stored, always computed.

### 4. StockMovement (immutable ledger)

```js
{
  sku:      String,
  delta:    Number,   // positive = stock in, negative = stock out / reserved
  field:    { type: String, enum: ["stock","reserved"] },
  reason:   { type: String, enum: [
    "purchase","adjustment",
    "web_order_reserved","wa_order_reserved",
    "order_confirmed","reservation_released",
    "cancelled","returned"
  ]},
  orderId:  ObjectId,
  refId:    String,   // e.g. WhatsApp message id
  actor:    String,   // "system" | adminUserId | "webhook"
  createdAt: Date,
}
```

### 5. Order

```js
{
  orderNumber:    String,   // e.g. "SNF-00042"
  source:         { type: String, enum: ["web","whatsapp","admin"] },
  customer: {
    name:    String,
    phone:   String,
    email:   String,
  },
  shippingAddress: {
    line1:   String,
    line2:   String,
    city:    String,
    state:   String,
    pincode: String,
  },
  lines: [{
    sku:             String,
    productName:     String,
    variantLabel:    String,  // e.g. "100ml Bottle"
    type:            String,
    sizeMl:          Number,
    qty:             Number,
    // Snapshotted at order creation — never change
    costPriceSnap:   Number,  // paise
    minProfitSnap:   Number,  // paise
    unitPrice:       Number,  // paise — what customer pays per unit
  }],
  totals: {
    linesTotal:    Number,  // sum(unitPrice * qty)
    shipping:      Number,  // grandTotal − linesTotal
    grandTotal:    Number,  // paise
    gstAmount:     Number,
    gatewayFee:    Number,
    gatewayFeeGst: Number,
    totalCost:     Number,  // sum(costPriceSnap * qty) + shippingCost
    netProfit:     Number,  // grandTotal − totalCost − gstAmount − gatewayFee − gatewayFeeGst
  },
  status: { type: String, enum: [
    "draft","awaiting_details","awaiting_payment",
    "confirmed","packed","shipped","delivered",
    "cancelled","refunded"
  ]},
  payment: {
    method:            String,
    razorpayOrderId:   String,
    razorpayPaymentId: String,
    paidAt:            Date,
  },
  waMessageId:      String,  // unique sparse index
  reservedUntil:    Date,
  vendorNotifiedAt: Date,
  tracking: {
    courier: String,
    awb:     String,
    url:     String,
  },
  createdAt, updatedAt,
}
```

### 6. AdminUser
```js
{ email, passwordHash, role: "superadmin"|"ops", lastLoginAt, createdAt }
```

### 7. WebhookEvent (dedup store)
```js
{ provider: "razorpay"|"whatsapp", eventId, payload, processedAt, createdAt }
// compound unique index: { provider, eventId }
```

---

## Pricing Engine — Math

Given from Settings:
- `g` = gstRate (0.18)
- `f` = gatewayFeeRate (0.02)
- `fg` = gatewayFeeGstRate (0.18)

```
k = (1 / (1 + g)) - f * (1 + fg)
  = (1 / 1.18) - 0.02 * 1.18
  = 0.847458... - 0.02360
  = 0.823858...   ← all paise go through this divisor
```

**unitPriceExclDelivery(variant)**
```
= ceilToStep((C + P) / k, roundingStep)
```
Used on the catalog. Each unit is priced as if it bears its own cost+profit but no delivery.

**grandTotal(cart)**
```
D_total = shippingCost(lines, settings)   ← integer paise, exact
grandTotal = ceilToStep((ΣC·qty + ΣP·qty + D_total) / k, roundingStep)
```
Displayed shipping = grandTotal − Σ(unitPriceExclDelivery · qty)

**Breakdown (what's inside grandTotal)**
```
gstAmount      = grandTotal * (1 - 1/(1+g))           // = grandTotal * g/(1+g)
gatewayFee     = grandTotal * f
gatewayFeeGst  = gatewayFee * fg
totalCost      = Σ(C·qty) + D_total
netProfit      = grandTotal - gstAmount - gatewayFee - gatewayFeeGst - totalCost
```
**Assert:** `netProfit >= Σ(P·qty)` — rounding can only increase it, never reduce it.

---

## Phase Roadmap

| Phase | What ships | Tests |
|---|---|---|
| **1** | `lib/pricing.js` — pure functions only | 100% unit coverage, all required test cases |
| **2** | DB config, all 7 Mongoose models, `lib/orderNumber.js`, migrations | Schema-level unit tests |
| **3** | Stock service (reserve/release/confirm + ledger), StockMovement writes, Settings CRUD | Integration tests with in-memory replica set |
| **4** | Product CRUD (admin), catalog endpoints (public) — auto-recalculate pricing on save | Integration tests |
| **5** | Order flow: web checkout → Razorpay order → payment verify → confirm → vendor WhatsApp notify; reservation expiry job | Integration + webhook tests |
| **6** | WhatsApp inbound orders, admin order management, tracking updates, refund flow | Full E2E happy-path tests |

---

## Key Implementation Rules (reminders)

- **Money:** all stored and computed in integer paise. `/100` only in response serializers.
- **Transactions:** every stock + ledger write uses a Mongoose session on the Atlas replica set.
- **Webhooks:** raw body middleware → signature verify → respond 200 immediately → enqueue to BullMQ → process in worker → mark WebhookEvent.processedAt.
- **Settings immutability:** variant pricing snapshots are re-computed and saved when Settings or costPrice/minProfit change; they are never re-computed from a stored order.
- **Idempotency:** WebhookEvent `{ provider, eventId }` unique index; BullMQ job dedup key = eventId.
- **Env validation:** all env vars validated at startup via zod — crash fast if missing.

---

## Open Questions for You

1. **Separate repo or monorepo?** Plan assumes `d:\codes\snifftok-api\` as a sibling folder. Confirm or specify.
2. **Redis:** Do you have a local Redis or want to use Upstash/Redis Cloud? I'll add Docker Compose if local.
3. **Admin auth:** JWT only (no refresh tokens) or sliding sessions with refresh?
4. **WhatsApp:** Do you have a Meta app + phone number ID ready, or should I stub the outbound calls?
5. **Razorpay:** Test mode keys ready, or should payment integration be stubbed in Phase 5?
