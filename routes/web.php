<?php

use Illuminate\Support\Facades\Route;

// Delegate all non-API routing to the React SPA.
Route::get('/{any}', function () {
    return view('spa');
})->where('any', '^(?!api|sanctum|storage).*$');
