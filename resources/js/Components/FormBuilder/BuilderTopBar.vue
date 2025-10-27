<template>
    <div>
        <Menubar :model="items">
            <template #start>
                <div class="flex items-center gap-4 ml-2">
                    <Button
                        icon="pi pi-arrow-left"
                        text
                        rounded
                        @click="$emit('back')"
                    />
                    <div>
                        <h1 class="text-xl font-bold" :style="{ color: 'var(--p-text-color)' }">{{ formTitle }}</h1>
                        <p class="text-sm" :style="{ color: 'var(--p-text-muted-color)' }">Form Builder</p>
                    </div>
                </div>
            </template>
            <template #end>
                <div class="flex gap-2 items-center">
                    <!-- Dark Mode Toggle -->
                    <Button
                        :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
                        text
                        rounded
                        @click="toggleDarkMode"
                        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
                    />

                    <Button
                        label="Save Form"
                        icon="pi pi-save"
                        :loading="saving"
                        @click="$emit('save')"
                    />
                </div>
            </template>
        </Menubar>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

const props = defineProps({
    formTitle: {
        type: String,
        required: true
    },
    saving: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['back', 'export', 'preview', 'save']);

// Dark mode state
const isDark = ref(false);

// Check if dark mode is enabled on mount
onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark');
});

// Toggle dark mode
const toggleDarkMode = () => {
    isDark.value = !isDark.value;

    if (isDark.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
};

const items = computed(() => [
    {
        label: 'File',
        icon: 'pi pi-file',
        items: [
            {
                label: 'Save',
                icon: 'pi pi-save',
                command: () => emit('save')
            },
            {
                label: 'Export Code',
                icon: 'pi pi-code',
                command: () => emit('export')
            }
        ]
    },
    {
        label: 'View',
        icon: 'pi pi-eye',
        items: [
            {
                label: 'Preview',
                icon: 'pi pi-eye',
                command: () => emit('preview')
            }
        ]
    }
]);
</script>
