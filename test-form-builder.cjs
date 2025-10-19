#!/usr/bin/env node

/**
 * Automated Test Script for Form Builder Phase 2
 * Tests SettingsPanel and BuilderTopBar components
 *
 * Usage: node test-form-builder.js
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
print('==============================================\n', 'cyan');

// ============================================
// Phase 1 Components Tests
// ============================================
print('📦 Phase 1 Components', 'blue');
print('---', 'blue');

const builderTopBarPath = path.join(resourcesPath, 'Components/FormBuilder/BuilderTopBar.vue');
test(
    'BuilderTopBar.vue exists',
    fileExists(builderTopBarPath),
    `File not found: ${builderTopBarPath}`
);

if (fileExists(builderTopBarPath)) {
    const topBarContent = readFile(builderTopBarPath);
    test('BuilderTopBar has formTitle prop', contains(topBarContent, 'formTitle'));
    test('BuilderTopBar has saving prop', contains(topBarContent, 'saving'));
    test('BuilderTopBar emits back event', contains(topBarContent, "@click=\"$emit('back')\""));
    test('BuilderTopBar emits save event', contains(topBarContent, "@click=\"$emit('save')\""));
}

// ============================================
// Phase 2 Components Tests
// ============================================
print('\n📦 Phase 2 Components', 'blue');
print('---', 'blue');

const settingsPanelPath = path.join(resourcesPath, 'Components/FormBuilder/Settings/SettingsPanel.vue');
test(
    'SettingsPanel.vue exists',
    fileExists(settingsPanelPath),
    `File not found: ${settingsPanelPath}`
);

if (fileExists(settingsPanelPath)) {
    const settingsContent = readFile(settingsPanelPath);
    const lines = countLines(settingsPanelPath);

    test('SettingsPanel has 500+ lines', lines >= 500, `Only ${lines} lines`);
    test('SettingsPanel has selectedField prop', contains(settingsContent, 'selectedField'));
    test('SettingsPanel has formData prop', contains(settingsContent, 'formData'));
    test('SettingsPanel has showFormSettings prop', contains(settingsContent, 'showFormSettings'));
    test('SettingsPanel emits close event', contains(settingsContent, "emit('close')"));
    test('SettingsPanel emits update:field event', contains(settingsContent, "emit('update:field'"));
    test('SettingsPanel emits update:formData event', contains(settingsContent, "emit('update:formData'"));
    test('SettingsPanel has container settings', contains(settingsContent, 'containerDescription'));
    test('SettingsPanel has tabs settings', contains(settingsContent, 'tabs-container'));
    test('SettingsPanel has column settings', contains(settingsContent, '2-columns'));
    test('SettingsPanel has table settings', contains(settingsContent, 'tableColumns'));
    test('SettingsPanel has static field settings', contains(settingsContent, 'heading'));
    test('SettingsPanel has form field settings', contains(settingsContent, 'is_required'));
    test('SettingsPanel has updateTabTitle helper', contains(settingsContent, 'updateTabTitle'));
    test('SettingsPanel has updateTableHeader helper', contains(settingsContent, 'updateTableHeader'));
    test('SettingsPanel has updateOption helper', contains(settingsContent, 'updateOption'));
}

const fieldRendererPath = path.join(resourcesPath, 'Components/FormBuilder/Canvas/FieldRenderer.vue');
test(
    'FieldRenderer.vue exists',
    fileExists(fieldRendererPath),
    `File not found: ${fieldRendererPath}`
);

if (fileExists(fieldRendererPath)) {
    const rendererContent = readFile(fieldRendererPath);
    test('FieldRenderer has field prop', contains(rendererContent, 'field:'));
    test('FieldRenderer has fieldIndex prop', contains(rendererContent, 'fieldIndex'));
    test('FieldRenderer handles heading type', contains(rendererContent, "field.type === 'heading'"));
    test('FieldRenderer handles paragraph type', contains(rendererContent, "field.type === 'paragraph'"));
    test('FieldRenderer handles divider type', contains(rendererContent, "field.type === 'divider'"));
    test('FieldRenderer has drag handle', contains(rendererContent, 'drag-handle'));
    test('FieldRenderer has delete button', contains(rendererContent, 'pi-trash'));
}

// ============================================
// Builder.vue Integration Tests
// ============================================
print('\n🔗 Builder.vue Integration', 'blue');
print('---', 'blue');

const builderPath = path.join(resourcesPath, 'Pages/Forms/Builder.vue');
test(
    'Builder.vue exists',
    fileExists(builderPath),
    `File not found: ${builderPath}`
);

if (fileExists(builderPath)) {
    const builderContent = readFile(builderPath);
    const lines = countLines(builderPath);

    test('Builder.vue reduced to ~1600 lines', lines < 1700, `Still ${lines} lines`);
    test('Builder imports BuilderTopBar', contains(builderContent, "import BuilderTopBar from '@/Components/FormBuilder/BuilderTopBar.vue'"));
    test('Builder imports SettingsPanel', contains(builderContent, "import SettingsPanel from '@/Components/FormBuilder/Settings/SettingsPanel.vue'"));
    test('Builder uses <BuilderTopBar /> component', contains(builderContent, '<BuilderTopBar'));
    test('Builder uses <SettingsPanel /> component', contains(builderContent, '<SettingsPanel'));
    test('Builder passes formData to SettingsPanel', contains(builderContent, ':form-data="formData"'));
    test('Builder passes selectedField to SettingsPanel', contains(builderContent, ':selected-field="selectedField"'));
    test('Builder handles @close event', contains(builderContent, '@close='));
    test('Builder handles @update:field event', contains(builderContent, '@update:field='));
    test('Builder handles @add-tab event', contains(builderContent, '@add-tab='));
    test('Builder handles @remove-option event', contains(builderContent, '@remove-option='));

    // Check that old inline settings panel code is removed
    test(
        'Old inline settings removed (no duplicate Form Settings)',
        !contains(builderContent, /Form Settings Content.*TabView.*TabPanel.*Form Title/s) ||
        builderContent.split('Form Settings').length <= 2
    );
}

// ============================================
// File Structure Tests
// ============================================
print('\n📁 File Structure', 'blue');
print('---', 'blue');

test('Canvas directory exists', fileExists(path.join(resourcesPath, 'Components/FormBuilder/Canvas')));
test('Settings directory exists', fileExists(path.join(resourcesPath, 'Components/FormBuilder/Settings')));

// ============================================
// CSS Tests
// ============================================
print('\n🎨 CSS Styling', 'blue');
print('---', 'blue');

const cssPath = path.join(basePath, 'resources/css/app.css');
if (fileExists(cssPath)) {
    const cssContent = readFile(cssPath);
    test('Dark theme settings panel styles exist', contains(cssContent, '.settings-panel-dark'));
    test('Input field dark styling exists', contains(cssContent, '.settings-panel-dark .p-inputtext'));
    test('Accordion dark styling exists', contains(cssContent, '.settings-panel-dark .p-accordion'));
    test('TabView dark styling exists', contains(cssContent, '.settings-panel-dark .p-tabview'));
}

// ============================================
// Code Quality Checks
// ============================================
print('\n✨ Code Quality', 'blue');
print('---', 'blue');

if (fileExists(settingsPanelPath)) {
    const settingsContent = readFile(settingsPanelPath);

    // Check for proper Vue 3 Composition API usage
    test('Uses <script setup>', contains(settingsContent, '<script setup>'));
    test('Uses defineProps', contains(settingsContent, 'defineProps'));
    test('Uses defineEmits', contains(settingsContent, 'defineEmits'));

    // Check for proper event handling
    test('Uses @update:model-value pattern', contains(settingsContent, '@update:model-value'));

    // Check for dark mode support
    test('Has dark mode classes', contains(settingsContent, 'dark:'));
}

// ============================================
// Integration Completeness
// ============================================
print('\n🔄 Integration Completeness', 'blue');
print('---', 'blue');

if (fileExists(builderPath)) {
    const builderContent = readFile(builderPath);

    // Check that builder has all necessary methods
    test('Builder has addTab method', contains(builderContent, 'const addTab'));
    test('Builder has removeTab method', contains(builderContent, 'const removeTab'));
    test('Builder has addOption method', contains(builderContent, 'const addOption'));
    test('Builder has removeOption method', contains(builderContent, 'const removeOption'));
    test('Builder has updateTableRows method', contains(builderContent, 'const updateTableRows'));
    test('Builder has updateTableColumns method', contains(builderContent, 'const updateTableColumns'));
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
    print('✅ All tests passed! Phase 2 is ready.', 'green');
    print('✅ You can proceed to Phase 3.\n', 'green');
    process.exit(0);
} else {
    print('❌ Some tests failed. Please review the issues above.', 'red');
    print('⚠️  Fix failing tests before proceeding to Phase 3.\n', 'yellow');
    process.exit(1);
}
