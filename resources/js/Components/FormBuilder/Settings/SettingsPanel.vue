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
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grid Columns
                </label>
                <div class="flex gap-2">
                    <div
                        v-for="col in [1, 2, 3, 4]"
                        :key="col"
                        class="flex items-center"
                    >
                        <RadioButton
                            :inputId="`rowGridCol${col}`"
                            name="rowGridColumns"
                            :value="col"
                            :model-value="selectedRow.gridColumns || 1"
                            @update:model-value="updateRow('gridColumns', $event)"
                        />
                        <label
                            :for="`rowGridCol${col}`"
                            class="ml-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                            {{ col }}
                        </label>
                    </div>
                </div>
                <small class="text-gray-500 dark:text-gray-400 block mt-1">
                    Number of equal-width columns in this row
                </small>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grid Rows
                </label>
                <div class="flex gap-2">
                    <div
                        v-for="rowCount in [1, 2, 3, 4]"
                        :key="rowCount"
                        class="flex items-center"
                    >
                        <RadioButton
                            :inputId="`gridRow${rowCount}`"
                            name="gridRows"
                            :value="rowCount"
                            :model-value="selectedRow.gridRows || 1"
                            @update:model-value="updateRow('gridRows', $event)"
                        />
                        <label
                            :for="`gridRow${rowCount}`"
                            class="ml-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                            {{ rowCount }}
                        </label>
                    </div>
                </div>
                <small class="text-gray-500 dark:text-gray-400 block mt-1">
                    Split this row into multiple rows
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
import RadioButton from 'primevue/radiobutton';
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
