<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div class="max-w-3xl mx-auto">
            <!-- Header -->
            <div class="mb-6">
                <Button
                    label="Back to Forms"
                    icon="pi pi-arrow-left"
                    text
                    @click="router.visit('/forms')"
                    class="mb-4"
                />
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create New Form</h1>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Start by giving your form a title and description</p>
            </div>

            <!-- Form Card -->
            <Card>
                <template #content>
                    <form @submit.prevent="submitForm" class="space-y-6">
                        <!-- Title -->
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Form Title *
                            </label>
                            <InputText
                                id="title"
                                v-model="form.title"
                                placeholder="Enter form title"
                                class="w-full"
                                :class="{ 'p-invalid': errors.title }"
                            />
                            <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
                        </div>

                        <!-- Description -->
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                v-model="form.description"
                                placeholder="Enter form description"
                                rows="4"
                                class="w-full"
                                :class="{ 'p-invalid': errors.description }"
                            />
                            <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
                        </div>

                        <!-- Active Toggle -->
                        <div class="flex items-center gap-3">
                            <InputSwitch v-model="form.is_active" inputId="is_active" />
                            <label for="is_active" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active (form is publicly accessible)
                            </label>
                        </div>

                        <!-- Actions -->
                        <div class="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                label="Cancel"
                                severity="secondary"
                                outlined
                                @click="router.visit('/forms')"
                                type="button"
                            />
                            <Button
                                label="Create Form"
                                icon="pi pi-check"
                                type="submit"
                                :loading="processing"
                            />
                        </div>
                    </form>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputSwitch from 'primevue/inputswitch';
import Button from 'primevue/button';

const form = useForm({
    title: '',
    description: '',
    is_active: true,
});

const processing = ref(false);
const errors = ref({});

const submitForm = () => {
    processing.value = true;
    errors.value = {};

    form.post('/forms', {
        onSuccess: () => {
            processing.value = false;
        },
        onError: (err) => {
            errors.value = err;
            processing.value = false;
        },
    });
};
</script>
