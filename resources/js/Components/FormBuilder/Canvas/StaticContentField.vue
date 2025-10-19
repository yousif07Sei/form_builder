<template>
    <div class="space-y-2">
        <!-- Heading -->
        <template v-if="field.type === 'heading'">
            <component
                :is="field.headingLevel || 'h2'"
                class="font-bold text-gray-900 dark:text-white"
            >
                {{ field.content }}
            </component>
        </template>

        <!-- Paragraph -->
        <template v-else-if="field.type === 'paragraph'">
            <p class="text-gray-700 dark:text-gray-300">{{ field.content }}</p>
        </template>

        <!-- Divider -->
        <template v-else-if="field.type === 'divider'">
            <hr class="border-t border-gray-300 dark:border-gray-600" />
        </template>

        <!-- Spacer -->
        <template v-else-if="field.type === 'spacer'">
            <div
                :style="{ height: (field.height || 20) + 'px' }"
                class="bg-gray-100 dark:bg-gray-700 rounded"
            ></div>
        </template>

        <!-- HTML -->
        <template v-else-if="field.type === 'html'">
            <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                {{ field.content }}
            </div>
        </template>

        <!-- Button Primary -->
        <template v-else-if="field.type === 'button-primary'">
            <Button :label="field.content" severity="primary" />
        </template>

        <!-- Button Secondary -->
        <template v-else-if="field.type === 'button-secondary'">
            <Button :label="field.content" severity="secondary" />
        </template>

        <!-- Button Danger -->
        <template v-else-if="field.type === 'button-danger'">
            <Button :label="field.content" severity="danger" />
        </template>

        <!-- Button Submit -->
        <template v-else-if="field.type === 'button-submit'">
            <Button :label="field.content" type="submit" />
        </template>

        <!-- Link -->
        <template v-else-if="field.type === 'link'">
            <a
                :href="field.url"
                target="_blank"
                class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline"
            >
                {{ field.content }}
            </a>
        </template>

        <!-- Quote -->
        <template v-else-if="field.type === 'quote'">
            <blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300">
                {{ field.content }}
            </blockquote>
        </template>

        <!-- Image -->
        <template v-else-if="field.type === 'image'">
            <img
                :src="field.imageSrc"
                :alt="field.imageAlt"
                class="max-w-full h-auto rounded"
            />
        </template>

        <!-- Table -->
        <template v-else-if="field.type === 'table'">
            <div class="overflow-x-auto">
                <table class="min-w-full border border-gray-300 dark:border-gray-600">
                    <thead class="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th
                                v-for="(header, idx) in field.headers"
                                :key="idx"
                                class="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600"
                            >
                                {{ header }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(row, rowIdx) in field.tableData"
                            :key="rowIdx"
                            class="border-b border-gray-200 dark:border-gray-700"
                        >
                            <td
                                v-for="(cell, cellIdx) in row"
                                :key="cellIdx"
                                class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                                {{ cell }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </div>
</template>

<script setup>
import Button from 'primevue/button';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    fieldIndex: {
        type: Number,
        required: true
    }
});
</script>
