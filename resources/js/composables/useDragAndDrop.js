import { getDefaultFieldProperties } from '@/utils/fieldTypes';

/**
 * Drag and Drop Composable
 * Handles drag and drop operations for form fields
 */
export function useDragAndDrop() {
    /**
     * Handle field drag start from FieldPalette component
     * @param {String} fieldType - Type of field being dragged
     */
    const handleFieldDragStart = (fieldType) => {
        // Drag data is already set by FieldPalette component
        // This is just for any additional logic if needed
    };

    /**
     * Handle drop on main canvas (top-level fields)
     * @param {Event} event - Drop event
     * @param {Ref} isDragging - Ref for dragging state
     * @param {Ref} fields - Ref for fields array
     * @param {Ref} selectedFieldIndex - Ref for selected field index
     */
    const onDrop = (event, isDragging, fields, selectedFieldIndex) => {
        isDragging.value = false;
        const fieldType = JSON.parse(event.dataTransfer.getData('fieldType'));

        // Create new field with default properties
        const newField = getDefaultFieldProperties(fieldType);

        fields.value.push(newField);
        selectedFieldIndex.value = fields.value.length - 1;
    };

    /**
     * Handle drop on nested containers (container, tabs-container)
     * @param {Event} event - Drop event
     * @param {Object} parentField - Parent container field
     * @param {Number|null} tabIndex - Tab index (for tabs-container)
     */
    const onNestedDrop = (event, parentField, tabIndex = null) => {
        event.stopPropagation();
        const fieldType = JSON.parse(event.dataTransfer.getData('fieldType'));

        // Create new field with default properties
        const newField = getDefaultFieldProperties(fieldType);

        // Add to container children or tab fields
        if (tabIndex !== null) {
            parentField.tabs[tabIndex].fields.push(newField);
        } else {
            parentField.containerChildren.push(newField);
        }
    };

    return {
        handleFieldDragStart,
        onDrop,
        onNestedDrop
    };
}
