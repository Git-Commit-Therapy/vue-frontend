<script setup lang="ts">
import { ref, onBeforeMount, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  AddPatientRequest,
  AddPatientResponse,
} from "~/composable/protobuf/frontend/emergency_ward_services";
import type { Patient } from "~/composable/protobuf/frontend/user";
import type { Doctor } from "~/composable/protobuf/frontend/user";
import { SeverityCode } from "~/composable/protobuf/frontend/medical_event";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";

const { t } = useI18n();
const config = useRuntimeConfig();
const employeeGRPC = EmployeeGRPC.getInstance(config.public.employeesUrl);

// Form data
const selectedPatient = ref<Patient | null>(null);
const selectedSeverityCode = ref<SeverityCode | null>(null);
const medicalReport = ref<string>("");
const examType = ref<string>("");

// UI state
const loading = ref<boolean>(false);
const showError = ref(false);
const errorMessage = ref("");

// Current doctor (filled automatically)
const currentDoctor = ref<Doctor | null>(null);

// Autocomplete data
const patients = ref<Patient[]>([]);
const patientSearch = ref<string>("");
const loadingPatients = ref(false);

const severityCodes = computed(() => [
  { label: t("white"), value: SeverityCode.WHITE },
  { label: t("green"), value: SeverityCode.GREEN },
  { label: t("yellow"), value: SeverityCode.YELLOW },
  { label: t("orange"), value: SeverityCode.ORANGE },
  { label: t("red"), value: SeverityCode.RED },
]);

// Validation
const isFormValid = computed(() => {
  return (
    selectedPatient.value &&
    selectedSeverityCode.value !== null &&
    medicalReport.value.trim() &&
    examType.value.trim()
  );
});

onBeforeMount(async () => {
  // Get current doctor
  try {
    fetchPatients();
    currentDoctor.value = await employeeGRPC.getDoctor();
  } catch (err) {
    showError.value = true;
    errorMessage.value = t("fetchError");
  }
});

const fetchPatients = async () => {
  loadingPatients.value = true;
  try {
    patients.value = (await employeeGRPC.getAllPatients()).patients;
  } catch (err) {
    showError.value = true;
    errorMessage.value = t("fetchError");
  } finally {
    loadingPatients.value = false;
  }
};

const addPatient = async () => {
  if (!isFormValid.value) {
    showError.value = true;
    errorMessage.value = t("required");
    return;
  }

  if (!currentDoctor.value) {
    showError.value = true;
    errorMessage.value = t("required");
    return;
  }

  loading.value = true;

  const request: AddPatientRequest = {
    patient: selectedPatient.value!,
    severityCode: selectedSeverityCode.value!,
    medicalReport: medicalReport.value,
    examType: examType.value,
    doctor: currentDoctor.value,
  };
  console.log(request);
  try {
    const response: AddPatientResponse =
      await employeeGRPC.addEmergencyPatient(request);

    // Show success message
    showError.value = true;
    errorMessage.value = t("submitSuccess");

    // Reset form
    resetForm();
  } catch (err) {
    console.error("Failed to add patient", err);
    showError.value = true;
    errorMessage.value = t("submitError");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  selectedPatient.value = null;
  selectedSeverityCode.value = null;
  medicalReport.value = "";
  examType.value = "";
  patientSearch.value = "";
};

const setError = (value: boolean) => {
  showError.value = value;
};
</script>

<template>
  <v-snackbar
    v-model="showError"
    timeout="5000"
    :color="errorMessage.includes('success') ? 'success' : 'error'"
    location="top right"
  >
    {{ errorMessage }}
    <template #actions>
      <v-btn variant="text" icon="mdi-close" @click="setError(false)" />
    </template>
  </v-snackbar>

  <div class="p-4">
    <v-card>
      <v-card-title>
        <v-icon start>mdi-account-plus</v-icon>
        {{ t("addPatientTitle") }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="addPatient">
          <v-row>
            <!-- Patient Selection -->
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="selectedPatient"
                v-model:search="patientSearch"
                :items="patients"
                :loading="loadingPatients"
                :label="t('patient')"
                variant="outlined"
                :item-title="showPatientFullName"
                return-object
                clearable
                @update:search="fetchPatients"
                :rules="[(v) => !!v || t('required')]"
                required
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title>
                      {{ t("noPatients") }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>

            <!-- Severity Code -->
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedSeverityCode"
                :items="severityCodes"
                :label="t('severityCode')"
                variant="outlined"
                item-title="label"
                item-value="value"
                :rules="[
                  (v) => (v !== null && v !== undefined) || t('required'),
                ]"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="examType"
                :label="t('examType')"
                variant="outlined"
                :rules="[(v) => !!v || t('required')]"
                required
              />
            </v-col>

            <!-- Medical Report -->
            <v-col cols="12">
              <v-textarea
                v-model="medicalReport"
                :label="t('medicalReport')"
                variant="outlined"
                rows="4"
                counter
                :rules="[(v) => !!v || t('required')]"
                required
                :hint="t('reportHint')"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="primary"
          variant="flat"
          @click="addPatient"
          :loading="loading"
          :disabled="!isFormValid"
        >
          <v-icon start>mdi-plus</v-icon>
          {{ t("submit") }}
        </v-btn>

        <v-btn
          color="grey"
          variant="outlined"
          @click="resetForm"
          :disabled="loading"
        >
          <v-icon start>mdi-refresh</v-icon>
          {{ t("reset") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
