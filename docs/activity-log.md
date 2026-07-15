# Activity Log

## 2026-07-12 — Separate Claim and Return QR Codes

### Changes
- Created migration `add_return_qr_path_to_borrow_records_table` to store return QR code path
- Added `return_qr_path` to `BorrowRecord` model fillable fields
- Updated `BorrowRequestApiController::approve()` to generate both claim and return QR codes on approval
- Updated `BorrowRequestReceipt` mail class and `receipt.blade.php` to display both QR codes side-by-side in the email
- Updated `ScannerApiController::lookup()` to extract and validate the `action` query parameter from QR URLs
- Updated `Scanner.tsx` frontend to extract the action from scanned QR codes and show only the matching action button
- Updated `admin.ts` API client `lookup()` to accept an optional `action` parameter

### Fixed
- `Node.removeChild` DOM error by switching from `useEffect` to `useLayoutEffect` for scanner cleanup
- QR code parsing in Scanner.tsx to extract borrow_id from full URL

### Changed
- Reverted separate claim/return QR codes to single QR code approach
- Created `BookClaimedNotification` mail class and `claimed.blade.php` view for claim confirmation emails
- Updated `ScannerApiController` to send `BookClaimedNotification` on claim instead of the receipt

### Pending
- Set up cron job for `php artisan schedule:run` to enable daily reminder emails
