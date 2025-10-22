<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Top Bar -->
        <BuilderTopBar
            :form-title="formData.title"
            :saving="saving"
            @back="router.visit('/forms')"
            @export="showExportDialog = true"
            @preview="previewForm"
            @save="saveForm"
        />

        <div class="flex h-[calc(100vh-73px)]">
            <!-- Left Sidebar - Field Palette -->
            <FieldPalette @dragstart="handleFieldDragStart" />

            <!-- Center - Form Builder Canvas -->
            <div class="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
                <div class="max-w-2xl mx-auto py-12">
                    <!-- Form Header -->
                    <div class="text-center mb-8">
                        <h1
                            class="text-4xl font-bold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            @click="openFormSettings"
                        >
                            {{ formData.title }}
                        </h1>
                        <p
                            v-if="formData.description"
                            class="text-lg text-gray-600 dark:text-gray-300 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            @click="openFormSettings"
                        >
                            {{ formData.description }}
                        </p>
                    </div>

                    <!-- Form Card -->
                    <Card class="min-h-[600px]">
                        <template #content>
                            <!-- Rows Container -->
                            <div
                                class="min-h-[500px] p-4 transition-colors"
                                :class="{ 'bg-primary-50 dark:bg-primary-900/20': isDragging }"
                                @click.self="openFormSettings"
                                @dragover.prevent="handleCanvasDragOver"
                                @dragleave="handleCanvasDragLeave"
                                @drop.prevent="handleCanvasDrop"
                            >
                                <!-- Empty State -->
                                <div v-if="rows.length === 1 && rows[0].fields.length === 0" class="text-center py-12 mb-4 pointer-events-none">
                                    <i class="pi pi-inbox text-6xl text-gray-400 mb-4"></i>
                                    <p class="text-gray-600 dark:text-gray-400">
                                        Drag and drop fields anywhere on the canvas
                                    </p>
                                </div>

                                <!-- Form Rows -->
                                <FormRow
                                    v-for="(row, rowIndex) in rows"
                                    :key="row.id"
                                    :row="row"
                                    :row-index="rowIndex"
                                    :max-slots="3"
                                    :selected-field-index="selectedFieldIndex"
                                    :selected-row-index="selectedRowIndex"
                                    :get-field-component="getFieldComponent"
                                    :get-field-props="getFieldProps"
                                    @drop="onRowDrop"
                                    @remove-field="removeFieldFromRow"
                                    @select-field="selectFieldInRow"
                                    @select-row="selectRow"
                                />
                            </div>
                        </template>
                    </Card>

                    <!-- Footer -->
                    <div class="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                        Powered by FormBuilder
                    </div>
                </div>
            </div>

            <!-- Right Sidebar - Settings Panel -->
            <SettingsPanel
                :selected-field-index="selectedFieldIndex"
                :selected-row-index="selectedRowIndex"
                :selected-nested-path="selectedNestedPath"
                :show-form-settings="showFormSettings"
                :selected-field="selectedField"
                :selected-row="selectedRow"
                :form-data="formData"
                @close="selectedFieldIndex = null; selectedRowIndex = null; selectedNestedPath = null; showFormSettings = false"
                @update:formData="formData = $event"
                @update:field="updateFieldInRow($event)"
                @update:row="updateRow($event)"
                @add-tab="addTab"
                @remove-tab="removeTab"
                @update-table-rows="updateTableRows"
                @update-table-columns="updateTableColumns"
                @add-option="addOption"
                @remove-option="removeOption"
            />
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
                        title="Copy to clipboard"
                    />
                </div>
            </div>
        </Dialog>
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
import MultiSelect from 'primevue/multiselect';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import FieldPalette from '@/Components/FieldPalette.vue';
import BuilderTopBar from '@/Components/FormBuilder/BuilderTopBar.vue';
import SettingsPanel from '@/Components/FormBuilder/Settings/SettingsPanel.vue';
import FieldRenderer from '@/Components/FormBuilder/Canvas/FieldRenderer.vue';
import FormRow from '@/Components/FormBuilder/Canvas/FormRow.vue';
import { getDefaultFieldProperties } from '@/utils/fieldTypes';
import { getFieldComponent, getFieldProps } from '@/utils/fieldHelpers';
import { useFormPersistence } from '@/composables/useFormPersistence';
import { useFieldManagement } from '@/composables/useFieldManagement';
import { useColumnLayout } from '@/composables/useColumnLayout';
import { useDragAndDrop } from '@/composables/useDragAndDrop';

const props = defineProps({
    form: Object
});

