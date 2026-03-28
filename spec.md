# AFLINO Affiliate System - Phase 1

## Current State
AFLINO has three portals: Admin, Seller, Customer. The Seller system has its own registration (`/seller-register`), dashboard, wallet, and commission logic. There is no affiliate/influencer system. The homepage has Banner Carousel, Category Pills, Flash Sale, Brand Carousel, Recently Viewed, Category Feeds — but no Watch & Shop video section. The Admin Dashboard is a single-page component (`AdminDashboard.tsx`) with tabs managed by `activeTab` state.

## Requested Changes (Diff)

### Add
- `/affiliate-register` page: New standalone registration form with fields for Full Name, Email, Phone, Social Profile Links (Instagram/YouTube/Blog), ID Proof upload (PAN/Aadhaar image), Bank Account Details (Account No, IFSC, Bank Name). Initial status = `pending`. No dashboard access until Admin approves.
- `AffiliateDashboard.tsx` page: Separate portal, accessible at `/affiliate`. Tabs: Overview, My Links, Commissions, Developer (conditionally shown). Locked with "Pending Approval" screen if not yet approved.
- `AffiliateContext.tsx`: Stores affiliate profiles, KYC status, commission ledger, cookie tracking, API toggle state in localStorage.
- `WatchAndShopSection.tsx`: New homepage section — horizontal scroll of embedded YouTube/Instagram video cards. Only shows Admin-approved videos. Positioned between Flash Sale and Brand Carousel sections.
- Admin "Affiliates" tab in `AdminDashboard.tsx`: Sub-tabs for KYC Review, Commission Settings, Video Approvals, Payout Manager.
- 30-day affiliate cookie tracking: When a user visits via `?ref=AFFILIATE_CODE`, store the affiliate code in a cookie (30 days). On successful order, credit commission to that affiliate.
- 10-day commission hold: Commissions start as `pending`. After 10 days from order date, auto-transition to `withdrawable`.

### Modify
- `HomePage.tsx` (or wherever the homepage sections are assembled): Add `<WatchAndShopSection />` between Flash Sale and Brands.
- `AdminDashboard.tsx`: Add new "Affiliates" sidebar tab that renders the full affiliate management panel.
- `Header.tsx`: No changes required.
- Navigation/routing: Add `/affiliate-register` and `/affiliate` to the app's page-switching logic.

### Remove
- Nothing removed.

## Implementation Plan

1. **AffiliateContext.tsx** — Create context with state for:
   - `affiliates[]`: Array of affiliate profiles `{ id, name, email, phone, socialLinks[], idProofFile: { name, sizeKB, url }, bankDetails, status: 'pending'|'approved'|'rejected', tier: 'normal'|'creator', apiEnabled: boolean, referralCode, joinedAt }`
   - `affiliateCommissions[]`: `{ id, affiliateId, orderId, amount, status: 'pending'|'withdrawable'|'paid', orderDate, releasesAt (orderDate + 10 days) }`
   - `approvedVideos[]`: `{ id, affiliateId, url, platform: 'youtube'|'instagram', title, thumbnail, approvedAt }`
   - `pendingVideos[]`: same schema but not yet approved
   - Helper functions: `registerAffiliate()`, `approveAffiliate()`, `rejectAffiliate()`, `addVideo()`, `approveVideo()`, `rejectVideo()`, `toggleApiAccess()`, `setAffiliateTier()`, `setTierCommission()`

2. **AffiliateTierCommissionContext.tsx** (or inline in AffiliateContext) — Commission rates by Category × Tier:
   - `{ category, normalRate, creatorRate }[]` — admin-editable

3. **AffiliateRegisterPage.tsx** (`/affiliate-register`):
   - Multi-step form: Step 1 (Personal Info + Social Links), Step 2 (ID Proof upload with file size check — flag < 150KB as Low Quality), Step 3 (Bank Details)
   - Submit → creates affiliate with status `pending`
   - Success screen: "Your application is under review. You'll be notified within 24-48 hours."

4. **AffiliateDashboard.tsx** (`/affiliate`):
   - If status === `pending`: Show "Under Review" screen with submitted info summary
   - If status === `rejected`: Show rejection reason
   - If status === `approved`: Show full dashboard
     - **Overview tab**: Stats cards (Total Earnings, Pending, Withdrawable, Total Clicks), referral link with copy button
     - **My Links tab**: Affiliate referral URL generator — pick a product → generates `?ref=CODE` URL. Simulated click/conversion stats.
     - **Commissions tab**: Table of commissions with status badges (Pending / Withdrawable / Paid), order date, release date (10-day countdown), amount
     - **Developer tab** (only if `apiEnabled === true`): API key display, product catalog fetch preview (shows Price/Image/Link for products), code snippet for integration

5. **WatchAndShopSection.tsx**:
   - Horizontal scroll row with section header "Watch & Shop 🎬"
   - Each card: Embedded YouTube iframe or Instagram link preview, affiliate name, video title, "Shop Now" CTA
   - Only renders `approvedVideos` from AffiliateContext
   - If no approved videos, section is hidden entirely

6. **Admin Affiliates Tab** (inside `AdminDashboard.tsx` as a new `activeTab === 'affiliates'` case, rendered via `<AffiliateManagerTab />`):
   - **KYC Review sub-tab**: Table of pending affiliates. Clicking "Review" opens a side-by-side modal showing: Profile Name | Uploaded ID image + file size. Low Quality badge if < 150KB. Approve / Reject (with reason) buttons.
   - **Commission Settings sub-tab**: Grid table of Category rows × Normal/Creator columns — editable % inputs.
   - **Video Approvals sub-tab**: List of pending video URLs (YouTube/Instagram) submitted by affiliates. Preview embed + Approve / Reject buttons.
   - **Payout Manager sub-tab**: List of withdrawable commissions. Mark as Paid button.
   - **API Access sub-tab** (can be inline on each affiliate row): Toggle switch per affiliate.

7. **Cookie/Referral Tracking** (in `CartContext` or `CheckoutPage`):
   - On app load, check URL for `?ref=CODE` → store `affiliateRef` in localStorage (simulating 30-day cookie)
   - On order completion, read `affiliateRef`, credit commission to matching affiliate, log in commissions ledger
   - Commission amount = order subtotal × tier rate for product category

8. **10-Day Hold Auto-Transition**:
   - On `AffiliateDashboard` load and `AffiliateManagerTab` load: iterate commissions, check if `Date.now() > releasesAt`, transition `pending → withdrawable`

9. **Wire `WatchAndShopSection` into homepage** between Flash Sale and Brands sections.

10. **Add `/affiliate-register` and `/affiliate` to app navigation** (Header login area or Footer link).
