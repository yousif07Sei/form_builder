<template>
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div class="max-w-2xl mx-auto">
            <!-- Form Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {{ form.title }}
                </h1>
                <p v-if="form.description" class="text-lg text-gray-600 dark:text-gray-300">
                    {{ form.description }}
                </p>
            </div>

            <!-- Success Message -->
            <div v-if="$page.props.flash?.success" class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <i class="pi pi-check-circle mr-2"></i>
                {{ $page.props.flash.success }}
            </div>

            <!-- Form Card -->
            <Card>
                <template #content>
                    <form @submit.prevent="submitForm" class="space-y-6">
                        <!-- Render each field -->
                        <div
                            v-for="field in form.fields"
                            :key="field.id"
                            class="space-y-2"
                        >
                            <!-- Container field -->
                            <template v-if="field.type === 'container'">
                                <div
                                    class="rounded p-4"
                                    :class="{ 'border border-gray-300 dark:border-gray-600': field.metadata?.containerBorder }"
                                    :style="{ padding: (field.metadata?.containerPadding || 16) + 'px' }"
                                >
                                    <label class="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        {{ field.label }}
                                    </label>

                                    <!-- Container Description -->
                                    <div v-if="field.metadata?.containerDescription" class="mb-4 p-2 bg-primary-50 dark:bg-primary-900/20 rounded text-sm text-gray-600 dark:text-gray-400">
                                        <i class="pi pi-info-circle mr-1"></i>
                                        {{ field.metadata.containerDescription }}
                                    </div>

                                    <!-- Render nested fields -->
                                    <div class="space-y-4">
                                        <div
                                            v-for="nestedField in (field.metadata?.containerChildren || [])"
                                            :key="nestedField.tempId"
                                        >
                                            <!-- Check if nested field is a column layout -->
                                            <template v-if="nestedField.type === '2-columns' || nestedField.type === '3-columns' || nestedField.type === '4-columns' || nestedField.type === 'grid-layout'">
                                                <div>
                                                    <label class="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                                        {{ nestedField.label }}
                                                    </label>
                                                    <div
                                                        class="grid"
                                                        :style="{
                                                            gridTemplateColumns: `repeat(${nestedField.columns || 2}, 1fr)`,
                                                            gap: `${nestedField.gap || 16}px`
                                                        }"
                                                    >
                                                        <div
                                                            v-for="colIdx in (nestedField.columns || 2)"
                                                            :key="colIdx"
                                                            class="space-y-4"
                                                        >
                                                            <!-- Render fields for this column -->
                                                            <div
                                                                v-for="colField in getNestedColumnFields(nestedField, colIdx - 1)"
                                                                :key="colField.tempId"
                                                                class="space-y-2"
                                                            >
                                                                <label
                                                                    :for="colField.name"
                                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                                >
                                                                    {{ colField.label }}
                                                                    <span v-if="colField.is_required" class="text-red-500">*</span>
                                                                </label>

                                                                <!-- Render field inputs -->
                                                                <InputText
                                                                    v-if="colField.type === 'text'"
                                                                    :id="colField.name"
                                                                    v-model="formData[colField.name]"
                                                                    :placeholder="colField.placeholder"
                                                                    class="w-full"
                                                                    :class="{ 'p-invalid': errors[colField.name] }"
                                                                />

                                                                <InputText
                                                                    v-else-if="colField.type === 'email'"
                                                                    :id="colField.name"
                                                                    v-model="formData[colField.name]"
                                                                    type="email"
                                                                    :placeholder="colField.placeholder"
                                                                    class="w-full"
                                                                    :class="{ 'p-invalid': errors[colField.name] }"
                                                                />

                                                                <InputText
                                                                    v-else-if="colField.type === 'number'"
                                                                    :id="colField.name"
                                                                    v-model="formData[colField.name]"
                                                                    type="number"
                                                                    :placeholder="colField.placeholder"
                                                                    class="w-full"
                                                                    :class="{ 'p-invalid': errors[colField.name] }"
                                                                />

                                                                <Textarea
                                                                    v-else-if="colField.type === 'textarea'"
                                                                    :id="colField.name"
                                                                    v-model="formData[colField.name]"
                                                                    :placeholder="colField.placeholder"
                                                                    rows="4"
                                                                    class="w-full"
                                                                    :class="{ 'p-invalid': errors[colField.name] }"
                                                                />

                                                                <Dropdown
                                                                    v-else-if="colField.type === 'select'"
                                                                    :id="colField.name"
                                                                    v-model="formData[colField.name]"
                                                                    :options="colField.options"
                                                                    :placeholder="colField.placeholder || 'Select an option'"
                                                                    class="w-full"
                                                                    :class="{ 'p-invalid': errors[colField.name] }"
                                                                />

                                                                <!-- Help text -->
                                                                <small v-if="colField.help_text" class="text-gray-500 dark:text-gray-400">
                                                                    {{ colField.help_text }}
                                                                </small>

                                                                <!-- Error message -->
                                                                <small v-if="errors[colField.name]" class="p-error block">
                                                                    {{ errors[colField.name] }}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>

                                            <!-- Regular nested fields -->
                                            <template v-else>
                                                <div class="space-y-2">
                                                    <label
                                                        :for="nestedField.name"
                                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        {{ nestedField.label }}
                                                        <span v-if="nestedField.is_required" class="text-red-500">*</span>
                                                    </label>

                                                    <!-- Render nested field input -->
                                                    <InputText
                                                        v-if="nestedField.type === 'text'"
                                                        :id="nestedField.name"
                                                        v-model="formData[nestedField.name]"
                                                        :placeholder="nestedField.placeholder"
                                                        class="w-full"
                                                        :class="{ 'p-invalid': errors[nestedField.name] }"
                                                    />

                                                    <InputText
                                                        v-else-if="nestedField.type === 'email'"
                                                        :id="nestedField.name"
                                                        v-model="formData[nestedField.name]"
                                                        type="email"
                                                        :placeholder="nestedField.placeholder"
                                                        class="w-full"
                                                        :class="{ 'p-invalid': errors[nestedField.name] }"
                                                    />

                                                    <InputText
                                                        v-else-if="nestedField.type === 'number'"
                                                        :id="nestedField.name"
                                                        v-model="formData[nestedField.name]"
                                                        type="number"
                                                        :placeholder="nestedField.placeholder"
                                                        class="w-full"
                                                        :class="{ 'p-invalid': errors[nestedField.name] }"
                                                    />

                                                    <Textarea
                                                        v-else-if="nestedField.type === 'textarea'"
                                                        :id="nestedField.name"
                                                        v-model="formData[nestedField.name]"
                                                        :placeholder="nestedField.placeholder"
                                                        rows="4"
                                                        class="w-full"
                                                        :class="{ 'p-invalid': errors[nestedField.name] }"
                                                    />

                                                    <Dropdown
                                                        v-else-if="nestedField.type === 'select'"
                                                        :id="nestedField.name"
                                                        v-model="formData[nestedField.name]"
                                                        :options="nestedField.options"
                                                        :placeholder="nestedField.placeholder || 'Select an option'"
                                                        class="w-full"
                                                        :class="{ 'p-invalid': errors[nestedField.name] }"
                                                    />

                                                    <!-- Help text for nested field -->
                                                    <small v-if="nestedField.help_text" class="text-gray-500 dark:text-gray-400">
                                                        {{ nestedField.help_text }}
                                                    </small>

                                                    <!-- Error message for nested field -->
                                                    <small v-if="errors[nestedField.name]" class="p-error block">
                                                        {{ errors[nestedField.name] }}
                                                    </small>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </template>

                            <!-- Column layouts (2-columns, 3-columns, 4-columns, grid-layout) -->
                            <template v-else-if="field.type === '2-columns' || field.type === '3-columns' || field.type === '4-columns' || field.type === 'grid-layout'">
                                <div>
                                    <label class="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        {{ field.label }}
                                    </label>
                                    <div
                                        class="grid"
                                        :style="{
                                            gridTemplateColumns: `repeat(${field.metadata?.columns || 2}, 1fr)`,
                                            gap: `${field.metadata?.gap || 16}px`
                                        }"
                                    >
                                        <div
                                            v-for="colIdx in (field.metadata?.columns || 2)"
                                            :key="colIdx"
                                            class="space-y-4"
                                        >
                                            <!-- Render fields for this column -->
                                            <div
                                                v-for="nestedField in getColumnFieldsPublic(field, colIdx - 1)"
                                                :key="nestedField.tempId"
                                                class="space-y-2"
                                            >
                                                <label
                                                    :for="nestedField.name"
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    {{ nestedField.label }}
                                                    <span v-if="nestedField.is_required" class="text-red-500">*</span>
                                                </label>

                                                <!-- Render field inputs -->
                                                <InputText
                                                    v-if="nestedField.type === 'text'"
                                                    :id="nestedField.name"
                                                    v-model="formData[nestedField.name]"
                                                    :placeholder="nestedField.placeholder"
                                                    class="w-full"
                                                    :class="{ 'p-invalid': errors[nestedField.name] }"
                                                />

                                                <InputText
                                                    v-else-if="nestedField.type === 'email'"
                                                    :id="nestedField.name"
                                                    v-model="formData[nestedField.name]"
                                                    type="email"
                                                    :placeholder="nestedField.placeholder"
                                                    class="w-full"
                                                    :class="{ 'p-invalid': errors[nestedField.name] }"
                                                />

                                                <InputText
                                                    v-else-if="nestedField.type === 'number'"
                                                    :id="nestedField.name"
                                                    v-model="formData[nestedField.name]"
                                                    type="number"
                                                    :placeholder="nestedField.placeholder"
                                                    class="w-full"
                                                    :class="{ 'p-invalid': errors[nestedField.name] }"
                                                />

                                                <Textarea
                                                    v-else-if="nestedField.type === 'textarea'"
                                                    :id="nestedField.name"
                                                    v-model="formData[nestedField.name]"
                                                    :placeholder="nestedField.placeholder"
                                                    rows="4"
                                                    class="w-full"
                                                    :class="{ 'p-invalid': errors[nestedField.name] }"
                                                />

                                                <Dropdown
                                                    v-else-if="nestedField.type === 'select'"
                                                    :id="nestedField.name"
                                                    v-model="formData[nestedField.name]"
                                                    :options="nestedField.options"
                                                    :placeholder="nestedField.placeholder || 'Select an option'"
                                                    class="w-full"
                                                    :class="{ 'p-invalid': errors[nestedField.name] }"
                                                />

                                                <!-- Help text -->
                                                <small v-if="nestedField.help_text" class="text-gray-500 dark:text-gray-400">
                                                    {{ nestedField.help_text }}
                                                </small>

                                                <!-- Error message -->
                                                <small v-if="errors[nestedField.name]" class="p-error block">
                                                    {{ errors[nestedField.name] }}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>

                            <!-- Regular fields -->
                            <template v-else>
                                <label
                                    :for="field.name"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    {{ field.label }}
                                    <span v-if="field.is_required" class="text-red-500">*</span>
                                </label></template>

                            <!-- Text Input -->
                            <InputText
                                v-if="field.type === 'text'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Email Input -->
                            <InputText
                                v-else-if="field.type === 'email'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                type="email"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Number Input -->
                            <InputText
                                v-else-if="field.type === 'number'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                type="number"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Phone Number Input -->
                            <InputText
                                v-else-if="field.type === 'tel'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                type="tel"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- URL Input -->
                            <InputText
                                v-else-if="field.type === 'url'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                type="url"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Password Input -->
                            <InputText
                                v-else-if="field.type === 'password'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                type="password"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Location Input -->
                            <InputText
                                v-else-if="field.type === 'location'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                type="text"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Textarea -->
                            <Textarea
                                v-else-if="field.type === 'textarea'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :placeholder="field.placeholder"
                                rows="4"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Dropdown/Select -->
                            <Dropdown
                                v-else-if="field.type === 'select'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :options="field.options"
                                :placeholder="field.placeholder || 'Select an option'"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Multi Select -->
                            <MultiSelect
                                v-else-if="field.type === 'multiselect'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :options="field.options"
                                :placeholder="field.placeholder || 'Select options'"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Radio Buttons -->
                            <div v-else-if="field.type === 'radio'" class="space-y-2">
                                <div
                                    v-for="(option, idx) in field.options"
                                    :key="idx"
                                    class="flex items-center gap-2"
                                >
                                    <RadioButton
                                        :id="`${field.name}_${idx}`"
                                        v-model="formData[field.name]"
                                        :value="option"
                                    />
                                    <label
                                        :for="`${field.name}_${idx}`"
                                        class="text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        {{ option }}
                                    </label>
                                </div>
                            </div>

                            <!-- Checkboxes -->
                            <div v-else-if="field.type === 'checkbox'" class="space-y-2">
                                <div
                                    v-for="(option, idx) in field.options"
                                    :key="idx"
                                    class="flex items-center gap-2"
                                >
                                    <Checkbox
                                        :id="`${field.name}_${idx}`"
                                        v-model="formData[field.name]"
                                        :value="option"
                                    />
                                    <label
                                        :for="`${field.name}_${idx}`"
                                        class="text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        {{ option }}
                                    </label>
                                </div>
                            </div>

                            <!-- Date Picker -->
                            <Calendar
                                v-else-if="field.type === 'date'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                                showIcon
                            />

                            <!-- Time Picker -->
                            <Calendar
                                v-else-if="field.type === 'time'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                                timeOnly
                                showIcon
                            />

                            <!-- DateTime Picker -->
                            <Calendar
                                v-else-if="field.type === 'datetime'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                                showTime
                                showIcon
                            />

                            <!-- File Upload -->
                            <FileUpload
                                v-else-if="field.type === 'file'"
                                :id="field.name"
                                mode="basic"
                                :chooseLabel="field.placeholder || 'Choose File'"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Image Upload -->
                            <FileUpload
                                v-else-if="field.type === 'image'"
                                :id="field.name"
                                mode="basic"
                                accept="image/*"
                                :chooseLabel="field.placeholder || 'Choose Image'"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Help Text -->
                            <small v-if="field.help_text" class="text-gray-500 dark:text-gray-400">
                                {{ field.help_text }}
                            </small>

                            <!-- Error Message -->
                            <small v-if="errors[field.name]" class="p-error block">
                                {{ errors[field.name] }}
                            </small>
                        </div>

                        <!-- Export Code Button -->
                        <div class="flex justify-end pt-4">
                            <Button
                                label="Export Code"
                                icon="pi pi-code"
                                severity="help"
                                @click="showExportDialog = true"
                                size="large"
                            />
                        </div>
                    </form>
                </template>
            </Card>

            <!-- Footer -->
            <div class="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                Powered by FormBuilder
            </div>
        </div>

        <!-- Export Code Dialog -->
        <Dialog
            v-model:visible="showExportDialog"
            :style="{ width: '800px' }"
            header="Export Form Code"
            :modal="true"
            maximizable
        >
            <div class="space-y-4">
                <!-- Code Type Selector -->
                <div class="flex gap-2 mb-4">
                    <Button
                        :label="'Vue.js'"
                        :severity="exportType === 'vue' ? 'primary' : 'secondary'"
                        :outlined="exportType !== 'vue'"
                        size="small"
                        @click="exportType = 'vue'"
                    />
                    <Button
                        :label="'HTML'"
                        :severity="exportType === 'html' ? 'primary' : 'secondary'"
                        :outlined="exportType !== 'html'"
                        size="small"
                        @click="exportType = 'html'"
                    />
                    <Button
                        :label="'Laravel Blade'"
                        :severity="exportType === 'blade' ? 'primary' : 'secondary'"
                        :outlined="exportType !== 'blade'"
                        size="small"
                        @click="exportType = 'blade'"
                    />
                    <Button
                        :label="'Validation Rules'"
                        :severity="exportType === 'validation' ? 'primary' : 'secondary'"
                        :outlined="exportType !== 'validation'"
                        size="small"
                        @click="exportType = 'validation'"
                    />
                </div>

                <!-- Code Display -->
                <div class="relative">
                    <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[500px] text-sm"><code>{{ generatedCode }}</code></pre>
                    <Button
                        icon="pi pi-copy"
                        class="absolute top-2 right-2"
                        size="small"
                        @click="copyToClipboard"
                        v-tooltip.left="'Copy to clipboard'"
                    />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const props = defineProps({
    form: Object
});

