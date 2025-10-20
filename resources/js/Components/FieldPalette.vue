<template>
    <!-- Left Sidebar - Field Palette -->
    <div class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <TabView v-model:activeIndex="activeTab" class="field-tabs">
            <!-- Fields Tab -->
            <TabPanel header="Fields">
                <div class="space-y-2 p-4">
                    <div
                        v-for="fieldType in fieldTypes"
                        :key="fieldType.type"
                        class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        draggable="true"
                        @dragstart="onDragStart(fieldType, $event)"
                    >
                        <div class="flex items-center gap-2">
                            <i :class="fieldType.icon" class="text-gray-600 dark:text-gray-400"></i>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ fieldType.label }}</span>
                        </div>
                    </div>
                </div>
            </TabPanel>

            <!-- Static HTML Tab -->
            <TabPanel header="Static">
                <div class="space-y-2 p-4">
                    <div
                        v-for="fieldType in staticHtmlFields"
                        :key="fieldType.type"
                        class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        draggable="true"
                        @dragstart="onDragStart(fieldType, $event)"
                    >
                        <div class="flex items-center gap-2">
                            <i :class="fieldType.icon" class="text-gray-600 dark:text-gray-400"></i>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ fieldType.label }}</span>
                        </div>
                    </div>
                </div>
            </TabPanel> 

            <!-- Structure Tab -->
            <TabPanel header="Structure">
                <div class="space-y-2 p-4">
                    <div
                        v-for="fieldType in structureFields"
                        :key="fieldType.type"
                        class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        draggable="true"
                        @dragstart="onDragStart(fieldType, $event)"
                    >
                        <div class="flex items-center gap-2">
                            <i :class="fieldType.icon" class="text-gray-600 dark:text-gray-400"></i>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ fieldType.label }}</span>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { inputFieldTypes, staticHtmlFieldTypes, structureFieldTypes } from '@/utils/fieldTypes';

// Active tab index
const activeTab = ref(0);

// Import field types from utilities
const fieldTypes = inputFieldTypes;
const staticHtmlFields = staticHtmlFieldTypes;
const structureFields = structureFieldTypes;

// Emit event when drag starts
const emit = defineEmits(['dragstart']);

const onDragStart = (fieldType, event) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('fieldType', JSON.stringify(fieldType));
    emit('dragstart', fieldType);
};
</script>

<style scoped>
/* Custom styles for field tabs if needed */
.field-tabs :deep(.p-tabview-nav) {
    background: transparent;
    border: none;
}

.field-tabs :deep(.p-tabview-nav-link) {
    border: none;
    background: transparent;
}

.field-tabs :deep(.p-tabview-nav-link:focus) {
    box-shadow: none;
}

.field-tabs :deep(.p-tabview-panels) {
    background: transparent;
    padding: 0;
}
</style>