// Initialize composables
const { loadFormFields, saveForm: saveFormComposable } = useFormPersistence();
const {
    selectField: selectFieldComposable,
    removeField: removeFieldComposable,
    isNestedFieldSelected: isNestedFieldSelectedComposable,
    addOption: addOptionComposable,
    removeOption: removeOptionComposable,
    addTab: addTabComposable,
    removeTab: removeTabComposable,
    updateTableRows: updateTableRowsComposable,
    updateTableColumns: updateTableColumnsComposable,
    openFormSettings: openFormSettingsComposable
} = useFieldManagement();
const { onColumnDrop: onColumnDropComposable, getColumnFields: getColumnFieldsComposable, removeColumnField: removeColumnFieldComposable } = useColumnLayout();
const { handleFieldDragStart: handleFieldDragStartComposable, onDrop: onDropComposable, onNestedDrop: onNestedDropComposable } = useDragAndDrop();

const formData = ref({
    title: props.form.title,
    description: props.form.description,
    is_active: props.form.is_active,
});

// Load form fields using composable
console.log('[Builder] Initializing - Props:', props.form);
const loadedFields = loadFormFields(props.form.fields);
console.log('[Builder] Loaded fields:', loadedFields);

const fields = ref(loadedFields);
console.log('[Builder] Component initialized successfully');

// Row-based canvas system
let rowIdCounter = 0;
const rows = ref([
    { id: rowIdCounter++, fields: [], gridColumns: 1 }
]);

const selectedFieldIndex = ref(null); // Now stores { rowIndex, slotIndex }
const selectedRowIndex = ref(null); // Stores rowIndex when row itself is selected
const selectedNestedPath = ref(null); // { parentIndex, childIndex, columnIndex } for nested fields
const showFormSettings = ref(false); // Track if form settings panel is open
const isDragging = ref(false);
const saving = ref(false);
const showExportDialog = ref(false);
const exportType = ref('vue');
const activeTab = ref(0);
const settingsTab = ref(0);

const selectedField = computed(() => {
    console.log('[selectedField] Computing...', {
        selectedFieldIndex: selectedFieldIndex.value,
        rowsLength: rows.value.length
    });

    // Get field from row-based structure
    if (selectedFieldIndex.value !== null && typeof selectedFieldIndex.value === 'object') {
        const { rowIndex, slotIndex } = selectedFieldIndex.value;
        const row = rows.value[rowIndex];
        const field = row?.fields[slotIndex] || null;

        console.log('[selectedField] Result:', {
            rowIndex,
            slotIndex,
            row,
            field
        });

        return field;
    }

    console.log('[selectedField] Returning null');
    return null;
});

const selectedRow = computed(() => {
    if (selectedRowIndex.value !== null) {
        return rows.value[selectedRowIndex.value] || null;
    }
    return null;
});

// Flatten rows into fields array for backward compatibility (preview, save, export)
const flattenedFields = computed(() => {
    const allFields = [];

    rows.value.forEach(row => {
        if (row.fields.length > 0) {
            // If row has multiple fields, wrap them in a column layout
            if (row.fields.length > 1) {
                const columnLayout = {
                    tempId: `row-${row.id}`,
                    type: `${row.fields.length}-columns`,
                    label: `${row.fields.length} Columns`,
                    columns: row.fields.length,
                    gap: 16,
                    children: row.fields.map((field, index) => ({
                        ...field,
                        columnIndex: index
                    }))
                };
                allFields.push(columnLayout);
            } else {
                // Single field, add directly
                allFields.push(row.fields[0]);
            }
        }
    });

    return allFields;
});

// Drag and drop handlers (use composable)
const handleFieldDragStart = (fieldType) => {
    handleFieldDragStartComposable(fieldType);
};

const onDrop = (event) => {
    onDropComposable(event, isDragging, fields, selectedFieldIndex);
};

// Row-based drop handler
const onRowDrop = ({ event, rowIndex, slotIndex }) => {
    event.stopPropagation();
    const fieldType = JSON.parse(event.dataTransfer.getData('fieldType'));

    // Create new field with default properties
    const newField = getDefaultFieldProperties(fieldType);

    // Add field to the specific slot in the row
    const row = rows.value[rowIndex];

    // Enforce maximum of 3 fields per row
    if (row.fields.length >= 3) {
        console.warn('Maximum 3 fields per row reached');
        isDragging.value = false;
        return;
    }

    // When adding a new field, redistribute all fields equally
    // This ensures fields always fit in the row
    const newFieldCount = row.fields.length + 1; // Count including the new field
    const equalWidth = 100 / newFieldCount;

    // Set all existing fields to equal width
    row.fields.forEach(field => {
        field.customWidth = equalWidth;
    });

    // Set the new field to equal width
    newField.customWidth = equalWidth;

    // Insert field at the correct position
    if (slotIndex >= row.fields.length) {
        row.fields.push(newField);
    } else {
        row.fields.splice(slotIndex, 0, newField);
    }

    // Auto-add new empty row if current row has fields and is the last row
    if (row.fields.length > 0 && rowIndex === rows.value.length - 1) {
        rows.value.push({ id: rowIdCounter++, fields: [], gridColumns: 1 });
    }

    isDragging.value = false;
};

