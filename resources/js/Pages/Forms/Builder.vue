<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Top Bar -->
        <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <Button
                        icon="pi pi-arrow-left"
                        text
                        @click="router.visit('/forms')"
                    />
                    <div>
                        <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ formData.title }}</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Form Builder</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <Button
                        label="Export Code"
                        icon="pi pi-code"
                        severity="help"
                        outlined
                        @click="showExportDialog = true"
                    />
                    <Button
                        label="Preview"
                        icon="pi pi-eye"
                        severity="secondary"
                        outlined
                        @click="previewForm"
                    />
                    <Button
                        label="Save Form"
                        icon="pi pi-save"
                        :loading="saving"
                        @click="saveForm"
                    />
                </div>
            </div>
        </div>

        <div class="flex h-[calc(100vh-73px)]">
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
                                @dragstart="onDragStart(fieldType)"
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
                                @dragstart="onDragStart(fieldType)"
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
                                @dragstart="onDragStart(fieldType)"
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

            <!-- Center - Form Builder Canvas -->
            <div class="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div class="max-w-3xl mx-auto py-12">
                    <!-- Form Header -->
                    <div class="text-center mb-8" @click="openFormSettings">
                        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {{ formData.title }}
                        </h1>
                        <p v-if="formData.description" class="text-lg text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {{ formData.description }}
                        </p>
                    </div>

                    <!-- Form Card -->
                    <Card>
                        <template #content>
                            <!-- Drop Zone -->
                            <div
                                class="min-h-[300px]"
                                :class="{ 'bg-blue-50 dark:bg-blue-900/20': isDragging }"
                                @dragover.prevent="isDragging = true"
                                @dragleave="isDragging = false"
                                @drop.prevent="onDrop"
                                @click="openFormSettings"
                            >
                                <div v-if="fields.length === 0" class="text-center py-12">
                                    <i class="pi pi-inbox text-6xl text-gray-400 mb-4"></i>
                                    <p class="text-gray-600 dark:text-gray-400">
                                        Drag and drop fields here to build your form
                                    </p>
                                </div>

                                <!-- Fields List -->
                                <draggable
                                    v-model="fields"
                                    :item-key="(item) => item.id || item.tempId"
                                    handle=".drag-handle"
                                    class="space-y-6"
                                >
                                    <template #item="{ element, index }">
                                        <div
                                            class="space-y-2 relative group"
                                            :class="{ 'ring-2 ring-blue-500 rounded-lg p-2 -m-2': selectedFieldIndex === index }"
                                            @click.stop="selectField(index)"
                                        >
                                            <!-- Drag Handle - Only visible on hover -->
                                            <div class="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <i class="pi pi-bars drag-handle cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"></i>
                                            </div>

                                            <!-- Delete Button - Only visible on hover -->
                                            <div class="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    icon="pi pi-trash"
                                                    severity="danger"
                                                    text
                                                    rounded
                                                    size="small"
                                                    @click.stop="removeField(index)"
                                                />
                                            </div>

                                            <!-- Label -->
                                            <label
                                                :for="element.name || `field-${index}`"
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                {{ element.label }}
                                                <span v-if="element.is_required" class="text-red-500">*</span>
                                            </label>

                                            <!-- Field Preview -->
                                            <div class="mt-2">
                                                <!-- Static HTML Fields -->
                                                <template v-if="element.type === 'heading'">
                                                    <component :is="element.headingLevel || 'h2'" class="font-bold text-gray-900 dark:text-white">
                                                        {{ element.content }}
                                                    </component>
                                                </template>
                                                <template v-else-if="element.type === 'paragraph'">
                                                    <p class="text-gray-700 dark:text-gray-300">{{ element.content }}</p>
                                                </template>
                                                <template v-else-if="element.type === 'divider'">
                                                    <hr class="border-t border-gray-300 dark:border-gray-600" />
                                                </template>
                                                <template v-else-if="element.type === 'spacer'">
                                                    <div :style="{ height: (element.height || 20) + 'px' }" class="bg-gray-100 dark:bg-gray-700 rounded"></div>
                                                </template>
                                                <template v-else-if="element.type === 'html'">
                                                    <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                                                        {{ element.content }}
                                                    </div>
                                                </template>
                                                <template v-else-if="element.type === 'button-primary'">
                                                    <Button :label="element.content" severity="primary" />
                                                </template>
                                                <template v-else-if="element.type === 'button-secondary'">
                                                    <Button :label="element.content" severity="secondary" />
                                                </template>
                                                <template v-else-if="element.type === 'button-danger'">
                                                    <Button :label="element.content" severity="danger" />
                                                </template>
                                                <template v-else-if="element.type === 'button-submit'">
                                                    <Button :label="element.content" type="submit" />
                                                </template>
                                                <template v-else-if="element.type === 'link'">
                                                    <a :href="element.url" target="_blank" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                                                        {{ element.content }}
                                                    </a>
                                                </template>
                                                <template v-else-if="element.type === 'quote'">
                                                    <blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300">
                                                        {{ element.content }}
                                                    </blockquote>
                                                </template>
                                                <template v-else-if="element.type === 'image'">
                                                    <img :src="element.imageSrc" :alt="element.imageAlt" class="max-w-full h-auto rounded" />
                                                </template>
                                                <!-- Structure Fields -->
                                                <template v-else-if="element.type === 'container'">
                                                    <div
                                                        class="rounded min-h-[100px]"
                                                        :class="{
                                                            'border border-gray-300 dark:border-gray-600': element.containerBorder
                                                        }"
                                                        :style="{ padding: (element.containerPadding || 16) + 'px' }"
                                                    >
                                                        <p class="text-gray-600 dark:text-gray-400">
                                                            {{ element.containerContent }}
                                                        </p>
                                                    </div>
                                                </template>
                                                <template v-else-if="element.type === 'tabs-container'">
                                                    <TabView class="structure-tabs">
                                                        <TabPanel v-for="(tab, tabIdx) in element.tabs" :key="tabIdx" :header="tab.title">
                                                            <div class="p-4 border border-gray-200 dark:border-gray-700 rounded min-h-[100px]">
                                                                <p v-if="!tab.fields || tab.fields.length === 0" class="text-sm text-gray-500 dark:text-gray-400 text-center">
                                                                    Tab content will appear here
                                                                </p>
                                                                <!-- Could add nested fields here later -->
                                                            </div>
                                                        </TabPanel>
                                                    </TabView>
                                                </template>
                                                <template v-else-if="element.type === '2-columns' || element.type === '3-columns' || element.type === '4-columns' || element.type === 'grid-layout'">
                                                    <div
                                                        class="grid border border-gray-200 dark:border-gray-700 rounded p-4 min-h-[100px]"
                                                        :style="{
                                                            gridTemplateColumns: `repeat(${element.columns || 2}, 1fr)`,
                                                            gap: `${element.gap || 4}px`
                                                        }"
                                                    >
                                                        <div
                                                            v-for="col in (element.columns || 2)"
                                                            :key="col"
                                                            class="border border-dashed border-gray-300 dark:border-gray-600 rounded p-4 min-h-[80px] flex items-center justify-center"
                                                        >
                                                            <span class="text-sm text-gray-500 dark:text-gray-400">Column {{ col }}</span>
                                                        </div>
                                                    </div>
                                                </template>
                                                <template v-else-if="element.type === 'table'">
                                                    <div class="overflow-x-auto">
                                                        <table class="w-full border-collapse border border-gray-300 dark:border-gray-600">
                                                            <thead>
                                                                <tr class="bg-gray-100 dark:bg-gray-700">
                                                                    <th
                                                                        v-for="(header, hIdx) in element.headers"
                                                                        :key="hIdx"
                                                                        class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium"
                                                                    >
                                                                        {{ header }}
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr v-for="(row, rIdx) in element.tableData" :key="rIdx">
                                                                    <td
                                                                        v-for="(cell, cIdx) in row"
                                                                        :key="cIdx"
                                                                        class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm"
                                                                    >
                                                                        {{ cell }}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </template>
                                                <!-- Regular Form Fields -->
                                                <component
                                                    v-else
                                                    :is="getFieldComponent(element.type)"
                                                    v-bind="getFieldProps(element)"
                                                    disabled
                                                />
                                            </div>

                                            <!-- Help Text -->
                                            <small v-if="element.help_text" class="text-gray-500 dark:text-gray-400 block mt-1">
                                                {{ element.help_text }}
                                            </small>
                                        </div>
                                    </template>
                                </draggable>
                            </div>
                        </template>
                    </Card>

                    <!-- Footer -->
                    <div class="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                        Powered by FormBuilder
                    </div>
                </div>
            </div>

            <!-- Right Sidebar - Settings Panel -->
            <div
                v-if="selectedFieldIndex !== null || showFormSettings"
                class="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
            >
                <div class="flex items-center justify-between p-4 pb-0">
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        {{ showFormSettings ? 'Form Settings' : 'Field Settings' }}
                    </h3>
                    <Button
                        icon="pi pi-times"
                        text
                        rounded
                        @click="selectedFieldIndex = null; showFormSettings = false"
                    />
                </div>

                <!-- Form Settings -->
                <div v-if="showFormSettings" class="p-4">
                    <TabView v-model:activeIndex="settingsTab" class="settings-tabs">
                        <!-- Form Settings Tab -->
                        <TabPanel header="Settings">
                            <div class="space-y-4 p-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Form Title
                                    </label>
                                    <InputText v-model="formData.title" class="w-full" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <Textarea v-model="formData.description" rows="2" class="w-full" />
                                </div>
                                <div class="flex items-center gap-3">
                                    <InputSwitch v-model="formData.is_active" inputId="is_active" />
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
                <TabView v-else-if="selectedFieldIndex !== null" v-model:activeIndex="settingsTab" class="settings-tabs">
                    <!-- Field Settings Tab -->
                    <TabPanel header="Field">
                        <div v-if="selectedField" class="space-y-4 p-4">
                    <!-- Settings for Structure Fields -->
                    <template v-if="['container', 'tabs-container', '2-columns', '3-columns', '4-columns', 'grid-layout', 'table'].includes(selectedField.type)">
                        <!-- Label (for identification) -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Label *
                            </label>
                            <InputText v-model="selectedField.label" class="w-full" />
                        </div>

                        <!-- Container Settings -->
                        <template v-if="selectedField.type === 'container'">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Content
                                </label>
                                <Textarea
                                    v-model="selectedField.containerContent"
                                    rows="4"
                                    class="w-full"
                                    placeholder="Container content..."
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Padding (px)
                                </label>
                                <InputText
                                    v-model.number="selectedField.containerPadding"
                                    type="number"
                                    min="0"
                                    max="64"
                                    class="w-full"
                                />
                            </div>
                            <div class="flex items-center gap-3">
                                <InputSwitch v-model="selectedField.containerBorder" inputId="container_border" />
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
                                            v-model="selectedField.tabs[idx].title"
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
                                    v-model.number="selectedField.gap"
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
                                    v-model.number="selectedField.columns"
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
                                    v-model.number="selectedField.gap"
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
                                    v-model.number="selectedField.rows"
                                    type="number"
                                    min="1"
                                    max="20"
                                    class="w-full"
                                    @input="updateTableRows"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Number of Columns
                                </label>
                                <InputText
                                    v-model.number="selectedField.tableColumns"
                                    type="number"
                                    min="1"
                                    max="10"
                                    class="w-full"
                                    @input="updateTableColumns"
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
                                        v-model="selectedField.headers[idx]"
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
                            <InputText v-model="selectedField.label" class="w-full" />
                        </div>

                        <!-- Heading Level (for heading only) -->
                        <div v-if="selectedField.type === 'heading'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Heading Level
                            </label>
                            <Dropdown
                                v-model="selectedField.headingLevel"
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
                                v-model="selectedField.content"
                                class="w-full"
                            />
                        </div>

                        <!-- Link Text (for link) -->
                        <div v-if="selectedField.type === 'link'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Link Text
                            </label>
                            <InputText
                                v-model="selectedField.content"
                                class="w-full"
                            />
                        </div>

                        <!-- URL (for link) -->
                        <div v-if="selectedField.type === 'link'">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                URL
                            </label>
                            <InputText
                                v-model="selectedField.url"
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
                                v-model="selectedField.content"
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
                                v-model="selectedField.imageSrc"
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
                                v-model="selectedField.imageAlt"
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
                                v-model="selectedField.content"
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
                                v-model.number="selectedField.height"
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
                            <InputText v-model="selectedField.label" class="w-full" />
                        </div>

                        <!-- Name -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Field Name *
                            </label>
                            <InputText v-model="selectedField.name" class="w-full" />
                        </div>

                        <!-- Placeholder -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Placeholder
                            </label>
                            <InputText v-model="selectedField.placeholder" class="w-full" />
                        </div>

                        <!-- Help Text -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Help Text
                            </label>
                            <Textarea v-model="selectedField.help_text" rows="2" class="w-full" />
                        </div>

                        <!-- Required -->
                        <div class="flex items-center gap-3">
                            <InputSwitch v-model="selectedField.is_required" inputId="is_required" />
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
                                        v-model="selectedField.options[idx]"
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
                            <!-- Add theme settings here -->
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>

        <!-- Export Code Dialog -->
        <Dialog
            v-model:visible="showExportDialog"
            :style="{ width: '800px' }"
            header="Export Form Code"
            :modal="true"
            maximizable
        >
            <div class="space-y-4">
                <!-- Code Type Selector -->
                <div class="flex gap-2 mb-4">
                    <Button
                        :label="'Vue.js'"
                        :severity="exportType === 'vue' ? 'primary' : 'secondary'"
                        :outlined="exportType !== 'vue'"
                        size="small"
                        @click="exportType = 'vue'"
                    />
                    <Button
                        :label="'HTML'"
                        :severity="exportType === 'html' ? 'primary' : 'secondary'"
                        :outlined="exportType !== 'html'"
                        size="small"
                        @click="exportType = 'html'"
                    />
                    <Button
                        :label="'Laravel Blade'"
                        :severity="exportType === 'blade' ? 'primary' : 'secondary'"
                        :outlined="exportType !== 'blade'"
                        size="small"
                        @click="exportType = 'blade'"
                    />
                    <Button
                        :label="'Validation Rules'"
                        :severity="exportType === 'validation' ? 'primary' : 'secondary'"
                        :outlined="exportType !== 'validation'"
                        size="small"
                        @click="exportType = 'validation'"
                    />
                </div>

                <!-- Code Display -->
                <div class="relative">
                    <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[500px] text-sm"><code>{{ generatedCode }}</code></pre>
                    <Button
                        icon="pi pi-copy"
                        class="absolute top-2 right-2"
                        size="small"
                        @click="copyToClipboard"
                        v-tooltip.left="'Copy to clipboard'"
                    />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import draggable from 'vuedraggable';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputSwitch from 'primevue/inputswitch';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const props = defineProps({
    form: Object
});

