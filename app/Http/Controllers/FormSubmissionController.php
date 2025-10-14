<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormSubmissionController extends Controller
{
    public function index(Form $form)
    {
        $submissions = FormSubmission::where('form_id', $form->id)
            ->with(['data.field'])
            ->latest('submitted_at')
            ->paginate(20);

        return Inertia::render('Forms/Submissions/Index', [
            'form' => $form,
            'submissions' => $submissions
        ]);
    }

    public function show(Form $form, FormSubmission $submission)
    {
        $submission->load(['data.field']);

        return Inertia::render('Forms/Submissions/Show', [
            'form' => $form,
            'submission' => $submission
        ]);
    }

    public function destroy(Form $form, FormSubmission $submission)
    {
        $submission->delete();

        return redirect()->route('forms.submissions.index', $form)
            ->with('success', 'Submission deleted successfully!');
    }
}
