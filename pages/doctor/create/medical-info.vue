<script setup lang="ts">
import { showPatientFullName } from "~/utils/show-patient-full-name";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import { useI18n } from "vue-i18n";
import { reactive, ref, computed, onBeforeMount } from "vue";
import type { Patient } from "~/composable/protobuf/frontend/user";
import type { MedicalInfo } from "~/composable/protobuf/frontend/medical_info";
import env from "~/utils/env";

const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);
const { t } = useI18n();

const medicalInfo = reactive<MedicalInfo>({
  medicalInfoId: -1,
  description: "",
  patient: undefined,
});

const patients = ref<Patient[]>([]);
const searchQuery = ref("");
const isLoadingPatients = ref(false);
const isSubmitting = ref(false);
const showError = ref(false);
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

const filteredPatients = computed(() => {
  if (!searchQuery.value) return patients.value;
  const query = searchQuery.value.toLowerCase();
  return patients.value.filter((patient) => {
    const user = patient.user;
    return (
      user &&
      (user.name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.id.toString().includes(query))
    );
  });
});

const isFormValid = computed(() => {
  return !!medicalInfo.patient && !!medicalInfo.description.trim();
});

onBeforeMount(async () => {
  try {
    isLoadingPatients.value = true;
    patients.value = await fetchPatients();
  } catch (error) {
    showError.value = true;
    errorMessage.value = t("fetchError");
  } finally {
    isLoadingPatients.value = false;
  }
});

function validatePatient(patient: Patient | undefined): string {
  return patient ? "" : t("required");
}

function validateDescription(desc: string): string {
  return desc.trim() ? "" : t("required");
}

async function submitForm() {
  touched.patient = true;
  touched.description = true;

  errors.patient = validatePatient(medicalInfo.patient);
  errors.description = validateDescription(medicalInfo.description);

  if (!isFormValid.value) return;

  try {
    isSubmitting.value = true;
    await submitMedicalInfo(medicalInfo);
    resetForm();
  } catch (error) {
    showError.value = true;
    errorMessage.value = t("submitError");
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
      <v-card-title class="text-h5">
        {{ t("createMedicalInfoTitle") }}
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
                  :label="t('patient')"
                  :loading="isLoadingPatients"
                  :error="Boolean(errors.patient)"
                  :error-messages="touched.patient ? errors.patient : ''"
                  :item-title="showPatientFullName"
                  item-value="id"
                  return-object
                  clearable
                  variant="outlined"
                  @blur="touched.patient = true"
                >
                </v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="medicalInfo.description"
                  :label="t('description')"
                  :error="Boolean(errors.description)"
                  :error-messages="
                    touched.description ? errors.description : ''
                  "
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
                  {{ t("submit") }}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </form>
      </v-card-text>
    </v-card>
  </div>
</template>
