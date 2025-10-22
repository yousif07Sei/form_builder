<template>
    <div
        v-if="selectedFieldIndex !== null || selectedRowIndex !== null || selectedNestedPath !== null || showFormSettings"
        class="settings-panel-dark w-80 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 overflow-y-auto overflow-x-hidden"
    >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 pb-0">
            <div class="flex-1 min-w-0 mr-2">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase truncate">
                    {{ showFormSettings ? 'Form Settings' : (selectedRow ? 'Row Settings' : (selectedField ? selectedField.label : 'Settings')) }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {{ showFormSettings ? 'Configure your form' : (selectedRow ? 'Configure row layout' : (selectedField ? selectedField.type : '')) }}
                </p>
            </div>
            <Button
                icon="pi pi-times"
                text
                rounded
                @click="handleClose"
            />
        </div>

        <!-- Form Settings Content -->
        <div v-if="showFormSettings" class="p-4">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Form Title
                    </label>
                    <InputText :model-value="formData.title" @update:model-value="updateFormData('title', $event)" class="w-full" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </label>
                    <Textarea :model-value="formData.description" @update:model-value="updateFormData('description', $event)" rows="3" class="w-full" />
                </div>
                <div class="flex items-center gap-3">
                    <InputSwitch :model-value="formData.is_active" @update:model-value="updateFormData('is_active', $event)" inputId="form_is_active" />
                    <label for="form_is_active" class="text-sm text-gray-700 dark:text-gray-300">
                        Form is active
                    </label>
                </div>
            </div>
        </div>

        <!-- Row Settings Content -->
        <div v-else-if="selectedRow" class="p-4 space-y-4">
            <!-- Show field width controls if row has fields -->
            <div v-if="selectedRow.fields && selectedRow.fields.length > 0">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Row Layout - {{ selectedRow.fields.length }} field{{ selectedRow.fields.length !== 1 ? 's' : '' }}
                </label>

                <!-- Field width breakdown -->
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
                    <div v-for="(field, index) in selectedRow.fields" :key="index">
                        Field {{ index + 1 }} ({{ field.label }}): <span class="font-medium">{{ getFieldWidth(index) }}%</span>
                    </div>
                </div>

                <!-- Slider - Only show for 2+ fields -->
                <div v-if="selectedRow.fields.length >= 2">
                    <Slider
                        :key="`slider-${selectedRowIndex}-${selectedRow.fields.length}`"
                        :modelValue="sliderValue"
                        @update:modelValue="onSliderChange"
                        :min="0"
                        :max="100"
                        :step="5"
                        :range="selectedRow.fields.length >= 3"
                        class="w-full mb-2"
                    />
                    <small class="text-gray-500 dark:text-gray-400 block">
                        <span v-if="selectedRow.fields.length === 2">
                            Drag handle to adjust field widths
                        </span>
                        <span v-else-if="selectedRow.fields.length === 3">
                            Left = Field 1 | Right = Field 3 (from right) | Middle auto-adjusts
                        </span>
                    </small>
                </div>

                <!-- No slider for single field -->
                <div v-else-if="selectedRow.fields.length === 1">
                    <small class="text-gray-500 dark:text-gray-400 block">
                        Single field takes full row width
                    </small>
                </div>
            </div>

            <div v-else>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Empty Row
                </label>
                <small class="text-gray-500 dark:text-gray-400 block mt-1">
                    Add fields to this row to adjust their widths
                </small>
            </div>
        </div>

        <!-- Field Settings Content -->
        <div v-else-if="selectedField" class="p-4 space-y-4">
            <!-- Properties Accordion - Only show for form fields (not structure/static) -->
            <Accordion
                v-if="!['container', 'tabs-container', '2-columns', '3-columns', '4-columns', 'grid-layout', 'table', 'heading', 'paragraph', 'divider', 'spacer', 'html', 'button-primary', 'button-secondary', 'button-danger', 'button-submit', 'link', 'quote', 'image'].includes(selectedField.type)"
                :activeIndex="0"
                :pt="{ root: { style: 'background: transparent' } }"
            >
                <AccordionTab header="Properties" :pt="{
                    root: { style: 'background: transparent' },
                    header: { style: 'background: transparent' },
                    headerAction: { style: 'background: transparent' },
                    headerLink: { style: 'background: transparent' },
                    content: { style: 'background: transparent' }
                }">
                    <div class="space-y-4">
                        <!-- Field Name/Label -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Label *
                            </label>
                            <InputText :model-value="selectedField.label" @update:model-value="updateField('label', $event)" class="w-full" />
                        </div>

                        <!-- Field Name -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Field Name *
                            </label>
                            <InputText :model-value="selectedField.name" @update:model-value="updateField('name', $event)" class="w-full" />
                        </div>

                        <!-- Placeholder -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Placeholder
                            </label>
                            <InputText :model-value="selectedField.placeholder" @update:model-value="updateField('placeholder', $event)" class="w-full" />
                        </div>

                        <!-- Help Text -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Help Text
                            </label>
                            <Textarea :model-value="selectedField.help_text" @update:model-value="updateField('help_text', $event)" rows="2" class="w-full" />
                        </div>

                        <!-- Field Width -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Field Width
                            </label>
                            <Dropdown
                                :model-value="selectedField.customWidth || Math.floor(100 / (selectedField.gridColumns || 1))"
                                @update:model-value="updateField('customWidth', $event)"
                                :options="widthOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Select width"
                                class="w-full"
                            />
                            <small class="text-gray-500 dark:text-gray-400 block mt-1">
                                Custom width percentage
                            </small>
                        </div>

                        <!-- Required -->
                        <div class="flex items-center gap-3">
                            <InputSwitch :model-value="selectedField.is_required" @update:model-value="updateField('is_required', $event)" inputId="is_required" />
                            <label for="is_required" class="text-sm text-gray-700 dark:text-gray-300">
                                Required field
                            </label>
                        </div>

                        <!-- Options for select, multiselect, radio, checkbox -->
                        <div v-if="['select', 'multiselect', 'radio', 'checkbox'].includes(selectedField.type)">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Options
                            </label>
                            <div class="space-y-2">
                                <div
                                    v-for="(option, idx) in selectedField.options"
                                    :key="idx"
                                    class="flex gap-2"
                                >
                                    <InputText
                                        :model-value="option"
                                        @update:model-value="updateOption(idx, $event)"
                                        placeholder="Option label"
                                        class="flex-1"
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        severity="danger"
                                        text
                                        @click="emit('remove-option', idx)"
                                    />
                                </div>
                                <Button
                                    label="Add Option"
                                    icon="pi pi-plus"
                                    size="small"
                                    outlined
                                    class="w-full"
                                    @click="emit('add-option')"
                                />
                            </div>
                        </div>
                    </div>
                </AccordionTab>
            </Accordion>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputSwitch from 'primevue/inputswitch';
