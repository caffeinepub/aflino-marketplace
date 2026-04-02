# AFLINO Marketplace

## Current State

AFLINO is a full-stack multi-vendor e-commerce marketplace on ICP. The frontend uses a custom SPA routing system (`view` state in `App.tsx` + `navigateTo()` function with `window.history.pushState`). There is NO React Router — all navigation is done via `setView()` and URL path matching in `navigateTo()`.

Key existing files:
- `src/frontend/src/App.tsx` — View type union, `AppContent`, all route rendering
- `src/frontend/src/pages/CheckoutPage.tsx` — Razorpay integration, coin redemption, `subtotal` + `coinDiscount` + `total` calculation
- `src/frontend/src/components/Header.tsx` — 3-part sticky header (logo row, search row, category carousel)
- `src/frontend/src/components/ProductCard.tsx` — product card with wishlist heart overlay
- `src/frontend/src/pages/ProductDetailPage.tsx` — full product detail modal/page
- `src/frontend/src/context/CartContext.tsx` — `cartCount` available
- `src/frontend/src/context/SellerContext.tsx` — seller profiles with `state` field, NO warehousePincode yet
- `src/frontend/src/data/products.ts` — `Product` interface with `sellerState`, NO `warehousePincode` or `sellerCity`

Current `View` type (App.tsx lines 56-72):
```
"home" | "login" | "seller-register" | "history" | "checkout" | "order-success" 
| "affiliate-register" | "affiliate" | "affiliate-landing" | "advertise" 
| "api-partners" | "wishlist" | "brand-register" | "brand-login" | "brand-dashboard"
```

URL path map in `navigateTo()` includes: home, affiliate, wishlist.

## Requested Changes (Diff)

### Add

