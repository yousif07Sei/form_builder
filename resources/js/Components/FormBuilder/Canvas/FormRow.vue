<template>
    <div class="form-row mb-4">
        <!-- Row container -->
        <div
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
                        class="h-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent transition-all overflow-hidden cursor-pointer"
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

                <!-- Invisible drop zone for additional field (only appears when dragging) -->
                <div
                    v-if="row.fields.length < maxSlots && isDraggingOverEmpty"
                    class="transition-all min-w-[80px] bg-primary-50 dark:bg-primary-900/20 border-2 border-dashed border-primary-400 dark:border-primary-500 rounded-lg"
                    :style="{ flexShrink: 0 }"
                >
                    <div class="flex items-center justify-center h-full py-4">
                        <i class="pi pi-plus text-primary-500"></i>
                    </div>
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
        default: 4
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

const emit = defineEmits(['drop', 'remove-field', 'select-field', 'select-row']);

const isDraggingOverRow = ref(false);
const isDraggingOverEmpty = ref(false);

// Get field width based on customWidth or equal distribution
const getFieldWidth = (index) => {
    const field = props.row.fields[index];

    // If custom width is set, use it
    if (field.customWidth !== undefined && field.customWidth > 0) {
        return field.customWidth;
    }

    // Otherwise calculate equal width based on number of fields
    // Count fields without custom widths
    const fieldsWithCustomWidth = props.row.fields.filter(f => f.customWidth !== undefined && f.customWidth > 0);
    const totalCustomWidth = fieldsWithCustomWidth.reduce((sum, f) => sum + (f.customWidth || 0), 0);
    const fieldsWithoutCustomWidth = props.row.fields.length - fieldsWithCustomWidth.length;

    if (fieldsWithoutCustomWidth > 0) {
        const remainingWidth = 100 - totalCustomWidth;
        return remainingWidth / fieldsWithoutCustomWidth;
    }

    // Fallback to equal distribution
    return 100 / props.row.fields.length;
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
    // Allow drag over if row is empty OR has space for more fields
    if (props.row.fields.length === 0) {
        isDraggingOverRow.value = true;
    } else if (props.row.fields.length < props.maxSlots) {
        isDraggingOverEmpty.value = true;
    }
};

const handleRowDragLeave = (event) => {
    isDraggingOverRow.value = false;
    isDraggingOverEmpty.value = false;
};

const handleRowDrop = (event) => {
    // Handle drop based on whether row is empty or has fields
    if (props.row.fields.length === 0) {
        event.stopPropagation();
        emit('drop', { event, rowIndex: props.rowIndex, slotIndex: 0 });
        isDraggingOverRow.value = false;
    } else if (props.row.fields.length < props.maxSlots) {
        // Add to end of row
        event.stopPropagation();
        emit('drop', { event, rowIndex: props.rowIndex, slotIndex: props.row.fields.length });
        isDraggingOverEmpty.value = false;
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
