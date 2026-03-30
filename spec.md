# AFLINO Marketplace — Dual-PWA Architecture

## Current State
- Single PWA with one manifest.json, basic service worker with cache-first strategy
- PWABrandingSection exists in Admin — uploads icon/splash to localStorage only
- No push notification support
- No dual-identity PWA (Customer vs Seller)
- No maskable icon safe-zone generation
- Camera/QR components not yet wired
- sw.js handles offline caching but no push event listener

## Requested Changes (Diff)

### Add
- `manifest-customer.json` — AFLINO Customer PWA manifest (start_url: `/?app=customer`)
- `manifest-seller.json` — AFLINO Seller PWA manifest (start_url: `/?app=seller`)
- Dynamic manifest injection via React `<link rel="manifest">` based on current route/context
- Maskable icon support: separate `purpose: "maskable"` icon entries with safe-zone padding
- Web Push API: VAPID key generation (stored in Admin settings), subscription management, push event handler in service worker
- Push notification triggers: New Order (Seller), Low Stock (Seller), Payout Released (Seller), Order Status Update (Customer)
- Notification permission prompt UI — shown contextually in Seller and Customer dashboards
- iOS Add-to-Home-Screen guidance banner (detects iOS Safari, no beforeinstallprompt)
- Camera integration in Seller Dashboard: Quick Add Product with phone camera capture
- QR scanner in Seller Dashboard: scan QR code to update delivery status
- Admin > Branding: maskable icon preview showing 80% safe zone (the circle/squircle Android uses)
- Admin > Branding: triggers manifest regeneration for both Customer and Seller manifests
- `usePWAIdentity` hook: detects if running as Customer PWA or Seller PWA based on URL params or localStorage
- Affiliate Share button in Customer/Affiliate portal: copy product affiliate link instantly

### Modify
- `sw.js` — add push event listener, notificationclick handler, update CACHE_NAME to v2
- `PWABrandingSection.tsx` — add maskable icon preview with safe-zone circle overlay, add "Apply to Both Apps" button, generate both manifests
- `main.tsx` — inject correct manifest link dynamically based on app identity
- Admin Settings > Branding section — add VAPID public key field and push notification test button
- Seller Dashboard header — add "Enable Notifications" bell button if push not yet subscribed
- Customer Dashboard header — add "Enable Notifications" bell button if push not yet subscribed

### Remove
- Nothing removed — all existing functionality preserved

## Implementation Plan
1. Create `manifest-customer.json` and `manifest-seller.json` with correct start_url, name, icons (any + maskable separate entries)
2. Create `usePWAIdentity` hook that reads `?app=customer|seller` or localStorage `aflino_pwa_identity`
3. Update `main.tsx` to dynamically inject the correct manifest `<link>` tag
4. Update `sw.js` to add push event listener and notificationclick handler; bump cache to v2
5. Build `usePushNotifications` hook: requestPermission, subscribe to push, store subscription in canister or localStorage
6. Add push notification triggers in order creation, low stock check, and payout logic (frontend simulation since backend is Motoko)
7. Update `PWABrandingSection` with maskable icon safe-zone preview, dual-manifest regeneration
8. Wire `camera` component into Seller Dashboard > Quick Add Product flow
9. Wire `qr-code` scanner component into Seller Dashboard > Order Management > Scan to Update Status
10. Add iOS detection banner for Add-to-Home-Screen prompt
11. Add Affiliate Share button in Customer product cards and Affiliate dashboard
12. Admin > Branding: VAPID public key input + test notification button
