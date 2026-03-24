# AFLINO Marketplace

## Current State
Homepage has: Category Circles, Banner Carousel, Curated Brands, Recently Viewed. ProductContext has products array + deleteProduct. SellerDashboard manages uploaded products locally without pushing to ProductContext.

## Requested Changes (Diff)

### Add
- CategoryFeedSection.tsx: category-specific grids with skeleton loaders, 2-col mobile / 4-col desktop
- addProduct to ProductContext for data sync

### Modify
- Hero.tsx: insert CategoryFeedSection below Curated Brands
- ProductContext.tsx: add addProduct
- SellerDashboard.tsx: call addProduct on successful product upload

### Remove
- Nothing

## Implementation Plan
1. Add addProduct to ProductContext
2. Wire SellerDashboard upload to addProduct
3. Create CategoryFeedSection component with skeleton + grid
4. Add to Hero.tsx after Curated Brands section