const formData = ref({});
const errors = ref({});
const showExportDialog = ref(false);
const exportType = ref('vue');

// Helper function to get fields for a specific column
const getColumnFieldsPublic = (field, columnIndex) => {
    if (!field.metadata?.children) {
        return [];
    }
    return field.metadata.children.filter(child => child.columnIndex === columnIndex);
};

// Helper function to get fields for nested column layouts inside containers
const getNestedColumnFields = (nestedField, columnIndex) => {
    // For nested column layouts, check if children is stored directly or in metadata
    const children = nestedField.children || nestedField.metadata?.children;
    if (!children) {
        return [];
    }
    return children.filter(child => child.columnIndex === columnIndex);
};

// Initialize form data with checkbox and multiselect arrays
props.form.fields.forEach(field => {
    // Initialize nested fields inside containers
    if (field.type === 'container' && field.metadata?.containerChildren) {
        field.metadata.containerChildren.forEach(nestedField => {
            // Check if nested field is a column layout
            if (nestedField.type === '2-columns' || nestedField.type === '3-columns' || nestedField.type === '4-columns' || nestedField.type === 'grid-layout') {
                // Initialize fields inside the column layout
                const children = nestedField.children || nestedField.metadata?.children;
                if (children) {
                    children.forEach(colField => {
                        if (colField.type === 'checkbox' || colField.type === 'multiselect') {
                            formData.value[colField.name] = [];
                        } else {
                            formData.value[colField.name] = colField.default_value || null;
                        }
                    });
                }
            }
            // Regular nested field
            else if (nestedField.type === 'checkbox' || nestedField.type === 'multiselect') {
                formData.value[nestedField.name] = [];
            } else {
                formData.value[nestedField.name] = nestedField.default_value || null;
            }
        });
    }
    // Initialize nested fields inside column layouts
    else if ((field.type === '2-columns' || field.type === '3-columns' || field.type === '4-columns' || field.type === 'grid-layout') && field.metadata?.children) {
        field.metadata.children.forEach(nestedField => {
            if (nestedField.type === 'checkbox' || nestedField.type === 'multiselect') {
                formData.value[nestedField.name] = [];
            } else {
                formData.value[nestedField.name] = nestedField.default_value || null;
            }
        });
    }
    // Initialize regular fields
    else if (field.name) {
        if (field.type === 'checkbox' || field.type === 'multiselect') {
            formData.value[field.name] = [];
        } else {
            formData.value[field.name] = field.default_value || null;
        }
    }
});

