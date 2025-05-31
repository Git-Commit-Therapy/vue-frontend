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
import env from "~/utils/env";

const { t } = useI18n();
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);

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

const severityCodes = ref<{ value: SeverityCode; title: string }[]>([
  { value: SeverityCode.WHITE, title: "Low Priority" },
  { value: SeverityCode.GREEN, title: "Medium Priority" },
  { value: SeverityCode.YELLOW, title: "High Priority" },
  { value: SeverityCode.ORANGE, title: "Critical" },
  { value: SeverityCode.RED, title: "Fatal" },
]);

// Exam types - replace with your actual types
const examTypes = ref<string[]>([
  "General Consultation",
  "Emergency Assessment",
  "Follow-up",
  "Specialist Referral",
  "Diagnostic",
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
    console.error("Failed to fetch current doctor", err);
    showError.value = true;
    errorMessage.value =
      t("doctor.fetchError") || "Failed to load doctor information";
  }
});

const fetchPatients = async () => {
  loadingPatients.value = true;
  try {
    patients.value = (await employeeGRPC.getAllPatients()).patients;
  } catch (err) {
    console.error("Failed to fetch patients", err);
    showError.value = true;
    errorMessage.value = t("patients.fetchError") || "Failed to fetch patients";
  } finally {
    loadingPatients.value = false;
  }
};

const addPatient = async () => {
  if (!isFormValid.value) {
    showError.value = true;
    errorMessage.value = t("form.invalid") || "Please fill all required fields";
    return;
  }

  if (!currentDoctor.value) {
    showError.value = true;
    errorMessage.value =
      t("doctor.notLoaded") || "Doctor information not loaded";
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
    errorMessage.value =
      t("patient.addSuccess") ||
      `Patient added successfully. Emergency ID: ${response.emergencyPatientId}`;

    // Reset form
    resetForm();
  } catch (err) {
    console.error("Failed to add patient", err);
    showError.value = true;
    errorMessage.value = t("patient.addError") || "Failed to add patient";
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

// Format patient display
const formatPatient = (patient: Patient) => {
  return `${patient.user?.name} ${patient.user?.surname} (${patient.user?.email})`;
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
        {{ t("addPatient") || "Add Patient to Emergency Ward" }}
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
                :label="t('selectPatient') || 'Select Patient *'"
                variant="outlined"
                :item-title="formatPatient"
                return-object
                clearable
                @update:search="fetchPatients"
                :rules="[(v) => !!v || 'Patient is required']"
                required
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title>
                      {{
                        t("noPatients") ||
                        "No patients found. Start typing to search."
                      }}
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
                :label="t('severityCode') || 'Severity Code *'"
                variant="outlined"
                :rules="[
                  (v) =>
                    (v !== null && v !== undefined) ||
                    'Severity code is required',
                ]"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="examType"
                :label="t('examType') || 'Exam Type *'"
                variant="outlined"
                :rules="[(v) => !!v || 'Exam type is required']"
                required
              />
            </v-col>

            <!-- Medical Report -->
            <v-col cols="12">
              <v-textarea
                v-model="medicalReport"
                :label="t('medicalReport') || 'Medical Report *'"
                variant="outlined"
                rows="4"
                counter
                :rules="[(v) => !!v || 'Medical report is required']"
                required
                hint="Describe the patient's condition, symptoms, and initial assessment"
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
          {{ t("addPatient") || "Add Patient" }}
        </v-btn>

        <v-btn
          color="grey"
          variant="outlined"
          @click="resetForm"
          :disabled="loading"
        >
          <v-icon start>mdi-refresh</v-icon>
          {{ t("reset") || "Reset Form" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