const formData = ref({
    title: props.form.title,
    description: props.form.description,
    is_active: props.form.is_active,
});

const fields = ref(props.form.fields || []);
const selectedFieldIndex = ref(null);
const showFormSettings = ref(false);
const isDragging = ref(false);
const saving = ref(false);
const showExportDialog = ref(false);
const exportType = ref('vue');
const activeTab = ref(0);
const settingsTab = ref(0);

const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: 'pi pi-align-left' },
    { type: 'email', label: 'Email', icon: 'pi pi-at' },
    { type: 'number', label: 'Number', icon: 'pi pi-hashtag' },
    { type: 'tel', label: 'Phone Number', icon: 'pi pi-phone' },
    { type: 'url', label: 'URL', icon: 'pi pi-link' },
    { type: 'password', label: 'Password', icon: 'pi pi-lock' },
    { type: 'location', label: 'Location', icon: 'pi pi-map-marker' },
    { type: 'textarea', label: 'Text Area', icon: 'pi pi-align-justify' },
    { type: 'select', label: 'Dropdown', icon: 'pi pi-chevron-down' },
    { type: 'multiselect', label: 'Multi Select', icon: 'pi pi-list' },
    { type: 'radio', label: 'Radio Buttons', icon: 'pi pi-circle' },
    { type: 'checkbox', label: 'Checkboxes', icon: 'pi pi-check-square' },
    { type: 'date', label: 'Date Picker', icon: 'pi pi-calendar' },
    { type: 'time', label: 'Time Picker', icon: 'pi pi-clock' },
    { type: 'datetime', label: 'Date Time Picker', icon: 'pi pi-calendar-clock' },
    { type: 'file', label: 'File Upload', icon: 'pi pi-file' },
    { type: 'image', label: 'Image Upload', icon: 'pi pi-image' },
];

