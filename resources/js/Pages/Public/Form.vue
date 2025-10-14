<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div class="max-w-2xl mx-auto">
            <!-- Form Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {{ form.title }}
                </h1>
                <p v-if="form.description" class="text-lg text-gray-600 dark:text-gray-300">
                    {{ form.description }}
                </p>
            </div>

            <!-- Success Message -->
            <div v-if="$page.props.flash?.success" class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <i class="pi pi-check-circle mr-2"></i>
                {{ $page.props.flash.success }}
            </div>

            <!-- Form Card -->
            <Card>
                <template #content>
                    <form @submit.prevent="submitForm" class="space-y-6">
                        <!-- Render each field -->
                        <div
                            v-for="field in form.fields"
                            :key="field.id"
                            class="space-y-2"
                        >
                            <label
                                :for="field.name"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                {{ field.label }}
                                <span v-if="field.is_required" class="text-red-500">*</span>
                            </label>

                            <!-- Text Input -->
                            <InputText
                                v-if="field.type === 'text'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Email Input -->
                            <InputText
                                v-else-if="field.type === 'email'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                type="email"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Number Input -->
                            <InputText
                                v-else-if="field.type === 'number'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                type="number"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Textarea -->
                            <Textarea
                                v-else-if="field.type === 'textarea'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :placeholder="field.placeholder"
                                rows="4"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Dropdown/Select -->
                            <Dropdown
                                v-else-if="field.type === 'select'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :options="field.options"
                                :placeholder="field.placeholder || 'Select an option'"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                            />

                            <!-- Radio Buttons -->
                            <div v-else-if="field.type === 'radio'" class="space-y-2">
                                <div
                                    v-for="(option, idx) in field.options"
                                    :key="idx"
                                    class="flex items-center gap-2"
                                >
                                    <RadioButton
                                        :id="`${field.name}_${idx}`"
                                        v-model="formData[field.name]"
                                        :value="option"
                                    />
                                    <label
                                        :for="`${field.name}_${idx}`"
                                        class="text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        {{ option }}
                                    </label>
                                </div>
                            </div>

                            <!-- Checkboxes -->
                            <div v-else-if="field.type === 'checkbox'" class="space-y-2">
                                <div
                                    v-for="(option, idx) in field.options"
                                    :key="idx"
                                    class="flex items-center gap-2"
                                >
                                    <Checkbox
                                        :id="`${field.name}_${idx}`"
                                        v-model="formData[field.name]"
                                        :value="option"
                                    />
                                    <label
                                        :for="`${field.name}_${idx}`"
                                        class="text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        {{ option }}
                                    </label>
                                </div>
                            </div>

                            <!-- Date Picker -->
                            <Calendar
                                v-else-if="field.type === 'date'"
                                :id="field.name"
                                v-model="formData[field.name]"
                                :placeholder="field.placeholder"
                                class="w-full"
                                :class="{ 'p-invalid': errors[field.name] }"
                                showIcon
                            />

                            <!-- Help Text -->
                            <small v-if="field.help_text" class="text-gray-500 dark:text-gray-400">
                                {{ field.help_text }}
                            </small>

                            <!-- Error Message -->
                            <small v-if="errors[field.name]" class="p-error block">
                                {{ errors[field.name] }}
                            </small>
                        </div>

                        <!-- Submit Button -->
                        <div class="flex justify-end pt-4">
                            <Button
                                label="Submit Form"
                                icon="pi pi-check"
                                type="submit"
                                :loading="processing"
                                size="large"
                            />
                        </div>
                    </form>
                </template>
            </Card>

            <!-- Footer -->
            <div class="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                Powered by FormBuilder
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';

const props = defineProps({
    form: Object
});

const formData = ref({});
const errors = ref({});
const processing = ref(false);

// Initialize form data with checkbox arrays
props.form.fields.forEach(field => {
    if (field.type === 'checkbox') {
        formData.value[field.name] = [];
    } else {
        formData.value[field.name] = field.default_value || null;
    }
});

const submitForm = () => {
    processing.value = true;
    errors.value = {};

    router.post(`/f/${props.form.slug}`, formData.value, {
        onSuccess: () => {
            processing.value = false;
            // Reset form
            props.form.fields.forEach(field => {
                if (field.type === 'checkbox') {
                    formData.value[field.name] = [];
                } else {
                    formData.value[field.name] = field.default_value || null;
                }
            });
        },
        onError: (err) => {
            errors.value = err;
            processing.value = false;
        },
    });
};
</script>
