# RAGHU BABA ONLINE SERVICE — Safe Authentication Migration Plan

## Current status (2026-10-18)
- Live portal uses a legacy retailer login that compares `retailers/{mobile}/pass` values in browser code.
- Admin login credentials are hard-coded in `index.html`.
- Portal data operations use unauthenticated Realtime Database REST calls.
- Phone OTP reset is wired to Firebase Phone Auth, but the user reported Firebase billing is not enabled.
- Retailer records contain an email field, but those records are not automatically Firebase Authentication accounts.
- A full pre-change copy of `index.html` is stored at `backups/index-before-email-reset-2026-10-18.html` on this safety branch.

## Do NOT do these yet
- Do not replace the current login with `sendPasswordResetEmail()` alone; legacy retailer records are not Firebase Auth email/password users.
- Do not tighten Realtime Database rules before the app is migrated to authenticated requests; that would break login, wallet, orders, recharges, and admin functions.
- Do not rewrite or delete retailer records, wallets, transfer logs, orders, or customer application data.
- Do not keep the current hard-coded admin credential once a proper admin authentication path is ready; remove it only after the replacement is verified.

## Safe sequence
1. Export a full Realtime Database JSON backup from Firebase Console and verify the downloaded file is non-empty. Keep it private because it contains retailer/customer information.
2. In Firebase Console, confirm Authentication providers and authorized domains. Email reset requires Firebase Authentication accounts; adding an email string to the Realtime Database record is not enough.
3. Build a migration that links each existing retailer to a Firebase Auth UID without changing the retailer's mobile key or any business data. Do not expose passwords or service credentials in the client.
4. Move admin-only actions (retailer creation, wallet credit/debit, recharge approval, order status/refund) behind trusted server-side authorization or equivalent verified Firebase rules.
5. Update the client to use authenticated requests and UID/role checks. Keep the existing retailer data paths intact during migration.
6. Test using a staging/test project and test accounts: existing login, email reset, wallet balance, wallet transfer ledger, recharge requests, orders, receipts, and admin actions.
7. Only after tests pass, deploy the client and then tighten database rules. Verify every workflow again.
8. Keep the original backup and rollback commit until the live site has been verified.

## Current code-only change
The email validation regular expression for retailer registration and admin email updates was corrected. No retailer or Firebase data was changed by that code edit.