const staticHtmlFields = [
    { type: 'heading', label: 'Heading', icon: 'pi pi-bookmark' },
    { type: 'paragraph', label: 'Paragraph', icon: 'pi pi-align-left' },
    { type: 'divider', label: 'Divider', icon: 'pi pi-minus' },
    { type: 'spacer', label: 'Spacer', icon: 'pi pi-arrows-v' },
    { type: 'html', label: 'Custom HTML', icon: 'pi pi-code' },
    { type: 'button-primary', label: 'Primary Button', icon: 'pi pi-check-circle' },
    { type: 'button-secondary', label: 'Secondary Button', icon: 'pi pi-circle' },
    { type: 'button-danger', label: 'Danger Button', icon: 'pi pi-times-circle' },
    { type: 'button-submit', label: 'Submit Button', icon: 'pi pi-send' },
    { type: 'link', label: 'Link', icon: 'pi pi-external-link' },
    { type: 'quote', label: 'Quote', icon: 'pi pi-comment' },
    { type: 'image', label: 'Image', icon: 'pi pi-image' },
];

const structureFields = [
    { type: 'container', label: 'Container', icon: 'pi pi-box' },
    { type: 'tabs-container', label: 'Tabs Container', icon: 'pi pi-window-maximize' },
    { type: '2-columns', label: '2 Columns', icon: 'pi pi-table' },
    { type: '3-columns', label: '3 Columns', icon: 'pi pi-table' },
    { type: '4-columns', label: '4 Columns', icon: 'pi pi-table' },
    { type: 'grid-layout', label: 'Grid Layout', icon: 'pi pi-th-large' },
    { type: 'table', label: 'Table', icon: 'pi pi-table' },
];

