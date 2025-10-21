<template>
    <div class="form-row mb-4">
        <!-- Container with sub-rows (displayed side-by-side) -->
        <div
            v-if="row.subRows && row.subRows.length > 0"
            class="flex gap-2 p-2 border-2 border-dashed rounded-lg transition-all relative cursor-pointer hover:border-primary-400"
            :class="{
                'border-gray-300 dark:border-gray-600 bg-gray-50/30 dark:bg-gray-800/30': !hasAnyFields,
                'border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-900': hasAnyFields,
                'ring-2 ring-purple-500 border-purple-500': isRowSelected
            }"
            @click.self="handleRowClick"
        >
            <!-- Each sub-row displayed side-by-side -->
            <div
                v-for="(subRow, subRowIndex) in row.subRows"
                :key="subRowIndex"
                class="flex-1 flex gap-2 min-h-[80px] p-2 border border-gray-200 dark:border-gray-700 rounded"
                @dragover.prevent
                @drop="handleSubRowDrop($event, subRowIndex)"
            >
                <!-- Fields in sub-row -->
                <template v-if="subRow.fields && subRow.fields.length > 0">
                    <div
                        v-for="(field, fieldIndex) in subRow.fields"
                        :key="field.tempId || field.id"
                        class="relative group"
                        :style="{ width: getSubRowFieldWidth(subRow, fieldIndex) + '%' }"
                    >
                        <!-- Delete Button -->
                        <div class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                text
                                rounded
                                size="small"
                                @click.stop="$emit('remove-subrow-field', { rowIndex, subRowIndex, fieldIndex })"
                            />
                        </div>

                        <!-- Field Content -->
                        <div
                            class="h-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all overflow-hidden cursor-pointer hover:border-primary-400 dark:hover:border-primary-500"
                            @click.stop="$emit('select-subrow-field', { rowIndex, subRowIndex, fieldIndex })"
                        >
                            <div class="w-full overflow-hidden pointer-events-none">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {{ field.label }}
                                    <span v-if="field.is_required" class="text-red-500">*</span>
                                </label>
                                <component
                                    :is="getFieldComponent(field.type)"
                                    v-bind="getFieldProps(field)"
                                    disabled
                                />
                                <small v-if="field.help_text" class="text-gray-500 dark:text-gray-400 block mt-1">
                                    {{ field.help_text }}
                                </small>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Empty state for sub-row -->
                <div v-else class="flex-1 flex items-center justify-center pointer-events-none">
                    <div class="text-center py-4">
                        <i class="pi pi-plus-circle text-xl text-gray-400 dark:text-gray-500 mb-1"></i>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Drop field here</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Regular single row (no sub-rows) -->
        <div
            v-else
            class="flex gap-2 min-h-[80px] p-2 border-2 border-dashed rounded-lg transition-all relative cursor-pointer hover:border-primary-400"
            :class="{
                'border-gray-300 dark:border-gray-600 bg-gray-50/30 dark:bg-gray-800/30': row.fields.length === 0,
                'border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-900': row.fields.length > 0,
                'ring-2 ring-purple-500 border-purple-500': isRowSelected
            }"
            @click.self="handleRowClick"
            @dragover.prevent="handleRowDragOver"
            @dragleave="handleRowDragLeave"
            @drop="handleRowDrop"
        >
            <!-- Empty State -->
            <div v-if="row.fields.length === 0" class="flex-1 flex items-center justify-center pointer-events-none">
                <div class="text-center py-8">
                    <i class="pi pi-plus-circle text-2xl text-gray-400 dark:text-gray-500 mb-2"></i>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Drop field here</p>
                </div>
            </div>

            <!-- Fields with dynamic widths -->
            <template v-else>
                <div
                    v-for="(field, index) in row.fields"
                    :key="field.tempId || field.id"
                    class="relative group"
                    :style="{ width: getFieldWidth(index) + '%' }"
                >
                    <!-- Delete Button -->
                    <div class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <Button
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            rounded
                            size="small"
                            @click.stop="$emit('remove-field', { rowIndex, slotIndex: index })"
                        />
                    </div>

                    <!-- Field Content -->
                    <div
                        class="h-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all overflow-hidden cursor-pointer hover:border-primary-400 dark:hover:border-primary-500"
                        :class="{ 'ring-2 ring-blue-500 border-blue-500': isFieldSelected(index) }"
                        @click.stop="handleFieldClick(index)"
                    >
                        <div class="w-full overflow-hidden pointer-events-none">
                            <!-- Field Label -->
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {{ field.label }}
                                <span v-if="field.is_required" class="text-red-500">*</span>
                            </label>

                            <!-- Field Input -->
                            <component
                                :is="getFieldComponent(field.type)"
                                v-bind="getFieldProps(field)"
                                disabled
                            />

                            <!-- Help Text -->
                            <small v-if="field.help_text" class="text-gray-500 dark:text-gray-400 block mt-1">
                                {{ field.help_text }}
                            </small>
                        </div>
                    </div>
                </div>

                <!-- Empty slot for additional field (if there's space) - invisible but functional -->
                <div
                    v-if="getTotalWidth() < 100"
                    class="transition-all"
                    :class="{
                        'bg-primary-50 dark:bg-primary-900/20 border-2 border-dashed border-primary-400 dark:border-primary-500 rounded-lg': isDraggingOverEmpty
                    }"
                    :style="{ width: (100 - getTotalWidth()) + '%' }"
                    @dragover.prevent="isDraggingOverEmpty = true"
                    @dragleave="isDraggingOverEmpty = false"
                    @drop="handleEmptySlotDrop"
                >
                    <!-- Empty - only show visual feedback when dragging -->
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Button from 'primevue/button';

