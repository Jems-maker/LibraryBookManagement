<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run library reminders every minute (exact times are handled inside the command)
Schedule::command('library:send-reminders')->everyMinute();

// Auto-expire unclaimed book requests every minute
Schedule::command('claims:auto-expire')->everyMinute();
