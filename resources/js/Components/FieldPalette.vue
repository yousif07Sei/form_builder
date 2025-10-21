<template>
    <!-- Left Sidebar - Field Palette -->
    <div class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div class="space-y-2 p-4">
            <div
                v-for="fieldType in fieldTypes"
                :key="fieldType.type"
                class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                draggable="true"
                @dragstart="onDragStart(fieldType, $event)"
            >
                <div class="flex items-center gap-2">
                    <i :class="fieldType.icon" class="text-gray-600 dark:text-gray-400"></i>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ fieldType.label }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { inputFieldTypes } from '@/utils/fieldTypes';

// Import field types from utilities
const fieldTypes = inputFieldTypes;

// Emit event when drag starts
const emit = defineEmits(['dragstart']);

const onDragStart = (fieldType, event) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('fieldType', JSON.stringify(fieldType));
    emit('dragstart', fieldType);
};
</script>

