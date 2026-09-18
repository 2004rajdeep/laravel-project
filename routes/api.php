<?php

use App\Http\Controllers\LinkController;
use Illuminate\Support\Facades\Route;

Route::post('/shorten', [LinkController::class, 'apiShorten'])
    ->middleware('throttle:60,1')
    ->name('api.shorten');