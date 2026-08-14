<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Use sync queue locally so queued emails fire immediately without a worker
        if ($this->app->environment('local')) {
            config(['queue.default' => 'sync']);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\View::composer('layouts.admin', function ($view) {
            $view->with('pendingRequestsCount', \App\Models\BorrowRequest::where('status', 'Pending')->count());
        });
    }
}
