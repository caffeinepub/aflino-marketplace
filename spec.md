# AFLINO Marketplace

## Current State
A `generateShippingLabel.ts` utility uses jsPDF to create a 3x5 inch PDF. The current design uses AFLINO Blue (#006AFF) fill colors in the header and elsewhere -- not thermal-printer friendly. It shows customer city+state+pincode but no phone/address text. A `ShippingLabelButton.tsx` component triggers the download from Seller Dashboard.

Admin Dashboard has Payment Settings, Courier Settings, and Communication Settings tabs but no "Brand Settings" tab.

## Requested Changes (Diff)

### Add
- "Brand Settings" tab in Admin Dashboard with a logo upload field (upload B&W PNG to replace the AFLINO wordmark on shipping labels)
- `adminBrandSettings` state in Admin context (logoDataUrl, logoUpdatedAt)

### Modify
- `generateShippingLabel.ts`: Full redesign to High-Contrast Black & White only (no colors, no fills). Layout:
  - Header: "AFLINO" bold wordmark top-left (or uploaded logo if available), "PREPAID" or "COD" bold badge top-right (black box, white text)
  - Dashed divider line
  - Courier/AWB placeholder row (bordered box, placeholder text)
  - Large "SHIP TO" section: Customer Name in large bold (14pt), Pincode bold large, city+state small. Phone replaced with "**********", full address replaced with "**********"
  - Two QR placeholders side by side: left "Scan to Track", right "Scan for Invoice" -- all in black border
  - Dashed divider
  - "SOLD BY" section: seller name and city
  - Order Details row: Order ID, SKU, Weight, Items
  - Footer: "Handle with care | AFLINO | Computer Generated" -- small text, black
  - All colors: black text on white, no blues, no pinks, no fills except black
- `ShippingLabelButton.tsx`: Pass `logoDataUrl` from admin brand settings if available to `generateShippingLabel`

### Remove
- All colored fills (blue header, colored payment badge, blue text for total) from the label PDF

## Implementation Plan
1. Update `generateShippingLabel.ts` -- full B&W redesign, accept optional `logoDataUrl` param, privacy masking ("**********" for phone/address)
2. Add `BrandSettingsTab.tsx` admin component with logo upload (file input → base64 → localStorage for now)
3. Add "Brand Settings" tab entry in `AdminDashboard.tsx`
4. Update `ShippingLabelButton.tsx` to pass logo from localStorage brand settings
