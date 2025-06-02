<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import type { Patient } from "~/composable/protobuf/frontend/user";
import { MedicalEvent } from "~/composable/protobuf/frontend/medical_event";
import { RemovePatientRequest } from "~/composable/protobuf/frontend/emergency_ward_services";
import { GetAllMedicalEventRequest } from "~/composable/protobuf/frontend/employee_services";

const { t } = useI18n();
const config = useRuntimeConfig();
const employeeGRPC = EmployeeGRPC.getInstance(config.public.employeesUrl);

// Form data
const selectedPatient = ref<Patient | null>(null);
const selectedMedicalEvent = ref<MedicalEvent | null>(null);
const dischargeLetter = ref("");

// UI state
const loading = ref(false);
const showError = ref(false);
const errorMessage = ref("");

// Autocomplete data
const patients = ref<Patient[]>([]);
const patientSearch = ref("");
const loadingPatients = ref(false);

// Medical events
const medicalEvents = ref<MedicalEvent[]>([]);
const loadingEvents = ref(false);

// Validation
const isFormValid = computed(() => {
  return (
    selectedPatient.value &&
    selectedMedicalEvent.value &&
    dischargeLetter.value.trim().length > 0
  );
});

const setError = (value: boolean) => {
  showError.value = value;
};

const resetForm = () => {
  selectedPatient.value = null;
  selectedMedicalEvent.value = null;
  dischargeLetter.value = "";
  patientSearch.value = "";
  medicalEvents.value = [];
};

// Format display
const formatPatient = (patient: Patient) => {
  return `${patient.user?.name} ${patient.user?.surname} (${patient.user?.email})`;
};

const formatEvent = (event: MedicalEvent) => {
  return `Event ID: ${event.eventId} — ${event.fromDateTime?.toLocaleString()}, ${event.toDateTime?.toLocaleString()}`;
};

// Fetch patients
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

// Fetch medical events when patient changes
watch(selectedPatient, async (newPatient) => {
  if (!newPatient) {
    medicalEvents.value = [];
    return;
  }

  loadingEvents.value = true;
  try {
    const request: GetAllMedicalEventRequest = {
      fromDate: undefined,
      toDate: undefined,
      patient: newPatient,
    };
    const res = await employeeGRPC.getAllMedicalEvents(request);
    medicalEvents.value = res.medicalEvent ?? [];
  } catch (err) {
    console.error("Failed to fetch medical events", err);
    showError.value = true;
    errorMessage.value =
      t("events.fetchError") || "Failed to fetch medical events";
  } finally {
    loadingEvents.value = false;
  }
});

// Remove patient
const removePatient = async () => {
  if (!isFormValid.value) {
    showError.value = true;
    errorMessage.value = t("form.invalid") || "Please fill all required fields";
    return;
  }

  loading.value = true;
  const request: RemovePatientRequest = {
    patient: selectedPatient.value!,
    medicalEventId: selectedMedicalEvent.value!.eventId,
    dischargeLetter: dischargeLetter.value.trim(),
  };

  try {
    await employeeGRPC.removeEmergencyPatient(request);
    showError.value = true;
    errorMessage.value = t("patient.removed") || "Patient successfully removed";
    resetForm();
  } catch (err) {
    console.error("Remove failed", err);
    showError.value = true;
    errorMessage.value = t("patient.removeError") || "Failed to remove patient";
  } finally {
    loading.value = false;
  }
};

// Init
onBeforeMount(async () => {
  await fetchPatients();
});
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
        <v-icon start>mdi-account-remove</v-icon>
        {{ t("removePatient") || "Remove Patient" }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="removePatient">
          <v-row>
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

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="selectedMedicalEvent"
                :items="medicalEvents"
                :loading="loadingEvents"
                :label="t('selectEvent') || 'Select Medical Event *'"
                variant="outlined"
                :item-title="formatEvent"
                return-object
                clearable
                :rules="[(v) => !!v || 'Event is required']"
                required
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title>
                      {{
                        t("noEvents") || "No events found for selected patient."
                      }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="dischargeLetter"
                :label="t('dischargeLetter') || 'Discharge Letter *'"
                variant="outlined"
                auto-grow
                rows="4"
                :rules="[
                  (v) =>
                    (!!v && v.length > 0) || 'Discharge letter is required',
                ]"
                required
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="error"
          variant="flat"
          @click="removePatient"
          :loading="loading"
          :disabled="!isFormValid"
        >
          <v-icon start>mdi-account-remove</v-icon>
          {{ t("removePatient") || "Remove Patient" }}
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
