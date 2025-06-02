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
    showError.value = true;
    errorMessage.value = t("fetchError");
  } finally {
    loadingPatients.value = false;
  }
};

const callPatientForVisit = async () => {
  if (!isFormValid.value) {
    showError.value = true;
    errorMessage.value = t("required");
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
    errorMessage.value = t("submitSuccess");
    // Reset form
    resetForm();
  } catch (err) {
    console.error("Failed to call patient", err);
    showError.value = true;
    errorMessage.value = t("submitError");
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
        {{ t("callPatientTitle") }}
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

            <!-- Ambulatory Selection -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="ambulatory"
                :label="t('ambulatory')"
                variant="outlined"
                :rules="[(v) => !!v || t('required')]"
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
