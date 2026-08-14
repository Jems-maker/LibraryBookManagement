<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('borrow_records', function (Blueprint $table) {
            $table->timestamp('due_reminder_sent_at')->nullable()->after('status');
            $table->timestamp('overdue_reminder_sent_at')->nullable()->after('due_reminder_sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('borrow_records', function (Blueprint $table) {
            $table->dropColumn(['due_reminder_sent_at', 'overdue_reminder_sent_at']);
        });
    }
};