// Code generation functions
const generateVueCode = () => {
    let template = `<template>\n  <form @submit.prevent="handleSubmit" class="space-y-6">\n`;

    props.form.fields.forEach(field => {
        template += `    <!-- ${field.label} -->\n`;
        template += `    <div class="space-y-2">\n`;
        template += `      <label for="${field.name}" class="block text-sm font-medium">\n`;
        template += `        ${field.label}${field.is_required ? '<span class="text-red-500">*</span>' : ''}\n`;
        template += `      </label>\n`;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'tel':
            case 'url':
            case 'password':
            case 'location':
                template += `      <InputText\n`;
                template += `        id="${field.name}"\n`;
                template += `        v-model="formData.${field.name}"\n`;
                const inputType = field.type === 'location' ? 'text' : field.type;
                if (field.type !== 'text') template += `        type="${inputType}"\n`;
                if (field.placeholder) template += `        placeholder="${field.placeholder}"\n`;
                template += `        class="w-full"\n`;
                template += `      />\n`;
                break;
            case 'textarea':
                template += `      <Textarea\n`;
                template += `        id="${field.name}"\n`;
                template += `        v-model="formData.${field.name}"\n`;
                if (field.placeholder) template += `        placeholder="${field.placeholder}"\n`;
                template += `        rows="4"\n`;
                template += `        class="w-full"\n`;
                template += `      />\n`;
                break;
            case 'select':
                template += `      <Dropdown\n`;
                template += `        id="${field.name}"\n`;
                template += `        v-model="formData.${field.name}"\n`;
                template += `        :options="${JSON.stringify(field.options || [])}"\n`;
                template += `        placeholder="${field.placeholder || 'Select an option'}"\n`;
                template += `        class="w-full"\n`;
                template += `      />\n`;
                break;
            case 'multiselect':
                template += `      <MultiSelect\n`;
                template += `        id="${field.name}"\n`;
                template += `        v-model="formData.${field.name}"\n`;
                template += `        :options="${JSON.stringify(field.options || [])}"\n`;
                template += `        placeholder="${field.placeholder || 'Select options'}"\n`;
                template += `        class="w-full"\n`;
                template += `      />\n`;
                break;
            case 'radio':
                template += `      <div class="space-y-2">\n`;
                (field.options || []).forEach((option, idx) => {
                    template += `        <div class="flex items-center gap-2">\n`;
                    template += `          <RadioButton id="${field.name}_${idx}" v-model="formData.${field.name}" value="${option}" />\n`;
                    template += `          <label for="${field.name}_${idx}">${option}</label>\n`;
                    template += `        </div>\n`;
                });
                template += `      </div>\n`;
                break;
            case 'checkbox':
                template += `      <div class="space-y-2">\n`;
                (field.options || []).forEach((option, idx) => {
                    template += `        <div class="flex items-center gap-2">\n`;
                    template += `          <Checkbox id="${field.name}_${idx}" v-model="formData.${field.name}" value="${option}" />\n`;
                    template += `          <label for="${field.name}_${idx}">${option}</label>\n`;
                    template += `        </div>\n`;
                });
                template += `      </div>\n`;
                break;
            case 'date':
                template += `      <Calendar\n`;
                template += `        id="${field.name}"\n`;
                template += `        v-model="formData.${field.name}"\n`;
                if (field.placeholder) template += `        placeholder="${field.placeholder}"\n`;
                template += `        showIcon\n`;
                template += `        class="w-full"\n`;
                template += `      />\n`;
                break;
            case 'time':
                template += `      <Calendar\n`;
                template += `        id="${field.name}"\n`;
                template += `        v-model="formData.${field.name}"\n`;
                if (field.placeholder) template += `        placeholder="${field.placeholder}"\n`;
                template += `        timeOnly\n`;
                template += `        showIcon\n`;
                template += `        class="w-full"\n`;
                template += `      />\n`;
                break;
            case 'datetime':
                template += `      <Calendar\n`;
                template += `        id="${field.name}"\n`;
                template += `        v-model="formData.${field.name}"\n`;
                if (field.placeholder) template += `        placeholder="${field.placeholder}"\n`;
                template += `        showTime\n`;
                template += `        showIcon\n`;
                template += `        class="w-full"\n`;
                template += `      />\n`;
                break;
            case 'file':
                template += `      <FileUpload\n`;
                template += `        mode="basic"\n`;
                template += `        id="${field.name}"\n`;
                template += `        chooseLabel="${field.placeholder || 'Choose File'}"\n`;
                template += `        class="w-full"\n`;
                template += `      />\n`;
                break;
            case 'image':
                template += `      <FileUpload\n`;
                template += `        mode="basic"\n`;
                template += `        id="${field.name}"\n`;
                template += `        accept="image/*"\n`;
                template += `        chooseLabel="${field.placeholder || 'Choose Image'}"\n`;
                template += `        class="w-full"\n`;
                template += `      />\n`;
                break;
        }

        if (field.help_text) {
            template += `      <small class="text-gray-500">${field.help_text}</small>\n`;
        }
        template += `    </div>\n\n`;
    });

    template += `    <Button type="submit" label="Submit" class="w-full" />\n`;
    template += `  </form>\n</template>\n\n`;
    template += `<script setup>\nimport { ref } from 'vue';\n\n`;
    template += `const formData = ref({\n`;
    props.form.fields.forEach(field => {
        template += `  ${field.name}: ${field.type === 'checkbox' || field.type === 'multiselect' ? '[]' : 'null'},\n`;
    });
    template += `});\n\n`;
    template += `const handleSubmit = () => {\n  console.log('Form data:', formData.value);\n};\n`;
    template += `<\/script>`;

    return template;
};

