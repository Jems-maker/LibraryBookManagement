<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ── Auth ─────────────────────────────────────────────────────────────────────
Route::post('/auth/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/auth/admin-login', [\App\Http\Controllers\Api\AuthController::class, 'adminLogin']);
Route::post('/auth/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
Route::post('/auth/forgot-password', [\App\Http\Controllers\Api\AuthController::class, 'forgotPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
    Route::post('/auth/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);

    // ── Books (student browsing) ──────────────────────────────────────────────
    Route::get('/books', [\App\Http\Controllers\Api\BookApiController::class, 'index']);
    Route::get('/books/categories', [\App\Http\Controllers\Api\BookApiController::class, 'categories']);
    Route::get('/books/suggestions', [\App\Http\Controllers\Api\BookApiController::class, 'suggestions']);
    Route::get('/books/{book}', [\App\Http\Controllers\Api\BookApiController::class, 'show']);

    // ── Student ───────────────────────────────────────────────────────────────
    Route::prefix('student')->name('api.student.')->group(function () {
        Route::get('/profile', [\App\Http\Controllers\Api\StudentApiController::class, 'profile']);
        Route::patch('/profile', [\App\Http\Controllers\Api\StudentApiController::class, 'updateProfile']);
        Route::patch('/profile/gender', [\App\Http\Controllers\Api\StudentApiController::class, 'updateGender']);
        Route::post('/borrow/{book}', [\App\Http\Controllers\Api\StudentApiController::class, 'borrow']);
        Route::get('/borrowed-books', [\App\Http\Controllers\Api\StudentApiController::class, 'activeBorrows']);
        Route::get('/history', [\App\Http\Controllers\Api\StudentApiController::class, 'history']);
    });

    // ── Admin ─────────────────────────────────────────────────────────────────
    Route::prefix('admin')->middleware('admin')->name('api.admin.')->group(function () {
        // Dashboard stats & notifications
        Route::get('/stats', [\App\Http\Controllers\Api\Admin\DashboardApiController::class, 'stats']);
        Route::get('/notifications', [\App\Http\Controllers\Api\Admin\DashboardApiController::class, 'notifications']);

        // Books CRUD
        Route::apiResource('books', \App\Http\Controllers\Api\Admin\BookApiController::class);

        // Categories / Authors / Publishers
        Route::apiResource('categories', \App\Http\Controllers\Api\Admin\CategoryApiController::class);
        Route::apiResource('authors', \App\Http\Controllers\Api\Admin\AuthorApiController::class);
        Route::apiResource('publishers', \App\Http\Controllers\Api\Admin\PublisherApiController::class);

        // Students
        Route::apiResource('students', \App\Http\Controllers\Api\Admin\StudentApiController::class);
        Route::apiResource('courses', \App\Http\Controllers\Api\Admin\CourseApiController::class);

        // Borrow Requests
        Route::get('/borrow-requests', [\App\Http\Controllers\Api\Admin\BorrowRequestApiController::class, 'index']);
        Route::post('/borrow-requests/{borrowRequest}/approve', [\App\Http\Controllers\Api\Admin\BorrowRequestApiController::class, 'approve']);
        Route::post('/borrow-requests/{borrowRequest}/reject', [\App\Http\Controllers\Api\Admin\BorrowRequestApiController::class, 'reject']);

        // Borrow Records
        Route::get('/borrow-records', [\App\Http\Controllers\Api\Admin\BorrowRecordApiController::class, 'index']);

        // Scanner
        Route::get('/scanner', [\App\Http\Controllers\Api\Admin\ScannerApiController::class, 'lookup']);
        Route::post('/scanner/process', [\App\Http\Controllers\Api\Admin\ScannerApiController::class, 'process']);

        // Awards
        Route::get('/awards', [\App\Http\Controllers\Api\Admin\AwardApiController::class, 'index']);
        Route::get('/awards/{student}/certificate/download', [\App\Http\Controllers\Api\Admin\AwardApiController::class, 'download']);

        // Settings
        Route::get('/settings', [\App\Http\Controllers\Api\Admin\SettingApiController::class, 'index']);
        Route::post('/settings', [\App\Http\Controllers\Api\Admin\SettingApiController::class, 'update']);

        // Reports
        Route::get('/reports', [\App\Http\Controllers\Api\Admin\ReportApiController::class, 'index']);
    });
});
