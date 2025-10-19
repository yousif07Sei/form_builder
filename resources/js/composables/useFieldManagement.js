/**
 * Field Management Composable
 * Handles field selection, CRUD operations, and option management
 */
export function useFieldManagement() {
    /**
     * Select a field (either top-level or nested)
     * @param {Ref} selectedFieldIndex - Ref for selected field index
     * @param {Ref} selectedNestedPath - Ref for nested field path
     * @param {Ref} showFormSettings - Ref for form settings visibility
     * @param {Number} index - Field index
     * @param {Object|null} nestedPath - Nested path object
     */
    const selectField = (selectedFieldIndex, selectedNestedPath, showFormSettings, index, nestedPath = null) => {
        showFormSettings.value = false; // Close form settings when selecting a field
        if (nestedPath) {
            selectedFieldIndex.value = null;
            selectedNestedPath.value = nestedPath;
        } else {
            selectedFieldIndex.value = index;
            selectedNestedPath.value = null;
        }
    };

    /**
     * Remove a field from the fields array
     * @param {Ref} fields - Ref for fields array
     * @param {Ref} selectedFieldIndex - Ref for selected field index
     * @param {Number} index - Index of field to remove
     */
    const removeField = (fields, selectedFieldIndex, index) => {
        fields.value.splice(index, 1);
        if (selectedFieldIndex.value === index) {
            selectedFieldIndex.value = null;
        }
    };

    /**
     * Check if a nested field is selected
     * @param {Ref} selectedNestedPath - Ref for nested field path
     * @param {Number} parentIndex - Parent field index
     * @param {Number|undefined} childIndex - Child field index
     * @param {Number|undefined} colIdx - Column index
     * @param {Number|undefined} colChildIdx - Column child index
     * @returns {Boolean}
     */
    const isNestedFieldSelected = (selectedNestedPath, parentIndex, childIndex = undefined, colIdx = undefined, colChildIdx = undefined) => {
        if (!selectedNestedPath.value) return false;
        const path = selectedNestedPath.value;

        // Check if this specific nested field is selected
        return path.parentIndex === parentIndex &&
               path.childIndex === childIndex &&
               path.colIdx === colIdx &&
               path.colChildIdx === colChildIdx;
    };

    /**
     * Add an option to select/multiselect/radio/checkbox field
     * @param {Object} selectedField - The currently selected field
     */
    const addOption = (selectedField) => {
        if (!selectedField.value.options) {
            selectedField.value.options = [];
        }
        selectedField.value.options.push('New Option');
    };

    /**
     * Remove an option from select/multiselect/radio/checkbox field
     * @param {Object} selectedField - The currently selected field
     * @param {Number} index - Index of option to remove
     */
    const removeOption = (selectedField, index) => {
        selectedField.value.options.splice(index, 1);
    };

    /**
     * Add a tab to tabs-container field
     * @param {Object} selectedField - The currently selected field
     */
    const addTab = (selectedField) => {
        if (!selectedField.value.tabs) {
            selectedField.value.tabs = [];
        }
        const tabNumber = selectedField.value.tabs.length + 1;
        selectedField.value.tabs.push({ title: `Tab ${tabNumber}`, fields: [] });
    };

    /**
     * Remove a tab from tabs-container field
     * @param {Object} selectedField - The currently selected field
     * @param {Number} index - Index of tab to remove
     */
    const removeTab = (selectedField, index) => {
        selectedField.value.tabs.splice(index, 1);
    };

    /**
     * Update table rows for table field
     * @param {Object} selectedField - The currently selected field
     */
    const updateTableRows = (selectedField) => {
        const currentRows = selectedField.value.tableData.length;
        const newRows = selectedField.value.rows;
        const cols = selectedField.value.tableColumns || 3;

        if (newRows > currentRows) {
            // Add rows
            for (let i = currentRows; i < newRows; i++) {
                const row = [];
                for (let j = 0; j < cols; j++) {
                    row.push(`Row ${i + 1} Col ${j + 1}`);
                }
                selectedField.value.tableData.push(row);
            }
        } else if (newRows < currentRows) {
            // Remove rows
            selectedField.value.tableData.splice(newRows);
        }
    };

    /**
     * Update table columns for table field
     * @param {Object} selectedField - The currently selected field
     */
    const updateTableColumns = (selectedField) => {
        const newCols = selectedField.value.tableColumns;
        const currentCols = selectedField.value.headers.length;

        // Update headers
        if (newCols > currentCols) {
            for (let i = currentCols; i < newCols; i++) {
                selectedField.value.headers.push(`Header ${i + 1}`);
            }
        } else if (newCols < currentCols) {
            selectedField.value.headers.splice(newCols);
        }

        // Update table data
        selectedField.value.tableData.forEach((row, rIdx) => {
            if (newCols > row.length) {
                for (let i = row.length; i < newCols; i++) {
                    row.push(`Row ${rIdx + 1} Col ${i + 1}`);
                }
            } else if (newCols < row.length) {
                row.splice(newCols);
            }
        });
    };

    /**
     * Open form settings panel
     * @param {Ref} selectedFieldIndex - Ref for selected field index
     * @param {Ref} selectedNestedPath - Ref for nested field path
     * @param {Ref} showFormSettings - Ref for form settings visibility
     */
    const openFormSettings = (selectedFieldIndex, selectedNestedPath, showFormSettings) => {
        selectedFieldIndex.value = null;
        selectedNestedPath.value = null;
        showFormSettings.value = true;
    };

    return {
        selectField,
        removeField,
        isNestedFieldSelected,
        addOption,
        removeOption,
        addTab,
        removeTab,
        updateTableRows,
        updateTableColumns,
        openFormSettings
    };
}
