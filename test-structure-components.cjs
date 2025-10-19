#!/usr/bin/env node

/**
 * Automated Test Script for Form Builder Phase 3
 * Tests structure field components extraction
 *
 * Usage: node test-phase3.cjs
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
print('Form Builder Phase 3 - Automated Tests', 'cyan');
print('==============================================\n', 'cyan');

// ============================================
// Phase 3 Component Files
// ============================================
print('📦 Phase 3 Structure Components', 'blue');
print('---', 'blue');

const containerFieldPath = path.join(resourcesPath, 'Components/FormBuilder/Canvas/ContainerField.vue');
test(
    'ContainerField.vue exists',
    fileExists(containerFieldPath),
    `File not found: ${containerFieldPath}`
);

if (fileExists(containerFieldPath)) {
    const containerContent = readFile(containerFieldPath);
    const lines = countLines(containerFieldPath);

    test('ContainerField has reasonable size (100-200 lines)', lines >= 100 && lines <= 200, `Has ${lines} lines`);
    test('ContainerField has field prop', contains(containerContent, 'field:'));
    test('ContainerField has fieldIndex prop', contains(containerContent, 'fieldIndex'));
    test('ContainerField imports Button', contains(containerContent, "import Button from 'primevue/button'"));
    test('ContainerField imports ColumnLayoutField', contains(containerContent, "import ColumnLayoutField from './ColumnLayoutField.vue'"));
    test('ContainerField handles containerChildren', contains(containerContent, 'containerChildren'));
    test('ContainerField handles containerDescription', contains(containerContent, 'containerDescription'));
    test('ContainerField emits nested-drop', contains(containerContent, "emit('nested-drop'"));
    test('ContainerField emits select-field', contains(containerContent, "emit('select-field'"));
    test('ContainerField emits remove-field', contains(containerContent, "emit('remove-field'"));
}

const columnLayoutFieldPath = path.join(resourcesPath, 'Components/FormBuilder/Canvas/ColumnLayoutField.vue');
test(
    'ColumnLayoutField.vue exists',
    fileExists(columnLayoutFieldPath),
    `File not found: ${columnLayoutFieldPath}`
);

if (fileExists(columnLayoutFieldPath)) {
    const columnContent = readFile(columnLayoutFieldPath);
    const lines = countLines(columnLayoutFieldPath);

    test('ColumnLayoutField has reasonable size (100-200 lines)', lines >= 100 && lines <= 200, `Has ${lines} lines`);
    test('ColumnLayoutField has field prop', contains(columnContent, 'field:'));
    test('ColumnLayoutField has getColumnFields prop', contains(columnContent, 'getColumnFields'));
    test('ColumnLayoutField handles columns', contains(columnContent, 'field.columns'));
    test('ColumnLayoutField has column drop zones', contains(columnContent, 'column-drop-zone'));
    test('ColumnLayoutField has empty state', contains(columnContent, 'Drop fields here'));
    test('ColumnLayoutField emits column-drop', contains(columnContent, "emit('column-drop'"));
    test('ColumnLayoutField emits select-field', contains(columnContent, "emit('select-field'"));
    test('ColumnLayoutField emits remove-field', contains(columnContent, "emit('remove-field'"));
    test('ColumnLayoutField has dragover-highlight style', contains(columnContent, 'dragover-highlight'));
}

const tabsContainerFieldPath = path.join(resourcesPath, 'Components/FormBuilder/Canvas/TabsContainerField.vue');
test(
    'TabsContainerField.vue exists',
    fileExists(tabsContainerFieldPath),
    `File not found: ${tabsContainerFieldPath}`
);

if (fileExists(tabsContainerFieldPath)) {
    const tabsContent = readFile(tabsContainerFieldPath);
    const lines = countLines(tabsContainerFieldPath);

    test('TabsContainerField has reasonable size (80-150 lines)', lines >= 80 && lines <= 150, `Has ${lines} lines`);
    test('TabsContainerField has field prop', contains(tabsContent, 'field:'));
    test('TabsContainerField imports TabView', contains(tabsContent, "import TabView from 'primevue/tabview'"));
    test('TabsContainerField imports TabPanel', contains(tabsContent, "import TabPanel from 'primevue/tabpanel'"));
    test('TabsContainerField handles tabs', contains(tabsContent, 'field.tabs'));
    test('TabsContainerField has tab fields', contains(tabsContent, 'tab.fields'));
    test('TabsContainerField emits nested-drop', contains(tabsContent, "emit('nested-drop'"));
    test('TabsContainerField emits select-field', contains(tabsContent, "emit('select-field'"));
    test('TabsContainerField emits remove-field', contains(tabsContent, "emit('remove-field'"));
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

    test('Builder imports ContainerField', contains(builderContent, "import ContainerField from '@/Components/FormBuilder/Canvas/ContainerField.vue'"));
    test('Builder imports ColumnLayoutField', contains(builderContent, "import ColumnLayoutField from '@/Components/FormBuilder/Canvas/ColumnLayoutField.vue'"));
    test('Builder imports TabsContainerField', contains(builderContent, "import TabsContainerField from '@/Components/FormBuilder/Canvas/TabsContainerField.vue'"));

    // Check if structure fields still render (either inline or via components)
    test('Builder handles container type', contains(builderContent, "element.type === 'container'"));
    test('Builder handles tabs-container type', contains(builderContent, "element.type === 'tabs-container'"));
    test('Builder handles column layout types', contains(builderContent, "element.type === '2-columns'"));

    // Line count improvement
    const originalLines = 1630; // From Phase 2
    if (lines < originalLines) {
        test(`Builder.vue line count reduced from ${originalLines}`, true, `Now ${lines} lines (-${originalLines - lines})`);
    } else if (lines === originalLines) {
        warn(`Builder.vue line count unchanged (${lines} lines) - components created but not yet integrated`);
    } else {
        warn(`Builder.vue line count increased to ${lines} lines (+${lines - originalLines})`);
    }
}

// ============================================
// Component Structure Tests
// ============================================
print('\n🏗️  Component Structure', 'blue');
print('---', 'blue');

test('Canvas directory exists', fileExists(path.join(resourcesPath, 'Components/FormBuilder/Canvas')));
test('Settings directory exists', fileExists(path.join(resourcesPath, 'Components/FormBuilder/Settings')));

// Check all canvas components
const canvasDir = path.join(resourcesPath, 'Components/FormBuilder/Canvas');
if (fileExists(canvasDir)) {
    test('FieldRenderer.vue exists in Canvas', fileExists(path.join(canvasDir, 'FieldRenderer.vue')));
    test('ContainerField.vue exists in Canvas', fileExists(path.join(canvasDir, 'ContainerField.vue')));
    test('ColumnLayoutField.vue exists in Canvas', fileExists(path.join(canvasDir, 'ColumnLayoutField.vue')));
    test('TabsContainerField.vue exists in Canvas', fileExists(path.join(canvasDir, 'TabsContainerField.vue')));
}

// ============================================
// Code Quality Checks
// ============================================
print('\n✨ Code Quality', 'blue');
print('---', 'blue');

// Check all structure components for Vue 3 best practices
[containerFieldPath, columnLayoutFieldPath, tabsContainerFieldPath].forEach((componentPath, idx) => {
    const componentNames = ['ContainerField', 'ColumnLayoutField', 'TabsContainerField'];
    if (fileExists(componentPath)) {
        const content = readFile(componentPath);
        test(`${componentNames[idx]} uses <script setup>`, contains(content, '<script setup>'));
        test(`${componentNames[idx]} uses defineProps`, contains(content, 'defineProps'));
        test(`${componentNames[idx]} uses defineEmits`, contains(content, 'defineEmits'));
        test(`${componentNames[idx]} has proper event emits`, contains(content, 'emit('));
    }
});

// ============================================
// Functionality Preservation
// ============================================
print('\n🔄 Functionality Preservation', 'blue');
print('---', 'blue');

if (fileExists(builderPath)) {
    const builderContent = readFile(builderPath);

    // Ensure critical functions still exist
    test('Builder has getColumnFields helper', contains(builderContent, 'const getColumnFields'));
    test('Builder has removeColumnField helper', contains(builderContent, 'const removeColumnField'));
    test('Builder has onNestedDrop handler', contains(builderContent, 'const onNestedDrop'));
    test('Builder has onColumnDrop handler', contains(builderContent, 'const onColumnDrop'));
    test('Builder has isNestedFieldSelected helper', contains(builderContent, 'const isNestedFieldSelected'));
    test('Builder has selectField handler', contains(builderContent, 'const selectField'));
    test('Builder has getFieldComponent helper', contains(builderContent, 'getFieldComponent'));
    test('Builder has getFieldProps helper', contains(builderContent, 'getFieldProps'));
}

// ============================================
// Phase Comparison
// ============================================
print('\n📊 Phase Comparison', 'blue');
print('---', 'blue');

const phase1Lines = 2092; // Original
const phase2Lines = 1630; // After Phase 2
const currentLines = fileExists(builderPath) ? countLines(builderPath) : phase2Lines;

print(`Phase 1 (Original): ${phase1Lines} lines`);
print(`Phase 2 (After SettingsPanel): ${phase2Lines} lines (${((phase2Lines/phase1Lines - 1) * 100).toFixed(1)}%)`);
print(`Phase 3 (Current): ${currentLines} lines (${((currentLines/phase1Lines - 1) * 100).toFixed(1)}%)`);

const phase2Reduction = phase1Lines - phase2Lines;
const phase3Reduction = phase1Lines - currentLines;
print(`\nTotal reduction: ${phase3Reduction} lines (${((1 - currentLines/phase1Lines) * 100).toFixed(1)}%)`);

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
        print('⚠️  Phase 3 components created but may not be fully integrated.', 'yellow');
        print('   The components are ready for use when needed.\n', 'yellow');
    } else {
        print('✅ All tests passed! Phase 3 is complete.', 'green');
        print('✅ Structure field components extracted successfully.\n', 'green');
    }
    process.exit(0);
} else {
    print('❌ Some tests failed. Please review the issues above.', 'red');
    print('⚠️  Fix failing tests before proceeding.\n', 'yellow');
    process.exit(1);
}
