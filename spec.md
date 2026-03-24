# AFLINO Marketplace

## Current State
ProductDetailModal has basic size/color chip selectors. 4 variant products exist. No smartphone product.

## Requested Changes (Diff)

### Add
- Smartphone product (id:11) with RAM+Storage combos as size field: 4GB+64GB (₹10,000) and 8GB+256GB (₹15,000)

### Modify
- ProductDetailModal: Redesign variant selectors into pill-container rows matching reference image:
  1. Colours row: Blue (#006AFF) pill label area, white scrollable swatch area, color dot + name, #006AFF ring on selected
  2. Sizes/Variants row: Pink (#FF1B8D) pill label area, white scrollable button area, circular buttons with size text + price below, #006AFF ring on selected
  - Arrow navigation buttons inside label pill area
  - Horizontal touch/drag scroll on mobile
  - Price updates instantly on selection

### Remove
- Nothing

## Implementation Plan
1. Update products.ts: add Smartphone product id:11 with 4 variants (4GB+64GB Black ₹10000, 4GB+64GB Silver ₹10500, 8GB+256GB Black ₹15000, 8GB+256GB Silver ₹15500)
2. Rewrite ProductDetailModal.tsx: pill-container design, two rows, horizontal scroll + arrows, per-variant price in size buttons, brand colors
