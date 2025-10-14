<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-6">
                <Button
                    label="Back to Forms"
                    icon="pi pi-arrow-left"
                    text
                    @click="router.visit('/forms')"
                    class="mb-4"
                />
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                            Submissions for "{{ form.title }}"
                        </h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">
                            View and manage form submissions
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <Button
                            label="Export CSV"
                            icon="pi pi-download"
                            severity="secondary"
                            outlined
                            @click="exportCSV"
                        />
                    </div>
                </div>
            </div>

            <!-- Submissions Table -->
            <Card>
                <template #content>
                    <DataTable
                        :value="submissions.data"
                        stripedRows
                        responsiveLayout="scroll"
                        class="p-datatable-sm"
                    >
                        <Column field="id" header="ID" sortable style="width: 80px" />

                        <Column header="Submission Data" style="min-width: 400px">
                            <template #body="{ data }">
                                <div class="space-y-1">
                                    <div v-for="item in data.data.slice(0, 3)" :key="item.id" class="text-sm">
                                        <span class="font-medium text-gray-700 dark:text-gray-300">
                                            {{ item.field.label }}:
                                        </span>
                                        <span class="text-gray-600 dark:text-gray-400 ml-2">
                                            {{ formatValue(item.value) }}
                                        </span>
                                    </div>
                                    <span v-if="data.data.length > 3" class="text-xs text-gray-500">
                                        +{{ data.data.length - 3 }} more fields
                                    </span>
                                </div>
                            </template>
                        </Column>

                        <Column field="ip_address" header="IP Address" sortable>
                            <template #body="{ data }">
                                <code class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {{ data.ip_address }}
                                </code>
                            </template>
                        </Column>

                        <Column field="submitted_at" header="Submitted" sortable>
                            <template #body="{ data }">
                                <span class="text-sm">{{ formatDate(data.submitted_at) }}</span>
                            </template>
                        </Column>

                        <Column header="Actions" style="width: 150px">
                            <template #body="{ data }">
                                <div class="flex gap-2">
                                    <Button
                                        icon="pi pi-eye"
                                        size="small"
                                        severity="info"
                                        outlined
                                        @click="viewSubmission(data.id)"
                                        v-tooltip.top="'View Details'"
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        size="small"
                                        severity="danger"
                                        outlined
                                        @click="confirmDelete(data)"
                                        v-tooltip.top="'Delete'"
                                    />
                                </div>
                            </template>
                        </Column>

                        <template #empty>
                            <div class="text-center py-8">
                                <i class="pi pi-inbox text-4xl text-gray-400 mb-3"></i>
                                <p class="text-gray-600 dark:text-gray-400">No submissions yet.</p>
                            </div>
                        </template>
                    </DataTable>

                    <!-- Pagination -->
                    <div v-if="submissions.data.length > 0" class="mt-4 flex justify-between items-center">
                        <span class="text-sm text-gray-600 dark:text-gray-400">
                            Showing {{ submissions.from }} to {{ submissions.to }} of {{ submissions.total }} submissions
                        </span>
                        <Paginator
                            :rows="submissions.per_page"
                            :totalRecords="submissions.total"
                            @page="onPageChange"
                        />
                    </div>
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
                <span v-if="submissionToDelete">
                    Are you sure you want to delete this submission? This action cannot be undone.
                </span>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="deleteDialog = false" />
                <Button label="Delete" icon="pi pi-trash" severity="danger" @click="deleteSubmission" />
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
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';

const props = defineProps({
    form: Object,
    submissions: Object
});

const deleteDialog = ref(false);
const submissionToDelete = ref(null);

const viewSubmission = (id) => {
    router.visit(`/forms/${props.form.id}/submissions/${id}`);
};

const confirmDelete = (submission) => {
    submissionToDelete.value = submission;
    deleteDialog.value = true;
};

const deleteSubmission = () => {
    if (submissionToDelete.value) {
        router.delete(`/forms/${props.form.id}/submissions/${submissionToDelete.value.id}`, {
            onSuccess: () => {
                deleteDialog.value = false;
                submissionToDelete.value = null;
            }
        });
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatValue = (value) => {
    if (!value) return '-';
    if (value.length > 50) return value.substring(0, 50) + '...';
    return value;
};

const onPageChange = (event) => {
    router.get(`/forms/${props.form.id}/submissions`, { page: event.page + 1 });
};

const exportCSV = () => {
    // Convert submissions to CSV
    const headers = ['ID', 'Submitted At', 'IP Address'];
    const fieldNames = new Set();

    // Collect all unique field names
    props.submissions.data.forEach(submission => {
        submission.data.forEach(item => {
            fieldNames.add(item.field.label);
        });
    });

    headers.push(...Array.from(fieldNames));

    const rows = props.submissions.data.map(submission => {
        const row = [
            submission.id,
            formatDate(submission.submitted_at),
            submission.ip_address
        ];

        fieldNames.forEach(fieldName => {
            const item = submission.data.find(d => d.field.label === fieldName);
            row.push(item ? item.value : '');
        });

        return row;
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.form.slug}_submissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
};
</script>