// Remove field from row
const removeFieldFromRow = ({ rowIndex, slotIndex }) => {
    const row = rows.value[rowIndex];
    row.fields.splice(slotIndex, 1);

    // Redistribute remaining fields equally to fill the row
    if (row.fields.length > 0) {
        const equalWidth = 100 / row.fields.length;
        row.fields.forEach(field => {
            field.customWidth = equalWidth;
        });
    }

    // Remove empty rows (except keep at least one)
    if (row.fields.length === 0 && rows.value.length > 1) {
        // Only remove if it's not the last row
        if (rowIndex < rows.value.length - 1) {
            rows.value.splice(rowIndex, 1);
        }
    }

    // Deselect if this field was selected
    if (selectedFieldIndex.value?.rowIndex === rowIndex &&
        selectedFieldIndex.value?.slotIndex === slotIndex) {
        selectedFieldIndex.value = null;
    }
};

// Select field in row
const selectFieldInRow = ({ rowIndex, slotIndex }) => {
    console.log('[selectFieldInRow] Called with:', { rowIndex, slotIndex });
    console.log('[selectFieldInRow] Field to select:', rows.value[rowIndex]?.fields[slotIndex]);

    selectedFieldIndex.value = { rowIndex, slotIndex };
    selectedRowIndex.value = null;
    selectedNestedPath.value = null;
    showFormSettings.value = false;

    console.log('[selectFieldInRow] selectedFieldIndex set to:', selectedFieldIndex.value);
};

const selectRow = (rowIndex) => {
    console.log('[selectRow] Called with:', rowIndex);

    selectedRowIndex.value = rowIndex;
    selectedFieldIndex.value = null;
    selectedNestedPath.value = null;
    showFormSettings.value = false;

    console.log('[selectRow] selectedRowIndex set to:', selectedRowIndex.value);
};


// Canvas-wide drop handlers
const handleCanvasDragOver = (event) => {
    isDragging.value = true;
};

const handleCanvasDragLeave = (event) => {
    // Only set to false if leaving the canvas completely
    if (event.target.classList.contains('min-h-[500px]')) {
        isDragging.value = false;
    }
};

const handleCanvasDrop = (event) => {
    event.stopPropagation();

    // Get the field type from drag data
    const fieldTypeData = event.dataTransfer.getData('fieldType');
    if (!fieldTypeData) {
        isDragging.value = false;
        return;
    }

    const fieldType = JSON.parse(fieldTypeData);

    // Create new field with default properties
    const newField = getDefaultFieldProperties(fieldType);

    // Find the last row with available space or create a new one
    let targetRow = null;
    let targetRowIndex = -1;

    // Check if the last row has space
    const lastRowIndex = rows.value.length - 1;
    const lastRow = rows.value[lastRowIndex];

    if (lastRow && lastRow.fields.length === 0) {
        // Last row is empty, use it
        targetRow = lastRow;
        targetRowIndex = lastRowIndex;
    } else {
        // Create a new row
        const newRow = { id: rowIdCounter++, fields: [], gridColumns: 1 };
        rows.value.push(newRow);
        targetRow = newRow;
        targetRowIndex = rows.value.length - 1;
    }

    // Enforce maximum of 3 fields per row
    if (targetRow.fields.length >= 3) {
        console.warn('Maximum 3 fields per row reached');
        isDragging.value = false;
        return;
    }

    // Add field to the row (always at the first position for canvas drops)
    targetRow.fields.push(newField);

    // Auto-select the newly added field
    selectedFieldIndex.value = { rowIndex: targetRowIndex, slotIndex: 0 };
    selectedNestedPath.value = null;
    showFormSettings.value = false;

    // Always ensure there's an empty row at the end
    const lastRowAfterDrop = rows.value[rows.value.length - 1];
    if (lastRowAfterDrop.fields.length > 0) {
        rows.value.push({ id: rowIdCounter++, fields: [], gridColumns: 1 });
    }

    isDragging.value = false;
};

// Field management handlers (use composable)
const updateFieldInRow = (updates) => {
    if (selectedFieldIndex.value !== null && typeof selectedFieldIndex.value === 'object') {
        const { rowIndex, slotIndex } = selectedFieldIndex.value;
        const row = rows.value[rowIndex];
        if (row && row.fields[slotIndex]) {
            const field = row.fields[slotIndex];

            // Update the field with new values
            Object.assign(field, updates);
        }
    }
};

