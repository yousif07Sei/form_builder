import { getDefaultFieldProperties } from '@/utils/fieldTypes';

/**
 * Column Layout Composable
 * Handles column layout operations (grid, 2/3/4-column layouts)
 */
export function useColumnLayout() {
    /**
     * Handle drop on column layout
     * @param {Event} event - Drop event
     * @param {Object} parentField - Parent field (column layout)
     * @param {Number} columnIndex - Index of column where field is dropped
     */
    const onColumnDrop = (event, parentField, columnIndex) => {
        event.stopPropagation();
        const fieldType = JSON.parse(event.dataTransfer.getData('fieldType'));

        // Create new field with default properties
        const newField = getDefaultFieldProperties(fieldType);

        // Track which column this field belongs to
        newField.columnIndex = columnIndex;

        // Initialize children array if it doesn't exist
        if (!parentField.children) {
            parentField.children = [];
        }

        // Add field to children array with column info
        parentField.children.push(newField);
    };

    /**
     * Get fields for a specific column
     * @param {Object} parentField - Parent field (column layout)
     * @param {Number} columnIndex - Index of column
     * @returns {Array} Fields in that column
     */
    const getColumnFields = (parentField, columnIndex) => {
        if (!parentField.children) {
            return [];
        }
        return parentField.children.filter(field => field.columnIndex === columnIndex);
    };

    /**
     * Remove field from column
     * @param {Object} parentField - Parent field (column layout)
     * @param {Number} columnIndex - Index of column
     * @param {Number} fieldIndex - Index of field within that column
     */
    const removeColumnField = (parentField, columnIndex, fieldIndex) => {
        const columnFields = getColumnFields(parentField, columnIndex);
        const fieldToRemove = columnFields[fieldIndex];
        const actualIndex = parentField.children.findIndex(f => f.tempId === fieldToRemove.tempId);
        if (actualIndex !== -1) {
            parentField.children.splice(actualIndex, 1);
        }
    };

    return {
        onColumnDrop,
        getColumnFields,
        removeColumnField
    };
}