**Feature 1: Mobile Bottom Navigation Bar**
- New component: `src/frontend/src/components/BottomNav.tsx`
- 6 slots: Home, Category, Earn, Orders, Cart, Account
- Glassmorphism: `bg-white/80 backdrop-blur-md` fixed at bottom, z-50
- Icons from lucide-react: `Home`, `LayoutGrid`, `Banknote`, `Package`, `ShoppingCart`, `UserCircle`
- Labels shown only on screens ≥ 360px (use `min-[360px]:block` / `hidden` CSS)
- Active state: AFLINO Blue (#006AFF) icon + label + small dot under icon
- `Earn` slot: subtle blue-to-pink gradient glow behind icon
- Cart slot: shows `cartCount` badge from `useCart()`
- Auth-guard: Orders + Account tap → call `onLoginRequired` if not logged in
- Hide-on-scroll-down, show-on-scroll-up (same pattern as existing header)
- Only render on mobile (`md:hidden`)
- New View values to add: `"categories"`, `"account"`, `"orders"`
- All 6 nav slots mapped to views: home→"home", categories→"categories", earn→"affiliate-landing", orders→"orders", cart→"checkout", account→"account"

**Feature 2: Smart Delivery ETA System**
- New context: `src/frontend/src/context/DeliveryETAContext.tsx`
  - Stores user's saved pincode in `localStorage` (key: `aflino_delivery_pincode`)
  - 3-zone ETA logic: same city (same first 3 digits of pincode) = 1-2 days, same state = 2-3 days, rest = 5-7 days
  - Export: `useDeliveryETA()` hook with `userPincode`, `setUserPincode`, `getETA(sellerState, sellerPincode): {minDays, maxDays, label, deliveryDate}`
  - `deliveryDate`: format as `"Mon, 7 Apr"` using `Date` API
- Add `warehousePincode?: string` to `Product` interface in `products.ts`
- Add `warehousePincode` to a few sample products (use Mumbai=400001, Bangalore=560001, Delhi=110001)
- New component: `src/frontend/src/components/DeliveryETAWidget.tsx`
  - Compact pincode input (6 digits), "Check" button, shows "FREE Delivery by Mon, 7 Apr" in green
  - If pincode saved in context, shows ETA directly without needing input
  - "Change" link to edit pincode
  - Countdown: if order placed within X hours (based on seller processing, default 5pm cutoff), show "Order within Xh Ym for faster delivery"
- Add `DeliveryETAWidget` to `ProductDetailPage.tsx` below the price/variant section
- Add small ETA badge to `ProductCard.tsx`: "Get it by Mon, 7 Apr" in small green text below price (only when `userPincode` is set in context)
- Add `warehousePincode` field to Seller Profile section in `SellerDashboard.tsx`
- Admin Shipping Rules panel: add a "Shipping Zones" section in `AdminDashboard.tsx` (under Settings or new tab) with editable processing time (default 1 day) and zone day ranges (local 1-2, zonal 2-3, national 5-7)

**Feature 3: Dynamic COD Fee Engine**
- New context: `src/frontend/src/context/CODContext.tsx`
  - State: `codEnabled: boolean`, `codFee: number` (default 29), `codFreeThreshold: number` (default 1999), `sellerCODOptOut: string[]`
  - Export: `useCOD()` hook, `setCodEnabled`, `setCodFee`, `setCodFreeThreshold`, `toggleSellerCODOptOut`
  - Logic: `isCODAvailable(subtotal): boolean` — true if `codEnabled` AND subtotal doesn't disqualify
  - Logic: `getCODFee(subtotal): number` — returns 29 if subtotal < 1999, else 0
- Update `CheckoutPage.tsx`:
  - Add payment method toggle: `[Online Payment]` vs `[Cash on Delivery]` radio cards
  - COD card: if selected → add `codFeeAmount` line item to order summary, update total
  - Online card: show green badge "Save ₹29 with Online Payment" if COD fee would apply
  - Micro-copy under COD: "Why this fee? To ensure safe and verified delivery to your doorstep."
  - Total calculation: `const codFeeAmount = paymentMethod === "cod" ? getCODFee(subtotal) : 0`; `const total = subtotal - coinDiscount + codFeeAmount`
  - Store `codFee` in order object for invoice
- Admin COD Settings: add to `AdminDashboard.tsx` Settings tab (or PaymentSettingsTab):
  - Master switch: Enable/Disable COD globally
  - COD Handling Fee field (₹29 default)
  - Free COD threshold (₹1999 default)
- Seller COD opt-out: in `SellerDashboard.tsx` add a toggle "Accept COD Orders" in settings/profile section

### Modify

- `App.tsx`: Add `"categories"`, `"account"`, `"orders"` to `View` type union. Add path mappings for `/categories`, `/account`, `/orders` in `navigateTo()`. Add simple placeholder renders for `"categories"` (scrolls to category section), `"orders"` (redirects to customer dashboard history tab), `"account"` (redirects to customer dashboard).
- `App.tsx`: Pass `onNavigate` and `isLoggedIn` and `cartCount` to `BottomNav`, render `<BottomNav>` inside `AppContent` at the bottom of the main content area (outside page-specific renders, always present on mobile).
- `src/frontend/src/data/products.ts`: Add `warehousePincode?: string` to `Product` interface. Add warehouse pincode to first 5 sample products.
- `src/frontend/src/context/SellerContext.tsx`: Add `warehousePincode?: string` to `PendingSeller` interface.
- `src/frontend/src/App.tsx`: Wrap with `DeliveryETAProvider` and `CODProvider`.

### Remove
- Nothing removed.

## Implementation Plan

1. **`DeliveryETAContext.tsx`** — New context file. Zone detection logic (compare first 3 digits of pincode for local, `sellerState` vs GeoLocationContext state for zonal). Date formatting utility. localStorage persistence.

2. **`CODContext.tsx`** — New context file. All COD state and fee calculation logic.

3. **`BottomNav.tsx`** — New component. 6 slots, glassmorphism, scroll hide/show, cart badge from `useCart()`, auth guard calls.

4. **`DeliveryETAWidget.tsx`** — New component. Pincode input, ETA display, countdown timer.

5. **Update `products.ts`** — Add `warehousePincode` to interface and seed data for 5 products.

6. **Update `SellerContext.tsx`** — Add `warehousePincode` to `PendingSeller` interface.

7. **Update `ProductCard.tsx`** — Add ETA badge below price using `useDeliveryETA()`.

8. **Update `ProductDetailPage.tsx`** — Add `DeliveryETAWidget` below price/variants.

9. **Update `CheckoutPage.tsx`** — Add payment method selection (Online vs COD), COD fee line item, updated total, micro-copy, "Save ₹29" badge for online.

10. **Update `SellerDashboard.tsx`** — Add `warehousePincode` field in profile/settings. Add COD opt-out toggle.

11. **Update `AdminDashboard.tsx`** — Add COD Settings (master switch, fee, threshold) in Settings/Payment tab. Add Shipping Zones config.

12. **Update `App.tsx`** — Add new view values, URL mappings, `BottomNav` render, new providers.
