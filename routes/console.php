<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run library reminders daily at 8:00 AM
Schedule::command('library:send-reminders')->dailyAt('08:00');

// Auto-expire unclaimed book requests every minute
Schedule::command('claims:auto-expire')->everyMinute();
