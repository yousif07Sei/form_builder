<template>
    <div class="space-y-2">
        <div
            class="grid rounded-lg p-3 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-gray-800/50 dark:to-gray-700/50 border-2 border-dashed border-primary-200 dark:border-primary-800"
            :style="{
                gridTemplateColumns: `repeat(${field.columns || 2}, 1fr)`,
                gap: `${field.gap || 16}px`
            }"
        >
            <div
                v-for="(column, colIdx) in (field.columns || 2)"
                :key="colIdx"
                class="column-drop-zone border-2 border-dashed rounded-lg p-4 min-h-[200px] transition-all duration-200 bg-white dark:bg-gray-900"
                :class="{
                    'border-primary-400 dark:border-primary-600': !getColumnFields(field, colIdx) || getColumnFields(field, colIdx).length === 0,
                    'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800': getColumnFields(field, colIdx) && getColumnFields(field, colIdx).length > 0
                }"
                @dragover.prevent="$event.currentTarget.classList.add('dragover-highlight')"
                @dragleave="$event.currentTarget.classList.remove('dragover-highlight')"
                @drop="handleColumnDrop($event, colIdx); $event.currentTarget.classList.remove('dragover-highlight')"
            >
                <!-- Column header badge -->
                <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span class="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                        Column {{ colIdx + 1 }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ (getColumnFields(field, colIdx) || []).length }}
                        {{ (getColumnFields(field, colIdx) || []).length === 1 ? 'field' : 'fields' }}
                    </span>
                </div>

                <!-- Empty state -->
                <div v-if="!getColumnFields(field, colIdx) || getColumnFields(field, colIdx).length === 0" class="flex flex-col items-center justify-center h-[calc(100%-2.5rem)] py-8">
                    <div class="text-center">
                        <div class="mb-3 w-12 h-12 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <i class="pi pi-plus text-xl text-primary-500 dark:text-primary-400"></i>
                        </div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Drop fields here</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500">Drag from the sidebar</p>
                    </div>
                </div>

                <!-- Fields list -->
                <div v-else class="space-y-3">
                    <div
                        v-for="(colChildField, colChildIdx) in getColumnFields(field, colIdx)"
                        :key="colChildField.tempId || colChildField.id"
                        class="relative group bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                        :class="{ 'ring-2 ring-blue-500': isNestedFieldSelected(colIdx, colChildIdx) }"
                        @click.stop="$emit('select-field', { colIdx, colChildIdx })"
                    >
                        <!-- Delete button -->
                        <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                text
                                rounded
                                size="small"
                                @click.stop="$emit('remove-field', { colIdx, colChildIdx })"
                            />
                        </div>

                        <!-- Render the actual field -->
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {{ colChildField.label }}
                                <span v-if="colChildField.is_required" class="text-red-500">*</span>
                            </label>
                            <component
                                :is="getFieldComponent(colChildField.type)"
                                v-bind="getFieldProps(colChildField)"
                                disabled
                            />
                            <small v-if="colChildField.help_text" class="text-gray-500 dark:text-gray-400 block">
                                {{ colChildField.help_text }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Button from 'primevue/button';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    fieldIndex: {
        type: Number,
        required: true
    },
    isNestedFieldSelected: {
        type: Function,
        required: true
    },
    getFieldComponent: {
        type: Function,
        required: true
    },
    getFieldProps: {
        type: Function,
        required: true
    },
    getColumnFields: {
        type: Function,
        required: true
    }
});

const emit = defineEmits(['column-drop', 'select-field', 'remove-field']);

const handleColumnDrop = (event, colIdx) => {
    emit('column-drop', { event, colIdx });
};
</script>

<style scoped>
/* Column drop zone styles */
.column-drop-zone {
    position: relative;
}

.column-drop-zone.dragover-highlight {
    border-color: rgb(59 130 246) !important;
    background-color: rgb(239 246 255) !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: scale(1.02);
}

.dark .column-drop-zone.dragover-highlight {
    border-color: rgb(96 165 250) !important;
    background-color: rgb(30 58 138 / 0.2) !important;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}
</style>