const selectedField = computed(() => {
    return selectedFieldIndex.value !== null ? fields.value[selectedFieldIndex.value] : null;
});

const onDragStart = (fieldType) => {
    // Store field type in drag data
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('fieldType', JSON.stringify(fieldType));
};

const onDrop = (event) => {
    isDragging.value = false;
    const fieldType = JSON.parse(event.dataTransfer.getData('fieldType'));

    // Check if it's a static HTML field
    const isStaticField = ['heading', 'paragraph', 'divider', 'spacer', 'html', 'button-primary', 'button-secondary', 'button-danger', 'button-submit', 'link', 'quote', 'image'].includes(fieldType.type);

    // Check if it's a structure field
    const isStructureField = ['container', 'tabs-container', '2-columns', '3-columns', '4-columns', 'grid-layout', 'table'].includes(fieldType.type);

    const newField = {
        tempId: Date.now(), // Use tempId for UI, not database id
        type: fieldType.type,
        label: fieldType.label,
        name: (isStaticField || isStructureField) ? null : fieldType.type + '_' + Date.now(),
        placeholder: (isStaticField || isStructureField) ? null : '',
        default_value: (isStaticField || isStructureField) ? null : '',
        validation_rules: {},
        options: fieldType.type === 'select' || fieldType.type === 'multiselect' || fieldType.type === 'radio' || fieldType.type === 'checkbox'
            ? ['Option 1', 'Option 2']
            : null,
        is_required: (isStaticField || isStructureField) ? false : false,
        help_text: (isStaticField || isStructureField) ? null : '',
        // Add content field for static HTML types
        content: isStaticField ? (
            fieldType.type === 'heading' ? 'Heading Text' :
            fieldType.type === 'paragraph' ? 'Paragraph text goes here...' :
            fieldType.type === 'html' ? '<div>Custom HTML</div>' :
            fieldType.type === 'link' ? 'Link Text' :
            fieldType.type === 'quote' ? 'Quote text goes here...' :
            fieldType.type.startsWith('button-') ? fieldType.label :
            ''
        ) : null,
        // Add URL for links
        url: fieldType.type === 'link' ? 'https://example.com' : null,
        // Add image source
        imageSrc: fieldType.type === 'image' ? 'https://via.placeholder.com/400x200' : null,
        imageAlt: fieldType.type === 'image' ? 'Image description' : null,
        // Add size/height for spacer
        height: fieldType.type === 'spacer' ? 20 : null,
        // Add heading level
        headingLevel: fieldType.type === 'heading' ? 'h2' : null,
        // Add structure-specific properties
        containerContent: fieldType.type === 'container' ? 'Container content here...' : null,
        containerPadding: fieldType.type === 'container' ? 16 : null,
        containerBorder: fieldType.type === 'container' ? true : null,
        tabs: fieldType.type === 'tabs-container' ? [
            { title: 'Tab 1', fields: [] },
            { title: 'Tab 2', fields: [] }
        ] : null,
        columns: fieldType.type === 'grid-layout' ? 2 :
                 fieldType.type === '2-columns' ? 2 :
                 fieldType.type === '3-columns' ? 3 :
                 fieldType.type === '4-columns' ? 4 : null,
        gap: (fieldType.type === 'grid-layout' || fieldType.type === '2-columns' || fieldType.type === '3-columns' || fieldType.type === '4-columns') ? 16 : null,
        children: (fieldType.type === 'grid-layout' || fieldType.type === '2-columns' || fieldType.type === '3-columns' || fieldType.type === '4-columns') ? [] : null,
        rows: fieldType.type === 'table' ? 3 : null,
        tableColumns: fieldType.type === 'table' ? 3 : null,
        headers: fieldType.type === 'table' ? ['Header 1', 'Header 2', 'Header 3'] : null,
        tableData: fieldType.type === 'table' ? [
            ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
            ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
            ['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3']
        ] : null,
    };

    fields.value.push(newField);
    selectedFieldIndex.value = fields.value.length - 1;
};

