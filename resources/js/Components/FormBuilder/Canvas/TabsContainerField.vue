<template>
    <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ field.label }}
        </label>
        <TabView class="structure-tabs">
            <TabPanel v-for="(tab, tabIdx) in field.tabs" :key="tabIdx" :header="tab.title">
                <div
                    class="p-4 border-2 border-dashed border-primary-300 dark:border-primary-600 rounded min-h-[100px] bg-gray-50 dark:bg-gray-800"
                    @dragover.prevent
                    @drop="handleNestedDrop($event, tabIdx)"
                >
                    <div v-if="!tab.fields || tab.fields.length === 0" class="text-center py-8">
                        <i class="pi pi-inbox text-3xl text-gray-400 mb-2"></i>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Drop fields here
                        </p>
                    </div>
                    <div v-else class="space-y-4">
                        <div
                            v-for="(childField, childIdx) in tab.fields"
                            :key="childField.tempId || childField.id"
                            class="relative group"
                            :class="{ 'ring-2 ring-blue-500 rounded-lg p-2 -m-2': isNestedFieldSelected(tabIdx, childIdx) }"
                            @click.stop="$emit('select-field', { tabIdx, childIdx })"
                        >
                            <!-- Delete button for nested field -->
                            <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    text
                                    rounded
                                    size="small"
                                    @click.stop="$emit('remove-field', { tabIdx, childIdx })"
                                />
                            </div>

                            <!-- Render the actual field -->
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {{ childField.label }}
                                    <span v-if="childField.is_required" class="text-red-500">*</span>
                                </label>
                                <component
                                    :is="getFieldComponent(childField.type)"
                                    v-bind="getFieldProps(childField)"
                                    disabled
                                />
                                <small v-if="childField.help_text" class="text-gray-500 dark:text-gray-400 block">
                                    {{ childField.help_text }}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    fieldIndex: {
        type: Number,
        required: true
    },
    isNestedFieldSelected: {
        type: Function,
        required: true
    },
    getFieldComponent: {
        type: Function,
        required: true
    },
    getFieldProps: {
        type: Function,
        required: true
    }
});

const emit = defineEmits(['nested-drop', 'select-field', 'remove-field']);

const handleNestedDrop = (event, tabIdx) => {
    emit('nested-drop', { event, tabIdx });
};
</script>

<style scoped>
:deep(.structure-tabs .p-tabview-nav) {
    background: transparent;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.dark .structure-tabs .p-tabview-nav) {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

:deep(.structure-tabs .p-tabview-panels) {
    background: transparent;
    padding: 0;
}

:deep(.structure-tabs .p-tabview-panel) {
    background: transparent;
}
</style>
