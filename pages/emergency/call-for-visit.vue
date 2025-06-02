<script setup lang="ts">
import { ref, onBeforeMount, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Patient } from "~/composable/protobuf/frontend/user";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import { CallPatientRequest } from "~/composable/protobuf/frontend/emergency_ward_services";

const { t } = useI18n();
const config = useRuntimeConfig();
const employeeGRPC = EmployeeGRPC.getInstance(config.public.employeesUrl);

// Form data
const selectedPatient = ref<Patient | null>(null);
const ambulatory = ref<string>("");

// UI state
const loading = ref<boolean>(false);
const showError = ref(false);
const errorMessage = ref("");

// Autocomplete data
const patients = ref<Patient[]>([]);
const patientSearch = ref<string>("");
const loadingPatients = ref(false);

const ambulatoryOptions = ref<string>("");

// Validation
const isFormValid = computed(() => {
  return selectedPatient.value && ambulatory.value.trim();
});

onBeforeMount(async () => {
  fetchPatients();
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

const callPatientForVisit = async () => {
  if (!isFormValid.value) {
    showError.value = true;
    errorMessage.value = t("form.invalid") || "Please fill all required fields";
    return;
  }

  loading.value = true;

  const request: CallPatientRequest = {
    patient: selectedPatient.value!,
    ambulatory: ambulatory.value,
  };

  try {
    await employeeGRPC.callEmergencyPatientForVisit(request);

    // Show success message
    showError.value = true;
    errorMessage.value =
      t("patient.callSuccess") ||
      `Patient ${selectedPatient.value?.user?.name} ${selectedPatient.value?.user?.surname} called to ${ambulatory.value}`;

    // Reset form
    resetForm();
  } catch (err) {
    console.error("Failed to call patient", err);
    showError.value = true;
    errorMessage.value =
      t("patient.callError") || "Failed to call patient for visit";
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  selectedPatient.value = null;
  ambulatory.value = "";
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
    :color="errorMessage.includes('called') ? 'success' : 'error'"
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
        <v-icon start>mdi-account-voice</v-icon>
        {{ t("callPatient") || "Call Patient for Visit" }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="callPatientForVisit">
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

            <!-- Ambulatory Selection -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="ambulatory"
                :label="t('ambulatory') || 'Ambulatory/Room *'"
                variant="outlined"
                :rules="[(v) => !!v || 'Ambulatory is required']"
                required
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="primary"
          variant="flat"
          @click="callPatientForVisit"
          :loading="loading"
          :disabled="!isFormValid"
        >
          <v-icon start>mdi-phone</v-icon>
          {{ t("callPatient") || "Call Patient" }}
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
