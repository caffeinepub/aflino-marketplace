# AFLINO Marketplace

## Current State
AFLINO has an existing Ads Manager in Admin Dashboard with 3 sub-tabs (Brand Leads, Active Campaigns, Slot Pricing). These are basic Brand Partner tools — no seller-side ad campaigns, no CPC bidding, no RTB auction, no ad wallet, no sponsored product injection into search/home. The Seller Dashboard has Earnings Wallet (order payouts) but no Ad Wallet. Admin Dashboard uses `AdminAdsManager.tsx` component.

## Requested Changes (Diff)

### Add
- `AdWalletContext.tsx` — Separate prepaid Ad Wallet per seller. Fields: balance, totalSpent, transactions (credit/debit). Razorpay-simulated top-up. Auto-pause when balance < bid or daily budget exhausted.
- `AdCampaignContext.tsx` — Full RTB auction engine. Ad types: Product Boost, Banner Ads, Video Spotlights (YouTube/Instagram embeds). RTB rank = bid * qualityScore (CTR * rating). 3 separate approval queues (one per ad type). Placement targeting (Search, Home, All). Daily budget cap logic. Placement control sliders (Ad % per zone).
- `SellerAdCampaignTab.tsx` — New tab in Seller Dashboard: create campaigns, set max bid (₹1–₹50), daily budget, targeting, view campaign status, Ad Wallet card.
- `SellerAdWalletTab.tsx` — Visual Ad Wallet card (balance, total spent, Add Money button via Razorpay), statement table (date, type, amount, description).
- Admin Ads Manager v2 — Extends existing `AdminAdsManager.tsx` with: 3 approval queue sub-tabs (Product Boost, Banner Ads, Video Spotlights), placement % sliders for Search/Home/Account, revenue tracking (Seller ad spend vs Brand partner spend, monthly breakdown), escrow report (total balance across all ad wallets), manual credit/debit per seller.
- Sponsored product injection in `ProductGrid.tsx` — reads approved Product Boost campaigns, ranks by Ad Rank, injects into search results at configured % (slots 1 and 4 reserved for top bidders), marks injected items with "Sponsored" badge.
- Account/Profile ad units — 1–2 brand coupon/deal banners in Customer Dashboard, fed by approved Banner Ad campaigns.

### Modify
- `AdminAdsManager.tsx` — Expand with new sub-tabs (Approval Queues, Placement Controls, Revenue Tracking, Ad Escrow). Existing Brand Leads/Campaigns/Pricing tabs remain.
- `SellerDashboard.tsx` — Add 'ads' tab to the tab list, wire SellerAdCampaignTab.
- `ProductGrid.tsx` — Accept sponsored products prop, inject at configured intervals.
- `App.tsx` — Wrap with `AdWalletProvider` and `AdCampaignProvider`.
- `CustomerDashboard.tsx` — Show 1–2 deal/coupon banners from approved Banner Ad campaigns.

### Remove
- Nothing removed; all existing functionality preserved.

## Implementation Plan
1. Create `src/frontend/src/context/AdWalletContext.tsx` — Ad Wallet state, top-up (simulated Razorpay), deductOnClick, auto-pause logic, admin override credit/debit, escrow report.
2. Create `src/frontend/src/context/AdCampaignContext.tsx` — Campaign CRUD, RTB auction rank calculation, approval workflow (pending → approved/rejected), placement % config, click tracking for CTR.
3. Create `src/frontend/src/components/seller/SellerAdCampaignTab.tsx` — Campaign creation form (product picker, bid, budget, targeting, ad type), campaign list with status badges.
4. Create `src/frontend/src/components/seller/SellerAdWalletTab.tsx` — Wallet card + statement table + Razorpay Add Money flow.
5. Update `src/frontend/src/components/admin/AdminAdsManager.tsx` — Add sub-tabs: Approval Queues (3 types), Placement Controls (sliders), Revenue Tracking (charts), Ad Escrow.
6. Update `src/frontend/src/components/ProductGrid.tsx` — Inject sponsored products at configured %, mark with badge, track clicks.
7. Update `src/frontend/src/pages/SellerDashboard.tsx` — Add 'ads' tab.
8. Update `src/frontend/src/pages/AdminDashboard.tsx` — Ensure ads tab wires new AdminAdsManager.
9. Update `src/frontend/src/pages/CustomerDashboard.tsx` — Add 1–2 deal banners from approved campaigns.
10. Update `src/frontend/src/App.tsx` — Add providers.
