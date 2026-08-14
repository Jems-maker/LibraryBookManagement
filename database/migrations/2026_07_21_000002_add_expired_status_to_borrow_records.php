<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE borrow_records MODIFY COLUMN status ENUM('Pending Claim', 'Borrowed', 'Returned', 'Overdue', 'Lost', 'Damaged', 'Expired') NOT NULL DEFAULT 'Pending Claim'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE borrow_records MODIFY COLUMN status ENUM('Pending Claim', 'Borrowed', 'Returned', 'Overdue', 'Lost', 'Damaged') NOT NULL DEFAULT 'Pending Claim'");
    }
};