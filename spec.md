# AFLINO Marketplace — PWA Implementation

## Current State
AFLINO is a React + Vite + ICP frontend. No PWA features exist:
- No `manifest.json`
- No service worker
- No `<meta>` iOS/PWA tags in `index.html`
- No install prompt UI anywhere
- No offline caching
- Icons exist at:
  - `/assets/generated/aflino-icon-512.dim_512x512.png`
  - `/assets/generated/aflino-icon-192.dim_192x192.png`

## Requested Changes (Diff)

### Add
- `public/manifest.json` — PWA web app manifest (name: AFLINO, display: standalone, theme: #006AFF, icons at 192 and 512)
- `public/sw.js` — Service Worker with:
  - Cache-first strategy for static assets (JS, CSS, images, fonts)
  - Network-first + cache fallback for page navigations
  - On `install` event: pre-cache shell assets and both PWA icons
  - On `fetch` event: serve from cache when offline; cache new responses as they come in
  - On `activate` event: purge stale caches
- iOS PWA meta tags in `index.html`: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `apple-touch-icon` link tag pointing to 192px icon
- `<link rel="manifest">` and `<meta name="theme-color">` in `index.html`
- `src/hooks/usePWAInstall.ts` — Custom hook that:
  - Listens for `beforeinstallprompt` event (Android/Desktop)
  - Stores the deferred prompt
  - Exposes `canInstall: boolean` and `triggerInstall(): void`
  - Also registers the service worker on mount
- `src/components/InstallPWAButton.tsx` — Small install button component:
  - Uses `usePWAInstall` hook
  - Renders an "Install App" button with download icon when `canInstall` is true
  - On click: triggers the native browser install prompt
  - On iOS (where `beforeinstallprompt` doesn't fire): shows a tooltip/modal with instructions: "Tap Share → Add to Home Screen"
  - Hides itself once app is installed (listens for `appinstalled` event)
- `src/context/PWABrandingContext.tsx` — Context that stores admin-uploaded PWA icon URL and splash logo URL (from localStorage/state), used to override manifest icons dynamically via a generated `/manifest.json` endpoint approach
- Admin Dashboard → Settings tab → new **Branding** sub-section:
  - "PWA App Icon (512x512)" upload field with preview
  - "Splash Screen Logo" upload field with preview
  - Stored in localStorage-based PWA branding state (since blob-storage is already in the project but manifests are static, we store URLs and display them in the admin UI; the actual manifest.json points to the generated icons for now with an admin note that changing requires re-deploy — OR we use a dynamic manifest approach via a JS-generated manifest)
  - Show a live preview of how the icon will look on a phone home screen

### Modify
- `src/frontend/index.html` — Add all PWA meta tags, manifest link, theme-color, apple-touch-icon
- `src/components/Header.tsx` — Add `<InstallPWAButton>` in the right side of the header, between the language switcher and user icon. Only renders when `canInstall` is true (auto-hides otherwise).
- `src/pages/CustomerDashboard.tsx` — Add Install App section in Settings tab
- `src/pages/SellerDashboard.tsx` — Add Install App section in Settings tab
- `src/pages/AffiliateDashboard.tsx` — Add Install App section in Settings tab
- `src/pages/AdminDashboard.tsx` — Add Branding sub-section in Settings tab

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/public/manifest.json` with AFLINO branding, icons, display=standalone, theme=#006AFF, start_url=/
2. Create `src/frontend/public/sw.js` — service worker with cache-first for assets, network-first for navigation, offline fallback shell
3. Update `src/frontend/index.html` — add all required meta tags for iOS PWA + Android PWA + manifest link
4. Create `src/frontend/src/hooks/usePWAInstall.ts` — hook managing beforeinstallprompt, SW registration, appinstalled event
5. Create `src/frontend/src/components/InstallPWAButton.tsx` — button that shows only when installable, handles iOS fallback with instructions
6. Create `src/frontend/src/context/PWABrandingContext.tsx` — admin-editable branding state
7. Wire `InstallPWAButton` into Header (between language switcher and user icon)
8. Wire `InstallPWAButton` + install section into Customer/Seller/Affiliate dashboard Settings tabs
9. Add Branding section in AdminDashboard Settings tab with icon upload previews and PWA branding state
10. Wrap App in PWABrandingContext provider
