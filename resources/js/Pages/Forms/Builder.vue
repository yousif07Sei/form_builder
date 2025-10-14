<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Top Bar -->
        <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <Button
                        icon="pi pi-arrow-left"
                        text
                        @click="router.visit('/forms')"
                    />
                    <div>
                        <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ formData.title }}</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Form Builder</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <Button
                        label="Preview"
                        icon="pi pi-eye"
                        severity="secondary"
                        outlined
                        @click="previewForm"
                    />
                    <Button
                        label="Save Form"
                        icon="pi pi-save"
                        :loading="saving"
                        @click="saveForm"
                    />
                </div>
            </div>
        </div>

        <div class="flex h-[calc(100vh-73px)]">
            <!-- Left Sidebar - Field Palette -->
            <div class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase">
                    Field Types
                </h3>
                <div class="space-y-2">
                    <div
                        v-for="fieldType in fieldTypes"
                        :key="fieldType.type"
                        class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        draggable="true"
                        @dragstart="onDragStart(fieldType)"
                    >
                        <div class="flex items-center gap-2">
                            <i :class="fieldType.icon" class="text-gray-600 dark:text-gray-400"></i>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ fieldType.label }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Center - Form Builder Canvas -->
            <div class="flex-1 p-6 overflow-y-auto">
                <div class="max-w-3xl mx-auto">
                    <!-- Form Settings -->
                    <Card class="mb-6">
                        <template #content>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Form Title
                                    </label>
                                    <InputText v-model="formData.title" class="w-full" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <Textarea v-model="formData.description" rows="2" class="w-full" />
                                </div>
                                <div class="flex items-center gap-3">
                                    <InputSwitch v-model="formData.is_active" inputId="is_active" />
                                    <label for="is_active" class="text-sm text-gray-700 dark:text-gray-300">
                                        Form is active
                                    </label>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Drop Zone -->
                    <div
                        class="min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6"
                        :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isDragging }"
                        @dragover.prevent="isDragging = true"
                        @dragleave="isDragging = false"
                        @drop.prevent="onDrop"
                    >
                        <div v-if="fields.length === 0" class="text-center py-12">
                            <i class="pi pi-inbox text-6xl text-gray-400 mb-4"></i>
                            <p class="text-gray-600 dark:text-gray-400">
                                Drag and drop fields here to build your form
                            </p>
                        </div>

                        <!-- Fields List -->
                        <draggable
                            v-model="fields"
                            :item-key="(item) => item.id || item.tempId"
                            handle=".drag-handle"
                            class="space-y-4"
                        >
                            <template #item="{ element, index }">
                                <div
                                    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                    :class="{ 'ring-2 ring-blue-500': selectedFieldIndex === index }"
                                    @click="selectField(index)"
                                >
                                    <div class="flex items-start gap-3">
                                        <i class="pi pi-bars drag-handle cursor-move text-gray-400 mt-1"></i>
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2 mb-2">
                                                <i :class="getFieldIcon(element.type)" class="text-gray-600"></i>
                                                <span class="font-medium text-gray-900 dark:text-white">
                                                    {{ element.label }}
                                                </span>
                                                <Tag v-if="element.is_required" value="Required" severity="danger" class="text-xs" />
                                            </div>
                                            <p v-if="element.help_text" class="text-sm text-gray-500 mb-2">
                                                {{ element.help_text }}
                                            </p>
                                            <!-- Field Preview -->
                                            <div class="mt-2">
                                                <component
                                                    :is="getFieldComponent(element.type)"
                                                    v-bind="getFieldProps(element)"
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            icon="pi pi-trash"
                                            severity="danger"
                                            text
                                            rounded
                                            @click.stop="removeField(index)"
                                        />
                                    </div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
            </div>

            <!-- Right Sidebar - Field Editor -->
            <div
                v-if="selectedFieldIndex !== null"
                class="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto"
            >
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Field Settings
                    </h3>
                    <Button
                        icon="pi pi-times"
                        text
                        rounded
                        @click="selectedFieldIndex = null"
                    />
                </div>

                <div v-if="selectedField" class="space-y-4">
                    <!-- Label -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Label *
                        </label>
                        <InputText v-model="selectedField.label" class="w-full" />
                    </div>

                    <!-- Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Field Name *
                        </label>
                        <InputText v-model="selectedField.name" class="w-full" />
                    </div>

                    <!-- Placeholder -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Placeholder
                        </label>
                        <InputText v-model="selectedField.placeholder" class="w-full" />
                    </div>

                    <!-- Help Text -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Help Text
                        </label>
                        <Textarea v-model="selectedField.help_text" rows="2" class="w-full" />
                    </div>

                    <!-- Required -->
                    <div class="flex items-center gap-3">
                        <InputSwitch v-model="selectedField.is_required" inputId="is_required" />
                        <label for="is_required" class="text-sm text-gray-700 dark:text-gray-300">
                            Required field
                        </label>
                    </div>

                    <!-- Options for select, radio, checkbox -->
                    <div v-if="['select', 'radio', 'checkbox'].includes(selectedField.type)">
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
                                    v-model="selectedField.options[idx]"
                                    placeholder="Option label"
                                    class="flex-1"
                                />
                                <Button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    text
                                    @click="removeOption(idx)"
                                />
                            </div>
                            <Button
                                label="Add Option"
                                icon="pi pi-plus"
                                size="small"
                                outlined
                                class="w-full"
                                @click="addOption"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import draggable from 'vuedraggable';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputSwitch from 'primevue/inputswitch';