const generateHTMLCode = () => {
    let html = `<form class="space-y-6">\n`;

    props.form.fields.forEach(field => {
        html += `  <!-- ${field.label} -->\n`;
        html += `  <div class="space-y-2">\n`;
        html += `    <label for="${field.name}" class="block text-sm font-medium">\n`;
        html += `      ${field.label}${field.is_required ? '<span class="text-red-500">*</span>' : ''}\n`;
        html += `    </label>\n`;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'tel':
            case 'url':
            case 'password':
            case 'location':
                html += `    <input\n`;
                const htmlInputType = field.type === 'location' ? 'text' : field.type;
                html += `      type="${htmlInputType}"\n`;
                html += `      id="${field.name}"\n`;
                html += `      name="${field.name}"\n`;
                if (field.placeholder) html += `      placeholder="${field.placeholder}"\n`;
                html += `      class="w-full px-3 py-2 border border-gray-300 rounded-md"\n`;
                if (field.is_required) html += `      required\n`;
                html += `    />\n`;
                break;
            case 'textarea':
                html += `    <textarea\n`;
                html += `      id="${field.name}"\n`;
                html += `      name="${field.name}"\n`;
                if (field.placeholder) html += `      placeholder="${field.placeholder}"\n`;
                html += `      rows="4"\n`;
                html += `      class="w-full px-3 py-2 border border-gray-300 rounded-md"\n`;
                if (field.is_required) html += `      required\n`;
                html += `    ></textarea>\n`;
                break;
            case 'select':
                html += `    <select\n`;
                html += `      id="${field.name}"\n`;
                html += `      name="${field.name}"\n`;
                html += `      class="w-full px-3 py-2 border border-gray-300 rounded-md"\n`;
                if (field.is_required) html += `      required\n`;
                html += `    >\n`;
                html += `      <option value="">${field.placeholder || 'Select an option'}</option>\n`;
                (field.options || []).forEach(option => {
                    html += `      <option value="${option}">${option}</option>\n`;
                });
                html += `    </select>\n`;
                break;
            case 'multiselect':
                html += `    <select\n`;
                html += `      id="${field.name}"\n`;
                html += `      name="${field.name}[]"\n`;
                html += `      multiple\n`;
                html += `      class="w-full px-3 py-2 border border-gray-300 rounded-md"\n`;
                if (field.is_required) html += `      required\n`;
                html += `    >\n`;
                (field.options || []).forEach(option => {
                    html += `      <option value="${option}">${option}</option>\n`;
                });
                html += `    </select>\n`;
                break;
            case 'radio':
                html += `    <div class="space-y-2">\n`;
                (field.options || []).forEach((option, idx) => {
                    html += `      <div class="flex items-center gap-2">\n`;
                    html += `        <input type="radio" id="${field.name}_${idx}" name="${field.name}" value="${option}"${field.is_required ? ' required' : ''} />\n`;
                    html += `        <label for="${field.name}_${idx}">${option}</label>\n`;
                    html += `      </div>\n`;
                });
                html += `    </div>\n`;
                break;
            case 'checkbox':
                html += `    <div class="space-y-2">\n`;
                (field.options || []).forEach((option, idx) => {
                    html += `      <div class="flex items-center gap-2">\n`;
                    html += `        <input type="checkbox" id="${field.name}_${idx}" name="${field.name}[]" value="${option}" />\n`;
                    html += `        <label for="${field.name}_${idx}">${option}</label>\n`;
                    html += `      </div>\n`;
                });
                html += `    </div>\n`;
                break;
            case 'date':
                html += `    <input\n`;
                html += `      type="date"\n`;
                html += `      id="${field.name}"\n`;
                html += `      name="${field.name}"\n`;
                html += `      class="w-full px-3 py-2 border border-gray-300 rounded-md"\n`;
                if (field.is_required) html += `      required\n`;
                html += `    />\n`;
                break;
            case 'time':
                html += `    <input\n`;
                html += `      type="time"\n`;
                html += `      id="${field.name}"\n`;
                html += `      name="${field.name}"\n`;
                html += `      class="w-full px-3 py-2 border border-gray-300 rounded-md"\n`;
                if (field.is_required) html += `      required\n`;
                html += `    />\n`;
                break;
            case 'datetime':
                html += `    <input\n`;
                html += `      type="datetime-local"\n`;
                html += `      id="${field.name}"\n`;
                html += `      name="${field.name}"\n`;
                html += `      class="w-full px-3 py-2 border border-gray-300 rounded-md"\n`;
                if (field.is_required) html += `      required\n`;
                html += `    />\n`;
                break;
            case 'file':
                html += `    <input\n`;
                html += `      type="file"\n`;
                html += `      id="${field.name}"\n`;
                html += `      name="${field.name}"\n`;
                html += `      class="w-full px-3 py-2 border border-gray-300 rounded-md"\n`;
                if (field.is_required) html += `      required\n`;
                html += `    />\n`;
                break;
            case 'image':
                html += `    <input\n`;
                html += `      type="file"\n`;
                html += `      id="${field.name}"\n`;
                html += `      name="${field.name}"\n`;
                html += `      accept="image/*"\n`;
                html += `      class="w-full px-3 py-2 border border-gray-300 rounded-md"\n`;
                if (field.is_required) html += `      required\n`;
                html += `    />\n`;
                break;
        }

        if (field.help_text) {
            html += `    <small class="text-gray-500">${field.help_text}</small>\n`;
        }
        html += `  </div>\n\n`;
    });

    html += `  <button type="submit" class="w-full bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600">\n`;
    html += `    Submit\n`;
    html += `  </button>\n`;
    html += `</form>`;

    return html;
};

