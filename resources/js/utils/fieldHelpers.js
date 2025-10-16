// Helper functions for field rendering and manipulation
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';

/**
 * Get the PrimeVue component for a given field type
 */
export const getFieldComponent = (type) => {
    const components = {
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
    };
    return components[type] || InputText;
};

/**
 * Get props for a field component based on field configuration
 */
export const getFieldProps = (field) => {
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

    if (field.type === 'multiselect') {
        return {
            ...baseProps,
            options: field.options,
            placeholder: field.placeholder || 'Select options',
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

    if (field.type === 'tel') {
        return {
            ...baseProps,
            type: 'tel',
        };
    }

    if (field.type === 'url') {
        return {
            ...baseProps,
            type: 'url',
        };
    }

    if (field.type === 'password') {
        return {
            ...baseProps,
            type: 'password',
        };
    }

    if (field.type === 'location') {
        return {
            ...baseProps,
            type: 'text',
        };
    }

    if (field.type === 'textarea') {
        return {
            ...baseProps,
            rows: 3,
        };
    }

    if (field.type === 'time') {
        return {
            ...baseProps,
            timeOnly: true,
            showIcon: true,
        };
    }

    if (field.type === 'datetime') {
        return {
            ...baseProps,
            showTime: true,
            showIcon: true,
        };
    }

    if (field.type === 'file') {
        return {
            mode: 'basic',
            chooseLabel: field.placeholder || 'Choose File',
            class: 'w-full',
        };
    }

    if (field.type === 'image') {
        return {
            mode: 'basic',
            accept: 'image/*',
            chooseLabel: field.placeholder || 'Choose Image',
            class: 'w-full',
        };
    }

    return baseProps;
};

/**
 * Generate a unique field name
 */
export const generateFieldName = (type) => {
    return `${type}_${Date.now()}`;
};

/**
 * Generate a unique ID for fields
 */
export const generateUniqueId = () => {
    return Date.now() + Math.random();
};
