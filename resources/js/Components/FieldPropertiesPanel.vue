<template>
    <!-- Right Sidebar - Settings Panel -->
    <div class="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div class="flex items-center justify-between p-4 pb-0">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                {{ showFormSettings ? 'Form Settings' : 'Field Settings' }}
            </h3>
            <Button
                icon="pi pi-times"
                text
                rounded
                @click="handleClose"
            />
        </div>

        <!-- Form Settings -->
        <div v-if="showFormSettings" class="p-4">
            <TabView v-model:activeIndex="activeTab" class="settings-tabs">
                <!-- Form Settings Tab -->
                <TabPanel header="Settings">
                    <div class="space-y-4 p-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Form Title
                            </label>
                            <InputText :model-value="formSettings.title" @update:model-value="updateFormSetting('title', $event)" class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <Textarea :model-value="formSettings.description" @update:model-value="updateFormSetting('description', $event)" rows="2" class="w-full" />
                        </div>
                        <div class="flex items-center gap-3">
                            <InputSwitch :model-value="formSettings.is_active" @update:model-value="updateFormSetting('is_active', $event)" inputId="is_active" />
                            <label for="is_active" class="text-sm text-gray-700 dark:text-gray-300">
                                Form is active
                            </label>
                        </div>
                    </div>
                </TabPanel>

                <!-- Theme Tab -->
                <TabPanel header="Theme">
                    <div class="space-y-4 p-4">
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Theme customization options will be available here.
                        </p>
                    </div>
                </TabPanel>
            </TabView>
        </div>

        <!-- Field Settings -->
        <TabView v-else-if="selectedField" v-model:activeIndex="activeTab" class="settings-tabs">
            <!-- Field Settings Tab -->
            <TabPanel header="Field">
                <div class="space-y-4 p-4">
                    <!-- Settings for Structure Fields -->
                    <template v-if="['container', 'tabs-container', '2-columns', '3-columns', '4-columns', 'grid-layout', 'table'].includes(selectedField.type)">
                        <!-- Label (for identification) -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Label *
                            </label>
                            <InputText :model-value="selectedField.label" @update:model-value="updateField('label', $event)" class="w-full" />
                        </div>

                        <!-- Container Settings -->
                        <template v-if="selectedField.type === 'container'">
                            <div class="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <i class="pi pi-info-circle mr-2"></i>
                                Drag and drop fields from the left sidebar into this container
                            </div>
                            <div
                                v-if="selectedField.containerChildren && selectedField.containerChildren.length > 0"
                                class="mb-4"
                            >
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contains {{ selectedField.containerChildren.length }} field(s)
                                </label>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Padding (px)
                                </label>
                                <InputText
                                    :model-value="selectedField.containerPadding"
                                    @update:model-value="updateField('containerPadding', Number($event))"
                                    type="number"
                                    min="0"
                                    max="64"
                                    class="w-full"
                                />
                            </div>
                            <div class="flex items-center gap-3">
                                <InputSwitch :model-value="selectedField.containerBorder" @update:model-value="updateField('containerBorder', $event)" inputId="container_border" />
                                <label for="container_border" class="text-sm text-gray-700 dark:text-gray-300">
                                    Show Border
                                </label>
                            </div>
                        </template>

                        <!-- Tabs Container Settings -->
                        <template v-if="selectedField.type === 'tabs-container'">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tabs
                                </label>
                                <div class="space-y-2">
                                    <div
                                        v-for="(tab, idx) in selectedField.tabs"
                                        :key="idx"
                                        class="flex gap-2"
                                    >
                                        <InputText
                                            :model-value="tab.title"
                                            @update:model-value="updateTabTitle(idx, $event)"
                                            placeholder="Tab title"
                                            class="flex-1"
                                        />
                                        <Button
                                            icon="pi pi-trash"
                                            severity="danger"
                                            text
                                            @click="removeTab(idx)"
                                        />
                                    </div>
                                    <Button
                                        label="Add Tab"
                                        icon="pi pi-plus"
                                        size="small"
                                        outlined
                                        class="w-full"
                                        @click="addTab"
                                    />
                                </div>
                            </div>
                        </template>

                        <!-- Column Layout Settings (2, 3, 4 columns) -->
                        <template v-if="['2-columns', '3-columns', '4-columns'].includes(selectedField.type)">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Gap Size (px)
                                </label>
                                <InputText
                                    :model-value="selectedField.gap"
                                    @update:model-value="updateField('gap', Number($event))"
                                    type="number"
                                    min="0"
                                    max="64"
                                    class="w-full"
                                />
                            </div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">
                                This layout has {{ selectedField.columns }} fixed columns
                            </div>
                        </template>

                        <!-- Grid Layout Settings -->
                        <template v-if="selectedField.type === 'grid-layout'">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Number of Columns
                                </label>
                                <InputText
                                    :model-value="selectedField.columns"
                                    @update:model-value="updateField('columns', Number($event))"
                                    type="number"
                                    min="1"
                                    max="6"
                                    class="w-full"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Gap Size (px)
                                </label>
                                <InputText
                                    :model-value="selectedField.gap"
                                    @update:model-value="updateField('gap', Number($event))"
                                    type="number"
                                    min="0"
                                    max="64"
                                    class="w-full"
                                />
                            </div>
                        </template>

                        <!-- Table Settings -->
                        <template v-if="selectedField.type === 'table'">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Number of Rows
                                </label>
                                <InputText
                                    :model-value="selectedField.rows"
                                    @update:model-value="handleTableRowsChange"
                                    type="number"
                                    min="1"
                                    max="20"
                                    class="w-full"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Number of Columns
                                </label>
                                <InputText
                                    :model-value="selectedField.tableColumns"
                                    @update:model-value="handleTableColumnsChange"
                                    type="number"
                                    min="1"
                                    max="10"
                                    class="w-full"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Headers
                                </label>
                                <div class="space-y-2">
                                    <InputText
                                        v-for="(header, idx) in selectedField.headers"
                                        :key="idx"
                                        :model-value="header"
                                        @update:model-value="updateHeader(idx, $event)"
                                        :placeholder="`Header ${idx + 1}`"
                                        class="w-full"
                                    />
                                </div>
                            </div>
                        </template>
                    </template>

                    <!-- Settings for Static HTML Fields -->
                    <template v-else-if="['heading', 'paragraph', 'divider', 'spacer', 'html', 'button-primary', 'button-secondary', 'button-danger', 'button-submit', 'link', 'quote', 'image'].includes(selectedField.type)">
                        <!-- Label (for identification) -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Label *
                            </label>
                            <InputText :model-value="selectedField.label" @update:model-value="updateField('label', $event)" class="w-full" />
                        </div>

                        <!-- Heading Level (for heading only) -->
                        <div v-if="selectedField.type === 'heading'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Heading Level
                            </label>
                            <Dropdown
                                :model-value="selectedField.headingLevel"
                                @update:model-value="updateField('headingLevel', $event)"
                                :options="['h1', 'h2', 'h3', 'h4', 'h5', 'h6']"
                                class="w-full"
                            />
                        </div>

                        <!-- Button Text (for buttons) -->
                        <div v-if="selectedField.type.startsWith('button-')">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Button Text
                            </label>
                            <InputText
                                :model-value="selectedField.content"
                                @update:model-value="updateField('content', $event)"
                                class="w-full"
                            />
                        </div>

                        <!-- Link Text (for link) -->
                        <div v-if="selectedField.type === 'link'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Link Text
                            </label>
                            <InputText
                                :model-value="selectedField.content"
                                @update:model-value="updateField('content', $event)"
                                class="w-full"
                            />
                        </div>

                        <!-- URL (for link) -->
                        <div v-if="selectedField.type === 'link'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                URL
                            </label>
                            <InputText
                                :model-value="selectedField.url"
                                @update:model-value="updateField('url', $event)"
                                type="url"
                                placeholder="https://example.com"
                                class="w-full"
                            />
                        </div>

                        <!-- Quote Text (for quote) -->
                        <div v-if="selectedField.type === 'quote'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Quote Text
                            </label>
                            <Textarea
                                :model-value="selectedField.content"
                                @update:model-value="updateField('content', $event)"
                                rows="3"
                                class="w-full"
                            />
                        </div>

                        <!-- Image Source (for image) -->
                        <div v-if="selectedField.type === 'image'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Image URL
                            </label>
                            <InputText
                                :model-value="selectedField.imageSrc"
                                @update:model-value="updateField('imageSrc', $event)"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                class="w-full"
                            />
                        </div>

                        <!-- Image Alt Text (for image) -->
                        <div v-if="selectedField.type === 'image'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Alt Text
                            </label>
                            <InputText
                                :model-value="selectedField.imageAlt"
                                @update:model-value="updateField('imageAlt', $event)"
                                placeholder="Image description"
                                class="w-full"
                            />
                        </div>

                        <!-- Content (for heading, paragraph, html) -->
                        <div v-if="['heading', 'paragraph', 'html'].includes(selectedField.type)">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {{ selectedField.type === 'html' ? 'HTML Content' : 'Content' }}
                            </label>
                            <Textarea
                                :model-value="selectedField.content"
                                @update:model-value="updateField('content', $event)"
                                :rows="selectedField.type === 'html' ? 6 : 3"
                                class="w-full"
                            />
                        </div>

                        <!-- Height (for spacer only) -->
                        <div v-if="selectedField.type === 'spacer'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Height (px)
                            </label>
                            <InputText
                                :model-value="selectedField.height"
                                @update:model-value="updateField('height', Number($event))"
                                type="number"
                                class="w-full"
                            />
                        </div>
                    </template>

                    <!-- Settings for Regular Form Fields -->
                    <template v-else>
                        <!-- Label -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Label *
                            </label>
                            <InputText :model-value="selectedField.label" @update:model-value="updateField('label', $event)" class="w-full" />
                        </div>

                        <!-- Name -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Field Name *
                            </label>
                            <InputText :model-value="selectedField.name" @update:model-value="updateField('name', $event)" class="w-full" />
                        </div>

                        <!-- Placeholder -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Placeholder
                            </label>
                            <InputText :model-value="selectedField.placeholder" @update:model-value="updateField('placeholder', $event)" class="w-full" />
                        </div>

                        <!-- Help Text -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Help Text
                            </label>
                            <Textarea :model-value="selectedField.help_text" @update:model-value="updateField('help_text', $event)" rows="2" class="w-full" />
                        </div>

                        <!-- Required -->
                        <div class="flex items-center gap-3">
                            <InputSwitch :model-value="selectedField.is_required" @update:model-value="updateField('is_required', $event)" inputId="is_required" />
                            <label for="is_required" class="text-sm text-gray-700 dark:text-gray-300">
                                Required field
                            </label>
                        </div>

                        <!-- Options for select, multiselect, radio, checkbox -->
                        <div v-if="['select', 'multiselect', 'radio', 'checkbox'].includes(selectedField.type)">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Options
                            </label>
                            <div class="space-y-2">
                                <div
                                    v-for="(option, idx) in selectedField.options"
                                    :key="idx"
                                    class="flex gap-2"
                                >
                                    <InputText
                                        :model-value="option"
                                        @update:model-value="updateOption(idx, $event)"
                                        placeholder="Option label"
                                        class="flex-1"
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        severity="danger"
                                        text
                                        @click="removeOption(idx)"
                                    />
                                </div>
                                <Button
                                    label="Add Option"
                                    icon="pi pi-plus"
                                    size="small"
                                    outlined
                                    class="w-full"
                                    @click="addOption"
                                />
                            </div>
                        </div>
                    </template>
                </div>
            </TabPanel>

            <!-- Theme Tab -->
            <TabPanel header="Theme">
                <div class="space-y-4 p-4">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Theme customization options will be available here.
                    </p>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputSwitch from 'primevue/inputswitch';
