import { router } from '@inertiajs/vue3';

/**
 * Form Persistence Composable
 * Handles form save/load logic and field preparation for database storage
 */
export function useFormPersistence() {
    /**
     * Recursively process nested fields to ensure they have tempId
     * Ensures all fields have IDs for Vue reactivity
     */
    const processNestedFields = (field) => {
        const processed = {
            ...field,
            tempId: field.tempId || field.id || Date.now(),
        };

        // Process containerChildren and recursively handle nested structure fields
        if (processed.containerChildren && Array.isArray(processed.containerChildren)) {
            processed.containerChildren = processed.containerChildren.map(processNestedFields);
        }

        // Process tabs with nested fields
        if (processed.tabs && Array.isArray(processed.tabs)) {
            processed.tabs = processed.tabs.map(tab => ({
                ...tab,
                fields: (tab.fields || []).map(processNestedFields),
            }));
        }

        // Initialize children array for column layouts if not present
        if (['2-columns', '3-columns', '4-columns', 'grid-layout'].includes(processed.type)) {
            if (!processed.children) {
                processed.children = [];
            }
        }

        // Process grid/column children
        if (processed.children && Array.isArray(processed.children)) {
            processed.children = processed.children.map(processNestedFields);
        }

        return processed;
    };

    /**
     * Load form from props and process fields
     * Merges metadata back into fields for UI
     */
    const loadFormFields = (formFields) => {
        return (formFields || []).map(field => {
            let mergedField = field;

            if (field.metadata) {
                mergedField = {
                    ...field,
                    ...field.metadata,
                    // Keep the database id but also set tempId for UI compatibility
                    tempId: field.id,
                };
            } else {
                mergedField = { ...field, tempId: field.id };
            }

            // Process any nested fields recursively
            return processNestedFields(mergedField);
        });
    };

    /**
     * Prepare field data for database storage
     * Removes temporary IDs and processes nested structures
     */
    const prepareFieldForSave = (field) => {
        // Standard database fields
        const standardFields = {
            id: field.id || null,
            type: field.type,
            label: field.label,
            name: field.name || null,
            placeholder: field.placeholder || null,
            default_value: field.default_value || null,
            validation_rules: field.validation_rules || {},
            options: field.options || null,
            is_required: field.is_required || false,
            help_text: field.help_text || null,
        };

        // Process nested fields recursively
        let processedContainerChildren = null;
        if (field.containerChildren && Array.isArray(field.containerChildren)) {
            processedContainerChildren = field.containerChildren.map(child => {
                // For nested fields, we only save the essential data, not prepare for database
                const childData = {
                    tempId: child.tempId,
                    type: child.type,
                    label: child.label,
                    name: child.name || null,
                    placeholder: child.placeholder || null,
                    default_value: child.default_value || null,
                    validation_rules: child.validation_rules || {},
                    options: child.options || null,
                    is_required: child.is_required || false,
                    help_text: child.help_text || null,
                };

                // If the nested child is a column layout, include its children
                if (['2-columns', '3-columns', '4-columns', 'grid-layout'].includes(child.type)) {
                    if (child.children && Array.isArray(child.children)) {
                        childData.children = child.children.map(colField => ({
                            tempId: colField.tempId,
                            type: colField.type,
                            label: colField.label,
                            name: colField.name || null,
                            placeholder: colField.placeholder || null,
                            default_value: colField.default_value || null,
                            validation_rules: colField.validation_rules || {},
                            options: colField.options || null,
                            is_required: colField.is_required || false,
                            help_text: colField.help_text || null,
                            columnIndex: colField.columnIndex,
                        }));
                    }
                    childData.columns = child.columns || null;
                    childData.gap = child.gap || null;
                }

                return childData;
            });
        }

        // Process tabs with nested fields
        let processedTabs = null;
        if (field.tabs && Array.isArray(field.tabs)) {
            processedTabs = field.tabs.map(tab => ({
                title: tab.title,
                fields: (tab.fields || []).map(child => ({
                    tempId: child.tempId,
                    type: child.type,
                    label: child.label,
                    name: child.name || null,
                    placeholder: child.placeholder || null,
                    default_value: child.default_value || null,
                    validation_rules: child.validation_rules || {},
                    options: child.options || null,
                    is_required: child.is_required || false,
                    help_text: child.help_text || null,
                })),
            }));
        }

        // Process column children (for grid/column layouts)
        let processedChildren = null;
        if (field.children && Array.isArray(field.children)) {
            processedChildren = field.children.map(child => ({
                tempId: child.tempId,
                type: child.type,
                label: child.label,
                name: child.name || null,
                placeholder: child.placeholder || null,
                default_value: child.default_value || null,
                validation_rules: child.validation_rules || {},
                options: child.options || null,
                is_required: child.is_required || false,
                help_text: child.help_text || null,
                columnIndex: child.columnIndex, // Preserve column assignment
            }));
        }

        // Metadata fields (everything else)
        const metadataFields = {
            // Static HTML fields
            content: field.content || null,
            url: field.url || null,
            imageSrc: field.imageSrc || null,
            imageAlt: field.imageAlt || null,
            height: field.height || null,
            headingLevel: field.headingLevel || null,
            // Structure fields
            containerChildren: processedContainerChildren,
            containerDescription: field.containerDescription || null,
            containerPadding: field.containerPadding || null,
            containerBorder: field.containerBorder !== undefined ? field.containerBorder : null,
            tabs: processedTabs,
            columns: field.columns || null,
            gap: field.gap || null,
            children: processedChildren,
            rows: field.rows || null,
            tableColumns: field.tableColumns || null,
            headers: field.headers || null,
            tableData: field.tableData || null,
        };

        // Remove null values from metadata to keep it clean
        const cleanMetadata = Object.fromEntries(
            Object.entries(metadataFields).filter(([_, value]) => value !== null)
        );

        return {
            ...standardFields,
            metadata: Object.keys(cleanMetadata).length > 0 ? cleanMetadata : null,
        };
    };

    /**
     * Save form to database via Inertia
     */
    const saveForm = (formId, formData, fields, savingRef, onSuccess, onError) => {
        savingRef.value = true;

        // Prepare fields by separating standard fields from metadata
        const preparedFields = fields.value.map(prepareFieldForSave);

        router.put(`/forms/${formId}`, {
            ...formData.value,
            fields: preparedFields,
        }, {
            onSuccess: () => {
                savingRef.value = false;
                if (onSuccess) onSuccess();
            },
            onError: () => {
                savingRef.value = false;
                if (onError) onError();
            },
        });
    };

    return {
        processNestedFields,
        loadFormFields,
        prepareFieldForSave,
        saveForm
    };
}
