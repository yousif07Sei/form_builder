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
            <FieldPalette @dragstart="handleFieldDragStart" />

            <!-- Center - Form Builder Canvas -->
            <div class="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
                <div class="max-w-2xl mx-auto py-12">
                    <!-- Form Header -->
                    <div class="text-center mb-8">
                        <h1
                            class="text-4xl font-bold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            @click="openFormSettings"
                        >
                            {{ formData.title }}
                        </h1>
                        <p
                            v-if="formData.description"
                            class="text-lg text-gray-600 dark:text-gray-300 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            @click="openFormSettings"
                        >
                            {{ formData.description }}
                        </p>
                    </div>

                    <!-- Form Card -->
                    <Card class="min-h-[600px]">
                        <template #content>
                            <!-- Drop Zone -->
                            <div
                                class="min-h-[500px]"
                                :class="{ 'bg-primary-50 dark:bg-primary-900/20': isDragging }"
                                @dragover.prevent="isDragging = true"
                                @dragleave="isDragging = false"
                                @drop.prevent="onDrop"
                                @click.self="openFormSettings"
                            >
                                <div v-if="fields.length === 0" class="text-center py-12" @click="openFormSettings">
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
                                                    <a :href="element.url" target="_blank" class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline">
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
                                                        class="rounded min-h-[100px] bg-gray-50 dark:bg-gray-800"
                                                        :class="{
                                                            'border-2 border-dashed border-primary-300 dark:border-primary-600': element.containerBorder
                                                        }"
                                                        :style="{ padding: (element.containerPadding || 16) + 'px' }"
                                                        @dragover.prevent
                                                        @drop="onNestedDrop($event, element)"
                                                    >
                                                        <!-- Container Description -->
                                                        <div v-if="element.containerDescription" class="mb-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded text-sm text-gray-600 dark:text-gray-400">
                                                            <i class="pi pi-info-circle mr-1"></i>
                                                            {{ element.containerDescription }}
                                                        </div>

                                                        <div v-if="!element.containerChildren || element.containerChildren.length === 0" class="text-center py-8">
                                                            <i class="pi pi-inbox text-3xl text-gray-400 mb-2"></i>
                                                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                                                Drop fields here
                                                            </p>
                                                        </div>
                                                        <div v-else class="space-y-4">
                                                            <div
                                                                v-for="(childField, childIdx) in element.containerChildren"
                                                                :key="childField.tempId || childField.id"
                                                                class="relative group"
                                                                :class="{ 'ring-2 ring-blue-500 rounded-lg p-2 -m-2': isNestedFieldSelected(index, childIdx) }"
                                                                @click.stop="selectField(index, { parentIndex: index, childIndex: childIdx })"
                                                            >
                                                                <!-- Delete button for nested field -->
                                                                <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                    <Button
                                                                        icon="pi pi-trash"
                                                                        severity="danger"
                                                                        text
                                                                        rounded
                                                                        size="small"
                                                                        @click.stop="element.containerChildren.splice(childIdx, 1)"
                                                                    />
                                                                </div>

                                                                <!-- Render column layouts (if nested) -->
                                                                <template v-if="childField.type === '2-columns' || childField.type === '3-columns' || childField.type === '4-columns' || childField.type === 'grid-layout'">
                                                                    <div
                                                                        class="grid rounded-lg p-3 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-gray-800/50 dark:to-gray-700/50 border-2 border-dashed border-primary-200 dark:border-primary-800"
                                                                        :style="{
                                                                            gridTemplateColumns: `repeat(${childField.columns || 2}, 1fr)`,
                                                                            gap: `${childField.gap || 16}px`
                                                                        }"
                                                                    >
                                                                        <div
                                                                            v-for="(column, colIdx) in (childField.columns || 2)"
                                                                            :key="colIdx"
                                                                            class="column-drop-zone border-2 border-dashed rounded-lg p-4 min-h-[200px] transition-all duration-200 bg-white dark:bg-gray-900"
                                                                            :class="{
                                                                                'border-primary-400 dark:border-primary-600': !getColumnFields(childField, colIdx) || getColumnFields(childField, colIdx).length === 0,
                                                                                'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800': getColumnFields(childField, colIdx) && getColumnFields(childField, colIdx).length > 0
                                                                            }"
                                                                            @dragover.prevent="$event.currentTarget.classList.add('dragover-highlight')"
                                                                            @dragleave="$event.currentTarget.classList.remove('dragover-highlight')"
                                                                            @drop="onColumnDrop($event, childField, colIdx); $event.currentTarget.classList.remove('dragover-highlight')"
                                                                        >
                                                                            <!-- Column header badge -->
                                                                            <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                                                                <span class="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                                                                                    Column {{ colIdx + 1 }}
                                                                                </span>
                                                                                <span class="text-xs text-gray-500 dark:text-gray-400">
                                                                                    {{ (getColumnFields(childField, colIdx) || []).length }}
                                                                                    {{ (getColumnFields(childField, colIdx) || []).length === 1 ? 'field' : 'fields' }}
                                                                                </span>
                                                                            </div>

                                                                            <!-- Empty state -->
                                                                            <div v-if="!getColumnFields(childField, colIdx) || getColumnFields(childField, colIdx).length === 0" class="flex flex-col items-center justify-center h-[calc(100%-2.5rem)] py-8">
                                                                                <div class="text-center">
                                                                                    <div class="mb-3 w-12 h-12 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                                                        <i class="pi pi-plus text-xl text-primary-500 dark:text-primary-400"></i>
                                                                                    </div>
                                                                                    <p class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Drop fields here</p>
                                                                                    <p class="text-xs text-gray-400 dark:text-gray-500">Drag from the sidebar</p>
                                                                                </div>
                                                                            </div>

                                                                            <!-- Fields list -->
                                                                            <div v-else class="space-y-3">
                                                                                <div
                                                                                    v-for="(colChildField, colChildIdx) in getColumnFields(childField, colIdx)"
                                                                                    :key="colChildField.tempId || colChildField.id"
                                                                                    class="relative group bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                                                                                    :class="{ 'ring-2 ring-blue-500': isNestedFieldSelected(index, childIdx, colIdx, colChildIdx) }"
                                                                                    @click.stop="selectField(index, { parentIndex: index, childIndex: childIdx, colIdx: colIdx, colChildIdx: colChildIdx })"
                                                                                >
                                                                                    <!-- Delete button -->
                                                                                    <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                                        <Button
                                                                                            icon="pi pi-trash"
                                                                                            severity="danger"
                                                                                            text
                                                                                            rounded
                                                                                            size="small"
                                                                                            @click.stop="removeColumnField(childField, colIdx, colChildIdx)"
                                                                                        />
                                                                                    </div>

                                                                                    <!-- Render the field -->
                                                                                    <div class="space-y-2">
                                                                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                            {{ colChildField.label }}
                                                                                            <span v-if="colChildField.is_required" class="text-red-500">*</span>
                                                                                        </label>
                                                                                        <component
                                                                                            :is="getFieldComponent(colChildField.type)"
                                                                                            v-bind="getFieldProps(colChildField)"
                                                                                            disabled
                                                                                        />
                                                                                        <small v-if="colChildField.help_text" class="text-gray-500 dark:text-gray-400 block">
                                                                                            {{ colChildField.help_text }}
                                                                                        </small>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </template>

                                                                <!-- Render regular fields -->
                                                                <template v-else>
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
                                                                </template>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </template>
                                                <template v-else-if="element.type === 'tabs-container'">
                                                    <TabView class="structure-tabs">
                                                        <TabPanel v-for="(tab, tabIdx) in element.tabs" :key="tabIdx" :header="tab.title">
                                                            <div
                                                                class="p-4 border-2 border-dashed border-primary-300 dark:border-primary-600 rounded min-h-[100px] bg-gray-50 dark:bg-gray-800"
                                                                @dragover.prevent
                                                                @drop="onNestedDrop($event, element, tabIdx)"
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
                                                                    >
                                                                        <!-- Delete button for nested field -->
                                                                        <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                            <Button
                                                                                icon="pi pi-trash"
                                                                                severity="danger"
                                                                                text
                                                                                rounded
                                                                                size="small"
                                                                                @click.stop="tab.fields.splice(childIdx, 1)"
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
                                                </template>
                                                <template v-else-if="element.type === '2-columns' || element.type === '3-columns' || element.type === '4-columns' || element.type === 'grid-layout'">
                                                    <div
                                                        class="grid rounded-lg p-3 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-gray-800/50 dark:to-gray-700/50 border-2 border-dashed border-primary-200 dark:border-primary-800"
                                                        :style="{
                                                            gridTemplateColumns: `repeat(${element.columns || 2}, 1fr)`,
                                                            gap: `${element.gap || 16}px`
                                                        }"
                                                    >
                                                        <div
                                                            v-for="(column, colIdx) in (element.columns || 2)"
                                                            :key="colIdx"
                                                            class="column-drop-zone border-2 border-dashed rounded-lg p-4 min-h-[200px] transition-all duration-200 bg-white dark:bg-gray-900"
                                                            :class="{
                                                                'border-primary-400 dark:border-primary-600': !getColumnFields(element, colIdx) || getColumnFields(element, colIdx).length === 0,
                                                                'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800': getColumnFields(element, colIdx) && getColumnFields(element, colIdx).length > 0
                                                            }"
                                                            @dragover.prevent="$event.currentTarget.classList.add('dragover-highlight')"
                                                            @dragleave="$event.currentTarget.classList.remove('dragover-highlight')"
                                                            @drop="onColumnDrop($event, element, colIdx); $event.currentTarget.classList.remove('dragover-highlight')"
                                                        >
                                                            <!-- Column header badge -->
                                                            <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                                                <span class="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                                                                    Column {{ colIdx + 1 }}
                                                                </span>
                                                                <span class="text-xs text-gray-500 dark:text-gray-400">
                                                                    {{ (getColumnFields(element, colIdx) || []).length }}
                                                                    {{ (getColumnFields(element, colIdx) || []).length === 1 ? 'field' : 'fields' }}
                                                                </span>
                                                            </div>

                                                            <!-- Empty state -->
                                                            <div v-if="!getColumnFields(element, colIdx) || getColumnFields(element, colIdx).length === 0" class="flex flex-col items-center justify-center h-[calc(100%-2.5rem)] py-8">
                                                                <div class="text-center">
                                                                    <div class="mb-3 w-12 h-12 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                                        <i class="pi pi-plus text-xl text-primary-500 dark:text-primary-400"></i>
                                                                    </div>
                                                                    <p class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Drop fields here</p>
                                                                    <p class="text-xs text-gray-400 dark:text-gray-500">Drag from the sidebar</p>
                                                                </div>
                                                            </div>

                                                            <!-- Fields list -->
                                                            <div v-else class="space-y-3">
                                                                <div
                                                                    v-for="(childField, childIdx) in getColumnFields(element, colIdx)"
                                                                    :key="childField.tempId || childField.id"
                                                                    class="relative group bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                                                                    :class="{ 'ring-2 ring-blue-500': isNestedFieldSelected(index, undefined, colIdx, childIdx) }"
                                                                    @click.stop="selectField(index, { parentIndex: index, colIdx: colIdx, colChildIdx: childIdx })"
                                                                >
                                                                    <!-- Delete button for nested field -->
                                                                    <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                        <Button
                                                                            icon="pi pi-trash"
                                                                            severity="danger"
                                                                            text
                                                                            rounded
                                                                            size="small"
                                                                            @click.stop="removeColumnField(element, colIdx, childIdx)"
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
                v-if="selectedFieldIndex !== null || selectedNestedPath !== null || showFormSettings"
                class="settings-panel-dark w-80 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 overflow-y-auto"
            >
                <div class="flex items-center justify-between p-4 pb-0">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                            {{ showFormSettings ? 'Form Settings' : (selectedField ? selectedField.label : 'Settings') }}
                        </h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {{ showFormSettings ? 'Configure your form' : (selectedField ? selectedField.type : '') }}
                        </p>
                    </div>
                    <Button
                        icon="pi pi-times"
                        text
                        rounded
                        @click="selectedFieldIndex = null; selectedNestedPath = null; showFormSettings = false"
                    />
                </div>

                <!-- Form Settings Content (with tabs) -->
                <div v-if="showFormSettings" class="p-4">
                    <TabView>
                        <TabPanel header="General">
                            <div class="space-y-4">
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
                                    <Textarea v-model="formData.description" rows="3" class="w-full" />
                                </div>
                                <div class="flex items-center gap-3">
                                    <InputSwitch v-model="formData.is_active" inputId="form_is_active" />
                                    <label for="form_is_active" class="text-sm text-gray-700 dark:text-gray-300">
                                        Form is active
                                    </label>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel header="Theme">
                            <div class="space-y-4">
                                <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded text-sm text-gray-600 dark:text-gray-400">
                                    <i class="pi pi-info-circle mr-2"></i>
                                    Theme customization options will be added here
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Primary Color
                                    </label>
                                    <InputText placeholder="#000000" class="w-full" disabled />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Background Color
                                    </label>
                                    <InputText placeholder="#ffffff" class="w-full" disabled />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Font Family
                                    </label>
                                    <Dropdown
                                        :options="['Default', 'Arial', 'Helvetica', 'Times New Roman']"
                                        placeholder="Select font"
                                        class="w-full"
                                        disabled
                                    />
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>

                <!-- Field Settings Content -->
                <div v-else-if="selectedField" class="p-4 space-y-4">
                    <!-- Properties Accordion -->
                    <Accordion :pt="{ root: { style: 'background: transparent' } }">
                        <AccordionTab header="Properties" :pt="{
                            root: { style: 'background: transparent' },
                            header: { style: 'background: transparent' },
                            headerAction: { style: 'background: transparent' },
                            headerLink: { style: 'background: transparent' },
                            content: { style: 'background: transparent' }
                        }">
                            <div class="space-y-4">
                                <!-- Field Name/Label -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Name *
                                    </label>
                                    <InputText v-model="selectedField.label" class="w-full" />
                                </div>

                                <!-- Placeholder for regular fields -->
                                <div v-if="selectedField.placeholder !== null && selectedField.placeholder !== undefined">
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Placeholder
                                    </label>
                                    <InputText v-model="selectedField.placeholder" class="w-full" />
                                </div>
                            </div>
                        </AccordionTab>
                    </Accordion>

                    <!-- Field-Specific Settings -->
                    <div class="space-y-4">
                    <!-- Settings for Structure Fields -->
                    <template v-if="['container', 'tabs-container', '2-columns', '3-columns', '4-columns', 'grid-layout', 'table'].includes(selectedField.type)">

                        <!-- Container Settings -->
                        <template v-if="selectedField.type === 'container'">
                            <div class="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded">
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
                                    Description
                                </label>
                                <Textarea
                                    v-model="selectedField.containerDescription"
                                    rows="2"
                                    placeholder="Optional description or instructions for this container"
                                    class="w-full"
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
                </div>
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
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import FieldPalette from '@/Components/FieldPalette.vue';
import { getDefaultFieldProperties } from '@/utils/fieldTypes';
import { getFieldComponent, getFieldProps } from '@/utils/fieldHelpers';

