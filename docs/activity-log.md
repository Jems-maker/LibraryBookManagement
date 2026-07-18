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

## 2026-07-17 — Overdue Processing, Email Fixes, and Dashboard Enhancements

### Added
- Auto-rejection of pending borrow requests not approved within 10 minutes to `AutoExpireClaims` command
- Active Borrow Detail modal with clickable borrower rows on admin Dashboard
- Course field to all email notification templates (claimed, receipt, submitted, reminder, return)
- Due date time format to claimed email (was date-only, now includes time)
- Student name and course to return notification email
- Smart auto-refresh on Dashboard and Requests page (poll notifications every 10s, refetch only on data change)
- Overdue badge to active borrower rows based on 20-minute grace period

### Changed
- Overdue detection threshold from 5 minutes to 20 minutes in `SendOverdueReminders` command
- Overdue threshold applied consistently to Dashboard stats and notifications endpoint
- Frontend overdue badge logic to match 20-minute grace period
- Due date format in claimed email from `F j, Y` to `F j, Y — h:i A`
- `MAIL_SCHEME` in `.env` reverted back to `smtps` (original correct value)

### Fixed
- Missing "due_now" email notification by including `Pending Claim` status in cron query
- Zero-record overdue count by sending notification immediately when book is claimed past due date
- Email delivery by verifying crontab is set up and mail scheme is valid
- Config cache cleared to apply `.env` changes

### Technical
- Set up system crontab to run Laravel scheduler every minute
- Verified scheduler executes both `library:send-reminders` and `claims:auto-expire` commands

## 2026-07-17 — Performance and UI Improvements

### Added
- Database indexes on `borrow_records` (`status`, `due_date`, `borrow_date`, `created_at`) and `borrow_requests` (`status`, `created_at`) via migration `2026_07_17_104710_add_indexes_to_borrow_tables`

### Changed
- Switched `CACHE_STORE` from `database` to `file` in `.env` to reduce MySQL cache load
- Admin Students page layout replaced table rows with responsive card grid
- Student cards now show separate Course and Year lines plus total borrows count

### Frontend
- Added `total_borrows` to `User` type and student card layout
- Replaced plain text Edit/Delete buttons with icon buttons across all admin pages
- Added centered card layout for Students page with course/year on separate lines
- Added reusable `ConfirmModal` component to replace all `window.confirm()` calls
- Integrated `ConfirmModal` into Students, Publishers, Categories, Authors, Courses, and Books pages

## 2026-07-17 — Book Year, Optional Fields, and Form Improvements

### Added
- `year_of_book` field to books (migration `2026_07_17_120200_add_year_of_book_to_books_table`)
- Year of book display in student BorrowedBooks page
- Year of book in all email templates (claimed, receipt, submitted, reminder, return-notification)

### Changed
- Reordered Book form fields: Author and Publisher now appear before Category
- Author Bio is now optional in Add/Edit Author form
- Publisher Address is now optional in Add/Edit Publisher form
- Removed `isbn` field from Book form and BookApiController validation
- Updated `BookApiController` to accept `year_of_book` in store/update validation
- Updated `Book` model fillable to include `year_of_book`