const props = defineProps({
    row: {
        type: Object,
        required: true
    },
    rowIndex: {
        type: Number,
        required: true
    },
    maxSlots: {
        type: Number,
        default: 3
    },
    selectedFieldIndex: {
        type: Object,
        default: null
    },
    selectedRowIndex: {
        type: Number,
        default: null
    },
    getFieldComponent: {
        type: Function,
        required: true
    },
    getFieldProps: {
        type: Function,
        required: true
    }
});

const emit = defineEmits(['drop', 'remove-field', 'select-field', 'select-row', 'remove-subrow-field', 'select-subrow-field', 'drop-subrow']);

const isDraggingOverRow = ref(false);
const isDraggingOverEmpty = ref(false);

// Get field width based on customWidth or row's gridColumns setting
const getFieldWidth = (index) => {
    const field = props.row.fields[index];

    // If custom width is set, use it
    if (field.customWidth && field.customWidth > 0) {
        return field.customWidth;
    }

    // Otherwise calculate equal width based on row's grid columns
    const gridColumns = props.row.gridColumns || 1;
    const equalWidth = 100 / gridColumns;

    return equalWidth;
};

// Check if this row is selected
const isRowSelected = computed(() => {
    return props.selectedRowIndex === props.rowIndex;
});

// Calculate total width of all fields
const getTotalWidth = () => {
    return props.row.fields.reduce((total, field, index) => {
        return total + getFieldWidth(index);
    }, 0);
};

const handleRowDragOver = (event) => {
    if (props.row.fields.length === 0) {
        isDraggingOverRow.value = true;
    }
};

const handleRowDragLeave = (event) => {
    isDraggingOverRow.value = false;
};

const handleRowDrop = (event) => {
    if (props.row.fields.length === 0) {
        event.stopPropagation();
        emit('drop', { event, rowIndex: props.rowIndex, slotIndex: 0 });
        isDraggingOverRow.value = false;
    }
};

const handleEmptySlotDrop = (event) => {
    event.stopPropagation();
    emit('drop', { event, rowIndex: props.rowIndex, slotIndex: props.row.fields.length });
    isDraggingOverEmpty.value = false;
};

const isFieldSelected = (slotIndex) => {
    return props.selectedFieldIndex?.rowIndex === props.rowIndex &&
           props.selectedFieldIndex?.slotIndex === slotIndex;
};

const handleFieldClick = (slotIndex) => {
    emit('select-field', { rowIndex: props.rowIndex, slotIndex });
};

const handleRowClick = () => {
    emit('select-row', props.rowIndex);
};

const handleSubRowDrop = (event, subRowIndex) => {
    event.stopPropagation();
    emit('drop-subrow', { event, rowIndex: props.rowIndex, subRowIndex });
};

const getSubRowFieldWidth = (subRow, fieldIndex) => {
    const field = subRow.fields[fieldIndex];

    // If custom width is set, use it
    if (field.customWidth && field.customWidth > 0) {
        return field.customWidth;
    }

    // Otherwise calculate equal width based on sub-row's grid columns
    const gridColumns = subRow.gridColumns || 1;
    const equalWidth = 100 / gridColumns;

    return equalWidth;
};

const hasAnyFields = computed(() => {
    if (props.row.subRows && props.row.subRows.length > 0) {
        return props.row.subRows.some(subRow => subRow.fields && subRow.fields.length > 0);
    }
    return false;
});
</script>

<style scoped>
.form-row {
    position: relative;
}

/* Ensure all inputs and form controls stay within bounds */
.form-row :deep(input),
.form-row :deep(textarea),
.form-row :deep(select),
.form-row :deep(.p-inputtext),
.form-row :deep(.p-dropdown),
.form-row :deep(.p-multiselect) {
    max-width: 100%;
    box-sizing: border-box;
}

/* Prevent text selection while resizing */
.form-row.resizing {
    user-select: none;
}
</style>