const props = defineProps({
    form: Object
});

const formData = ref({
    title: props.form.title,
    description: props.form.description,
    is_active: props.form.is_active,
});

// Recursively process nested fields to ensure they have tempId
const processNestedFields = (field) => {
    const processed = {
        ...field,
        tempId: field.tempId || field.id || Date.now(),
    };

    // Process containerChildren and recursively handle nested structure fields
    if (processed.containerChildren && Array.isArray(processed.containerChildren)) {
        processed.containerChildren = processed.containerChildren.map(processNestedFields);
    }

    // Process tabs with nested fields
    if (processed.tabs && Array.isArray(processed.tabs)) {
        processed.tabs = processed.tabs.map(tab => ({
            ...tab,
            fields: (tab.fields || []).map(processNestedFields),
        }));
    }

    // Initialize children array for column layouts if not present
    if (['2-columns', '3-columns', '4-columns', 'grid-layout'].includes(processed.type)) {
        if (!processed.children) {
            processed.children = [];
        }
    }

    // Process grid/column children
    if (processed.children && Array.isArray(processed.children)) {
        processed.children = processed.children.map(processNestedFields);
    }

    return processed;
};

// Merge metadata back into fields for UI
const loadedFields = (props.form.fields || []).map(field => {
    let mergedField = field;

    if (field.metadata) {
        mergedField = {
            ...field,
            ...field.metadata,
            // Keep the database id but also set tempId for UI compatibility
            tempId: field.id,
        };
    } else {
        mergedField = { ...field, tempId: field.id };
    }

    // Process any nested fields recursively
    return processNestedFields(mergedField);
});

