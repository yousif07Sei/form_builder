# Form Builder Refactoring Plan

## Current Status
- **Builder.vue**: 2,379 lines (needs refactoring)
- **Public/Form.vue**: ~1,200 lines (needs refactoring)
- No component structure
- All logic in single files

## Proposed Directory Structure

```
resources/js/
├── Components/
│   ├── FormBuilder/
│   │   ├── FieldRenderer.vue          # Renders individual field types in builder
│   │   ├── ColumnLayout.vue           # Column layout component (2/3/4-columns, grid)
│   │   ├── ContainerField.vue         # Container component
│   │   ├── TabsField.vue              # Tabs component
│   │   ├── FieldSidebar.vue           # Available fields sidebar (left panel)
│   │   ├── FieldPropertiesPanel.vue   # Right-side properties panel
│   │   ├── CanvasDropZone.vue         # Main canvas drop area
│   │   └── StaticFields/
│   │       ├── HeadingField.vue       # Heading field
│   │       ├── ParagraphField.vue     # Paragraph field
│   │       ├── DividerField.vue       # Divider field
│   │       ├── ImageField.vue         # Image field
│   │       └── VideoField.vue         # Video field
│   │
│   ├── FormPreview/
│   │   ├── FieldInput.vue             # Renders input fields for public view
│   │   ├── ColumnLayoutPreview.vue    # Column layout for preview
│   │   ├── ContainerPreview.vue       # Container for preview
│   │   └── TabsPreview.vue            # Tabs for preview
│   │
│   └── Shared/
│       └── FieldLabel.vue             # Reusable field label component
│
├── composables/
│   ├── useFieldManagement.js          # Add, remove, reorder, duplicate fields
│   ├── useFieldProperties.js          # Field property getters/setters
│   ├── useColumnLayout.js             # Column drag/drop logic
│   ├── useFormPersistence.js          # Save/load form logic (prepareFieldForSave)
│   ├── useDragAndDrop.js              # Drag and drop handlers
│   └── useFormValidation.js           # Form validation logic
│
└── utils/
    ├── fieldTypes.js                  # Field type definitions and configurations
    ├── fieldHelpers.js                # Helper functions (getFieldComponent, etc.)
    └── validationHelpers.js           # Validation utilities
```

## Phase 1: Extract Utilities (Priority: HIGH)

### 1.1 Create `utils/fieldTypes.js`
Extract all field type definitions and configurations:
- Available field types
- Field icons
- Default field properties
- Field categories (Input, Structure, Static)

**From Builder.vue lines:** ~150-450

### 1.2 Create `utils/fieldHelpers.js`
Extract helper functions:
- `getFieldComponent(type)` - Maps field type to PrimeVue component
- `getFieldProps(field)` - Returns props for field component
- `generateUniqueId()` - Generates unique field IDs
- `sanitizeFieldName(name)` - Sanitizes field names

**From Builder.vue lines:** ~1490-1622

### 1.3 Create `utils/validationHelpers.js`
Extract validation logic:
- Field validation rules
- Custom validation functions

## Phase 2: Extract Composables (Priority: HIGH)

### 2.1 Create `composables/useFormPersistence.js`
Extract save/load logic:
- `prepareFieldForSave(field)` - Prepares field data for database
- `processNestedFields(fields)` - Processes loaded fields
- `saveForm()` - Save form to database
- `loadForm(formId)` - Load form from database

**From Builder.vue lines:** ~1624-1750, ~1088-1110

**Key Functions:**
```javascript
export function useFormPersistence() {
  const prepareFieldForSave = (field) => { /* ... */ }
  const processNestedFields = (fields) => { /* ... */ }
  const saveForm = async (formData) => { /* ... */ }
  const loadForm = async (formId) => { /* ... */ }

  return {
    prepareFieldForSave,
    processNestedFields,
    saveForm,
    loadForm
  }
}
```

### 2.2 Create `composables/useFieldManagement.js`
Extract field management logic:
- `addField(fieldType)` - Add new field to canvas
- `removeField(fieldId)` - Remove field from canvas
- `duplicateField(field)` - Duplicate a field
- `reorderFields(oldIndex, newIndex)` - Reorder fields
- `selectField(fieldId)` - Select field for editing

**From Builder.vue lines:** ~830-1080

### 2.3 Create `composables/useColumnLayout.js`
Extract column layout logic:
- `onColumnDrop(event, parentField, columnIndex)` - Handle column drop
- `getColumnFields(parentField, columnIndex)` - Get fields for column
- `removeColumnField(parentField, columnIndex, fieldIndex)` - Remove from column

**From Builder.vue lines:** ~1248-1311

### 2.4 Create `composables/useDragAndDrop.js`
Extract drag and drop handlers:
- `onDragStart(event, item)` - Handle drag start
- `onDragOver(event)` - Handle drag over
- `onDrop(event, target)` - Handle drop
- `onDragEnd(event)` - Handle drag end

**From Builder.vue lines:** ~761-829

## Phase 3: Extract Components (Priority: MEDIUM)