import Dropdown from 'primevue/dropdown';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const props = defineProps({
    selectedField: {
        type: Object,
        default: null
    },
    showFormSettings: {
        type: Boolean,
        default: false
    },
    formSettings: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits([
    'close',
    'update:field',
    'update:form-setting',
    'add-option',
    'remove-option',
    'update-option',
    'add-tab',
    'remove-tab',
    'update-tab-title',
    'update-table-rows',
    'update-table-columns',
    'update-header'
]);

const activeTab = ref(0);

const handleClose = () => {
    emit('close');
};

const updateField = (key, value) => {
    emit('update:field', { key, value });
};

const updateFormSetting = (key, value) => {
    emit('update:form-setting', { key, value });
};

const addOption = () => {
    emit('add-option');
};

const removeOption = (index) => {
    emit('remove-option', index);
};

const updateOption = (index, value) => {
    emit('update-option', { index, value });
};

const addTab = () => {
    emit('add-tab');
};

const removeTab = (index) => {
    emit('remove-tab', index);
};

const updateTabTitle = (index, value) => {
    emit('update-tab-title', { index, value });
};

const handleTableRowsChange = (value) => {
    emit('update-table-rows', Number(value));
};

const handleTableColumnsChange = (value) => {
    emit('update-table-columns', Number(value));
};

const updateHeader = (index, value) => {
    emit('update-header', { index, value });
};
</script>

<style scoped>
.settings-tabs :deep(.p-tabview-nav) {
    background: transparent;
    border: none;
}

.settings-tabs :deep(.p-tabview-nav-link) {
    border: none;
    background: transparent;
}

.settings-tabs :deep(.p-tabview-nav-link:focus) {
    box-shadow: none;
}

.settings-tabs :deep(.p-tabview-panels) {
    background: transparent;
    padding: 0;
}
</style>
