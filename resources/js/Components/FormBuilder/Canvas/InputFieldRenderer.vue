<template>
    <div class="space-y-2">
        <component
            :is="getFieldComponent(field.type)"
            v-bind="getFieldProps(field)"
            disabled
        />
    </div>
</template>

<script setup>
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import InputSwitch from 'primevue/inputswitch';

const props = defineProps({
    field: {
        type: Object,
        required: true
    }
});

/**
 * Get the appropriate PrimeVue component for the field type
 */
const getFieldComponent = (type) => {
    const componentMap = {
        text: InputText,
        email: InputText,
        number: InputText,
        tel: InputText,
        url: InputText,
        password: InputText,
        location: InputText,
        textarea: Textarea,
        select: Dropdown,
        multiselect: MultiSelect,
        radio: RadioButton,
        checkbox: Checkbox,
        date: Calendar,
        time: Calendar,
        datetime: Calendar,
        file: FileUpload,
        image: FileUpload,
        switch: InputSwitch
    };

    return componentMap[type] || InputText;
};

/**
 * Get the props for the field component
 */
const getFieldProps = (field) => {
    const baseProps = {
        modelValue: field.default_value || null,
        placeholder: field.placeholder || '',
        disabled: true
    };

    // Text-based inputs
    if (['text', 'email', 'tel', 'url', 'password', 'location'].includes(field.type)) {
        return {
            ...baseProps,
            type: field.type === 'location' ? 'text' : field.type
        };
    }

    // Number input
    if (field.type === 'number') {
        return {
            ...baseProps,
            type: 'number'
        };
    }

    // Textarea
    if (field.type === 'textarea') {
        return {
            ...baseProps,
            rows: field.rows || 4
        };
    }

    // Select/Dropdown
    if (field.type === 'select') {
        return {
            ...baseProps,
            options: field.options || [],
            optionLabel: (option) => option,
            optionValue: (option) => option
        };
    }

    // MultiSelect
    if (field.type === 'multiselect') {
        return {
            ...baseProps,
            options: field.options || [],
            optionLabel: (option) => option,
            optionValue: (option) => option,
            display: 'chip'
        };
    }

    // Radio buttons (rendered as group)
    if (field.type === 'radio' && field.options) {
        return {
            ...baseProps,
            options: field.options,
            name: field.name
        };
    }

    // Checkboxes (rendered as group)
    if (field.type === 'checkbox' && field.options) {
        return {
            ...baseProps,
            options: field.options,
            name: field.name
        };
    }

    // Date picker
    if (field.type === 'date') {
        return {
            ...baseProps,
            showIcon: true,
            dateFormat: 'yy-mm-dd'
        };
    }

    // Time picker
    if (field.type === 'time') {
        return {
            ...baseProps,
            showIcon: true,
            timeOnly: true
        };
    }

    // DateTime picker
    if (field.type === 'datetime') {
        return {
            ...baseProps,
            showIcon: true,
            showTime: true
        };
    }

    // File upload
    if (field.type === 'file') {
        return {
            mode: 'basic',
            chooseLabel: field.placeholder || 'Choose File',
            auto: false
        };
    }

    // Image upload
    if (field.type === 'image') {
        return {
            mode: 'basic',
            chooseLabel: field.placeholder || 'Choose Image',
            accept: 'image/*',
            auto: false
        };
    }

    // Switch/Toggle
    if (field.type === 'switch') {
        return {
            modelValue: field.default_value || false
        };
    }

    return baseProps;
};
</script>