const updateRow = (updates) => {
    console.log('[Builder] updateRow called with:', updates);
    console.log('[Builder] updates.fields:', updates.fields);
    console.log('[Builder] selectedRowIndex:', selectedRowIndex.value);

    if (selectedRowIndex.value !== null) {
        const row = rows.value[selectedRowIndex.value];
        if (row) {
            console.log('[Builder] Updating row at index:', selectedRowIndex.value);
            console.log('[Builder] Before update fields:', row.fields.map(f => ({ label: f.label, customWidth: f.customWidth })));

            // Update the row - use Vue.set or direct replacement for reactivity
            rows.value[selectedRowIndex.value] = { ...row, ...updates };

            console.log('[Builder] After update fields:', rows.value[selectedRowIndex.value].fields.map(f => ({ label: f.label, customWidth: f.customWidth })));
        }
    }
};

const selectField = (index, nestedPath = null) => {
    console.log('selectField called:', { index, nestedPath, fieldType: fields.value[index]?.type });
    selectFieldComposable(selectedFieldIndex, selectedNestedPath, showFormSettings, index, nestedPath);
};

const openFormSettings = () => {
    openFormSettingsComposable(selectedFieldIndex, selectedNestedPath, showFormSettings);
};

const isNestedFieldSelected = (parentIndex, childIndex = undefined, colIdx = undefined, colChildIdx = undefined) => {
    return isNestedFieldSelectedComposable(selectedNestedPath, parentIndex, childIndex, colIdx, colChildIdx);
};

const removeField = (index) => {
    removeFieldComposable(fields, selectedFieldIndex, index);
};

const addOption = () => {
    if (selectedFieldIndex.value !== null && typeof selectedFieldIndex.value === 'object') {
        const { rowIndex, slotIndex } = selectedFieldIndex.value;
        const field = rows.value[rowIndex]?.fields[slotIndex];
        if (field && field.options) {
            field.options.push('New Option');
        }
    }
};

const removeOption = (index) => {
    if (selectedFieldIndex.value !== null && typeof selectedFieldIndex.value === 'object') {
        const { rowIndex, slotIndex } = selectedFieldIndex.value;
        const field = rows.value[rowIndex]?.fields[slotIndex];
        if (field && field.options) {
            field.options.splice(index, 1);
        }
    }
};

// Nested drop handler (use composable)
const onNestedDrop = (event, parentField, tabIndex = null) => {
    onNestedDropComposable(event, parentField, tabIndex);
};

// Column layout handlers (use composable)
const onColumnDrop = (event, parentField, columnIndex) => {
    onColumnDropComposable(event, parentField, columnIndex);
};

const getColumnFields = (parentField, columnIndex) => {
    return getColumnFieldsComposable(parentField, columnIndex);
};

const removeColumnField = (parentField, columnIndex, fieldIndex) => {
    removeColumnFieldComposable(parentField, columnIndex, fieldIndex);
};

// Tab and table management handlers (use composable)
const addTab = () => {
    addTabComposable(selectedField);
};

const removeTab = (index) => {
    removeTabComposable(selectedField, index);
};

const updateTableRows = () => {
    updateTableRowsComposable(selectedField);
};

const updateTableColumns = () => {
    updateTableColumnsComposable(selectedField);
};

// Save form handler (use composable)
const saveForm = () => {
    saveFormComposable(props.form.id, formData, flattenedFields, saving);
};

const previewForm = () => {
    window.open(`/f/${props.form.slug}`, '_blank');
};

const generatedCode = computed(() => {
    if (exportType.value === 'vue') {
        return generateVueCode();
    } else if (exportType.value === 'html') {
        return generateHTMLCode();
    } else if (exportType.value === 'blade') {
        return generateBladeCode();
    } else if (exportType.value === 'validation') {
        return generateValidationRules();
    }
    return '';
});

const generateFieldVueCode = (field, indent = '    ') => {
    let component = '';

    // Handle structure fields
    if (field.type === 'container') {
        const childrenHTML = (field.containerChildren || []).map(child => generateFieldVueCode(child, indent + '      ')).join('\n\n');
        return `${indent}<div class="space-y-2">
${indent}  <label class="block text-sm font-medium">${field.label}</label>
${indent}  <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px;">
${childrenHTML || `${indent}    <p class="text-gray-500">Empty container</p>`}
${indent}  </div>
${indent}</div>`;
    }

    if (field.type === 'tabs-container') {
        const tabsContent = field.tabs.map(tab => {
            const tabFieldsHTML = (tab.fields || []).map(child => generateFieldVueCode(child, indent + '      ')).join('\n\n');
            return `${indent}  <TabPanel header="${tab.title}">
${tabFieldsHTML || `${indent}    <p class="text-gray-500">Empty tab</p>`}
${indent}  </TabPanel>`;
        }).join('\n');
        return `${indent}<div class="space-y-2">
${indent}  <label class="block text-sm font-medium">${field.label}</label>
${indent}  <TabView>
${tabsContent}
${indent}  </TabView>
${indent}</div>`;
    }

    // Rest of the field generation logic...
    // For brevity, we'll keep existing logic and just call this function
    // Handle other field types similar to before
    // (We'll integrate this properly in the main function)
};

