<template>
    <div
        class="space-y-2 relative group"
        :class="{ 'ring-2 ring-blue-500 rounded-lg p-2 -m-2': isSelected }"
        @click.stop="$emit('select')"
    >
        <!-- Drag Handle - Only visible on hover -->
        <div class="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <i class="pi pi-bars drag-handle cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"></i>
        </div>

        <!-- Delete Button - Only visible on hover -->
        <div class="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="small"
                @click.stop="$emit('delete')"
            />
        </div>

        <!-- Label -->
        <label
            :for="field.name || `field-${fieldIndex}`"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
            {{ field.label }}
            <span v-if="field.is_required" class="text-red-500">*</span>
        </label>

        <!-- Field Preview -->
        <div class="mt-2">
            <!-- Static/Content Fields -->
            <StaticContentField
                v-if="isStaticField(field.type)"
                :field="field"
                :field-index="fieldIndex"
            />

            <!-- Structure Fields -->
            <ContainerField
                v-else-if="field.type === 'container'"
                :field="field"
                :field-index="fieldIndex"
                :is-nested-field-selected="isNestedFieldSelected"
                :is-column-field-selected="isColumnFieldSelected"
                :get-field-component="getFieldComponent"
                :get-field-props="getFieldProps"
                :get-column-fields="getColumnFields"
                @nested-drop="$emit('nested-drop', $event)"
                @select-field="$emit('select-field', $event)"
                @remove-field="$emit('remove-field', $event)"
                @select-column-field="$emit('select-column-field', $event)"
                @remove-column-field="$emit('remove-column-field', $event)"
                @column-drop="$emit('column-drop', $event)"
            />

            <TabsContainerField
                v-else-if="field.type === 'tabs-container'"
                :field="field"
                :field-index="fieldIndex"
                :is-nested-field-selected="isNestedFieldSelected"
                :get-field-component="getFieldComponent"
                :get-field-props="getFieldProps"
                @nested-drop="$emit('nested-drop', $event)"
                @select-field="$emit('select-field', $event)"
                @remove-field="$emit('remove-field', $event)"
            />

            <ColumnLayoutField
                v-else-if="['2-columns', '3-columns', '4-columns', 'grid-layout'].includes(field.type)"
                :field="field"
                :field-index="fieldIndex"
                :is-nested-field-selected="isNestedFieldSelected"
                :get-field-component="getFieldComponent"
                :get-field-props="getFieldProps"
                :get-column-fields="getColumnFields"
                @column-drop="$emit('column-drop', $event)"
                @select-field="$emit('select-field', $event)"
                @remove-field="$emit('remove-field', $event)"
            />

            <!-- Table Field -->
            <template v-else-if="field.type === 'table'">
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                            <tr class="bg-gray-100 dark:bg-gray-700">
                                <th
                                    v-for="(header, hIdx) in field.headers"
                                    :key="hIdx"
                                    class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium"
                                >
                                    {{ header }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, rIdx) in field.tableData" :key="rIdx">
                                <td
                                    v-for="(cell, cIdx) in row"
                                    :key="cIdx"
                                    class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm"
                                >
                                    {{ cell }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>

            <!-- Input Fields -->
            <InputFieldRenderer
                v-else
                :field="field"
            />
        </div>

        <!-- Help Text -->
        <small v-if="field.help_text" class="text-gray-500 dark:text-gray-400 block mt-1">
            {{ field.help_text }}
        </small>
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import StaticContentField from './StaticContentField.vue';
import InputFieldRenderer from './InputFieldRenderer.vue';
import ContainerField from './ContainerField.vue';
import ColumnLayoutField from './ColumnLayoutField.vue';
import TabsContainerField from './TabsContainerField.vue';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    fieldIndex: {
        type: Number,
        required: true
    },
    isSelected: {
        type: Boolean,
        default: false
    },
    isNestedFieldSelected: {
        type: Function,
        default: () => false
    },
    isColumnFieldSelected: {
        type: Function,
        default: () => false
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
        default: () => []
    },
    removeColumnField: {
        type: Function,
        default: () => {}
    }
});

defineEmits([
    'select',
    'delete',
    'select-field',
    'nested-drop',
    'column-drop',
    'remove-field',
    'select-column-field',
    'remove-column-field'
]);

/**
 * Check if field is a static/content field
 */
const isStaticField = (type) => {
    return [
        'heading',
        'paragraph',
        'divider',
        'spacer',
        'html',
        'button-primary',
        'button-secondary',
        'button-danger',
        'button-submit',
        'link',
        'quote',
        'image'
    ].includes(type);
};
</script>
