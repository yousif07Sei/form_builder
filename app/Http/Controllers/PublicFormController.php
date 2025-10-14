<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\SubmissionData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicFormController extends Controller
{
    public function show($slug)
    {
        $form = Form::where('slug', $slug)
            ->where('is_active', true)
            ->with(['fields' => function ($query) {
                $query->orderBy('order');
            }])
            ->firstOrFail();

        return Inertia::render('Public/Form', [
            'form' => $form
        ]);
    }

    public function submit(Request $request, $slug)
    {
        $form = Form::where('slug', $slug)
            ->where('is_active', true)
            ->with('fields')
            ->firstOrFail();

        // Build validation rules dynamically
        $rules = [];
        foreach ($form->fields as $field) {
            $fieldRules = [];

            if ($field->is_required) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            // Add type-specific validation
            if ($field->type === 'email') {
                $fieldRules[] = 'email';
            } elseif ($field->type === 'number') {
                $fieldRules[] = 'numeric';
            }

            $rules[$field->name] = implode('|', $fieldRules);
        }

        $validated = $request->validate($rules);

        // Create submission
        $submission = FormSubmission::create([
            'form_id' => $form->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'submitted_at' => now(),
        ]);

        // Store submission data
        foreach ($form->fields as $field) {
            if (isset($validated[$field->name])) {
                SubmissionData::create([
                    'submission_id' => $submission->id,
                    'field_id' => $field->id,
                    'value' => is_array($validated[$field->name])
                        ? json_encode($validated[$field->name])
                        : $validated[$field->name],
                ]);
            }
        }

        return back()->with('success', 'Form submitted successfully!');
    }
}