import Dropdown from 'primevue/dropdown';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';

const props = defineProps({
    form: Object
});

const formData = ref({
    title: props.form.title,
    description: props.form.description,
    is_active: props.form.is_active,
});

const fields = ref(props.form.fields || []);
const selectedFieldIndex = ref(null);
const isDragging = ref(false);
const saving = ref(false);

const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: 'pi pi-align-left' },
    { type: 'email', label: 'Email', icon: 'pi pi-at' },
    { type: 'number', label: 'Number', icon: 'pi pi-hashtag' },
    { type: 'textarea', label: 'Text Area', icon: 'pi pi-align-justify' },
    { type: 'select', label: 'Dropdown', icon: 'pi pi-chevron-down' },
    { type: 'radio', label: 'Radio Buttons', icon: 'pi pi-circle' },
    { type: 'checkbox', label: 'Checkboxes', icon: 'pi pi-check-square' },
    { type: 'date', label: 'Date Picker', icon: 'pi pi-calendar' },
];

const selectedField = computed(() => {
    return selectedFieldIndex.value !== null ? fields.value[selectedFieldIndex.value] : null;
});

const onDragStart = (fieldType) => {
    // Store field type in drag data
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('fieldType', JSON.stringify(fieldType));
};

const onDrop = (event) => {
    isDragging.value = false;
    const fieldType = JSON.parse(event.dataTransfer.getData('fieldType'));

    const newField = {
        tempId: Date.now(), // Use tempId for UI, not database id
        type: fieldType.type,
        label: fieldType.label,
        name: fieldType.type + '_' + Date.now(),
        placeholder: '',
        default_value: '',
        validation_rules: {},
        options: fieldType.type === 'select' || fieldType.type === 'radio' || fieldType.type === 'checkbox'
            ? ['Option 1', 'Option 2']
            : null,
        is_required: false,
        help_text: '',
    };

    fields.value.push(newField);
    selectedFieldIndex.value = fields.value.length - 1;
};

const selectField = (index) => {
    selectedFieldIndex.value = index;
};

const removeField = (index) => {
    fields.value.splice(index, 1);
    if (selectedFieldIndex.value === index) {
        selectedFieldIndex.value = null;
    }
};

const addOption = () => {
    if (!selectedField.value.options) {
        selectedField.value.options = [];
    }
    selectedField.value.options.push('New Option');
};

const removeOption = (index) => {
    selectedField.value.options.splice(index, 1);
};

const getFieldIcon = (type) => {
    const field = fieldTypes.find(f => f.type === type);
    return field ? field.icon : 'pi pi-question';
};

const getFieldComponent = (type) => {
    const components = {
        text: InputText,
        email: InputText,
        number: InputText,
        textarea: Textarea,
        select: Dropdown,
        radio: RadioButton,
        checkbox: Checkbox,
        date: Calendar,
    };
    return components[type] || InputText;
};

const getFieldProps = (field) => {
    const baseProps = {
        placeholder: field.placeholder,
        class: 'w-full',
    };

    if (field.type === 'select') {
        return {
            ...baseProps,
            options: field.options,
            placeholder: field.placeholder || 'Select an option',
        };
    }

    if (field.type === 'number') {
        return {
            ...baseProps,
            type: 'number',
        };
    }

    if (field.type === 'email') {
        return {
            ...baseProps,
            type: 'email',
        };
    }

    if (field.type === 'textarea') {
        return {
            ...baseProps,
            rows: 3,
        };
    }

    return baseProps;
};

const saveForm = () => {
    saving.value = true;

    router.put(`/forms/${props.form.id}`, {
        ...formData.value,
        fields: fields.value,
    }, {
        onSuccess: () => {
            saving.value = false;
        },
        onError: () => {
            saving.value = false;
        },
    });
};

const previewForm = () => {
    window.open(`/f/${props.form.slug}`, '_blank');
};
</script>
