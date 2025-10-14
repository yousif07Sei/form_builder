<?php

use App\Http\Controllers\FormController;
use App\Http\Controllers\FormSubmissionController;
use App\Http\Controllers\PublicFormController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Form Management Routes
Route::resource('forms', FormController::class);

// Form Submissions Routes
Route::get('/forms/{form}/submissions', [FormSubmissionController::class, 'index'])->name('forms.submissions.index');
Route::get('/forms/{form}/submissions/{submission}', [FormSubmissionController::class, 'show'])->name('forms.submissions.show');
Route::delete('/forms/{form}/submissions/{submission}', [FormSubmissionController::class, 'destroy'])->name('forms.submissions.destroy');

// Public Form Routes
Route::get('/f/{slug}', [PublicFormController::class, 'show'])->name('public.forms.show');
Route::post('/f/{slug}', [PublicFormController::class, 'submit'])->name('public.forms.submit');
