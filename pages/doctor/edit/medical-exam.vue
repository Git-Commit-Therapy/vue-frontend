<script setup lang="ts">
import { ref, computed, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import type { MedicalExam } from "~/composable/protobuf/frontend/medical_exam";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import type { Patient } from "~/composable/protobuf/frontend/user";
import {
  GetAllMedicalExamResponse,
  GetAllMedicalExamRequest,
} from "~/composable/protobuf/frontend/employee_services";

const { t } = useI18n();
const config = useRuntimeConfig();
const employeeGRPC = EmployeeGRPC.getInstance(config.public.employeesUrl);

// State
const fromDate = ref<string>("");
const toDate = ref<string>("");
const loading = ref(false);
const saving = ref(false);
const exams = ref<MedicalExam[]>([]);
const editingExam = ref<MedicalExam | null>(null);
const patients = ref<Patient[]>([]);
const searchPatient = ref<string>("");
const showEditDialog = ref(false);
const showError = ref(false);
const errorMessage = ref("");

const now = new Date();

// Computed
const canEdit = computed(() => (date: string | Date) => new Date(date) > now);

const hasValidDateRange = computed(() => {
  if (!fromDate.value || !toDate.value) return true; // Allow empty dates
  return new Date(fromDate.value) <= new Date(toDate.value);
});

const filteredPatients = computed(() => {
  if (!searchPatient.value) return patients.value;
  return patients.value.filter((patient) => {
    const fullName = showPatientFullName(patient);
    return fullName.includes(searchPatient.value.toLowerCase());
  });
});

// Methods
const setError = (value: boolean) => {
  showError.value = value;
};

const fetchAllPatients = async () => {
  try {
    patients.value = (await employeeGRPC.getAllPatients()).patients;
  } catch (err) {
    console.error("Failed to fetch patients", err);
    errorMessage.value = t("failedToLoadPatients");
    showError.value = true;
  }
};

const showPatientFullName = (patient: Patient) => {
  return `${patient.user?.name} ${patient.user?.surname}`;
};

const fetchExams = async () => {
  if (!hasValidDateRange.value) {
    errorMessage.value = t("invalidDateRange");
    showError.value = true;
    return;
  }

  loading.value = true;
  const req: GetAllMedicalExamRequest = {
    fromDate: fromDate.value ? new Date(fromDate.value) : undefined,
    toDate: toDate.value ? new Date(toDate.value) : undefined,
    patient: searchPatient.value
      ? patients.value.find((p) =>
          showPatientFullName(p)
            .toLowerCase()
            .includes(searchPatient.value.toLowerCase()),
        )
      : undefined,
  };

  try {
    const res: GetAllMedicalExamResponse =
      await employeeGRPC.getAllMedicalExams(req);
    exams.value = res.medicalExams;
  } catch (err) {
    console.error("Failed to fetch medical exams", err);
    errorMessage.value = t("failedToLoadExams");
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

const openEditDialog = (exam: MedicalExam) => {
  editingExam.value = { ...exam }; // Create a copy for editing
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  editingExam.value = null;
  showEditDialog.value = false;
};

const saveExam = async () => {
  if (!editingExam.value) return;

  saving.value = true;
  try {
    await employeeGRPC.updateMedicalExam(editingExam.value);

    const index = exams.value.findIndex(
      (e) => e.examId === editingExam.value!.examId,
    );
    if (index !== -1) {
      exams.value[index] = { ...editingExam.value };
    }

    closeEditDialog();
  } catch (err) {
    console.error("Failed to save medical exam", err);
    errorMessage.value = t("failedToSaveExam");
    showError.value = true;
  } finally {
    saving.value = false;
  }
};

// Initialize data
onBeforeMount(async () => {
  await fetchAllPatients();
});
</script>

<template>
  <div class="pa-4">
    <!-- Error Snackbar -->
    <VSnackbar
      v-model="showError"
      timeout="5000"
      color="error"
      location="top right"
    >
      {{ errorMessage }}
      <template #actions>
        <VBtn variant="text" icon="mdi-close" @click="setError(false)" />
      </template>
    </VSnackbar>
    <!-- Search Section -->
    <VCard class="mb-6">
      <VCardTitle class="d-flex align-center">
        <VIcon class="me-2">mdi-magnify</VIcon>
        {{ t("searchMedicalExams") }}
      </VCardTitle>

      <VCardText>
        <VForm @submit.prevent="fetchExams">
          <VRow>
            <VCol cols="12" md="5">
              <VTextField
                v-model="fromDate"
                :label="t('fromDate')"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                :error="!hasValidDateRange"
              />
            </VCol>

            <VCol cols="12" md="5">
              <VTextField
                v-model="toDate"
                :label="t('toDate')"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                :error="!hasValidDateRange"
                :error-messages="
                  !hasValidDateRange ? t('toDateMustBeAfterFromDate') : ''
                "
              />
            </VCol>

            <VCol cols="12" md="4">
              <v-autocomplete
                :v-model="searchPatient"
                :items="filteredPatients"
                :search-input.sync="searchPatient"
                :label="t('patient')"
                :item-title="showPatientFullName"
                item-value="id"
                return-object
                clearable
                variant="outlined"
                :no-data-text="t('noPatients')"
              />
            </VCol>
          </VRow>

          <div class="d-flex gap-2 mt-4">
            <VBtn
              :loading="loading"
              :disabled="!hasValidDateRange"
              type="submit"
              color="primary"
              variant="elevated"
            >
              <VIcon start>mdi-magnify</VIcon>
              {{ t("search") }}
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <!-- Results Section -->
    <div v-if="exams.length">
      <div class="d-flex align-center mb-4">
        <VIcon class="me-2">mdi-clipboard-list</VIcon>
        <h3>{{ t("searchResults") }} ({{ exams.length }})</h3>
      </div>

      <VRow>
        <VCol v-for="exam in exams" :key="exam.examId" cols="12" md="6" lg="4">
          <VCard
            class="h-100"
            :class="{ 'border-warning': canEdit(exam.dateTime!) }"
            variant="outlined"
          >
            <VCardTitle class="text-subtitle-1">
              <VIcon
                :color="canEdit(exam.dateTime!) ? 'warning' : 'grey'"
                class="me-2"
              >
                mdi-account
              </VIcon>
              {{ exam.patient?.user?.name }} {{ exam.patient?.user?.surname }}
            </VCardTitle>

            <VCardText>
              <div class="d-flex align-center mb-2">
                <VIcon class="me-2" size="small">mdi-calendar</VIcon>
                <span>{{ formatDateTime(exam.dateTime!) }}</span>
              </div>

              <VChip
                :color="canEdit(exam.dateTime!) ? 'warning' : 'grey'"
                size="small"
                variant="tonal"
              >
                {{ canEdit(exam.dateTime!) ? t("editable") : t("pastExam") }}
              </VChip>
            </VCardText>

            <VCardActions>
              <VSpacer />
              <VBtn
                v-if="canEdit(exam.dateTime!)"
                color="primary"
                variant="elevated"
                size="small"
                @click="openEditDialog(exam)"
              >
                <VIcon start>mdi-pencil</VIcon>
                {{ t("edit") }}
              </VBtn>

              <VBtn v-else disabled variant="text" size="small">
                <VIcon start>mdi-lock</VIcon>
                {{ t("readOnly") }}
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- No Results -->

    <v-alert v-if="exams.length === 0 && !loading" type="info" variant="tonal">
      {{ t("noMedicalExams") }}
    </v-alert>

    <!-- Edit Dialog -->
    <VDialog v-model="showEditDialog" max-width="600px" persistent>
      <VCard v-if="editingExam">
        <VCardTitle class="d-flex align-center">
          <VIcon class="me-2">mdi-pencil</VIcon>
          {{ t("editMedicalExam") }}
        </VCardTitle>

        <VCardText>
          <VForm @submit.prevent="saveExam">
            <VTextField
              :model-value="`${editingExam.patient?.user?.name} ${editingExam.patient?.user?.surname}`"
              :label="t('patient')"
              readonly
              variant="outlined"
              class="mb-4"
            />

            <VTextField
              v-model="editingExam.dateTime"
              :label="t('dateTime')"
              type="date"
              variant="outlined"
              class="mb-4"
            />

            <VTextarea
              v-model="editingExam.medicalReport"
              :label="t('medicalReport')"
              variant="outlined"
              rows="4"
            />
          </VForm>
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="closeEditDialog" :disabled="saving">
            {{ t("cancel") }}
          </VBtn>

          <VBtn
            color="primary"
            variant="elevated"
            :loading="saving"
            @click="saveExam"
          >
            <VIcon start>mdi-content-save</VIcon>
            {{ t("save") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
