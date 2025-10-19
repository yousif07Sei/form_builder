#!/usr/bin/env node

/**
 * Automated Test Script for Form Builder Phase 2
 * Tests field rendering component extraction (FieldRenderer, StaticFieldRenderer, InputFieldRenderer)
 *
 * Usage: node test-phase2-completion.cjs
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

// Test results tracking
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

/**
 * Print colored output
 */
function print(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test result logger
 */
function test(name, condition, errorMessage = '') {
    if (condition) {
        passedTests++;
        print(`✓ ${name}`, 'green');
        return true;
    } else {
        failedTests++;
        print(`✗ ${name}`, 'red');
        if (errorMessage) {
            print(`  ${errorMessage}`, 'red');
        }
        return false;
    }
}

/**
 * Warning logger
 */
function warn(message) {
    warnings++;
    print(`⚠ ${message}`, 'yellow');
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (e) {
        return false;
    }
}

/**
 * Read file content
 */
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        return null;
    }
}

/**
 * Count lines in file
 */
function countLines(filePath) {
    const content = readFile(filePath);
    return content ? content.split('\n').length : 0;
}

/**
 * Check if content contains pattern
 */
function contains(content, pattern) {
    if (typeof pattern === 'string') {
        return content.includes(pattern);
    }
    return pattern.test(content);
}

// Base paths
const basePath = '/Users/yousif/presonal_projects_scriptIT/formBuilder';
const resourcesPath = path.join(basePath, 'resources/js');

print('\n==============================================', 'cyan');
print('Form Builder Phase 2 - Automated Tests', 'cyan');
print('Field Rendering Component Extraction', 'cyan');
print('==============================================\n', 'cyan');

// ============================================
// Phase 2 Component 1: InputFieldRenderer
// ============================================
print('📦 Phase 2: InputFieldRenderer Component', 'blue');
print('---', 'blue');

const inputFieldRendererPath = path.join(resourcesPath, 'Components/FormBuilder/Canvas/InputFieldRenderer.vue');
test(
    'InputFieldRenderer.vue exists',
    fileExists(inputFieldRendererPath),
    `File not found: ${inputFieldRendererPath}`
);

if (fileExists(inputFieldRendererPath)) {
    const inputContent = readFile(inputFieldRendererPath);
    const lines = countLines(inputFieldRendererPath);

    test('InputFieldRenderer has reasonable size (150-200 lines)', lines >= 150 && lines <= 200, `Has ${lines} lines`);
    test('InputFieldRenderer has field prop', contains(inputContent, 'field:'));
    test('InputFieldRenderer uses <script setup>', contains(inputContent, '<script setup>'));
    test('InputFieldRenderer uses defineProps', contains(inputContent, 'defineProps'));

    // Check for PrimeVue component imports
    test('InputFieldRenderer imports InputText', contains(inputContent, "import InputText from 'primevue/inputtext'"));
    test('InputFieldRenderer imports Textarea', contains(inputContent, "import Textarea from 'primevue/textarea'"));
    test('InputFieldRenderer imports Dropdown', contains(inputContent, "import Dropdown from 'primevue/dropdown'"));
    test('InputFieldRenderer imports MultiSelect', contains(inputContent, "import MultiSelect from 'primevue/multiselect'"));
    test('InputFieldRenderer imports RadioButton', contains(inputContent, "import RadioButton from 'primevue/radiobutton'"));
    test('InputFieldRenderer imports Checkbox', contains(inputContent, "import Checkbox from 'primevue/checkbox'"));
    test('InputFieldRenderer imports Calendar', contains(inputContent, "import Calendar from 'primevue/calendar'"));
    test('InputFieldRenderer imports FileUpload', contains(inputContent, "import FileUpload from 'primevue/fileupload'"));
    test('InputFieldRenderer imports InputSwitch', contains(inputContent, "import InputSwitch from 'primevue/inputswitch'"));

    // Check for helper functions
    test('InputFieldRenderer has getFieldComponent function', contains(inputContent, 'getFieldComponent'));
    test('InputFieldRenderer has getFieldProps function', contains(inputContent, 'getFieldProps'));

    // Check for field type handling
    test('InputFieldRenderer handles text fields', contains(inputContent, "'text'") || contains(inputContent, '"text"'));
    test('InputFieldRenderer handles email fields', contains(inputContent, "'email'") || contains(inputContent, '"email"'));
    test('InputFieldRenderer handles number fields', contains(inputContent, "'number'") || contains(inputContent, '"number"'));
    test('InputFieldRenderer handles textarea fields', contains(inputContent, "'textarea'") || contains(inputContent, '"textarea"'));
    test('InputFieldRenderer handles select fields', contains(inputContent, "'select'") || contains(inputContent, '"select"'));
    test('InputFieldRenderer handles date fields', contains(inputContent, "'date'") || contains(inputContent, '"date"'));
    test('InputFieldRenderer handles file fields', contains(inputContent, "'file'") || contains(inputContent, '"file"'));
    test('InputFieldRenderer handles switch fields', contains(inputContent, "'switch'") || contains(inputContent, '"switch"'));

    // Check for component usage
    test('InputFieldRenderer uses dynamic component', contains(inputContent, '<component') || contains(inputContent, ':is='));
}

