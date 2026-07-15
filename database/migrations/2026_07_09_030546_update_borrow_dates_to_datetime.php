<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // MySQL raw queries to modify column types to DATETIME safely
        DB::statement('ALTER TABLE borrow_requests MODIFY return_date DATETIME');
        DB::statement('ALTER TABLE borrow_records MODIFY borrow_date DATETIME');
        DB::statement('ALTER TABLE borrow_records MODIFY due_date DATETIME');
        DB::statement('ALTER TABLE borrow_records MODIFY return_date DATETIME');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE borrow_requests MODIFY return_date DATE');
        DB::statement('ALTER TABLE borrow_records MODIFY borrow_date DATE');
        DB::statement('ALTER TABLE borrow_records MODIFY due_date DATE');
        DB::statement('ALTER TABLE borrow_records MODIFY return_date DATE');
    }
};
