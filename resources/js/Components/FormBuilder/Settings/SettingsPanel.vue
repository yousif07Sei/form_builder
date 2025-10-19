<template>
    <div
        v-if="selectedFieldIndex !== null || selectedNestedPath !== null || showFormSettings"
        class="settings-panel-dark w-80 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 overflow-y-auto"
    >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 pb-0">
            <div>
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                    {{ showFormSettings ? 'Form Settings' : (selectedField ? selectedField.label : 'Settings') }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ showFormSettings ? 'Configure your form' : (selectedField ? selectedField.type : '') }}
                </p>
            </div>
            <Button
                icon="pi pi-times"
                text
                rounded
                @click="handleClose"
            />
        </div>

        <!-- Form Settings Content (with tabs) -->
        <div v-if="showFormSettings" class="p-4">
            <TabView>
                <TabPanel header="General">
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
                </TabPanel>
                <TabPanel header="Theme">
                    <div class="space-y-4">
                        <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded text-sm text-gray-600 dark:text-gray-400">
                            <i class="pi pi-info-circle mr-2"></i>
                            Theme customization options will be added here
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Primary Color
                            </label>
                            <InputText placeholder="#000000" class="w-full" disabled />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Background Color
                            </label>
                            <InputText placeholder="#ffffff" class="w-full" disabled />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Font Family
                            </label>
                            <Dropdown
                                :options="['Default', 'Arial', 'Helvetica', 'Times New Roman']"
                                placeholder="Select font"
                                class="w-full"
                                disabled
                            />
                        </div>
                    </div>
                </TabPanel>
            </TabView>
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

            <!-- Field-Specific Settings -->
            <div class="space-y-4">
                <!-- Settings for Structure Fields -->
                <template v-if="['container', 'tabs-container', '2-columns', '3-columns', '4-columns', 'grid-layout', 'table'].includes(selectedField.type)">
                    <!-- Container Settings -->
                    <template v-if="selectedField.type === 'container'">
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded">
                            <i class="pi pi-info-circle mr-2"></i>
                            Drag and drop fields from the left sidebar into this container
                        </div>
                        <div
                            v-if="selectedField.containerChildren && selectedField.containerChildren.length > 0"
                            class="mb-4"
                        >
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Contains {{ selectedField.containerChildren.length }} field(s)
                            </label>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <Textarea
                                :model-value="selectedField.containerDescription"
                                @update:model-value="updateField('containerDescription', $event)"
                                rows="2"
                                placeholder="Optional description or instructions for this container"
                                class="w-full"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Padding (px)
                            </label>
                            <InputText
                                :model-value="selectedField.containerPadding"
                                @update:model-value="updateField('containerPadding', parseInt($event) || 0)"
                                type="number"
                                min="0"
                                max="64"
                                class="w-full"
                            />
                        </div>
                        <div class="flex items-center gap-3">
                            <InputSwitch
                                :model-value="selectedField.containerBorder"
                                @update:model-value="updateField('containerBorder', $event)"
                                inputId="container_border"
                            />
                            <label for="container_border" class="text-sm text-gray-700 dark:text-gray-300">
                                Show Border
                            </label>
                        </div>
                    </template>

                    <!-- Tabs Container Settings -->
                    <template v-if="selectedField.type === 'tabs-container'">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tabs
                            </label>
                            <div class="space-y-2">
                                <div
                                    v-for="(tab, idx) in selectedField.tabs"
                                    :key="idx"
                                    class="flex gap-2"
                                >
                                    <InputText
                                        :model-value="tab.title"
                                        @update:model-value="updateTabTitle(idx, $event)"
                                        placeholder="Tab title"
                                        class="flex-1"
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        severity="danger"
                                        text
                                        @click="emit('remove-tab', idx)"
                                    />
                                </div>
                                <Button
                                    label="Add Tab"
                                    icon="pi pi-plus"
                                    size="small"
                                    outlined
                                    class="w-full"
                                    @click="emit('add-tab')"
                                />
                            </div>
                        </div>
                    </template>

                    <!-- Column Layout Settings (2, 3, 4 columns) -->
                    <template v-if="['2-columns', '3-columns', '4-columns'].includes(selectedField.type)">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gap Size (px)
                            </label>
                            <InputText
                                :model-value="selectedField.gap"
                                @update:model-value="updateField('gap', parseInt($event) || 0)"
                                type="number"
                                min="0"
                                max="64"
                                class="w-full"
                            />
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                            This layout has {{ selectedField.columns }} fixed columns
                        </div>
                    </template>

                    <!-- Grid Layout Settings -->
                    <template v-if="selectedField.type === 'grid-layout'">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Number of Columns
                            </label>
                            <InputText
                                :model-value="selectedField.columns"
                                @update:model-value="updateField('columns', parseInt($event) || 2)"
                                type="number"
                                min="1"
                                max="6"
                                class="w-full"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gap Size (px)
                            </label>
                            <InputText
                                :model-value="selectedField.gap"
                                @update:model-value="updateField('gap', parseInt($event) || 0)"
                                type="number"
                                min="0"
                                max="64"
                                class="w-full"
                            />
                        </div>
                    </template>

                    <!-- Table Settings -->
                    <template v-if="selectedField.type === 'table'">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Number of Rows
                            </label>
                            <InputText
                                :model-value="selectedField.rows"
                                @update:model-value="emit('update-table-rows', parseInt($event) || 1)"
                                type="number"
                                min="1"
                                max="20"
                                class="w-full"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Number of Columns
                            </label>
                            <InputText
                                :model-value="selectedField.tableColumns"
                                @update:model-value="emit('update-table-columns', parseInt($event) || 1)"
                                type="number"
                                min="1"
                                max="10"
                                class="w-full"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Headers
                            </label>
                            <div class="space-y-2">
                                <InputText
                                    v-for="(header, idx) in selectedField.headers"
                                    :key="idx"
                                    :model-value="header"
                                    @update:model-value="updateTableHeader(idx, $event)"
                                    :placeholder="`Header ${idx + 1}`"
                                    class="w-full"
                                />
                            </div>
                        </div>
                    </template>
                </template>

                <!-- Settings for Static HTML Fields -->
                <template v-else-if="['heading', 'paragraph', 'divider', 'spacer', 'html', 'button-primary', 'button-secondary', 'button-danger', 'button-submit', 'link', 'quote', 'image'].includes(selectedField.type)">
                    <!-- Label (for identification) -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Label *
                        </label>
                        <InputText :model-value="selectedField.label" @update:model-value="updateField('label', $event)" class="w-full" />
                    </div>

                    <!-- Heading Level (for heading only) -->
                    <div v-if="selectedField.type === 'heading'">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Heading Level
                        </label>
                        <Dropdown
                            :model-value="selectedField.headingLevel"
                            @update:model-value="updateField('headingLevel', $event)"
                            :options="['h1', 'h2', 'h3', 'h4', 'h5', 'h6']"
                            class="w-full"
                        />
                    </div>

                    <!-- Button Text (for buttons) -->
                    <div v-if="selectedField.type.startsWith('button-')">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Button Text
                        </label>
                        <InputText
                            :model-value="selectedField.content"
                            @update:model-value="updateField('content', $event)"
                            class="w-full"
                        />
                    </div>

                    <!-- Link Text (for link) -->
                    <div v-if="selectedField.type === 'link'">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Link Text
                        </label>
                        <InputText
                            :model-value="selectedField.content"
                            @update:model-value="updateField('content', $event)"
                            class="w-full"
                        />
                    </div>

                    <!-- URL (for link) -->
                    <div v-if="selectedField.type === 'link'">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            URL
                        </label>
                        <InputText
                            :model-value="selectedField.url"
                            @update:model-value="updateField('url', $event)"
                            type="url"
                            placeholder="https://example.com"
                            class="w-full"
                        />
                    </div>

                    <!-- Quote Text (for quote) -->
                    <div v-if="selectedField.type === 'quote'">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quote Text
                        </label>
                        <Textarea
                            :model-value="selectedField.content"
                            @update:model-value="updateField('content', $event)"
                            rows="3"
                            class="w-full"
                        />
                    </div>

                    <!-- Image Source (for image) -->
                    <div v-if="selectedField.type === 'image'">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Image URL
                        </label>
                        <InputText
                            :model-value="selectedField.imageSrc"
                            @update:model-value="updateField('imageSrc', $event)"
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            class="w-full"
                        />
                    </div>

                    <!-- Image Alt Text (for image) -->
                    <div v-if="selectedField.type === 'image'">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Alt Text
                        </label>
                        <InputText
                            :model-value="selectedField.imageAlt"
                            @update:model-value="updateField('imageAlt', $event)"
                            placeholder="Image description"
                            class="w-full"
                        />
                    </div>

                    <!-- Content (for heading, paragraph, html) -->
                    <div v-if="['heading', 'paragraph', 'html'].includes(selectedField.type)">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {{ selectedField.type === 'html' ? 'HTML Content' : 'Content' }}
                        </label>
                        <Textarea
                            :model-value="selectedField.content"
                            @update:model-value="updateField('content', $event)"
                            :rows="selectedField.type === 'html' ? 6 : 3"
                            class="w-full"
                        />
                    </div>

                    <!-- Height (for spacer only) -->
                    <div v-if="selectedField.type === 'spacer'">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Height (px)
                        </label>
                        <InputText
                            :model-value="selectedField.height"
                            @update:model-value="updateField('height', parseInt($event) || 20)"
                            type="number"
                            class="w-full"
                        />
                    </div>
                </template>

                <!-- Settings for Regular Form Fields -->
                <template v-else>
                    <!-- Label -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Label *
                        </label>
                        <InputText :model-value="selectedField.label" @update:model-value="updateField('label', $event)" class="w-full" />
                    </div>

                    <!-- Name -->
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
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputSwitch from 'primevue/inputswitch';
import Dropdown from 'primevue/dropdown';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';

const props = defineProps({
    selectedFieldIndex: {
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
    formData: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close', 'update:formData', 'update:field', 'add-tab', 'remove-tab', 'update-table-rows', 'update-table-columns', 'add-option', 'remove-option']);

const handleClose = () => {
    emit('close');
};

const updateFormData = (key, value) => {
    emit('update:formData', { ...props.formData, [key]: value });
};

const updateField = (key, value) => {
    emit('update:field', { ...props.selectedField, [key]: value });
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