const generateBladeCode = () => {
    let blade = `<form method="POST" action="{{ route('form.submit') }}" enctype="multipart/form-data" class="space-y-6">\n`;
    blade += `  @csrf\n\n`;

    props.form.fields.forEach(field => {
        blade += `  <!-- ${field.label} -->\n`;
        blade += `  <div class="space-y-2">\n`;
        blade += `    <label for="${field.name}" class="block text-sm font-medium">\n`;
        blade += `      ${field.label}${field.is_required ? '<span class="text-red-500">*</span>' : ''}\n`;
        blade += `    </label>\n`;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'tel':
            case 'url':
            case 'password':
            case 'location':
                blade += `    <input\n`;
                const bladeInputType = field.type === 'location' ? 'text' : field.type;
                blade += `      type="${bladeInputType}"\n`;
                blade += `      id="${field.name}"\n`;
                blade += `      name="${field.name}"\n`;
                blade += `      value="{{ old('${field.name}') }}"\n`;
                if (field.placeholder) blade += `      placeholder="${field.placeholder}"\n`;
                blade += `      class="w-full px-3 py-2 border border-gray-300 rounded-md @error('${field.name}') border-red-500 @enderror"\n`;
                if (field.is_required) blade += `      required\n`;
                blade += `    />\n`;
                break;
            case 'textarea':
                blade += `    <textarea\n`;
                blade += `      id="${field.name}"\n`;
                blade += `      name="${field.name}"\n`;
                if (field.placeholder) blade += `      placeholder="${field.placeholder}"\n`;
                blade += `      rows="4"\n`;
                blade += `      class="w-full px-3 py-2 border border-gray-300 rounded-md @error('${field.name}') border-red-500 @enderror"\n`;
                if (field.is_required) blade += `      required\n`;
                blade += `    >{{ old('${field.name}') }}</textarea>\n`;
                break;
            case 'select':
                blade += `    <select\n`;
                blade += `      id="${field.name}"\n`;
                blade += `      name="${field.name}"\n`;
                blade += `      class="w-full px-3 py-2 border border-gray-300 rounded-md @error('${field.name}') border-red-500 @enderror"\n`;
                if (field.is_required) blade += `      required\n`;
                blade += `    >\n`;
                blade += `      <option value="">${field.placeholder || 'Select an option'}</option>\n`;
                (field.options || []).forEach(option => {
                    blade += `      <option value="${option}" {{ old('${field.name}') == '${option}' ? 'selected' : '' }}>${option}</option>\n`;
                });
                blade += `    </select>\n`;
                break;
            case 'multiselect':
                blade += `    <select\n`;
                blade += `      id="${field.name}"\n`;
                blade += `      name="${field.name}[]"\n`;
                blade += `      multiple\n`;
                blade += `      class="w-full px-3 py-2 border border-gray-300 rounded-md @error('${field.name}') border-red-500 @enderror"\n`;
                if (field.is_required) blade += `      required\n`;
                blade += `    >\n`;
                (field.options || []).forEach(option => {
                    blade += `      <option value="${option}" {{ in_array('${option}', old('${field.name}', [])) ? 'selected' : '' }}>${option}</option>\n`;
                });
                blade += `    </select>\n`;
                break;
            case 'radio':
                blade += `    <div class="space-y-2">\n`;
                (field.options || []).forEach((option, idx) => {
                    blade += `      <div class="flex items-center gap-2">\n`;
                    blade += `        <input type="radio" id="${field.name}_${idx}" name="${field.name}" value="${option}" {{ old('${field.name}') == '${option}' ? 'checked' : '' }}${field.is_required ? ' required' : ''} />\n`;
                    blade += `        <label for="${field.name}_${idx}">${option}</label>\n`;
                    blade += `      </div>\n`;
                });
                blade += `    </div>\n`;
                break;
            case 'checkbox':
                blade += `    <div class="space-y-2">\n`;
                (field.options || []).forEach((option, idx) => {
                    blade += `      <div class="flex items-center gap-2">\n`;
                    blade += `        <input type="checkbox" id="${field.name}_${idx}" name="${field.name}[]" value="${option}" {{ in_array('${option}', old('${field.name}', [])) ? 'checked' : '' }} />\n`;
                    blade += `        <label for="${field.name}_${idx}">${option}</label>\n`;
                    blade += `      </div>\n`;
                });
                blade += `    </div>\n`;
                break;
            case 'date':
                blade += `    <input\n`;
                blade += `      type="date"\n`;
                blade += `      id="${field.name}"\n`;
                blade += `      name="${field.name}"\n`;
                blade += `      value="{{ old('${field.name}') }}"\n`;
                blade += `      class="w-full px-3 py-2 border border-gray-300 rounded-md @error('${field.name}') border-red-500 @enderror"\n`;
                if (field.is_required) blade += `      required\n`;
                blade += `    />\n`;
                break;
            case 'time':
                blade += `    <input\n`;
                blade += `      type="time"\n`;
                blade += `      id="${field.name}"\n`;
                blade += `      name="${field.name}"\n`;
                blade += `      value="{{ old('${field.name}') }}"\n`;
                blade += `      class="w-full px-3 py-2 border border-gray-300 rounded-md @error('${field.name}') border-red-500 @enderror"\n`;
                if (field.is_required) blade += `      required\n`;
                blade += `    />\n`;
                break;
            case 'datetime':
                blade += `    <input\n`;
                blade += `      type="datetime-local"\n`;
                blade += `      id="${field.name}"\n`;
                blade += `      name="${field.name}"\n`;
                blade += `      value="{{ old('${field.name}') }}"\n`;
                blade += `      class="w-full px-3 py-2 border border-gray-300 rounded-md @error('${field.name}') border-red-500 @enderror"\n`;
                if (field.is_required) blade += `      required\n`;
                blade += `    />\n`;
                break;
            case 'file':
                blade += `    <input\n`;
                blade += `      type="file"\n`;
                blade += `      id="${field.name}"\n`;
                blade += `      name="${field.name}"\n`;
                blade += `      class="w-full px-3 py-2 border border-gray-300 rounded-md @error('${field.name}') border-red-500 @enderror"\n`;
                if (field.is_required) blade += `      required\n`;
                blade += `    />\n`;
                break;
            case 'image':
                blade += `    <input\n`;
                blade += `      type="file"\n`;
                blade += `      id="${field.name}"\n`;
                blade += `      name="${field.name}"\n`;
                blade += `      accept="image/*"\n`;
                blade += `      class="w-full px-3 py-2 border border-gray-300 rounded-md @error('${field.name}') border-red-500 @enderror"\n`;
                if (field.is_required) blade += `      required\n`;
                blade += `    />\n`;
                break;
        }

        blade += `    @error('${field.name}')\n`;
        blade += `      <small class="text-red-500">{{ $message }}</small>\n`;
        blade += `    @enderror\n`;

        if (field.help_text) {
            blade += `    <small class="text-gray-500">${field.help_text}</small>\n`;
        }
        blade += `  </div>\n\n`;
    });

    blade += `  <button type="submit" class="w-full bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600">\n`;
    blade += `    Submit\n`;
    blade += `  </button>\n`;
    blade += `</form>`;

    return blade;
};