const selectField = (index) => {
    selectedFieldIndex.value = index;
    showFormSettings.value = false;
};

const openFormSettings = () => {
    selectedFieldIndex.value = null;
    showFormSettings.value = true;
};

const removeField = (index) => {
    fields.value.splice(index, 1);
    if (selectedFieldIndex.value === index) {
        selectedFieldIndex.value = null;
    }
};

const addOption = () => {
    if (!selectedField.value.options) {
        selectedField.value.options = [];
    }
    selectedField.value.options.push('New Option');
};

const removeOption = (index) => {
    selectedField.value.options.splice(index, 1);
};

// Structure field helpers
const addTab = () => {
    if (!selectedField.value.tabs) {
        selectedField.value.tabs = [];
    }
    const tabNumber = selectedField.value.tabs.length + 1;
    selectedField.value.tabs.push({ title: `Tab ${tabNumber}`, fields: [] });
};

const removeTab = (index) => {
    selectedField.value.tabs.splice(index, 1);
};

const updateTableRows = () => {
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

const updateTableColumns = () => {
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

const getFieldIcon = (type) => {
    const field = fieldTypes.find(f => f.type === type);
    if (field) return field.icon;

    const staticField = staticHtmlFields.find(f => f.type === type);
    if (staticField) return staticField.icon;

    const structureField = structureFields.find(f => f.type === type);
    return structureField ? structureField.icon : 'pi pi-question';
};

const getFieldComponent = (type) => {
    const components = {
        text: InputText,
        email: InputText,
        number: InputText,
        tel: InputText,
        url: InputText,
        password: InputText,
        location: InputText,
        textarea: Textarea,
        select: Dropdown,
        multiselect: MultiSelect,
        radio: RadioButton,
        checkbox: Checkbox,
        date: Calendar,
        time: Calendar,
        datetime: Calendar,
        file: FileUpload,
        image: FileUpload,
    };
    return components[type] || InputText;
};

const getFieldProps = (field) => {
    const baseProps = {
        placeholder: field.placeholder,
        class: 'w-full',
    };

    if (field.type === 'select') {
        return {
            ...baseProps,
            options: field.options,
            placeholder: field.placeholder || 'Select an option',
        };
    }

    if (field.type === 'multiselect') {
        return {
            ...baseProps,
            options: field.options,
            placeholder: field.placeholder || 'Select options',
        };
    }

    if (field.type === 'number') {
        return {
            ...baseProps,
            type: 'number',
        };
    }

    if (field.type === 'email') {
        return {
            ...baseProps,
            type: 'email',
        };
    }

    if (field.type === 'tel') {
        return {
            ...baseProps,
            type: 'tel',
        };
    }

    if (field.type === 'url') {
        return {
            ...baseProps,
            type: 'url',
        };
    }

    if (field.type === 'password') {
        return {
            ...baseProps,
            type: 'password',
        };
    }

    if (field.type === 'location') {
        return {
            ...baseProps,
            type: 'text',
        };
    }

    if (field.type === 'textarea') {
        return {
            ...baseProps,
            rows: 3,
        };
    }

    if (field.type === 'time') {
        return {
            ...baseProps,
            timeOnly: true,
            showIcon: true,
        };
    }

    if (field.type === 'datetime') {
        return {
            ...baseProps,
            showTime: true,
            showIcon: true,
        };
    }

    if (field.type === 'file') {
        return {
            mode: 'basic',
            chooseLabel: field.placeholder || 'Choose File',
            class: 'w-full',
        };
    }

    if (field.type === 'image') {
        return {
            mode: 'basic',
            accept: 'image/*',
            chooseLabel: field.placeholder || 'Choose Image',
            class: 'w-full',
        };
    }

    return baseProps;
};

const saveForm = () => {
    saving.value = true;

    router.put(`/forms/${props.form.id}`, {
        ...formData.value,
        fields: fields.value,
    }, {
        onSuccess: () => {
            saving.value = false;
        },
        onError: () => {
            saving.value = false;
        },
    });
};

const previewForm = () => {
    window.open(`/f/${props.form.slug}`, '_blank');
};

const generatedCode = computed(() => {
    if (exportType.value === 'vue') {
        return generateVueCode();
    } else if (exportType.value === 'html') {
        return generateHTMLCode();
    } else if (exportType.value === 'blade') {
        return generateBladeCode();
    } else if (exportType.value === 'validation') {
        return generateValidationRules();
    }
    return '';
});

const generateVueCode = () => {
    const fieldsHTML = fields.value.map(field => {
        let component = '';

        // Handle structure fields
        if (field.type === 'container') {
            return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}</label>
      <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px; min-height: 100px;">
        ${field.containerContent || 'Container content here...'}
      </div>
    </div>`;
        }

        if (field.type === 'tabs-container') {
            const tabsContent = field.tabs.map(tab =>
                `<TabPanel header="${tab.title}">
      <p class="text-gray-600">Tab content here</p>
    </TabPanel>`
            ).join('\n    ');
            return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}</label>
      <TabView>
        ${tabsContent}
      </TabView>
    </div>`;
        }

        if (field.type === '2-columns' || field.type === '3-columns' || field.type === '4-columns' || field.type === 'grid-layout') {
            const gridColumns = `repeat(${field.columns}, 1fr)`;
            return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}</label>
      <div style="display: grid; grid-template-columns: ${gridColumns}; gap: ${field.gap}px;">
        ${Array.from({length: field.columns}, (_, i) => `<div class="border p-4">Column ${i + 1}</div>`).join('\n        ')}
      </div>
    </div>`;
        }

        if (field.type === 'table') {
            const headerRow = field.headers.map(h => `<th class="border px-4 py-2">${h}</th>`).join('');
            const bodyRows = field.tableData.map(row =>
                `<tr>${row.map(cell => `<td class="border px-4 py-2">${cell}</td>`).join('')}</tr>`
            ).join('\n        ');
            return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}</label>
      <table class="w-full border-collapse">
        <thead><tr>${headerRow}</tr></thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </div>`;
        }

        // Handle static HTML fields
        if (field.type === 'heading') {
            return `    <${field.headingLevel || 'h2'} class="font-bold">${field.content}</${field.headingLevel || 'h2'}>`;
        }
        if (field.type === 'paragraph') {
            return `    <p>${field.content}</p>`;
        }
        if (field.type === 'divider') {
            return `    <hr class="border-t" />`;
        }
        if (field.type === 'spacer') {
            return `    <div style="height: ${field.height}px;"></div>`;
        }
        if (field.type === 'html') {
            return `    ${field.content}`;
        }
        if (field.type.startsWith('button-')) {
            const severity = field.type === 'button-primary' ? 'primary' : field.type === 'button-danger' ? 'danger' : 'secondary';
            return `    <Button label="${field.content}" severity="${severity}" />`;
        }
        if (field.type === 'link') {
            return `    <a href="${field.url}" class="text-blue-600 underline">${field.content}</a>`;
        }
        if (field.type === 'quote') {
            return `    <blockquote class="border-l-4 pl-4 italic">${field.content}</blockquote>`;
        }
        if (field.type === 'image') {
            return `    <img src="${field.imageSrc}" alt="${field.imageAlt}" class="max-w-full" />`;
        }

        // Handle regular form fields
        if (!field.name) return ''; // Skip fields without names

        const attrs = `v-model="formData.${field.name}"`;
        const classes = 'class="w-full"';
        const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : '';

        if (field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'url' || field.type === 'password' || field.type === 'location') {
            const inputType = field.type === 'location' ? 'text' : field.type;
            component = `<InputText ${attrs} type="${inputType}" ${placeholder} ${classes} />`;
        } else if (field.type === 'number') {
            component = `<InputText ${attrs} type="number" ${placeholder} ${classes} />`;
        } else if (field.type === 'textarea') {
            component = `<Textarea ${attrs} rows="4" ${placeholder} ${classes} />`;
        } else if (field.type === 'select') {
            const options = JSON.stringify(field.options || []);
            component = `<Dropdown ${attrs} :options='${options}' ${placeholder} ${classes} />`;
        } else if (field.type === 'multiselect') {
            const options = JSON.stringify(field.options || []);
            component = `<MultiSelect ${attrs} :options='${options}' ${placeholder} ${classes} />`;
        } else if (field.type === 'date') {
            component = `<Calendar ${attrs} ${placeholder} ${classes} showIcon />`;
        } else if (field.type === 'time') {
            component = `<Calendar ${attrs} ${placeholder} ${classes} timeOnly showIcon />`;
        } else if (field.type === 'datetime') {
            component = `<Calendar ${attrs} ${placeholder} ${classes} showTime showIcon />`;
        } else if (field.type === 'file') {
            component = `<FileUpload mode="basic" ${attrs} chooseLabel="${field.placeholder || 'Choose File'}" ${classes} />`;
        } else if (field.type === 'image') {
            component = `<FileUpload mode="basic" ${attrs} accept="image/*" chooseLabel="${field.placeholder || 'Choose Image'}" ${classes} />`;
        } else if (field.type === 'radio') {
            component = field.options.map((opt, idx) =>
                `<div class="flex items-center gap-2">
  <RadioButton ${attrs} value="${opt}" inputId="${field.name}_${idx}" />
  <label for="${field.name}_${idx}">${opt}</label>
</div>`
            ).join('\n        ');
        } else if (field.type === 'checkbox') {
            component = field.options.map((opt, idx) =>
                `<div class="flex items-center gap-2">
  <Checkbox ${attrs} value="${opt}" inputId="${field.name}_${idx}" />
  <label for="${field.name}_${idx}">${opt}</label>
</div>`
            ).join('\n        ');
        }

        return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}${field.is_required ? ' *' : ''}</label>
      ${component}
      ${field.help_text ? `<small class="text-gray-500">${field.help_text}</small>` : ''}
    </div>`;
    }).join('\n\n');

    return `<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
${fieldsHTML}

    <Button type="submit" label="Submit" />
  </form>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';

const formData = ref({
${fields.value.filter(f => f.name).map(f => `  ${f.name}: ${f.type === 'checkbox' || f.type === 'multiselect' ? '[]' : 'null'},`).join('\n')}
});

const handleSubmit = () => {
  console.log('Form data:', formData.value);
  // Add your submit logic here
};
<\/script>`;
};

const generateHTMLCode = () => {
    const fieldsHTML = fields.value.map(field => {
        let input = '';

        // Handle structure fields
        if (field.type === 'container') {
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px; min-height: 100px;">
      ${field.containerContent || 'Container content here...'}
    </div>
  </div>`;
        }

        if (field.type === 'tabs-container') {
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="border rounded p-4">
      <ul class="flex gap-4 border-b mb-4">
        ${field.tabs.map((tab, idx) => `<li><button type="button" class="px-4 py-2">${tab.title}</button></li>`).join('\n        ')}
      </ul>
      <div>Tab content here</div>
    </div>
  </div>`;
        }

        if (field.type === '2-columns' || field.type === '3-columns' || field.type === '4-columns' || field.type === 'grid-layout') {
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div style="display: grid; grid-template-columns: repeat(${field.columns}, 1fr); gap: ${field.gap}px;">
      ${Array.from({length: field.columns}, (_, i) => `<div class="border p-4">Column ${i + 1}</div>`).join('\n      ')}
    </div>
  </div>`;
        }

        if (field.type === 'table') {
            const headerRow = field.headers.map(h => `<th class="border px-4 py-2">${h}</th>`).join('');
            const bodyRows = field.tableData.map(row =>
                `<tr>${row.map(cell => `<td class="border px-4 py-2">${cell}</td>`).join('')}</tr>`
            ).join('\n      ');
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <table class="w-full border-collapse">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  </div>`;
        }

        // Handle static HTML fields
        if (field.type === 'heading') {
            return `  <${field.headingLevel || 'h2'} class="font-bold mb-4">${field.content}</${field.headingLevel || 'h2'}>`;
        }
        if (field.type === 'paragraph') {
            return `  <p class="mb-4">${field.content}</p>`;
        }
        if (field.type === 'divider') {
            return `  <hr class="my-4" />`;
        }
        if (field.type === 'spacer') {
            return `  <div style="height: ${field.height}px;"></div>`;
        }
        if (field.type === 'html') {
            return `  ${field.content}`;
        }
        if (field.type.startsWith('button-')) {
            const buttonClass = field.type === 'button-danger' ? 'bg-red-500' : field.type === 'button-secondary' ? 'bg-gray-500' : 'bg-blue-500';
            return `  <button type="button" class="px-4 py-2 ${buttonClass} text-white rounded mb-4">${field.content}</button>`;
        }
        if (field.type === 'link') {
            return `  <a href="${field.url}" class="text-blue-600 underline mb-4 block">${field.content}</a>`;
        }
        if (field.type === 'quote') {
            return `  <blockquote class="border-l-4 pl-4 italic mb-4">${field.content}</blockquote>`;
        }
        if (field.type === 'image') {
            return `  <img src="${field.imageSrc}" alt="${field.imageAlt}" class="max-w-full mb-4" />`;
        }

        // Handle regular form fields
        if (!field.name) return ''; // Skip fields without names

        if (field.type === 'textarea') {
            input = `<textarea name="${field.name}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded"></textarea>`;
        } else if (field.type === 'select') {
            input = `<select name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">
      ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('\n      ')}
    </select>`;
        } else if (field.type === 'multiselect') {
            input = `<select name="${field.name}[]" multiple ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">
      ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('\n      ')}
    </select>`;
        } else if (field.type === 'radio') {
            input = field.options.map(opt =>
                `<label class="flex items-center gap-2">
      <input type="radio" name="${field.name}" value="${opt}" ${field.is_required ? 'required' : ''}>
      ${opt}
    </label>`
            ).join('\n    ');
        } else if (field.type === 'checkbox') {
            input = field.options.map(opt =>
                `<label class="flex items-center gap-2">
      <input type="checkbox" name="${field.name}[]" value="${opt}">
      ${opt}
    </label>`
            ).join('\n    ');
        } else if (field.type === 'time') {
            input = `<input type="time" name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'datetime') {
            input = `<input type="datetime-local" name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'file') {
            input = `<input type="file" name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'image') {
            input = `<input type="file" name="${field.name}" accept="image/*" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else {
            input = `<input type="${field.type}" name="${field.name}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        }

        return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}${field.is_required ? ' *' : ''}</label>
    ${input}
    ${field.help_text ? `<small class="text-gray-500">${field.help_text}</small>` : ''}
  </div>`;
    }).join('\n\n');

    return `<form method="POST" action="/submit" class="max-w-2xl mx-auto p-6">