const fields = ref(loadedFields);
const selectedFieldIndex = ref(null);
const selectedNestedPath = ref(null); // { parentIndex, childIndex, columnIndex } for nested fields
const showFormSettings = ref(false); // Track if form settings panel is open
const isDragging = ref(false);
const saving = ref(false);
const showExportDialog = ref(false);
const exportType = ref('vue');
const activeTab = ref(0);
const settingsTab = ref(0);

const selectedField = computed(() => {
    // If nested path is set, get nested field
    if (selectedNestedPath.value !== null) {
        const { parentIndex, childIndex, colIdx, colChildIdx } = selectedNestedPath.value;
        const parent = fields.value[parentIndex];

        if (!parent) return null;

        // Handle fields inside column layouts that are inside containers
        if (colIdx !== undefined && colChildIdx !== undefined && childIndex !== undefined) {
            const containerChild = parent.containerChildren?.[childIndex];
            if (containerChild?.children) {
                const columnFields = containerChild.children.filter(f => f.columnIndex === colIdx);
                return columnFields[colChildIdx];
            }
        }

        // Handle fields inside column layouts (top-level or container child)
        if (colIdx !== undefined && colChildIdx !== undefined && childIndex === undefined) {
            if (parent.children) {
                const columnFields = parent.children.filter(f => f.columnIndex === colIdx);
                return columnFields[colChildIdx];
            }
        }

        // Handle container children (non-column fields)
        if (parent.containerChildren && childIndex !== undefined) {
            return parent.containerChildren[childIndex];
        }
    }

    // Otherwise get top-level field
    return selectedFieldIndex.value !== null ? fields.value[selectedFieldIndex.value] : null;
});

