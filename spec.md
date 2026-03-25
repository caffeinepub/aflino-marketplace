# AFLINO Marketplace

## Current State
Admin Dashboard has tabs: vendors, approvals, payouts, settings, products, homepage, payment, communication, brand, reviews. Products tab has product list and upload form. OrderTrackingContext has orders with buyerPincode, indiaPostOrder, courierPartner, amountRaw fields. Products have category and brandName fields. ProductContext has updateProductsBulk.

## Requested Changes (Diff)

### Add
- New "analytics" tab in Admin Dashboard: "Command Center" with 3 charts
  - Top 5 Pincodes bar chart (order volume by pincode from orders data)
  - Logistics Split pie chart (% iThinkLogistics vs Shiprocket vs India Post from orders data)
  - Weekly Revenue line graph (daily sales for last 7 days from orders data using amountRaw + date)
- New AdminCommandCenter component for the analytics tab
- Global Price Adjuster section in Admin > Products tab
  - Filter by Category or Brand (dropdown selects)
  - Percentage input (positive = hike, negative = sale)
  - Preview count of affected products before applying
  - Apply button updates discountedPrice only (never price/MRP)
  - Uses ProductContext updateProductsBulk

### Modify
- AdminDashboard: add "analytics" to Tab type, add nav button, render AdminCommandCenter
- Products tab: add Global Price Adjuster panel above the product list
- ProductContext: add bulkAdjustDiscountedPrice(filter, percent) helper

### Remove
- Nothing removed

## Implementation Plan
1. Create src/frontend/src/components/admin/AdminCommandCenter.tsx — charts using recharts (already available via shadcn chart.tsx)
2. Add bulkAdjustDiscountedPrice to ProductContext
3. Create src/frontend/src/components/admin/GlobalPriceAdjuster.tsx
4. Update AdminDashboard.tsx: add analytics tab, import components, render them
