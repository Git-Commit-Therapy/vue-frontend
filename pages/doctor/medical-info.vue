<script setup lang="ts">
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import { useI18n } from "vue-i18n";
import type { Patient, Staff } from "~/composable/protobuf/frontend/user";
import env from "~/utils/env";
import type { MedicalInfo } from "~/composable/protobuf/frontend/medical_info";
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);
const { t } = useI18n(); // Reactive state
const medicalInfo = reactive<MedicalInfo>({
  medicalInfoId: -1,
  description: "",
  patient: undefined,
});

const patients = ref<Patient[]>([]);
const searchQuery = ref<string>("");
const isLoadingPatients = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);
const showError = ref<boolean>(false);
const errorMessage = ref("");

// Validation state
const touched = reactive({
  patient: false,
  description: false,
});

const errors = reactive({
  patient: "",
  description: "",
});

// Computed filtered patients
const filteredPatients = computed(() => {
  if (!searchQuery.value) return patients.value;
  const query = searchQuery.value.toLowerCase();
  return patients.value.filter(
    (patient: Patient) =>
      patient.user!.name.toLowerCase().includes(query) ||
      patient.user!.email?.toLowerCase().includes(query) ||
      patient.user!.id.toString().includes(query),
  );
});

// Form validation
const isFormValid = computed(() => {
  return !!medicalInfo.patient && !!medicalInfo.description.trim();
});

// Load patients on mount
onMounted(async () => {
  try {
    isLoadingPatients.value = true;
    patients.value = await fetchPatients();
  } catch (error) {
    showError.value = true;
    errorMessage.value = t("medicalInfo.loadError");
  } finally {
    isLoadingPatients.value = false;
  }
});

// Validation functions
function validatePatient(patient: Patient | undefined): string {
  if (!patient) return t("required");
  return "";
}

function validateDescription(desc: string): string {
  if (!desc.trim()) return t("required");
  return "";
}

// Form handling
async function submitForm() {
  touched.patient = true;
  touched.description = true;

  errors.patient = validatePatient(medicalInfo.patient);
  errors.description = validateDescription(medicalInfo.description);

  if (!isFormValid.value) return;

  try {
    isSubmitting.value = true;
    await submitMedicalInfo(medicalInfo);
    // Handle success
    resetForm();
  } catch (error) {
    showError.value = true;
    errorMessage.value = t("medicalInfo.submitError");
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  medicalInfo.patient = undefined;
  medicalInfo.description = "";
  searchQuery.value = "";
  touched.patient = false;
  touched.description = false;
}

async function fetchPatients() {
  return (await employeeGRPC.getAllPatients()).patients;
}

async function submitMedicalInfo(info: MedicalInfo) {
  return await employeeGRPC.createMedicalInfo(info);
}

function setError(error: boolean) {
  showError.value = error;
}
</script>

<template>
  <div>
    <v-snackbar
      v-model="showError"
      :timeout="5000"
      color="error"
      location="top right"
    >
      {{ errorMessage }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" @click="setError(false)" />
      </template>
    </v-snackbar>

    <v-card class="mx-auto my-4" max-width="800" rounded="lg">
      <v-card-title class="headline">
        {{ t("medicalInfo.title") }}
      </v-card-title>

      <v-card-text>
        <form @submit.prevent="submitForm">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  v-model="medicalInfo.patient"
                  :items="filteredPatients"
                  :search-input.sync="searchQuery"
                  :label="t('medicalInfo.patient')"
                  :loading="isLoadingPatients"
                  :errors="touched.patient && errors.patient"
                  :error-messages="errors.patient"
                  item-title="name"
                  item-value="id"
                  return-object
                  clearable
                  variant="outlined"
                  @blur="touched.patient = true"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #title>
                        {{ item.raw.user!.name }}
                      </template>
                      <template #subtitle>
                        {{ item.raw.user!.email }} ({{ item.raw.user!.id }})
                      </template>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="medicalInfo.description"
                  :label="t('medicalInfo.description')"
                  :error="touched.description"
                  :errorMessages="errors.description"
                  variant="outlined"
                  rows="3"
                  @blur="touched.description = true"
                />
              </v-col>

              <v-col cols="12">
                <v-btn
                  type="submit"
                  color="primary"
                  :disabled="!isFormValid"
                  :loading="isSubmitting"
                  block
                  size="large"
                >
                  {{ t("medicalInfo.submit") }}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </form>
      </v-card-text>
    </v-card>
  </div>
</template>
