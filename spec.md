# AFLINO Marketplace

## Current State
- Product type has `price` and `stock` fields; no `discountedPrice` or `stockThreshold` fields.
- SellerDashboard has a basic sidebar with `My Products` tab but no content — just a button with no active logic.
- No CSV import/export feature exists.
- No low stock badge or notification bell in the Seller Dashboard.
- ProductContext has `updateProductPrice` but no bulk update method.

## Requested Changes (Diff)

### Add
- `discountedPrice?: number` and `stockThreshold?: number` (default 5) fields to Product interface in `data/products.ts`.
- `updateProductsBulk(updates: BulkUpdate[]) => void` method to ProductContext that accepts array of `{id, price?, discountedPrice?, stock?, stockThreshold?}`.
- `BulkCSVManager` component in Seller Dashboard under a new working `My Products` tab:
  - Export button: generates and downloads a CSV with columns: `product_id` (readonly), `product_name` (readonly), `sku` (readonly), `category` (readonly), `price`, `discounted_price`, `stock`, `stock_threshold`.
  - Import button: file picker for CSV, validates and applies bulk update using `updateProductsBulk`.
  - Inline validation error table shown if any rows have issues.
  - Product list table with Low Stock badge (bright red) when stock ≤ stockThreshold.
- Low Stock Notification Bell in Seller Dashboard header:
  - Bell icon (Lucide `Bell`) with a red badge count of low-stock products.
  - Dropdown panel listing each alert: "Alert: [Product Name] is at [X] units!"
  - Each alert has a red exclamation icon for prominence.
- In Admin Dashboard product list: show bright red "Low Stock" badge on products where stock ≤ threshold.

### Modify
- `ProductContext.tsx`: add `updateProductsBulk` method and expose it.
- `SellerDashboard.tsx`: wire up the `My Products` tab with active state, add BulkCSVManager, add notification bell to header.
- `data/products.ts`: add `discountedPrice` and `stockThreshold` fields to existing sample products (stockThreshold defaults to 5, discountedPrice same as price by default).

### Remove
- Nothing removed.

## Implementation Plan
1. Update `Product` interface and sample data with `discountedPrice` and `stockThreshold`.
2. Add `updateProductsBulk` to ProductContext.
3. Create `src/frontend/src/components/seller/BulkCSVManager.tsx` — export/import logic, product table with Low Stock badges.
4. Update `SellerDashboard.tsx`:
   - Wire `My Products` tab to show BulkCSVManager.
   - Add notification bell with dropdown in header using low-stock product count.
5. Update AdminDashboard to show Low Stock badge in product lists where applicable.
6. Validate and build.
