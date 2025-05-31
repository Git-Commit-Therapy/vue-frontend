<script setup lang="ts">
import { ref, onBeforeMount, computed } from "vue";
import { useI18n } from "vue-i18n";
import { TransferPatientRequest } from "~/composable/protobuf/frontend/emergency_ward_services";
import type { Patient } from "~/composable/protobuf/frontend/user";
import type { Ward } from "~/composable/protobuf/frontend/ward";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import env from "~/utils/env";

const { t } = useI18n();
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);

// Form data
const selectedPatient = ref<Patient | null>(null);
const selectedWard = ref<Ward | null>(null);

// UI state
const loading = ref<boolean>(false);
const showError = ref(false);
const errorMessage = ref("");

// Autocomplete data
const patients = ref<Patient[]>([]);
const patientSearch = ref<string>("");
const loadingPatients = ref(false);

const wards = ref<Ward[]>([]);
const wardSearch = ref<string>("");
const loadingWards = ref(false);

// Validation
const isFormValid = computed(() => {
  return selectedPatient.value && selectedWard.value;
});

onBeforeMount(async () => {
  try {
    fetchPatients();
    fetchWards();
  } catch (err) {
    console.error("Init failed", err);
    showError.value = true;
    errorMessage.value = t("init.fetchError") || "Failed to load data";
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

const fetchWards = async () => {
  loadingWards.value = true;
  try {
    wards.value = (await employeeGRPC.getAllWards()).ward;
  } catch (err) {
    console.error("Failed to fetch wards", err);
    showError.value = true;
    errorMessage.value = t("wards.fetchError") || "Failed to fetch wards";
  } finally {
    loadingWards.value = false;
  }
};

const transferPatient = async () => {
  if (!isFormValid.value) {
    showError.value = true;
    errorMessage.value = t("form.invalid") || "Please fill all required fields";
    return;
  }

  loading.value = true;

  const request: TransferPatientRequest = {
    patient: selectedPatient.value!,
    ward: selectedWard.value!,
  };

  try {
    await employeeGRPC.transferEmergencyPatient(request);

    showError.value = true;
    errorMessage.value =
      t("patient.transferSuccess") || "Patient transferred successfully";

    resetForm();
  } catch (err) {
    console.error("Failed to transfer patient", err);
    showError.value = true;
    errorMessage.value =
      t("patient.transferError") || "Failed to transfer patient";
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  selectedPatient.value = null;
  selectedWard.value = null;
  patientSearch.value = "";
  wardSearch.value = "";
};

const setError = (value: boolean) => {
  showError.value = value;
};

// Format display
const formatPatient = (patient: Patient) => {
  return `${patient.user?.name} ${patient.user?.surname} (${patient.user?.email})`;
};

const formatWard = (ward: Ward) => {
  return `${ward.name} (ID: ${ward.id})`;
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
        <v-icon start>mdi-transfer</v-icon>
        {{ t("transferPatient") || "Transfer Patient" }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="transferPatient">
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

            <!-- Ward Selection -->
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="selectedWard"
                v-model:search="wardSearch"
                :items="wards"
                :loading="loadingWards"
                :label="t('selectWard') || 'Select Ward *'"
                variant="outlined"
                :item-title="formatWard"
                return-object
                clearable
                @update:search="fetchWards"
                :rules="[(v) => !!v || 'Ward is required']"
                required
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title>
                      {{
                        t("noWards") ||
                        "No wards found. Start typing to search."
                      }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="primary"
          variant="flat"
          @click="transferPatient"
          :loading="loading"
          :disabled="!isFormValid"
        >
          <v-icon start>mdi-transfer</v-icon>
          {{ t("transferPatient") || "Transfer Patient" }}
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
