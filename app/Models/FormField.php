<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormField extends Model
{
    protected $fillable = [
        'form_id',
        'type',
        'label',
        'name',
        'placeholder',
        'default_value',
        'validation_rules',
        'options',
        'order',
        'is_required',
        'help_text',
    ];

    protected $casts = [
        'validation_rules' => 'array',
        'options' => 'array',
        'is_required' => 'boolean',
        'order' => 'integer',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function submissionData(): HasMany
    {
        return $this->hasMany(SubmissionData::class, 'field_id');
    }
}
