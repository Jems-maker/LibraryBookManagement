<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrow_records', function (Blueprint $table) {
            $table->index(['status', 'due_date']);
            $table->index(['status', 'borrow_date']);
            $table->index('created_at');
        });

        Schema::table('borrow_requests', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('borrow_records', function (Blueprint $table) {
            $table->dropIndex(['status', 'due_date']);
            $table->dropIndex(['status', 'borrow_date']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('borrow_requests', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
        });
    }
};