// ============================================
// Phase 2 Component 2: FieldRenderer (Refactored)
// ============================================
print('\n📦 Phase 2: FieldRenderer Component (Refactored)', 'blue');
print('---', 'blue');

const fieldRendererPath = path.join(resourcesPath, 'Components/FormBuilder/Canvas/FieldRenderer.vue');
test(
    'FieldRenderer.vue exists',
    fileExists(fieldRendererPath),
    `File not found: ${fieldRendererPath}`
);

if (fileExists(fieldRendererPath)) {
    const fieldContent = readFile(fieldRendererPath);
    const lines = countLines(fieldRendererPath);

    test('FieldRenderer has reasonable size (180-220 lines)', lines >= 180 && lines <= 220, `Has ${lines} lines`);

    // Check for required imports (child components)
    test('FieldRenderer imports StaticContentField', contains(fieldContent, "import StaticContentField from './StaticContentField.vue'"));
    test('FieldRenderer imports InputFieldRenderer', contains(fieldContent, "import InputFieldRenderer from './InputFieldRenderer.vue'"));
    test('FieldRenderer imports ContainerField', contains(fieldContent, "import ContainerField from './ContainerField.vue'"));
    test('FieldRenderer imports ColumnLayoutField', contains(fieldContent, "import ColumnLayoutField from './ColumnLayoutField.vue'"));
    test('FieldRenderer imports TabsContainerField', contains(fieldContent, "import TabsContainerField from './TabsContainerField.vue'"));
    test('FieldRenderer imports Button', contains(fieldContent, "import Button from 'primevue/button'"));

    // Check for delegation to child components
    test('FieldRenderer delegates to StaticContentField', contains(fieldContent, '<StaticContentField'));
    test('FieldRenderer delegates to InputFieldRenderer', contains(fieldContent, '<InputFieldRenderer'));
    test('FieldRenderer delegates to ContainerField', contains(fieldContent, '<ContainerField'));
    test('FieldRenderer delegates to ColumnLayoutField', contains(fieldContent, '<ColumnLayoutField'));
    test('FieldRenderer delegates to TabsContainerField', contains(fieldContent, '<TabsContainerField'));

    // Check for props
    test('FieldRenderer has field prop', contains(fieldContent, 'field:'));
    test('FieldRenderer has fieldIndex prop', contains(fieldContent, 'fieldIndex'));
    test('FieldRenderer has isSelected prop', contains(fieldContent, 'isSelected'));
    test('FieldRenderer has getFieldComponent prop', contains(fieldContent, 'getFieldComponent'));
    test('FieldRenderer has getFieldProps prop', contains(fieldContent, 'getFieldProps'));

    // Check for events
    test('FieldRenderer defines select event', contains(fieldContent, "'select'") || contains(fieldContent, '"select"'));
    test('FieldRenderer defines delete event', contains(fieldContent, "'delete'") || contains(fieldContent, '"delete"'));
    test('FieldRenderer defines nested-drop event', contains(fieldContent, "'nested-drop'") || contains(fieldContent, '"nested-drop"'));
    test('FieldRenderer defines column-drop event', contains(fieldContent, "'column-drop'") || contains(fieldContent, '"column-drop"'));

    // Check for UI chrome (drag handle, delete button, label, help text)
    test('FieldRenderer has drag handle', contains(fieldContent, 'drag-handle'));
    test('FieldRenderer has delete button', contains(fieldContent, 'pi-trash'));
    test('FieldRenderer has label rendering', contains(fieldContent, '<label'));
    test('FieldRenderer has help text rendering', contains(fieldContent, 'help_text'));

    // Check for helper function
    test('FieldRenderer has isStaticField helper', contains(fieldContent, 'isStaticField'));

    // Check that inline templates are removed (should delegate instead)
    const hasInlineInputComponent = contains(fieldContent, /<component[^>]*:is="getFieldComponent\(field\.type\)"[^>]*disabled/);
    test('FieldRenderer no longer has inline input component rendering', !hasInlineInputComponent, 'Still has inline component rendering');
}

