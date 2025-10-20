<template>
    <div class="space-y-2">
        <div
            class="rounded min-h-[100px] bg-gray-50 dark:bg-gray-800"
            :class="{
                'border-2 border-dashed border-primary-300 dark:border-primary-600': field.containerBorder
            }"
            :style="{ padding: (field.containerPadding || 16) + 'px' }"
            @dragover.prevent
            @drop="handleNestedDrop($event)"
        >
            <!-- Container Description -->
            <div v-if="field.containerDescription" class="mb-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded text-sm text-gray-600 dark:text-gray-400">
                <i class="pi pi-info-circle mr-1"></i>
                {{ field.containerDescription }}
            </div>

            <div v-if="!field.containerChildren || field.containerChildren.length === 0" class="text-center py-8">
                <i class="pi pi-inbox text-3xl text-gray-400 mb-2"></i>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Drop fields here
                </p>
            </div>
            <div v-else class="space-y-4">
                <div
                    v-for="(childField, childIdx) in field.containerChildren"
                    :key="childField.tempId || childField.id"
                    class="relative group"
                    :class="{ 'ring-2 ring-blue-500 rounded-lg p-2 -m-2': isNestedFieldSelected(childIdx) }"
                    @click.stop="$emit('select-field', { childIndex: childIdx })"
                >
                    <!-- Delete button for nested field -->
                    <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            rounded
                            size="small"
                            @click.stop="$emit('remove-field', { childIdx })"
                        />
                    </div>

                    <!-- Render column layouts (if nested) -->
                    <template v-if="childField.type === '2-columns' || childField.type === '3-columns' || childField.type === '4-columns' || childField.type === 'grid-layout'">
                        <ColumnLayoutField
                            :field="childField"
                            :field-index="childIdx"
                            :is-nested-field-selected="(colIdx, colChildIdx) => isColumnFieldSelected(childIdx, colIdx, colChildIdx)"
                            :get-field-component="getFieldComponent"
                            :get-field-props="getFieldProps"
                            :get-column-fields="getColumnFields"
                            @column-drop="handleColumnDrop($event, childField)"
                            @select-field="(payload) => $emit('select-column-field', { childIdx, ...payload })"
                            @remove-field="(payload) => $emit('remove-column-field', { childField, ...payload })"
                        />
                    </template>

                    <!-- Render regular fields -->
                    <template v-else>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {{ childField.label }}
                                <span v-if="childField.is_required" class="text-red-500">*</span>
                            </label>
                            <component
                                :is="getFieldComponent(childField.type)"
                                v-bind="getFieldProps(childField)"
                                disabled
                            />
                            <small v-if="childField.help_text" class="text-gray-500 dark:text-gray-400 block">
                                {{ childField.help_text }}
                            </small>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import ColumnLayoutField from './ColumnLayoutField.vue';

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
    isColumnFieldSelected: {
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

const emit = defineEmits(['nested-drop', 'select-field', 'remove-field', 'select-column-field', 'remove-column-field', 'column-drop']);

const handleNestedDrop = (event) => {
    emit('nested-drop', { event });
};

const handleColumnDrop = (payload, childField) => {
    emit('column-drop', { ...payload, childField });
};
</script>