import Slider from 'primevue/slider';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';

const props = defineProps({
    selectedFieldIndex: {
        type: [Number, Object], // Number (old) or Object { rowIndex, slotIndex } (row-based)
        default: null
    },
    selectedRowIndex: {
        type: Number,
        default: null
    },
    selectedNestedPath: {
        type: Object,
        default: null
    },
    showFormSettings: {
        type: Boolean,
        default: false
    },
    selectedField: {
        type: Object,
        default: null
    },
    selectedRow: {
        type: Object,
        default: null
    },
    formData: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close', 'update:formData', 'update:field', 'update:row', 'add-tab', 'remove-tab', 'update-table-rows', 'update-table-columns', 'add-option', 'remove-option']);

// Generate width options from 25% to 100% in 5% increments
const widthOptions = [];
for (let i = 25; i <= 100; i += 5) {
    widthOptions.push({
        label: `${i}%`,
        value: i
    });
}

// Get field width for a specific field
const getFieldWidth = (index) => {
    if (!props.selectedRow?.fields || !props.selectedRow.fields[index]) {
        return 25;
    }

    const field = props.selectedRow.fields[index];
    const totalFields = props.selectedRow.fields.length;

    // If custom width is set, use it
    if (field.customWidth !== undefined && field.customWidth > 0) {
        return field.customWidth;
    }

    // Otherwise calculate from all fields' widths
    // If some fields have customWidth, calculate remaining for fields without it
    const fieldsWithWidth = props.selectedRow.fields.filter(f => f.customWidth !== undefined && f.customWidth > 0);
    const totalCustomWidth = fieldsWithWidth.reduce((sum, f) => sum + (f.customWidth || 0), 0);
    const fieldsWithoutWidth = totalFields - fieldsWithWidth.length;

    if (fieldsWithoutWidth > 0) {
        const remainingWidth = 100 - totalCustomWidth;
        return Math.floor(remainingWidth / fieldsWithoutWidth);
    }

    // Fallback: equal distribution
    return Math.floor(100 / totalFields);
};

// Compute slider value from field widths
const sliderValue = computed(() => {
    if (!props.selectedRow?.fields) {
        return [0, 100];
    }

    const fieldCount = props.selectedRow.fields.length;

    if (fieldCount === 1) {
        // No slider for single field
        return 100;
    } else if (fieldCount === 2) {
        // Single handle - controls where the split is between Field 1 and Field 2
        const field1Width = getFieldWidth(0);

        console.log('[SettingsPanel] 2-field slider value:', {
            field1Width,
            field2Width: 100 - field1Width,
            sliderValue: field1Width
        });

        return field1Width;
    } else if (fieldCount === 3) {
        const field1Width = getFieldWidth(0);
        const field3Width = getFieldWidth(2);
        const rightHandle = 100 - field3Width;

        console.log('[SettingsPanel] 3-field slider values:', {
            field1Width,
            field3Width,
            leftHandle: field1Width,
            rightHandle,
            field2Width: rightHandle - field1Width
        });

        return [field1Width, rightHandle];
    }

    return [0, 100];
});

// Handle slider change
const onSliderChange = (newValue) => {
    if (!props.selectedRow?.fields) {
        return;
    }

    const fieldCount = props.selectedRow.fields.length;
    const updatedRow = { ...props.selectedRow };
    updatedRow.fields = updatedRow.fields.map(f => ({ ...f }));

    if (fieldCount === 1) {
        // Single field, no slider shown
        updatedRow.fields[0].customWidth = 100;
    } else if (fieldCount === 2) {
        // Single handle - value is where Field 1 ends / Field 2 starts
        const splitPoint = newValue; // Single value, not array
        updatedRow.fields[0].customWidth = splitPoint;
        updatedRow.fields[1].customWidth = 100 - splitPoint;
    } else if (fieldCount === 3) {
        // Range slider - two handles
        const [leftHandle, rightHandle] = newValue;
        // Left handle = Field 1 width
        // Right handle = where Field 3 starts, so Field 3 width = 100 - rightHandle
        // Field 2 = middle space
        const field3Width = 100 - rightHandle;
        updatedRow.fields[0].customWidth = leftHandle;
        updatedRow.fields[1].customWidth = rightHandle - leftHandle;
        updatedRow.fields[2].customWidth = field3Width;
    }

    emit('update:row', updatedRow);
};


const handleClose = () => {
    emit('close');
};

const updateFormData = (key, value) => {
    emit('update:formData', { ...props.formData, [key]: value });
};

const updateField = (key, value) => {
    emit('update:field', { ...props.selectedField, [key]: value });
};

const updateRow = (key, value) => {
    emit('update:row', { ...props.selectedRow, [key]: value });
};

// Helper method for updating tab titles
const updateTabTitle = (idx, value) => {
    const updatedTabs = [...props.selectedField.tabs];
    updatedTabs[idx] = { ...updatedTabs[idx], title: value };
    emit('update:field', { ...props.selectedField, tabs: updatedTabs });
};

// Helper method for updating table headers
const updateTableHeader = (idx, value) => {
    const updatedHeaders = [...props.selectedField.headers];
    updatedHeaders[idx] = value;
    emit('update:field', { ...props.selectedField, headers: updatedHeaders });
};

// Helper method for updating options
const updateOption = (idx, value) => {
    const updatedOptions = [...props.selectedField.options];
    updatedOptions[idx] = value;
    emit('update:field', { ...props.selectedField, options: updatedOptions });
};
</script>
