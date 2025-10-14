<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Forms</h1>
                    <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your dynamic forms</p>
                </div>
                <Button
                    label="Create Form"
                    icon="pi pi-plus"
                    @click="createForm"
                    severity="primary"
                />
            </div>

            <!-- Forms Table -->
            <Card>
                <template #content>
                    <DataTable
                        :value="forms"
                        :paginator="true"
                        :rows="10"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        stripedRows
                        responsiveLayout="scroll"
                        class="p-datatable-sm"
                    >
                        <Column field="title" header="Title" sortable>
                            <template #body="{ data }">
                                <div class="font-medium">{{ data.title }}</div>
                                <div class="text-sm text-gray-500">{{ data.description }}</div>
                            </template>
                        </Column>

                        <Column field="slug" header="Slug" sortable>
                            <template #body="{ data }">
                                <code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                                    {{ data.slug }}
                                </code>
                            </template>
                        </Column>

                        <Column field="fields_count" header="Fields" sortable>
                            <template #body="{ data }">
                                <Tag :value="data.fields_count" severity="info" />
                            </template>
                        </Column>

                        <Column field="submissions_count" header="Submissions" sortable>
                            <template #body="{ data }">
                                <Tag :value="data.submissions_count" severity="success" />
                            </template>
                        </Column>

                        <Column field="is_active" header="Status" sortable>
                            <template #body="{ data }">
                                <Tag
                                    :value="data.is_active ? 'Active' : 'Inactive'"
                                    :severity="data.is_active ? 'success' : 'secondary'"
                                />
                            </template>
                        </Column>

                        <Column field="created_at" header="Created" sortable>
                            <template #body="{ data }">
                                <span class="text-sm">{{ formatDate(data.created_at) }}</span>
                            </template>
                        </Column>

                        <Column header="Actions" style="width: 200px">
                            <template #body="{ data }">
                                <div class="flex gap-2">
                                    <Button
                                        icon="pi pi-pencil"
                                        size="small"
                                        severity="secondary"
                                        outlined
                                        @click="editForm(data.id)"
                                        v-tooltip.top="'Edit Form'"
                                    />
                                    <Button
                                        icon="pi pi-eye"
                                        size="small"
                                        severity="info"
                                        outlined
                                        @click="viewSubmissions(data.id)"
                                        v-tooltip.top="'View Submissions'"
                                    />
                                    <Button
                                        icon="pi pi-external-link"
                                        size="small"
                                        severity="help"
                                        outlined
                                        @click="openPublicForm(data.slug)"
                                        v-tooltip.top="'Open Public Form'"
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        size="small"
                                        severity="danger"
                                        outlined
                                        @click="confirmDelete(data)"
                                        v-tooltip.top="'Delete Form'"
                                    />
                                </div>
                            </template>
                        </Column>

                        <template #empty>
                            <div class="text-center py-8">
                                <i class="pi pi-inbox text-4xl text-gray-400 mb-3"></i>
                                <p class="text-gray-600 dark:text-gray-400">No forms created yet.</p>
                                <Button
                                    label="Create Your First Form"
                                    icon="pi pi-plus"
                                    class="mt-4"
                                    @click="createForm"
                                />
                            </div>
                        </template>
                    </DataTable>
                </template>
            </Card>
        </div>

        <!-- Delete Confirmation Dialog -->
        <Dialog
            v-model:visible="deleteDialog"
            :style="{ width: '450px' }"
            header="Confirm Delete"
            :modal="true"
        >
            <div class="flex items-center gap-3">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                <span v-if="formToDelete">
                    Are you sure you want to delete <b>{{ formToDelete.title }}</b>?
                    This will also delete all fields and submissions.
                </span>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="deleteDialog = false" />
                <Button label="Delete" icon="pi pi-trash" severity="danger" @click="deleteForm" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';

const props = defineProps({
    forms: Array
});

const deleteDialog = ref(false);
const formToDelete = ref(null);

const createForm = () => {
    router.visit('/forms/create');
};

const editForm = (id) => {
    router.visit(`/forms/${id}/edit`);
};

const viewSubmissions = (id) => {
    router.visit(`/forms/${id}/submissions`);
};

const openPublicForm = (slug) => {
    window.open(`/f/${slug}`, '_blank');
};

const confirmDelete = (form) => {
    formToDelete.value = form;
    deleteDialog.value = true;
};

const deleteForm = () => {
    if (formToDelete.value) {
        router.delete(`/forms/${formToDelete.value.id}`, {
            onSuccess: () => {
                deleteDialog.value = false;
                formToDelete.value = null;
            }
        });
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
</script>