${fieldsHTML}

  <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
</form>`;
};

const generateBladeCode = () => {
    const fieldsHTML = fields.value.map(field => {
        let input = '';

        // Handle structure fields (same as HTML since Blade is HTML with PHP)
        if (field.type === 'container') {
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px; min-height: 100px;">
      ${field.containerContent || 'Container content here...'}
    </div>
  </div>`;
        }

        if (field.type === 'tabs-container') {
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="border rounded p-4">
      <ul class="flex gap-4 border-b mb-4">
        ${field.tabs.map((tab, idx) => `<li><button type="button" class="px-4 py-2">${tab.title}</button></li>`).join('\n        ')}
      </ul>
      <div>Tab content here</div>
    </div>
  </div>`;
        }

        if (field.type === '2-columns' || field.type === '3-columns' || field.type === '4-columns' || field.type === 'grid-layout') {
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div style="display: grid; grid-template-columns: repeat(${field.columns}, 1fr); gap: ${field.gap}px;">
      ${Array.from({length: field.columns}, (_, i) => `<div class="border p-4">Column ${i + 1}</div>`).join('\n      ')}
    </div>
  </div>`;
        }

        if (field.type === 'table') {
            const headerRow = field.headers.map(h => `<th class="border px-4 py-2">${h}</th>`).join('');
            const bodyRows = field.tableData.map(row =>
                `<tr>${row.map(cell => `<td class="border px-4 py-2">${cell}</td>`).join('')}</tr>`
            ).join('\n      ');
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <table class="w-full border-collapse">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  </div>`;
        }

        // Handle static HTML fields
        if (field.type === 'heading') {
            return `  <${field.headingLevel || 'h2'} class="font-bold mb-4">${field.content}</${field.headingLevel || 'h2'}>`;
        }
        if (field.type === 'paragraph') {
            return `  <p class="mb-4">${field.content}</p>`;
        }
        if (field.type === 'divider') {
            return `  <hr class="my-4" />`;
        }
        if (field.type === 'spacer') {
            return `  <div style="height: ${field.height}px;"></div>`;
        }
        if (field.type === 'html') {
            return `  ${field.content}`;
        }
        if (field.type.startsWith('button-')) {
            const buttonClass = field.type === 'button-danger' ? 'bg-red-500' : field.type === 'button-secondary' ? 'bg-gray-500' : 'bg-blue-500';
            return `  <button type="button" class="px-4 py-2 ${buttonClass} text-white rounded mb-4">${field.content}</button>`;
        }
        if (field.type === 'link') {
            return `  <a href="${field.url}" class="text-blue-600 underline mb-4 block">${field.content}</a>`;
        }
        if (field.type === 'quote') {
            return `  <blockquote class="border-l-4 pl-4 italic mb-4">${field.content}</blockquote>`;
        }
        if (field.type === 'image') {
            return `  <img src="${field.imageSrc}" alt="${field.imageAlt}" class="max-w-full mb-4" />`;
        }

        // Handle regular form fields
        if (!field.name) return ''; // Skip fields without names

        if (field.type === 'textarea') {
            input = `<textarea name="${field.name}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">{{ old('${field.name}') }}</textarea>`;
        } else if (field.type === 'select') {
            input = `<select name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">
      @foreach(${JSON.stringify(field.options)} as $option)
        <option value="{{ $option }}" {{ old('${field.name}') == $option ? 'selected' : '' }}>{{ $option }}</option>
      @endforeach
    </select>`;
        } else if (field.type === 'multiselect') {
            input = `<select name="${field.name}[]" multiple ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">
      @foreach(${JSON.stringify(field.options)} as $option)
        <option value="{{ $option }}" {{ in_array($option, old('${field.name}', [])) ? 'selected' : '' }}>{{ $option }}</option>
      @endforeach
    </select>`;
        } else if (field.type === 'time') {
            input = `<input type="time" name="${field.name}" value="{{ old('${field.name}') }}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'datetime') {
            input = `<input type="datetime-local" name="${field.name}" value="{{ old('${field.name}') }}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'file') {
            input = `<input type="file" name="${field.name}" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else if (field.type === 'image') {
            input = `<input type="file" name="${field.name}" accept="image/*" ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        } else {
            input = `<input type="${field.type}" name="${field.name}" value="{{ old('${field.name}') }}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} ${field.is_required ? 'required' : ''} class="w-full p-2 border rounded">`;
        }

        return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}${field.is_required ? ' *' : ''}</label>
    ${input}
    @error('${field.name}')
      <span class="text-red-500 text-sm">{{ $message }}</span>
    @enderror
    ${field.help_text ? `<small class="text-gray-500">${field.help_text}</small>` : ''}
  </div>`;
    }).join('\n\n');

    return `<form method="POST" action="{{ route('form.submit') }}" class="max-w-2xl mx-auto p-6">
  @csrf