const generateVueCode = () => {
    const fieldsHTML = flattenedFields.value.map(field => {
        let component = '';

        // Handle structure fields
        if (field.type === 'container') {
            const childrenCount = (field.containerChildren || []).length;
            const childrenPreview = childrenCount > 0 ? `${childrenCount} nested field(s)` : 'Empty container';
            return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}</label>
      <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px; min-height: 100px;">
        <!-- ${childrenPreview} -->
        <p class="text-gray-500">Container with ${childrenCount} field(s)</p>
      </div>
    </div>`;
        }

        if (field.type === 'tabs-container') {
            const tabsContent = field.tabs.map(tab => {
                const fieldsCount = (tab.fields || []).length;
                return `<TabPanel header="${tab.title}">
      <!-- ${fieldsCount} nested field(s) -->
      <p class="text-gray-600">Tab with ${fieldsCount} field(s)</p>
    </TabPanel>`;
            }).join('\n    ');
            return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}</label>
      <TabView>
        ${tabsContent}
      </TabView>
    </div>`;
        }

        if (field.type === '2-columns' || field.type === '3-columns' || field.type === '4-columns' || field.type === 'grid-layout') {
            const gridColumns = `repeat(${field.columns}, 1fr)`;
            return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}</label>
      <div style="display: grid; grid-template-columns: ${gridColumns}; gap: ${field.gap}px;">
        ${Array.from({length: field.columns}, (_, i) => `<div class="border p-4">Column ${i + 1}</div>`).join('\n        ')}
      </div>
    </div>`;
        }

        if (field.type === 'table') {
            const headerRow = field.headers.map(h => `<th class="border px-4 py-2">${h}</th>`).join('');
            const bodyRows = field.tableData.map(row =>
                `<tr>${row.map(cell => `<td class="border px-4 py-2">${cell}</td>`).join('')}</tr>`
            ).join('\n        ');
            return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}</label>
      <table class="w-full border-collapse">
        <thead><tr>${headerRow}</tr></thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </div>`;
        }

        // Handle static HTML fields
        if (field.type === 'heading') {
            return `    <${field.headingLevel || 'h2'} class="font-bold">${field.content}</${field.headingLevel || 'h2'}>`;
        }
        if (field.type === 'paragraph') {
            return `    <p>${field.content}</p>`;
        }
        if (field.type === 'divider') {
            return `    <hr class="border-t" />`;
        }
        if (field.type === 'spacer') {
            return `    <div style="height: ${field.height}px;"></div>`;
        }
        if (field.type === 'html') {
            return `    ${field.content}`;
        }
        if (field.type.startsWith('button-')) {
            const severity = field.type === 'button-primary' ? 'primary' : field.type === 'button-danger' ? 'danger' : 'secondary';
            return `    <Button label="${field.content}" severity="${severity}" />`;
        }
        if (field.type === 'link') {
            return `    <a href="${field.url}" class="text-primary-600 underline">${field.content}</a>`;
        }
        if (field.type === 'quote') {
            return `    <blockquote class="border-l-4 pl-4 italic">${field.content}</blockquote>`;
        }
        if (field.type === 'image') {
            return `    <img src="${field.imageSrc}" alt="${field.imageAlt}" class="max-w-full" />`;
        }

        // Handle regular form fields
        if (!field.name) return ''; // Skip fields without names

        const attrs = `v-model="formData.${field.name}"`;
        const classes = 'class="w-full"';
        const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : '';

        if (field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'url' || field.type === 'password' || field.type === 'location') {
            const inputType = field.type === 'location' ? 'text' : field.type;
            component = `<InputText ${attrs} type="${inputType}" ${placeholder} ${classes} />`;
        } else if (field.type === 'number') {
            component = `<InputText ${attrs} type="number" ${placeholder} ${classes} />`;
        } else if (field.type === 'textarea') {
            component = `<Textarea ${attrs} rows="4" ${placeholder} ${classes} />`;
        } else if (field.type === 'select') {
            const options = JSON.stringify(field.options || []);
            component = `<Dropdown ${attrs} :options='${options}' ${placeholder} ${classes} />`;
        } else if (field.type === 'multiselect') {
            const options = JSON.stringify(field.options || []);
            component = `<MultiSelect ${attrs} :options='${options}' ${placeholder} ${classes} />`;
        } else if (field.type === 'date') {
            component = `<Calendar ${attrs} ${placeholder} ${classes} showIcon />`;
        } else if (field.type === 'time') {
            component = `<Calendar ${attrs} ${placeholder} ${classes} timeOnly showIcon />`;
        } else if (field.type === 'datetime') {
            component = `<Calendar ${attrs} ${placeholder} ${classes} showTime showIcon />`;
        } else if (field.type === 'file') {
            component = `<FileUpload mode="basic" ${attrs} chooseLabel="${field.placeholder || 'Choose File'}" ${classes} />`;
        } else if (field.type === 'image') {
            component = `<FileUpload mode="basic" ${attrs} accept="image/*" chooseLabel="${field.placeholder || 'Choose Image'}" ${classes} />`;
        } else if (field.type === 'radio') {
            component = field.options.map((opt, idx) =>
                `<div class="flex items-center gap-2">
  <RadioButton ${attrs} value="${opt}" inputId="${field.name}_${idx}" />
  <label for="${field.name}_${idx}">${opt}</label>
</div>`
            ).join('\n        ');
        } else if (field.type === 'checkbox') {
            component = field.options.map((opt, idx) =>
                `<div class="flex items-center gap-2">
  <Checkbox ${attrs} value="${opt}" inputId="${field.name}_${idx}" />
  <label for="${field.name}_${idx}">${opt}</label>
</div>`
            ).join('\n        ');
        }

        return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}${field.is_required ? ' *' : ''}</label>
      ${component}
      ${field.help_text ? `<small class="text-gray-500">${field.help_text}</small>` : ''}
    </div>`;
    }).join('\n\n');

    return `<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
