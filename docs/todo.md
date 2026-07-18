# Todo

## High Priority
- [x] Set up cron job for `php artisan schedule:run` to enable daily reminder emails

## Technical Debt
- [ ] Verify Gmail app password is still valid and regenerate if needed
- [x] Add database indexes on frequently queried columns (borrow_records + borrow_requests)
- [x] Switch cache from database to file to reduce MySQL load
- [ ] Monitor email delivery after MAIL_SCHEME fix to confirm students receive notifications
- [ ] Consider adding error logging to empty catch blocks in remaining controllers