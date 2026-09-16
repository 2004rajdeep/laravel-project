<?php

use App\Http\Controllers\LinkController;

use Illuminate\Support\Facades\Route;

Route::get('/', [LinkController::class, 'index'])->name('home');

Route::post('/shorten', [LinkController::class, 'store'])->name('shorten');

Route::get('/{code}', [LinkController::class, 'redirect'])->name('redirect');