// ============================================
// Builder.vue Integration
// ============================================
print('\n🔗 Builder.vue Integration', 'blue');
print('---', 'blue');

const builderPath = path.join(resourcesPath, 'Pages/Forms/Builder.vue');
if (fileExists(builderPath)) {
    const builderContent = readFile(builderPath);
    const lines = countLines(builderPath);

    test('Builder imports FieldRenderer', contains(builderContent, "import FieldRenderer from '@/Components/FormBuilder/Canvas/FieldRenderer.vue'"));

    // Check that Builder uses FieldRenderer component
    test('Builder uses FieldRenderer component', contains(builderContent, '<FieldRenderer'));
    test('Builder passes field prop to FieldRenderer', contains(builderContent, ':field="element"'));
    test('Builder passes field-index prop to FieldRenderer', contains(builderContent, ':field-index="index"'));
    test('Builder passes is-selected prop to FieldRenderer', contains(builderContent, ':is-selected'));
    test('Builder passes getFieldComponent to FieldRenderer', contains(builderContent, ':get-field-component="getFieldComponent"'));
    test('Builder passes getFieldProps to FieldRenderer', contains(builderContent, ':get-field-props="getFieldProps"'));

    // Check event handlers
    test('Builder handles select event from FieldRenderer', contains(builderContent, '@select'));
    test('Builder handles delete event from FieldRenderer', contains(builderContent, '@delete'));

    // Check that inline field rendering has been removed from Builder
    const hasInlineDragHandle = contains(builderContent, /<div class="absolute -left-8 top-2[^>]*>[\s\S]*?<i class="pi pi-bars drag-handle/);
    const hasInlineDeleteButton = contains(builderContent, /<div class="absolute -right-8 top-2[^>]*>[\s\S]*?<Button[\s\S]*?icon="pi pi-trash"/);

    // These should NOT be in the draggable item template anymore (they're in FieldRenderer now)
    test('Builder no longer has inline drag handle in item template', !hasInlineDragHandle, 'Still has inline drag handle');
    test('Builder no longer has inline delete button in item template', !hasInlineDeleteButton, 'Still has inline delete button');

    // Check that old component imports have been removed
    const hasOldContainerImport = contains(builderContent, "import ContainerField from '@/Components/FormBuilder/Canvas/ContainerField.vue'");
    const hasOldColumnLayoutImport = contains(builderContent, "import ColumnLayoutField from '@/Components/FormBuilder/Canvas/ColumnLayoutField.vue'");
    const hasOldTabsContainerImport = contains(builderContent, "import TabsContainerField from '@/Components/FormBuilder/Canvas/TabsContainerField.vue'");
    const hasOldStaticContentImport = contains(builderContent, "import StaticContentField from '@/Components/FormBuilder/Canvas/StaticContentField.vue'");

    test('Builder no longer directly imports ContainerField', !hasOldContainerImport, 'Still imports ContainerField');
    test('Builder no longer directly imports ColumnLayoutField', !hasOldColumnLayoutImport, 'Still imports ColumnLayoutField');
    test('Builder no longer directly imports TabsContainerField', !hasOldTabsContainerImport, 'Still imports TabsContainerField');
    test('Builder no longer directly imports StaticContentField', !hasOldStaticContentImport, 'Still imports StaticContentField');

    // Line count improvement
    const phase2ALines = 1355; // From Phase 2A (StaticContentField)
    if (lines < phase2ALines) {
        test(`Builder.vue line count reduced from ${phase2ALines}`, true, `Now ${lines} lines (-${phase2ALines - lines})`);
        print(`  Line reduction: ${phase2ALines - lines} lines saved`, 'green');
    } else if (lines === phase2ALines) {
        warn(`Builder.vue line count unchanged (${lines} lines)`);
    } else {
        warn(`Builder.vue line count increased to ${lines} lines (+${lines - phase2ALines})`);
    }
}

// ============================================
// Component Structure Tests
// ============================================
print('\n🏗️  Component Structure', 'blue');
print('---', 'blue');

const canvasDir = path.join(resourcesPath, 'Components/FormBuilder/Canvas');
if (fileExists(canvasDir)) {
    test('FieldRenderer.vue exists in Canvas', fileExists(path.join(canvasDir, 'FieldRenderer.vue')));
    test('InputFieldRenderer.vue exists in Canvas', fileExists(path.join(canvasDir, 'InputFieldRenderer.vue')));
    test('StaticContentField.vue exists in Canvas', fileExists(path.join(canvasDir, 'StaticContentField.vue')));
    test('ContainerField.vue exists in Canvas', fileExists(path.join(canvasDir, 'ContainerField.vue')));
    test('ColumnLayoutField.vue exists in Canvas', fileExists(path.join(canvasDir, 'ColumnLayoutField.vue')));
    test('TabsContainerField.vue exists in Canvas', fileExists(path.join(canvasDir, 'TabsContainerField.vue')));
}

// ============================================
// Code Quality Checks
// ============================================
print('\n✨ Code Quality', 'blue');
print('---', 'blue');

if (fileExists(inputFieldRendererPath)) {
    const content = readFile(inputFieldRendererPath);
    test('InputFieldRenderer uses <script setup>', contains(content, '<script setup>'));
    test('InputFieldRenderer uses defineProps', contains(content, 'defineProps'));
    test('InputFieldRenderer has proper Vue 3 composition API', contains(content, '<script setup>') && contains(content, 'defineProps'));
}

if (fileExists(fieldRendererPath)) {
    const content = readFile(fieldRendererPath);
    test('FieldRenderer uses <script setup>', contains(content, '<script setup>'));
    test('FieldRenderer uses defineProps', contains(content, 'defineProps'));
    test('FieldRenderer uses defineEmits', contains(content, 'defineEmits'));
    test('FieldRenderer has proper Vue 3 composition API', contains(content, '<script setup>') && contains(content, 'defineProps'));
}

// ============================================
// Functionality Preservation
// ============================================
print('\n🔄 Functionality Preservation', 'blue');
print('---', 'blue');

if (fileExists(builderPath)) {
    const builderContent = readFile(builderPath);

    // Ensure critical functions still exist
    test('Builder still has getFieldComponent helper', contains(builderContent, 'getFieldComponent'));
    test('Builder still has getFieldProps helper', contains(builderContent, 'getFieldProps'));
    test('Builder still has selectField function', contains(builderContent, 'selectField'));
    test('Builder still has removeField function', contains(builderContent, 'removeField'));
    test('Builder still has onNestedDrop function', contains(builderContent, 'onNestedDrop'));
    test('Builder still has onColumnDrop function', contains(builderContent, 'onColumnDrop'));
    test('Builder still has getColumnFields function', contains(builderContent, 'getColumnFields'));
}

// ============================================
// Phase Comparison
// ============================================
print('\n📊 Phase Comparison', 'blue');
print('---', 'blue');

const phase1Lines = 2092; // Original
const phase2Lines = 1630; // After Phase 2 (SettingsPanel)
const phase2ALines = 1355; // After Phase 2A (StaticContentField)
const currentLines = fileExists(builderPath) ? countLines(builderPath) : phase2ALines;

print(`Phase 1 (Original): ${phase1Lines} lines`);
print(`Phase 2 (After SettingsPanel): ${phase2Lines} lines (${((phase2Lines/phase1Lines - 1) * 100).toFixed(1)}%)`);
print(`Phase 2A (After StaticContentField): ${phase2ALines} lines (${((phase2ALines/phase1Lines - 1) * 100).toFixed(1)}%)`);
print(`Phase 2B (Current - Field Rendering): ${currentLines} lines (${((currentLines/phase1Lines - 1) * 100).toFixed(1)}%)`);

const phase2Reduction = phase1Lines - phase2Lines;
const phase2AReduction = phase1Lines - phase2ALines;
const phase2BReduction = phase1Lines - currentLines;
print(`\nPhase 2B reduction: ${phase2BReduction - phase2AReduction} lines this phase`);
print(`Total reduction: ${phase2BReduction} lines (${((1 - currentLines/phase1Lines) * 100).toFixed(1)}%)`);

// ============================================
// File Size Summary
// ============================================
print('\n📏 Component Sizes', 'blue');
print('---', 'blue');

if (fileExists(inputFieldRendererPath)) {
    print(`InputFieldRenderer.vue: ${countLines(inputFieldRendererPath)} lines`);
}
if (fileExists(fieldRendererPath)) {
    print(`FieldRenderer.vue: ${countLines(fieldRendererPath)} lines`);
}
const staticContentPath = path.join(resourcesPath, 'Components/FormBuilder/Canvas/StaticContentField.vue');
if (fileExists(staticContentPath)) {
    print(`StaticContentField.vue: ${countLines(staticContentPath)} lines`);
}
if (fileExists(builderPath)) {
    print(`Builder.vue: ${countLines(builderPath)} lines`);
}

// ============================================
// Summary
// ============================================
print('\n==============================================', 'cyan');
print('Test Summary', 'cyan');
print('==============================================', 'cyan');

const total = passedTests + failedTests;
const passRate = total > 0 ? ((passedTests / total) * 100).toFixed(1) : 0;

print(`\nTotal Tests: ${total}`);
print(`Passed: ${passedTests}`, 'green');
print(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
print(`Warnings: ${warnings}`, warnings > 0 ? 'yellow' : 'green');
print(`Pass Rate: ${passRate}%\n`, passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red');

if (failedTests === 0) {
    if (warnings > 0) {
        print('✅ All tests passed with warnings!', 'yellow');
        print('⚠️  Phase 2 components created but may have minor issues.', 'yellow');
        print('   Review the warnings above.\n', 'yellow');
    } else {
        print('✅ All tests passed! Phase 2 is complete.', 'green');
        print('✅ Field rendering components extracted successfully.\n', 'green');
    }
    process.exit(0);
} else {
    print('❌ Some tests failed. Please review the issues above.', 'red');
    print('⚠️  Fix failing tests before proceeding.\n', 'yellow');
    process.exit(1);
}