${fieldsHTML}

    <Button type="submit" label="Submit" />
  </form>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';

const formData = ref({
${fields.value.filter(f => f.name).map(f => `  ${f.name}: ${f.type === 'checkbox' || f.type === 'multiselect' ? '[]' : 'null'},`).join('\n')}
});

const handleSubmit = () => {
  console.log('Form data:', formData.value);
  // Add your submit logic here
};
<\/script>`;
};

const generateHTMLCode = () => {
    const fieldsHTML = flattenedFields.value.map(field => {
        let input = '';

        // Handle structure fields
        if (field.type === 'container') {
            const childrenCount = (field.containerChildren || []).length;
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px; min-height: 100px;">
      <!-- Container with ${childrenCount} field(s) -->
      <p class="text-gray-500">Container with ${childrenCount} nested field(s)</p>
    </div>
  </div>`;
        }

        if (field.type === 'tabs-container') {
            const tabsHTML = field.tabs.map((tab, idx) => {
                const fieldsCount = (tab.fields || []).length;
                return `<li><button type="button" class="px-4 py-2">${tab.title} (${fieldsCount})</button></li>`;
            }).join('\n        ');
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="border rounded p-4">
      <ul class="flex gap-4 border-b mb-4">
        ${tabsHTML}
      </ul>
      <div><!-- Tabs contain nested fields --></div>
    </div>
  </div>`;
        }

        if (field.type === '2-columns' || field.type === '3-columns' || field.type === '4-columns' || field.type === 'grid-layout') {
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div style="display: grid; grid-template-columns: repeat(${field.columns}, 1fr); gap: ${field.gap}px;">
      ${Array.from({length: field.columns}, (_, i) => `<div class="border p-4">Column ${i + 1}</div>`).join('\n      ')}
    </div>
  </div>`;
        }

        if (field.type === 'table') {
            const headerRow = field.headers.map(h => `<th class="border px-4 py-2">${h}</th>`).join('');
            const bodyRows = field.tableData.map(row =>
                `<tr>${row.map(cell => `<td class="border px-4 py-2">${cell}</td>`).join('')}</tr>`
            ).join('\n      ');
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <table class="w-full border-collapse">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  </div>`;
        }

        // Handle static HTML fields
        if (field.type === 'heading') {
            return `  <${field.headingLevel || 'h2'} class="font-bold mb-4">${field.content}</${field.headingLevel || 'h2'}>`;
        }
        if (field.type === 'paragraph') {
            return `  <p class="mb-4">${field.content}</p>`;
        }
        if (field.type === 'divider') {
            return `  <hr class="my-4" />`;
        }
        if (field.type === 'spacer') {
            return `  <div style="height: ${field.height}px;"></div>`;
        }
        if (field.type === 'html') {
            return `  ${field.content}`;
        }
        if (field.type.startsWith('button-')) {
            const buttonClass = field.type === 'button-danger' ? 'bg-red-500' : field.type === 'button-secondary' ? 'bg-gray-500' : 'bg-primary-500';
            return `  <button type="button" class="px-4 py-2 ${buttonClass} text-white rounded mb-4">${field.content}</button>`;
        }
        if (field.type === 'link') {
            return `  <a href="${field.url}" class="text-primary-600 underline mb-4 block">${field.content}</a>`;
        }
        if (field.type === 'quote') {
            return `  <blockquote class="border-l-4 pl-4 italic mb-4">${field.content}</blockquote>`;
        }
        if (field.type === 'image') {
            return `  <img src="${field.imageSrc}" alt="${field.imageAlt}" class="max-w-full mb-4" />`;
        }

        // Handle regular form fields
        if (!field.name) return ''; // Skip fields without names

        if (field.type === 'textarea') {
            input = `<textarea name="${field.name}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded"></textarea>`;
        } else if (field.type === 'select') {
            input = `<select name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">
      ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('\n      ')}
    </select>`;
        } else if (field.type === 'multiselect') {
            input = `<select name="${field.name}[]" multiple ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">
      ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('\n      ')}
    </select>`;
        } else if (field.type === 'radio') {
            input = field.options.map(opt =>
                `<label class="flex items-center gap-2">
      <input type="radio" name="${field.name}" value="${opt}" ${field.is_required ? 'required' : ''}>
      ${opt}
    </label>`
            ).join('\n    ');
        } else if (field.type === 'checkbox') {
            input = field.options.map(opt =>
                `<label class="flex items-center gap-2">
      <input type="checkbox" name="${field.name}[]" value="${opt}">
      ${opt}
    </label>`
            ).join('\n    ');
        } else if (field.type === 'time') {
            input = `<input type="time" name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'datetime') {
            input = `<input type="datetime-local" name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'file') {
            input = `<input type="file" name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'image') {
            input = `<input type="file" name="${field.name}" accept="image/*" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else {
            input = `<input type="${field.type}" name="${field.name}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        }

        return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}${field.is_required ? ' *' : ''}</label>
    ${input}
    ${field.help_text ? `<small class="text-gray-500">${field.help_text}</small>` : ''}
  </div>`;
    }).join('\n\n');

    return `<form method="POST" action="/submit" class="max-w-2xl mx-auto p-6">