const generateValidationRules = () => {
    let rules = `// Laravel Validation Rules\n`;
    rules += `$rules = [\n`;

    props.form.fields.forEach(field => {
        let fieldRules = [];

        if (field.is_required) {
            fieldRules.push('required');
        } else {
            fieldRules.push('nullable');
        }

        switch (field.type) {
            case 'email':
                fieldRules.push('email');
                break;
            case 'number':
                fieldRules.push('numeric');
                break;
            case 'date':
                fieldRules.push('date');
                break;
            case 'url':
                fieldRules.push('url');
                break;
            case 'tel':
                fieldRules.push('string');
                break;
            case 'password':
                fieldRules.push('string|min:8');
                break;
            case 'location':
                fieldRules.push('string');
                break;
            case 'checkbox':
                fieldRules.push('array');
                break;
            case 'multiselect':
                fieldRules.push('array');
                break;
            case 'time':
                fieldRules.push('date_format:H:i');
                break;
            case 'datetime':
                fieldRules.push('date');
                break;
            case 'file':
                fieldRules.push('file');
                break;
            case 'image':
                fieldRules.push('image');
                break;
        }

        if (field.validation_rules) {
            try {
                const customRules = JSON.parse(field.validation_rules);
                fieldRules = fieldRules.concat(customRules);
            } catch (e) {
                // Invalid JSON, skip
            }
        }

        rules += `    '${field.name}' => '${fieldRules.join('|')}',\n`;
    });

    rules += `];\n\n`;
    rules += `// Usage in controller:\n`;
    rules += `$validated = $request->validate($rules);`;

    return rules;
};

const generatedCode = computed(() => {
    switch (exportType.value) {
        case 'vue':
            return generateVueCode();
        case 'html':
            return generateHTMLCode();
        case 'blade':
            return generateBladeCode();
        case 'validation':
            return generateValidationRules();
        default:
            return '';
    }
});

const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode.value).then(() => {
        alert('Code copied to clipboard!');
    });
};
</script>
