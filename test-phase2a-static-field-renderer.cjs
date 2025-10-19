#!/usr/bin/env node

/**
 * Automated Test Script for Form Builder Phase 4
 * Tests static/content field component extraction
 *
 * Usage: node test-static-content.cjs
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
print('Form Builder Phase 4 - Automated Tests', 'cyan');
print('==============================================\n', 'cyan');

// ============================================
// Phase 4 StaticContentField Component
// ============================================
print('📦 Phase 4 StaticContentField Component', 'blue');
print('---', 'blue');

const staticContentFieldPath = path.join(resourcesPath, 'Components/FormBuilder/Canvas/StaticContentField.vue');
test(
    'StaticContentField.vue exists',
    fileExists(staticContentFieldPath),
    `File not found: ${staticContentFieldPath}`
);

if (fileExists(staticContentFieldPath)) {
    const staticContent = readFile(staticContentFieldPath);
    const lines = countLines(staticContentFieldPath);

    test('StaticContentField has reasonable size (80-150 lines)', lines >= 80 && lines <= 150, `Has ${lines} lines`);
    test('StaticContentField has field prop', contains(staticContent, 'field:'));
    test('StaticContentField has fieldIndex prop', contains(staticContent, 'fieldIndex'));
    test('StaticContentField imports Button', contains(staticContent, "import Button from 'primevue/button'"));

    // Check for all static/content field types
    test('StaticContentField handles heading type', contains(staticContent, "element.type === 'heading'") || contains(staticContent, "field.type === 'heading'"));
    test('StaticContentField handles paragraph type', contains(staticContent, "element.type === 'paragraph'") || contains(staticContent, "field.type === 'paragraph'"));
    test('StaticContentField handles divider type', contains(staticContent, "element.type === 'divider'") || contains(staticContent, "field.type === 'divider'"));
    test('StaticContentField handles spacer type', contains(staticContent, "element.type === 'spacer'") || contains(staticContent, "field.type === 'spacer'"));
    test('StaticContentField handles html type', contains(staticContent, "element.type === 'html'") || contains(staticContent, "field.type === 'html'"));
    test('StaticContentField handles button-primary type', contains(staticContent, "element.type === 'button-primary'") || contains(staticContent, "field.type === 'button-primary'"));
    test('StaticContentField handles button-secondary type', contains(staticContent, "element.type === 'button-secondary'") || contains(staticContent, "field.type === 'button-secondary'"));
    test('StaticContentField handles button-danger type', contains(staticContent, "element.type === 'button-danger'") || contains(staticContent, "field.type === 'button-danger'"));
    test('StaticContentField handles button-submit type', contains(staticContent, "element.type === 'button-submit'") || contains(staticContent, "field.type === 'button-submit'"));
    test('StaticContentField handles link type', contains(staticContent, "element.type === 'link'") || contains(staticContent, "field.type === 'link'"));
    test('StaticContentField handles quote type', contains(staticContent, "element.type === 'quote'") || contains(staticContent, "field.type === 'quote'"));
    test('StaticContentField handles image type', contains(staticContent, "element.type === 'image'") || contains(staticContent, "field.type === 'image'"));

    // Check for dynamic properties
    test('StaticContentField uses dynamic headingLevel', contains(staticContent, 'headingLevel'));
    test('StaticContentField uses dynamic height for spacer', contains(staticContent, 'height'));
    test('StaticContentField uses URL for links', contains(staticContent, 'url'));
    test('StaticContentField uses imageSrc for images', contains(staticContent, 'imageSrc'));
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

    test('Builder imports StaticContentField', contains(builderContent, "import StaticContentField from '@/Components/FormBuilder/Canvas/StaticContentField.vue'"));

    // Check that inline templates have been replaced
    const hasInlineHeading = contains(builderContent, /<template v-if="element\.type === 'heading'">/);
    const hasInlineParagraph = contains(builderContent, /<template v-else-if="element\.type === 'paragraph'">/);
    const hasInlineDivider = contains(builderContent, /<template v-else-if="element\.type === 'divider'">/);
    const hasInlineButton = contains(builderContent, /<template v-else-if="element\.type === 'button-primary'">/);

    test('Builder no longer has inline heading template', !hasInlineHeading, 'Inline template still present');
    test('Builder no longer has inline paragraph template', !hasInlineParagraph, 'Inline template still present');
    test('Builder no longer has inline divider template', !hasInlineDivider, 'Inline template still present');
    test('Builder no longer has inline button templates', !hasInlineButton, 'Inline template still present');

    // Check that StaticContentField component is being used
    test('Builder uses StaticContentField component', contains(builderContent, '<StaticContentField'));
    test('Builder passes field prop to StaticContentField', contains(builderContent, ':field="element"') && contains(builderContent, 'StaticContentField'));
    test('Builder passes field-index prop to StaticContentField', contains(builderContent, ':field-index="index"') && contains(builderContent, 'StaticContentField'));

    // Line count improvement
    const phase3Lines = 1391; // From Phase 3
    if (lines < phase3Lines) {
        test(`Builder.vue line count reduced from ${phase3Lines}`, true, `Now ${lines} lines (-${phase3Lines - lines})`);
    } else if (lines === phase3Lines) {
        warn(`Builder.vue line count unchanged (${lines} lines)`);
    } else {
        warn(`Builder.vue line count increased to ${lines} lines (+${lines - phase3Lines})`);
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
    test('ContainerField.vue exists in Canvas', fileExists(path.join(canvasDir, 'ContainerField.vue')));
    test('ColumnLayoutField.vue exists in Canvas', fileExists(path.join(canvasDir, 'ColumnLayoutField.vue')));
    test('TabsContainerField.vue exists in Canvas', fileExists(path.join(canvasDir, 'TabsContainerField.vue')));
    test('StaticContentField.vue exists in Canvas', fileExists(path.join(canvasDir, 'StaticContentField.vue')));
}

// ============================================
// Code Quality Checks
// ============================================
print('\n✨ Code Quality', 'blue');
print('---', 'blue');

if (fileExists(staticContentFieldPath)) {
    const content = readFile(staticContentFieldPath);
    test('StaticContentField uses <script setup>', contains(content, '<script setup>'));
    test('StaticContentField uses defineProps', contains(content, 'defineProps'));
    test('StaticContentField has proper Vue 3 composition API', contains(content, '<script setup>') && contains(content, 'defineProps'));
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
    test('Builder still imports ContainerField', contains(builderContent, 'ContainerField'));
    test('Builder still imports ColumnLayoutField', contains(builderContent, 'ColumnLayoutField'));
    test('Builder still imports TabsContainerField', contains(builderContent, 'TabsContainerField'));
}

// ============================================
// Phase Comparison
// ============================================
print('\n📊 Phase Comparison', 'blue');
print('---', 'blue');

const phase1Lines = 2092; // Original
const phase2Lines = 1630; // After Phase 2
const phase3Lines = 1391; // After Phase 3
const currentLines = fileExists(builderPath) ? countLines(builderPath) : phase3Lines;

print(`Phase 1 (Original): ${phase1Lines} lines`);
print(`Phase 2 (After SettingsPanel): ${phase2Lines} lines (${((phase2Lines/phase1Lines - 1) * 100).toFixed(1)}%)`);
print(`Phase 3 (After Structure Fields): ${phase3Lines} lines (${((phase3Lines/phase1Lines - 1) * 100).toFixed(1)}%)`);
print(`Phase 4 (Current): ${currentLines} lines (${((currentLines/phase1Lines - 1) * 100).toFixed(1)}%)`);

const phase2Reduction = phase1Lines - phase2Lines;
const phase3Reduction = phase1Lines - phase3Lines;
const phase4Reduction = phase1Lines - currentLines;
print(`\nPhase 4 reduction: ${phase4Reduction - phase3Reduction} lines this phase`);
print(`Total reduction: ${phase4Reduction} lines (${((1 - currentLines/phase1Lines) * 100).toFixed(1)}%)`);

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
        print('⚠️  Phase 4 component created but may have minor issues.', 'yellow');
        print('   Review the warnings above.\\n', 'yellow');
    } else {
        print('✅ All tests passed! Phase 4 is complete.', 'green');
        print('✅ Static/content field component extracted successfully.\\n', 'green');
    }
    process.exit(0);
} else {
    print('❌ Some tests failed. Please review the issues above.', 'red');
    print('⚠️  Fix failing tests before proceeding.\\n', 'yellow');
    process.exit(1);
}