${fieldsHTML}

  <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
</form>`;
};

const generateValidationRules = () => {
    const rules = fields.value.map(field => {
        const validationRules = [];

        if (field.is_required) {
            validationRules.push('required');
        } else {
            validationRules.push('nullable');
        }

        if (field.type === 'email') {
            validationRules.push('email');
        } else if (field.type === 'number') {
            validationRules.push('numeric');
        } else if (field.type === 'date') {
            validationRules.push('date');
        } else if (field.type === 'url') {
            validationRules.push('url');
        } else if (field.type === 'tel') {
            validationRules.push('string');
        } else if (field.type === 'password') {
            validationRules.push('string|min:8');
        } else if (field.type === 'location') {
            validationRules.push('string');
        } else if (field.type === 'multiselect') {
            validationRules.push('array');
        } else if (field.type === 'time') {
            validationRules.push('date_format:H:i');
        } else if (field.type === 'datetime') {
            validationRules.push('date');
        } else if (field.type === 'file') {
            validationRules.push('file');
        } else if (field.type === 'image') {
            validationRules.push('image');
        }

        return `'${field.name}' => '${validationRules.join('|')}',`;
    }).join('\n    ');

    return `// Laravel Validation Rules
$rules = [
    ${rules}
];

$validated = $request->validate($rules);`;
};

const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode.value);
    // Could add a toast notification here
};
</script>

<style scoped>
:deep(.field-tabs .p-tabview-nav) {
    background: transparent;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.dark .field-tabs .p-tabview-nav) {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

:deep(.field-tabs .p-tabview-panels) {
    background: transparent;
    padding: 0;
}

:deep(.field-tabs .p-tabview-panel) {
    background: transparent;
}

:deep(.settings-tabs .p-tabview-nav) {
    background: transparent;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.dark .settings-tabs .p-tabview-nav) {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

:deep(.settings-tabs .p-tabview-panels) {
    background: transparent;
    padding: 0;
}

:deep(.settings-tabs .p-tabview-panel) {
    background: transparent;
}
</style>