// Handle field drag start from FieldPalette component
const handleFieldDragStart = (fieldType) => {
    // Drag data is already set by FieldPalette component
    // This is just for any additional logic if needed
};

const onDrop = (event) => {
    isDragging.value = false;
    const fieldType = JSON.parse(event.dataTransfer.getData('fieldType'));

    // Create new field with default properties
    const newField = getDefaultFieldProperties(fieldType);

    fields.value.push(newField);
    selectedFieldIndex.value = fields.value.length - 1;
};

const selectField = (index, nestedPath = null) => {
    showFormSettings.value = false; // Close form settings when selecting a field
    if (nestedPath) {
        selectedFieldIndex.value = null;
        selectedNestedPath.value = nestedPath;
    } else {
        selectedFieldIndex.value = index;
        selectedNestedPath.value = null;
    }
};

const openFormSettings = () => {
    selectedFieldIndex.value = null;
    selectedNestedPath.value = null;
    showFormSettings.value = true;
};

// Helper to check if a nested field is selected
const isNestedFieldSelected = (parentIndex, childIndex = undefined, colIdx = undefined, colChildIdx = undefined) => {
    if (!selectedNestedPath.value) return false;
    const path = selectedNestedPath.value;

    // Check if this specific nested field is selected
    return path.parentIndex === parentIndex &&
           path.childIndex === childIndex &&
           path.colIdx === colIdx &&
           path.colChildIdx === colChildIdx;
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
const onNestedDrop = (event, parentField, tabIndex = null) => {
    event.stopPropagation();
    const fieldType = JSON.parse(event.dataTransfer.getData('fieldType'));

    // Create new field with default properties
    const newField = getDefaultFieldProperties(fieldType);

    // Add to container children or tab fields
    if (tabIndex !== null) {
        parentField.tabs[tabIndex].fields.push(newField);
    } else {
        parentField.containerChildren.push(newField);
    }
};

// Handle drop on column layout
const onColumnDrop = (event, parentField, columnIndex) => {
    event.stopPropagation();
    const fieldType = JSON.parse(event.dataTransfer.getData('fieldType'));

    // Create new field with default properties
    const newField = getDefaultFieldProperties(fieldType);

    // Track which column this field belongs to
    newField.columnIndex = columnIndex;

    // Initialize children array if it doesn't exist
    if (!parentField.children) {
        parentField.children = [];
    }

    // Add field to children array with column info
    parentField.children.push(newField);
};

// Get fields for a specific column
const getColumnFields = (parentField, columnIndex) => {
    if (!parentField.children) {
        return [];
    }
    return parentField.children.filter(field => field.columnIndex === columnIndex);
};

// Remove field from column
const removeColumnField = (parentField, columnIndex, fieldIndex) => {
    const columnFields = getColumnFields(parentField, columnIndex);
    const fieldToRemove = columnFields[fieldIndex];
    const actualIndex = parentField.children.findIndex(f => f.tempId === fieldToRemove.tempId);
    if (actualIndex !== -1) {
        parentField.children.splice(actualIndex, 1);
    }
};

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

const prepareFieldForSave = (field) => {
    // Standard database fields
    const standardFields = {
        id: field.id || null,
        type: field.type,
        label: field.label,
        name: field.name || null,
        placeholder: field.placeholder || null,
        default_value: field.default_value || null,
        validation_rules: field.validation_rules || {},
        options: field.options || null,
        is_required: field.is_required || false,
        help_text: field.help_text || null,
    };

    // Process nested fields recursively
    let processedContainerChildren = null;
    if (field.containerChildren && Array.isArray(field.containerChildren)) {
        processedContainerChildren = field.containerChildren.map(child => {
            // For nested fields, we only save the essential data, not prepare for database
            const childData = {
                tempId: child.tempId,
                type: child.type,
                label: child.label,
                name: child.name || null,
                placeholder: child.placeholder || null,
                default_value: child.default_value || null,
                validation_rules: child.validation_rules || {},
                options: child.options || null,
                is_required: child.is_required || false,
                help_text: child.help_text || null,
            };

            // If the nested child is a column layout, include its children
            if (['2-columns', '3-columns', '4-columns', 'grid-layout'].includes(child.type)) {
                if (child.children && Array.isArray(child.children)) {
                    childData.children = child.children.map(colField => ({
                        tempId: colField.tempId,
                        type: colField.type,
                        label: colField.label,
                        name: colField.name || null,
                        placeholder: colField.placeholder || null,
                        default_value: colField.default_value || null,
                        validation_rules: colField.validation_rules || {},
                        options: colField.options || null,
                        is_required: colField.is_required || false,
                        help_text: colField.help_text || null,
                        columnIndex: colField.columnIndex,
                    }));
                }
                childData.columns = child.columns || null;
                childData.gap = child.gap || null;
            }

            return childData;
        });
    }

    // Process tabs with nested fields
    let processedTabs = null;
    if (field.tabs && Array.isArray(field.tabs)) {
        processedTabs = field.tabs.map(tab => ({
            title: tab.title,
            fields: (tab.fields || []).map(child => ({
                tempId: child.tempId,
                type: child.type,
                label: child.label,
                name: child.name || null,
                placeholder: child.placeholder || null,
                default_value: child.default_value || null,
                validation_rules: child.validation_rules || {},
                options: child.options || null,
                is_required: child.is_required || false,
                help_text: child.help_text || null,
            })),
        }));
    }

    // Process column children (for grid/column layouts)
    let processedChildren = null;
    if (field.children && Array.isArray(field.children)) {
        processedChildren = field.children.map(child => ({
            tempId: child.tempId,
            type: child.type,
            label: child.label,
            name: child.name || null,
            placeholder: child.placeholder || null,
            default_value: child.default_value || null,
            validation_rules: child.validation_rules || {},
            options: child.options || null,
            is_required: child.is_required || false,
            help_text: child.help_text || null,
            columnIndex: child.columnIndex, // Preserve column assignment
        }));
    }

    // Metadata fields (everything else)
    const metadataFields = {
        // Static HTML fields
        content: field.content || null,
        url: field.url || null,
        imageSrc: field.imageSrc || null,
        imageAlt: field.imageAlt || null,
        height: field.height || null,
        headingLevel: field.headingLevel || null,
        // Structure fields
        containerChildren: processedContainerChildren,
        containerDescription: field.containerDescription || null,
        containerPadding: field.containerPadding || null,
        containerBorder: field.containerBorder !== undefined ? field.containerBorder : null,
        tabs: processedTabs,
        columns: field.columns || null,
        gap: field.gap || null,
        children: processedChildren,
        rows: field.rows || null,
        tableColumns: field.tableColumns || null,
        headers: field.headers || null,
        tableData: field.tableData || null,
    };

    // Remove null values from metadata to keep it clean
    const cleanMetadata = Object.fromEntries(
        Object.entries(metadataFields).filter(([_, value]) => value !== null)
    );

    return {
        ...standardFields,
        metadata: Object.keys(cleanMetadata).length > 0 ? cleanMetadata : null,
    };
};

const saveForm = () => {
    saving.value = true;

    // Prepare fields by separating standard fields from metadata
    const preparedFields = fields.value.map(prepareFieldForSave);

    router.put(`/forms/${props.form.id}`, {
        ...formData.value,
        fields: preparedFields,
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

const generateFieldVueCode = (field, indent = '    ') => {
    let component = '';

    // Handle structure fields
    if (field.type === 'container') {
        const childrenHTML = (field.containerChildren || []).map(child => generateFieldVueCode(child, indent + '      ')).join('\n\n');
        return `${indent}<div class="space-y-2">
${indent}  <label class="block text-sm font-medium">${field.label}</label>
${indent}  <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px;">
${childrenHTML || `${indent}    <p class="text-gray-500">Empty container</p>`}
${indent}  </div>
${indent}</div>`;
    }

    if (field.type === 'tabs-container') {
        const tabsContent = field.tabs.map(tab => {
            const tabFieldsHTML = (tab.fields || []).map(child => generateFieldVueCode(child, indent + '      ')).join('\n\n');
            return `${indent}  <TabPanel header="${tab.title}">
${tabFieldsHTML || `${indent}    <p class="text-gray-500">Empty tab</p>`}
${indent}  </TabPanel>`;
        }).join('\n');
        return `${indent}<div class="space-y-2">
${indent}  <label class="block text-sm font-medium">${field.label}</label>
${indent}  <TabView>
${tabsContent}
${indent}  </TabView>
${indent}</div>`;
    }

    // Rest of the field generation logic...
    // For brevity, we'll keep existing logic and just call this function
    // Handle other field types similar to before
    // (We'll integrate this properly in the main function)
};

const generateVueCode = () => {
    const fieldsHTML = fields.value.map(field => {
        let component = '';

        // Handle structure fields
        if (field.type === 'container') {
            const childrenCount = (field.containerChildren || []).length;
            const childrenPreview = childrenCount > 0 ? `${childrenCount} nested field(s)` : 'Empty container';
            return `    <div class="space-y-2">
      <label class="block text-sm font-medium">${field.label}</label>
      <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px; min-height: 100px;">
        <!-- ${childrenPreview} -->
        <p class="text-gray-500">Container with ${childrenCount} field(s)</p>
      </div>
    </div>`;
        }

        if (field.type === 'tabs-container') {
            const tabsContent = field.tabs.map(tab => {
                const fieldsCount = (tab.fields || []).length;
                return `<TabPanel header="${tab.title}">
      <!-- ${fieldsCount} nested field(s) -->
      <p class="text-gray-600">Tab with ${fieldsCount} field(s)</p>
    </TabPanel>`;
            }).join('\n    ');
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
            return `    <a href="${field.url}" class="text-primary-600 underline">${field.content}</a>`;
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
            const childrenCount = (field.containerChildren || []).length;
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px; min-height: 100px;">
      <!-- Container with ${childrenCount} field(s) -->
      <p class="text-gray-500">Container with ${childrenCount} nested field(s)</p>
    </div>
  </div>`;
        }

        if (field.type === 'tabs-container') {
            const tabsHTML = field.tabs.map((tab, idx) => {
                const fieldsCount = (tab.fields || []).length;
                return `<li><button type="button" class="px-4 py-2">${tab.title} (${fieldsCount})</button></li>`;
            }).join('\n        ');
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="border rounded p-4">
      <ul class="flex gap-4 border-b mb-4">
        ${tabsHTML}
      </ul>
      <div><!-- Tabs contain nested fields --></div>
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
            const buttonClass = field.type === 'button-danger' ? 'bg-red-500' : field.type === 'button-secondary' ? 'bg-gray-500' : 'bg-primary-500';
            return `  <button type="button" class="px-4 py-2 ${buttonClass} text-white rounded mb-4">${field.content}</button>`;
        }
        if (field.type === 'link') {
            return `  <a href="${field.url}" class="text-primary-600 underline mb-4 block">${field.content}</a>`;
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

  <button type="submit" class="px-4 py-2 bg-primary-500 text-white rounded">Submit</button>
</form>`;
};

const generateBladeCode = () => {
    const fieldsHTML = fields.value.map(field => {
        let input = '';

        // Handle structure fields (same as HTML since Blade is HTML with PHP)
        if (field.type === 'container') {
            const childrenCount = (field.containerChildren || []).length;
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="rounded${field.containerBorder ? ' border border-gray-300' : ''}" style="padding: ${field.containerPadding || 16}px; min-height: 100px;">
      {{-- Container with ${childrenCount} field(s) --}}
      <p class="text-gray-500">Container with ${childrenCount} nested field(s)</p>
    </div>
  </div>`;
        }

        if (field.type === 'tabs-container') {
            const tabsHTML = field.tabs.map((tab, idx) => {
                const fieldsCount = (tab.fields || []).length;
                return `<li><button type="button" class="px-4 py-2">${tab.title} (${fieldsCount})</button></li>`;
            }).join('\n        ');
            return `  <div class="mb-4">
    <label class="block mb-2 font-medium">${field.label}</label>
    <div class="border rounded p-4">
      <ul class="flex gap-4 border-b mb-4">
        ${tabsHTML}
      </ul>
      <div>{{-- Tabs contain nested fields --}}</div>
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
            const buttonClass = field.type === 'button-danger' ? 'bg-red-500' : field.type === 'button-secondary' ? 'bg-gray-500' : 'bg-primary-500';
            return `  <button type="button" class="px-4 py-2 ${buttonClass} text-white rounded mb-4">${field.content}</button>`;
        }
        if (field.type === 'link') {
            return `  <a href="${field.url}" class="text-primary-600 underline mb-4 block">${field.content}</a>`;
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

  <button type="submit" class="px-4 py-2 bg-primary-500 text-white rounded">Submit</button>
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

/* Column drop zone styles */
.column-drop-zone {
    position: relative;
}

.column-drop-zone.dragover-highlight {
    border-color: rgb(59 130 246) !important;
    background-color: rgb(239 246 255) !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: scale(1.02);
}

.dark .column-drop-zone.dragover-highlight {
    border-color: rgb(96 165 250) !important;
    background-color: rgb(30 58 138 / 0.2) !important;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

/* Settings Panel Dark Theme Overrides */
/* Make all inputs and components match the dark sidebar - using global styles for better specificity */

</style>
