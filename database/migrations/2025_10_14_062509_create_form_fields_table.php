<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained()->onDelete('cascade');
            $table->string('type'); // text, email, number, textarea, select, radio, checkbox, date
            $table->string('label');
            $table->string('name');
            $table->string('placeholder')->nullable();
            $table->string('default_value')->nullable();
            $table->json('validation_rules')->nullable();
            $table->json('options')->nullable(); // for select, radio, checkbox
            $table->integer('order')->default(0);
            $table->boolean('is_required')->default(false);
            $table->text('help_text')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};
