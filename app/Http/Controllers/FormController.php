<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormField;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $forms = Form::withCount('fields')
            ->latest()
            ->get();

        return Inertia::render('Forms/Index', [
            'forms' => $forms
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Forms/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'settings' => 'nullable|array',
        ]);

        $form = Form::create($validated);

        return redirect()->route('forms.edit', $form->id)
            ->with('success', 'Form created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Form $form)
    {
        $form->load(['fields' => function ($query) {
            $query->orderBy('order');
        }]);

        return Inertia::render('Forms/Show', [
            'form' => $form
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Form $form)
    {
        $form->load(['fields' => function ($query) {
            $query->orderBy('order');
        }]);

        return Inertia::render('Forms/Builder', [
            'form' => $form
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Form $form)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'settings' => 'nullable|array',
            'fields' => 'nullable|array',
            'fields.*.id' => 'nullable|exists:form_fields,id',
            'fields.*.type' => 'required|string',
            'fields.*.label' => 'required|string',
            'fields.*.name' => 'nullable|string',
            'fields.*.placeholder' => 'nullable|string',
            'fields.*.default_value' => 'nullable|string',
            'fields.*.validation_rules' => 'nullable|array',
            'fields.*.options' => 'nullable|array',
            'fields.*.is_required' => 'nullable|boolean',
            'fields.*.help_text' => 'nullable|string',
            'fields.*.metadata' => 'nullable|array',
        ]);

        $form->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'settings' => $validated['settings'] ?? null,
        ]);

        // Handle fields if provided
        if (isset($validated['fields'])) {
            $existingFieldIds = [];

            foreach ($validated['fields'] as $index => $fieldData) {
                $fieldData['order'] = $index;
                $fieldData['form_id'] = $form->id;

                if (isset($fieldData['id']) && $fieldData['id']) {
                    // Update existing field
                    $field = FormField::find($fieldData['id']);
                    if ($field && $field->form_id === $form->id) {
                        $field->update($fieldData);
                        $existingFieldIds[] = $field->id;
                    }
                } else {
                    // Create new field
                    unset($fieldData['id']);
                    $field = FormField::create($fieldData);
                    $existingFieldIds[] = $field->id;
                }
            }

            // Delete fields that were removed
            $form->fields()->whereNotIn('id', $existingFieldIds)->delete();
        }

        return back()->with('success', 'Form updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Form $form)
    {
        $form->delete();

        return redirect()->route('forms.index')
            ->with('success', 'Form deleted successfully!');
    }
}
