<template>
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <Button
                    icon="pi pi-arrow-left"
                    text
                    @click="$emit('back')"
                />
                <div>
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ formTitle }}</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Form Builder</p>
                </div>
            </div>
            <div class="flex gap-2">
                <Button
                    label="Export Code"
                    icon="pi pi-code"
                    severity="help"
                    outlined
                    @click="$emit('export')"
                />
                <Button
                    label="Preview"
                    icon="pi pi-eye"
                    severity="secondary"
                    outlined
                    @click="$emit('preview')"
                />
                <Button
                    label="Save Form"
                    icon="pi pi-save"
                    :loading="saving"
                    @click="$emit('save')"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import Button from 'primevue/button';

defineProps({
    formTitle: {
        type: String,
        required: true
    },
    saving: {
        type: Boolean,
        default: false
    }
});

defineEmits(['back', 'export', 'preview', 'save']);
</script>
