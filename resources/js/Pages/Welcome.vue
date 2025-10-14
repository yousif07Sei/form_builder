<template>
    <div class="min-h-screen flex items-center justify-center p-6">
        <div class="max-w-2xl w-full">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Form Builder
                </h1>
                <p class="text-gray-600 dark:text-gray-300 mb-6">
                    Welcome to the Dynamic Form Builder application built with Laravel, Vue.js, Inertia.js, and PrimeVue!
                </p>

                <div class="space-y-4">
                    <Card>
                        <template #header>
                            <div class="flex items-center gap-2 p-4">
                                <i class="pi pi-check-circle text-green-500"></i>
                                <span class="font-semibold">Setup Complete</span>
                            </div>
                        </template>
                        <template #content>
                            <ul class="space-y-2 text-sm">
                                <li class="flex items-center gap-2">
                                    <i class="pi pi-check text-green-500"></i>
                                    <span>Database schema created</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <i class="pi pi-check text-green-500"></i>
                                    <span>Models and migrations ready</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <i class="pi pi-check text-green-500"></i>
                                    <span>Vue.js + Inertia.js configured</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <i class="pi pi-check text-green-500"></i>
                                    <span>PrimeVue + Tailwind CSS integrated</span>
                                </li>
                            </ul>
                        </template>
                    </Card>

                    <Button
                        label="View Form Builder"
                        icon="pi pi-arrow-right"
                        icon-pos="right"
                        class="w-full"
                        @click="goToBuilder"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { router } from '@inertiajs/vue3';
import Card from 'primevue/card';
import Button from 'primevue/button';

const goToBuilder = () => {
    router.visit('/forms');
};
</script>
