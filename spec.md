# AFLINO Marketplace

## Current State
- Seller Dashboard: Product upload form, pending approval check
- Admin Dashboard: Vendor Management tab, Pending Approvals tab
- SellerContext: manages pending sellers, approved sellers
- No wallet, payout, or earnings logic exists

## Requested Changes (Diff)

### Add
- WalletContext: manages wallet balances, payout requests, payout history, commission rate, min payout amount
- Sample delivered orders (3-4) pre-loaded so wallet has demo balance
- Seller Dashboard: new 'Wallet & Earnings' tab showing:
  - Total Earnings (all delivered orders after commission)
  - Pending Balance (balance not yet paid out, shown in violet)
  - Payout Request button (disabled if balance < min payout amount)
  - Payout history table (approved payouts with amounts and dates)
- Admin Dashboard: new 'Payout Requests' tab showing:
  - Table of payout requests (seller name, requested amount, date, status)
  - Approve: admin enters payout amount, confirms -- balance deducted, history recorded
  - Reject: request removed
  - Settings section: set global commission rate, set minimum payout amount

### Modify
- SellerContext or new WalletContext: add wallet state
- AdminDashboard: add Payout Requests tab + commission/payout settings
- SellerDashboard: add Wallet tab in sidebar

### Remove
- Nothing removed

## Implementation Plan
1. Create WalletContext with sample delivered orders, wallet balances per seller, payout requests, payout history, commission rate, min payout settings
2. Update SellerDashboard to add Wallet tab with balance cards and payout request button
3. Update AdminDashboard to add Payout Requests tab and commission/min payout settings
4. Wire WalletContext into App.tsx provider tree
