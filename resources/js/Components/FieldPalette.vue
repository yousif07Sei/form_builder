<template>
    <!-- Left Sidebar - Field Palette -->
    <div class="w-64 border-r border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] overflow-y-auto text-gray-900 dark:text-white" style="background: var(--p-surface-0)">
        <PanelMenu :model="groupedFields" class="w-full">
            <template #item="{ item }">
                <div
                    v-if="item.fieldType"
                    class="p-3 cursor-move"
                    draggable="true"
                    @dragstart="onDragStart(item.fieldType, $event)"
                >
                    <div class="flex items-center gap-2">
                        <i :class="item.icon"></i>
                        <span class="text-sm font-medium">{{ item.label }}</span>
                    </div>
                </div>
                <a
                    v-else
                    class="flex items-center gap-2 p-3"
                >
                    <i :class="item.icon"></i>
                    <span class="font-semibold">{{ item.label }}</span>
                </a>
            </template>
        </PanelMenu>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import PanelMenu from 'primevue/panelmenu';
import { inputFieldTypes } from '@/utils/fieldTypes';

// Emit event when drag starts
const emit = defineEmits(['dragstart']);

// Group field types into categories
const groupedFields = computed(() => {
    const inputFields = inputFieldTypes.filter(f =>
        ['text', 'email', 'number', 'tel', 'url', 'password', 'textarea'].includes(f.type)
    );

    const selectionFields = inputFieldTypes.filter(f =>
        ['select', 'multiselect', 'radio', 'checkbox'].includes(f.type)
    );

    const dateFields = inputFieldTypes.filter(f =>
        ['date', 'time', 'datetime'].includes(f.type)
    );

    const fileFields = inputFieldTypes.filter(f =>
        ['file', 'image'].includes(f.type)
    );

    const otherFields = inputFieldTypes.filter(f =>
        !inputFields.includes(f) &&
        !selectionFields.includes(f) &&
        !dateFields.includes(f) &&
        !fileFields.includes(f)
    );

    return [
        {
            label: 'Input Fields',
            icon: 'pi pi-pencil',
            items: inputFields.map(f => ({ ...f, fieldType: f }))
        },
        {
            label: 'Selection Fields',
            icon: 'pi pi-list',
            items: selectionFields.map(f => ({ ...f, fieldType: f }))
        },
        {
            label: 'Date & Time',
            icon: 'pi pi-calendar',
            items: dateFields.map(f => ({ ...f, fieldType: f }))
        },
        {
            label: 'File Upload',
            icon: 'pi pi-upload',
            items: fileFields.map(f => ({ ...f, fieldType: f }))
        },
        ...(otherFields.length > 0 ? [{
            label: 'Other Fields',
            icon: 'pi pi-box',
            items: otherFields.map(f => ({ ...f, fieldType: f }))
        }] : [])
    ];
});

const onDragStart = (fieldType, event) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('fieldType', JSON.stringify(fieldType));
    emit('dragstart', fieldType);
};
</script>