${fieldsHTML}

  <button type="submit" class="px-4 py-2 bg-primary-500 text-white rounded">Submit</button>
</form>`;
};

const generateBladeCode = () => {
    const fieldsHTML = flattenedFields.value.map(field => {
        let input = '';

        // Handle structure fields (same as HTML since Blade is HTML with PHP)
        if (field.type === 'container') {
            const childrenCount = (field.containerChildren || []).length;
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px; min-height: 100px;">
      {{-- Container with ${childrenCount} field(s) --}}
      <p class="text-gray-500">Container with ${childrenCount} nested field(s)</p>
    </div>
  </div>`;
        }

        if (field.type === 'tabs-container') {
            const tabsHTML = field.tabs.map((tab, idx) => {
                const fieldsCount = (tab.fields || []).length;
                return `<li><button type="button" class="px-4 py-2">${tab.title} (${fieldsCount})</button></li>`;
            }).join('\n        ');
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="border rounded p-4">
      <ul class="flex gap-4 border-b mb-4">
        ${tabsHTML}
      </ul>
      <div>{{-- Tabs contain nested fields --}}</div>
    </div>
  </div>`;
        }

        if (field.type === '2-columns' || field.type === '3-columns' || field.type === '4-columns' || field.type === 'grid-layout') {
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div style="display: grid; grid-template-columns: repeat(${field.columns}, 1fr); gap: ${field.gap}px;">
      ${Array.from({length: field.columns}, (_, i) => `<div class="border p-4">Column ${i + 1}</div>`).join('\n      ')}
    </div>
  </div>`;
        }

        if (field.type === 'table') {
            const headerRow = field.headers.map(h => `<th class="border px-4 py-2">${h}</th>`).join('');
            const bodyRows = field.tableData.map(row =>
                `<tr>${row.map(cell => `<td class="border px-4 py-2">${cell}</td>`).join('')}</tr>`
            ).join('\n      ');
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <table class="w-full border-collapse">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  </div>`;
        }

        // Handle static HTML fields
        if (field.type === 'heading') {
            return `  <${field.headingLevel || 'h2'} class="font-bold mb-4">${field.content}</${field.headingLevel || 'h2'}>`;
        }
        if (field.type === 'paragraph') {
            return `  <p class="mb-4">${field.content}</p>`;
        }
        if (field.type === 'divider') {
            return `  <hr class="my-4" />`;
        }
        if (field.type === 'spacer') {
            return `  <div style="height: ${field.height}px;"></div>`;
        }
        if (field.type === 'html') {
            return `  ${field.content}`;
        }
        if (field.type.startsWith('button-')) {
            const buttonClass = field.type === 'button-danger' ? 'bg-red-500' : field.type === 'button-secondary' ? 'bg-gray-500' : 'bg-primary-500';
            return `  <button type="button" class="px-4 py-2 ${buttonClass} text-white rounded mb-4">${field.content}</button>`;
        }
        if (field.type === 'link') {
            return `  <a href="${field.url}" class="text-primary-600 underline mb-4 block">${field.content}</a>`;
        }
        if (field.type === 'quote') {
            return `  <blockquote class="border-l-4 pl-4 italic mb-4">${field.content}</blockquote>`;
        }
        if (field.type === 'image') {
            return `  <img src="${field.imageSrc}" alt="${field.imageAlt}" class="max-w-full mb-4" />`;
        }

        // Handle regular form fields
        if (!field.name) return ''; // Skip fields without names

        if (field.type === 'textarea') {
            input = `<textarea name="${field.name}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">{{ old('${field.name}') }}</textarea>`;
        } else if (field.type === 'select') {
            input = `<select name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">
      @foreach(${JSON.stringify(field.options)} as $option)
        <option value="{{ $option }}" {{ old('${field.name}') == $option ? 'selected' : '' }}>{{ $option }}</option>
      @endforeach
    </select>`;
        } else if (field.type === 'multiselect') {
            input = `<select name="${field.name}[]" multiple ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">
      @foreach(${JSON.stringify(field.options)} as $option)
        <option value="{{ $option }}" {{ in_array($option, old('${field.name}', [])) ? 'selected' : '' }}>{{ $option }}</option>
      @endforeach
    </select>`;
        } else if (field.type === 'time') {
            input = `<input type="time" name="${field.name}" value="{{ old('${field.name}') }}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'datetime') {
            input = `<input type="datetime-local" name="${field.name}" value="{{ old('${field.name}') }}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'file') {
            input = `<input type="file" name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'image') {
            input = `<input type="file" name="${field.name}" accept="image/*" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else {
            input = `<input type="${field.type}" name="${field.name}" value="{{ old('${field.name}') }}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        }

        return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}${field.is_required ? ' *' : ''}</label>
    ${input}
    @error('${field.name}')
      <span class="text-red-500 text-sm">{{ $message }}</span>
    @enderror
    ${field.help_text ? `<small class="text-gray-500">${field.help_text}</small>` : ''}
  </div>`;
    }).join('\n\n');

    return `<form method="POST" action="{{ route('form.submit') }}" class="max-w-2xl mx-auto p-6">
  @csrf