### 3.1 Create `Components/FormBuilder/FieldSidebar.vue`
Extract the left sidebar with available fields.

**From Builder.vue lines:** ~72-215

**Props:**
- None (self-contained)

**Emits:**
- `@field-drag-start` - When field drag starts

### 3.2 Create `Components/FormBuilder/FieldPropertiesPanel.vue`
Extract the right properties panel.

**From Builder.vue lines:** ~460-750

**Props:**
- `selectedField` - Currently selected field
- `fields` - All fields (for name validation)

**Emits:**
- `@update:field` - When field properties change
- `@close` - When panel is closed

### 3.3 Create `Components/FormBuilder/ColumnLayout.vue`
Extract column layout rendering logic.

**From Builder.vue lines:** ~327-407

**Props:**
- `field` - The column layout field
- `editable` - Whether in edit mode

**Emits:**
- `@drop` - When field is dropped on column
- `@remove-field` - When field is removed from column

### 3.4 Create `Components/FormBuilder/ContainerField.vue`
Extract container field rendering logic.

**From Builder.vue lines:** ~237-357

**Props:**
- `field` - The container field
- `editable` - Whether in edit mode

**Emits:**
- `@drop` - When field is dropped in container
- `@remove-field` - When field is removed from container

### 3.5 Create `Components/FormBuilder/CanvasDropZone.vue`
Extract main canvas area.

**From Builder.vue lines:** ~216-457

**Props:**
- `fields` - Array of form fields
- `selectedFieldId` - Currently selected field ID

**Emits:**
- `@drop` - When field is dropped on canvas
- `@select-field` - When field is selected
- `@remove-field` - When field is removed

## Phase 4: Extract Preview Components (Priority: MEDIUM)

### 4.1 Create `Components/FormPreview/FieldInput.vue`
Extract field input rendering for public view.

**From Public/Form.vue lines:** ~80-533

**Props:**
- `field` - Field configuration
- `modelValue` - Field value
- `error` - Validation error

**Emits:**
- `@update:modelValue` - When value changes

### 4.2 Create `Components/FormPreview/ColumnLayoutPreview.vue`
Extract column layout preview rendering.

**From Public/Form.vue lines:** ~48-142

**Props:**
- `field` - Column layout field
- `formData` - Form data object
- `errors` - Validation errors

## Phase 5: Refactor Main Files (Priority: LOW)

### 5.1 Refactor `Pages/Forms/Builder.vue`
After extracting components and composables:
- Import and use extracted components
- Import and use extracted composables
- Keep only page-level logic
- **Target:** Reduce from 2,379 lines to ~300-400 lines

### 5.2 Refactor `Pages/Public/Form.vue`
After extracting preview components:
- Import and use preview components
- Import and use composables if needed
- Keep only page-level logic
- **Target:** Reduce from ~1,200 lines to ~200-300 lines

## Migration Strategy

### Step-by-Step Approach:
1. **Create utils first** - These have no dependencies
2. **Create composables** - These depend on utils
3. **Create components** - These depend on utils and composables
4. **Update main files** - Replace code with imports
5. **Test thoroughly** - Ensure nothing breaks

### Testing Checklist After Each Phase:
- [ ] Form builder loads correctly
- [ ] Can add fields from sidebar
- [ ] Can configure field properties
- [ ] Can drag/drop fields to reorder
- [ ] Can drag fields into containers
- [ ] Can drag fields into column layouts
- [ ] Column layouts save/load correctly
- [ ] Nested structures work (containers with columns)
- [ ] Preview displays correctly
- [ ] Form submission works
- [ ] No console errors

## Benefits of This Refactoring

1. **Maintainability**: Smaller, focused files easier to understand
2. **Reusability**: Components can be reused across pages
3. **Testability**: Individual functions can be unit tested
4. **Performance**: Better code splitting and lazy loading
5. **Collaboration**: Multiple developers can work on different components
6. **Scalability**: Easier to add new field types and features

## Estimated Timeline

- **Phase 1 (Utils)**: 2-3 hours
- **Phase 2 (Composables)**: 4-5 hours
- **Phase 3 (Builder Components)**: 5-6 hours
- **Phase 4 (Preview Components)**: 3-4 hours
- **Phase 5 (Main Files)**: 2-3 hours
- **Testing**: 2-3 hours

**Total**: ~20-25 hours

## Notes

- All refactoring should be done incrementally
- Commit after each successful phase
- Keep the dev server running to catch errors immediately
- Use TypeScript if desired (optional improvement)
- Consider adding Storybook for component documentation (optional)

## Priority Order

1. **Phase 1** - Extract utils (no breaking changes)
2. **Phase 2** - Extract composables (easy to test)
3. **Phase 2.1** - Focus on `useFormPersistence` first (most critical)
4. **Phase 2.3** - Focus on `useColumnLayout` (recent fix should be preserved)
5. **Phase 3** - Extract components gradually
6. **Phase 4** - Extract preview components
7. **Phase 5** - Refactor main files last
