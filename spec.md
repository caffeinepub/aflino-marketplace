# AFLINO Marketplace

## Current State
- Product data is in `src/frontend/src/data/products.ts` with interface `Product { id, title, seller, category, price, stock, rating }`
- ProductGrid shows products with a simple "Add" button; no product detail page/modal exists
- SellerDashboard has a Product Upload form with fields: title, category, price, stock, description
- Cart add-to-cart is a simple toast (no actual cart context); no variant concept exists anywhere
- No variant system exists in data model, UI, or forms

## Requested Changes (Diff)

### Add
- `ProductVariant` interface: `{ id: string, size: string, color: string, colorHex: string, price: number, stock: number }`
- `variants?: ProductVariant[]` optional field on `Product` interface
- Sample variants on 4 products: product 1 (Headphones), 5 (Linen Shirt), 6 (Floral Maxi Dress), 7 (Canvas Sneakers)
- `ProductDetailModal` component: opens when customer clicks a product card; shows variant chips (size chips + color swatches), updates price & stock count dynamically as variant is selected; selected chip uses `#006AFF` background; "Add to Cart" button passes selected variant info
- `CartContext`: global cart state with items `{ productId, productTitle, price, quantity, variant?: { size, color, colorHex } }`; `addToCart`, `removeFromCart`, `cartItems`, `cartCount` exposed
- Variant builder UI in SellerDashboard Product Upload: section to add variant combos; each row has Size (text input), Color Name (free text), Color Picker (hex input type="color" inline), Price (₹), Stock (number); Add/Remove rows; optional (can upload product with no variants)

### Modify
- `products.ts`: extend `Product` interface and add sample variant data to 4 products
- `ProductGrid.tsx` local ProductCard: clicking the card or "View" button opens `ProductDetailModal`
- `SellerDashboard.tsx`: extend upload form with optional Variants section
- `App.tsx`: wrap with `CartProvider`
- `CustomerDashboard.tsx`: show cart count badge somewhere (optional minor enhancement)

### Remove
- Simple `toast.success("added to cart")` inline in ProductGrid replaced by actual CartContext dispatch + modal flow

## Implementation Plan
1. Extend `products.ts` with `ProductVariant` interface and add sample variants to products 1, 5, 6, 7
2. Create `CartContext.tsx` with cart state, add/remove, and cart count
3. Create `ProductDetailModal.tsx` with:
   - Variant size chips (clickable, selected = #006AFF bg white text)
   - Color swatches (small circle with colorHex + label, selected = ring #006AFF)
   - Dynamic price + stock update when combo selected
   - Add to Cart dispatches to CartContext with variant info
   - If no variants: shows single price/stock and direct Add to Cart
4. Update `ProductGrid.tsx` ProductCard to open ProductDetailModal on card/button click
5. Update `SellerDashboard.tsx` upload form with optional Variants builder section
6. Wrap App with CartProvider
