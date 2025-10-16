// Field type definitions and configurations

export const inputFieldTypes = [
    { type: 'text', label: 'Text Input', icon: 'pi pi-align-left' },
    { type: 'email', label: 'Email', icon: 'pi pi-at' },
    { type: 'number', label: 'Number', icon: 'pi pi-hashtag' },
    { type: 'tel', label: 'Phone Number', icon: 'pi pi-phone' },
    { type: 'url', label: 'URL', icon: 'pi pi-link' },
    { type: 'password', label: 'Password', icon: 'pi pi-lock' },
    { type: 'location', label: 'Location', icon: 'pi pi-map-marker' },
    { type: 'textarea', label: 'Text Area', icon: 'pi pi-align-justify' },
    { type: 'select', label: 'Dropdown', icon: 'pi pi-chevron-down' },
    { type: 'multiselect', label: 'Multi Select', icon: 'pi pi-list' },
    { type: 'radio', label: 'Radio Buttons', icon: 'pi pi-circle' },
    { type: 'checkbox', label: 'Checkboxes', icon: 'pi pi-check-square' },
    { type: 'date', label: 'Date Picker', icon: 'pi pi-calendar' },
    { type: 'time', label: 'Time Picker', icon: 'pi pi-clock' },
    { type: 'datetime', label: 'Date Time Picker', icon: 'pi pi-calendar-clock' },
    { type: 'file', label: 'File Upload', icon: 'pi pi-file' },
    { type: 'image', label: 'Image Upload', icon: 'pi pi-image' },
];

export const staticHtmlFieldTypes = [
    { type: 'heading', label: 'Heading', icon: 'pi pi-bookmark' },
    { type: 'paragraph', label: 'Paragraph', icon: 'pi pi-align-left' },
    { type: 'divider', label: 'Divider', icon: 'pi pi-minus' },
    { type: 'spacer', label: 'Spacer', icon: 'pi pi-arrows-v' },
    { type: 'html', label: 'Custom HTML', icon: 'pi pi-code' },
    { type: 'button-primary', label: 'Primary Button', icon: 'pi pi-check-circle' },
    { type: 'button-secondary', label: 'Secondary Button', icon: 'pi pi-circle' },
    { type: 'button-danger', label: 'Danger Button', icon: 'pi pi-times-circle' },
    { type: 'button-submit', label: 'Submit Button', icon: 'pi pi-send' },
    { type: 'link', label: 'Link', icon: 'pi pi-external-link' },
    { type: 'quote', label: 'Quote', icon: 'pi pi-comment' },
    { type: 'image', label: 'Image', icon: 'pi pi-image' },
];

export const structureFieldTypes = [
    { type: 'container', label: 'Container', icon: 'pi pi-box' },
    { type: 'tabs-container', label: 'Tabs Container', icon: 'pi pi-window-maximize' },
    { type: '2-columns', label: '2 Columns', icon: 'pi pi-table' },
    { type: '3-columns', label: '3 Columns', icon: 'pi pi-table' },
    { type: '4-columns', label: '4 Columns', icon: 'pi pi-table' },
    { type: 'grid-layout', label: 'Grid Layout', icon: 'pi pi-th-large' },
    { type: 'table', label: 'Table', icon: 'pi pi-table' },
];

// Check if a field type is a static HTML field
export const isStaticField = (type) => {
    return ['heading', 'paragraph', 'divider', 'spacer', 'html', 'button-primary', 'button-secondary', 'button-danger', 'button-submit', 'link', 'quote', 'image'].includes(type);
};

// Check if a field type is a structure field
export const isStructureField = (type) => {
    return ['container', 'tabs-container', '2-columns', '3-columns', '4-columns', 'grid-layout', 'table'].includes(type);
};

// Check if a field type is a column layout
export const isColumnLayout = (type) => {
    return ['2-columns', '3-columns', '4-columns', 'grid-layout'].includes(type);
};

// Get default properties for a field type
export const getDefaultFieldProperties = (fieldType) => {
    const type = fieldType.type;
    const isStatic = isStaticField(type);
    const isStructure = isStructureField(type);

    const baseProps = {
        tempId: Date.now(),
        type: type,
        label: fieldType.label,
        name: (isStatic || isStructure) ? null : type + '_' + Date.now(),
        placeholder: (isStatic || isStructure) ? null : '',
        default_value: (isStatic || isStructure) ? null : '',
        validation_rules: {},
        is_required: false,
        help_text: (isStatic || isStructure) ? null : '',
    };

    // Add options for select/multiselect/radio/checkbox
    if (['select', 'multiselect', 'radio', 'checkbox'].includes(type)) {
        baseProps.options = ['Option 1', 'Option 2'];
    }

    // Add content field for static HTML types
    if (isStatic) {
        baseProps.content =
            type === 'heading' ? 'Heading Text' :
            type === 'paragraph' ? 'Paragraph text goes here...' :
            type === 'html' ? '<div>Custom HTML</div>' :
            type === 'link' ? 'Link Text' :
            type === 'quote' ? 'Quote text goes here...' :
            type.startsWith('button-') ? fieldType.label :
            '';
    }

    // Add specific properties for different static field types
    if (type === 'link') {
        baseProps.url = 'https://example.com';
    }

    if (type === 'image') {
        baseProps.imageSrc = 'https://via.placeholder.com/400x200';
        baseProps.imageAlt = 'Image description';
    }

    if (type === 'spacer') {
        baseProps.height = 20;
    }

    if (type === 'heading') {
        baseProps.headingLevel = 'h2';
    }

    // Add structure-specific properties
    if (type === 'container') {
        baseProps.containerChildren = [];
        baseProps.containerDescription = '';
        baseProps.containerPadding = 16;
        baseProps.containerBorder = true;
    }

    if (type === 'tabs-container') {
        baseProps.tabs = [
            { title: 'Tab 1', fields: [] },
            { title: 'Tab 2', fields: [] }
        ];
    }

    if (isColumnLayout(type)) {
        baseProps.columns =
            type === 'grid-layout' ? 2 :
            type === '2-columns' ? 2 :
            type === '3-columns' ? 3 :
            type === '4-columns' ? 4 : 2;
        baseProps.gap = 16;
        baseProps.children = [];
    }

    if (type === 'table') {
        baseProps.rows = 3;
        baseProps.tableColumns = 3;
        baseProps.headers = ['Header 1', 'Header 2', 'Header 3'];
        baseProps.tableData = [
            ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
            ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
            ['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3']
        ];
    }

    return baseProps;
};
