<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add 'Unavailable' to the books status ENUM
        DB::statement("ALTER TABLE books MODIFY COLUMN status ENUM('Available','Unavailable','Borrowed','Reserved','Lost','Damaged') NOT NULL DEFAULT 'Available'");
    }

    public function down(): void
    {
        // Revert to original ENUM
        DB::statement("ALTER TABLE books MODIFY COLUMN status ENUM('Available','Borrowed','Reserved','Lost','Damaged') NOT NULL DEFAULT 'Available'");
    }
};
