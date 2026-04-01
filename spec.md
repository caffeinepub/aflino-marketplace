# AFLINO Marketplace

## Current State
AFLINO is a full multi-vendor marketplace with Admin, Seller, Customer, and Affiliate portals. Admin Dashboard has tabs: vendors, approvals, payouts, settings, products, homepage, payment, communication, brand, reviews, analytics, languages, affiliates. Footer has Explore/Account/Support/Legal columns. No Brand (advertiser) portal, no /advertise-with-us page, no Ads Manager in Admin.

## Requested Changes (Diff)

### Add
- `/advertise-with-us` public page: hero section, "Why Advertise" section, Interactive Ad Slot Cards (name, dimensions, impressions), high-conversion Contact Form (Brand Name, Website, Contact Name, Email, Phone, Budget)
- `/brand/register` page: separate brand advertiser registration (Company, Contact Name, Email, Password, Website, Industry)
- `/brand/login` page: brand login portal, isolated from Seller/Customer auth
- Brand Dashboard (`/brand/dashboard`): shows pending status, uploaded creatives, campaign overview
- `AdminAdsManager.tsx` component: sub-tabs [Brand Leads, Active Campaigns, Slot Pricing]
- "ads" tab in Admin Dashboard sidebar
- "Ad Inquiries Email" field in Admin Settings (under Communication or Settings tab)
- Footer "Business" column: "Advertise with Us", "Brand Solutions", "Sell on AFLINO"

### Modify
- `App.tsx`: add routes for `/advertise-with-us`, `/brand/register`, `/brand/login`, `/brand/dashboard`
- `AdminDashboard.tsx`: add "ads" tab to sidebar, render AdminAdsManager for that tab, add Ad Inquiries Email field in settings
- `Footer.tsx`: add Business column with ad/brand links

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/AdvertiseWithUs.tsx` — public marketing page with Ad Slot Cards + Contact Form; form submissions stored in localStorage-based state and routed to admin
2. Create `src/frontend/src/pages/BrandRegister.tsx` — registration form with brand-specific fields
3. Create `src/frontend/src/pages/BrandLogin.tsx` — login form for brand portal
4. Create `src/frontend/src/pages/BrandDashboard.tsx` — brand dashboard showing campaign status
5. Create `src/frontend/src/components/admin/AdminAdsManager.tsx` — three sub-tabs: Brand Leads table, Active Campaigns manager, Slot Pricing tool
6. Update `AdminDashboard.tsx`: add "ads" sidebar tab, render AdminAdsManager, add Ad Inquiries Email field in Settings
7. Update `Footer.tsx`: add Business column
8. Update `App.tsx`: add all new routes
