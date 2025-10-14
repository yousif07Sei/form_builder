<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormSubmission extends Model
{
    protected $fillable = [
        'form_id',
        'ip_address',
        'user_agent',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function data(): HasMany
    {
        return $this->hasMany(SubmissionData::class, 'submission_id');
    }

    public function getFormattedDataAttribute(): array
    {
        $formatted = [];
        foreach ($this->data as $item) {
            $formatted[$item->field->name] = [
                'label' => $item->field->label,
                'value' => $item->value,
            ];
        }
        return $formatted;
    }
}