${fieldsHTML}

  <button type="submit" class="px-4 py-2 bg-primary-500 text-white rounded">Submit</button>
</form>`;
};

const generateValidationRules = () => {
    const rules = flattenedFields.value.map(field => {
        const validationRules = [];

        if (field.is_required) {
            validationRules.push('required');
        } else {
            validationRules.push('nullable');
        }

        if (field.type === 'email') {
            validationRules.push('email');
        } else if (field.type === 'number') {
            validationRules.push('numeric');
        } else if (field.type === 'date') {
            validationRules.push('date');
        } else if (field.type === 'url') {
            validationRules.push('url');
        } else if (field.type === 'tel') {
            validationRules.push('string');
        } else if (field.type === 'password') {
            validationRules.push('string|min:8');
        } else if (field.type === 'location') {
            validationRules.push('string');
        } else if (field.type === 'multiselect') {
            validationRules.push('array');
        } else if (field.type === 'time') {
            validationRules.push('date_format:H:i');
        } else if (field.type === 'datetime') {
            validationRules.push('date');
        } else if (field.type === 'file') {
            validationRules.push('file');
        } else if (field.type === 'image') {
            validationRules.push('image');
        }

        return `'${field.name}' => '${validationRules.join('|')}',`;
    }).join('\n    ');

    return `// Laravel Validation Rules
$rules = [
    ${rules}
];

$validated = $request->validate($rules);`;
};

const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode.value);
    // Could add a toast notification here
};
</script>

<style scoped>
:deep(.field-tabs .p-tabview-nav) {
    background: transparent;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.dark .field-tabs .p-tabview-nav) {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

:deep(.field-tabs .p-tabview-panels) {
    background: transparent;
    padding: 0;
}

:deep(.field-tabs .p-tabview-panel) {
    background: transparent;
}

:deep(.settings-tabs .p-tabview-nav) {
    background: transparent;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.dark .settings-tabs .p-tabview-nav) {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

:deep(.settings-tabs .p-tabview-panels) {
    background: transparent;
    padding: 0;
}

:deep(.settings-tabs .p-tabview-panel) {
    background: transparent;
}

/* Column drop zone styles */
.column-drop-zone {
    position: relative;
}

.column-drop-zone.dragover-highlight {
    border-color: rgb(59 130 246) !important;
    background-color: rgb(239 246 255) !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: scale(1.02);
}

.dark .column-drop-zone.dragover-highlight {
    border-color: rgb(96 165 250) !important;
    background-color: rgb(30 58 138 / 0.2) !important;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

/* Settings Panel Dark Theme Overrides */
/* Make all inputs and components match the dark sidebar - using global styles for better specificity */

</style>
