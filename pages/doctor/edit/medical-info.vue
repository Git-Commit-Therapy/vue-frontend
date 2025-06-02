<script setup lang="ts">
import { showPatientFullName } from "~/utils/show-patient-full-name";
import { ref, reactive, computed, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import type { MedicalInfo } from "~/composable/protobuf/frontend/medical_info";
import type { Patient } from "~/composable/protobuf/frontend/user";

const config = useRuntimeConfig();
const employeeGRPC = EmployeeGRPC.getInstance(config.public.employeesUrl);
const { t } = useI18n();

const medicalInfo = reactive<MedicalInfo>({
  medicalInfoId: 0,
  patient: undefined,
  description: "",
});

const searchPatient = ref("");
const isSubmitting = ref(false);
const showError = ref(false);
const showSuccess = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const patients = ref<Patient[]>([]);
const medicalInfoList = ref<MedicalInfo[]>([]);

const touched = reactive({
  patient: false,
  description: false,
});

const errors = reactive({
  patient: "",
  description: "",
});

const isFormValid = computed(() => {
  return (
    medicalInfo.patient &&
    !errors.patient &&
    medicalInfo.description &&
    !errors.description
  );
});

onBeforeMount(async () => {
  await fetchAllPatients();
});

async function fetchAllPatients() {
  try {
    patients.value = (await employeeGRPC.getAllPatients()).patients;
  } catch {
    showError.value = true;
    errorMessage.value = t("fetchError");
  }
}

async function onPatientChange(patient: Patient | null) {
  medicalInfo.patient = patient!;
  medicalInfoList.value = [];

  if (patient) {
    try {
      const response = await employeeGRPC.getMedicalInfo(patient);
      medicalInfoList.value = response.medicalInfo || [];
    } catch (e) {
      console.error(e);
      showError.value = true;
      errorMessage.value = t("fetchError");
    }
  }
}

function selectMedicalInfo(selectedInfo: MedicalInfo) {
  medicalInfo.medicalInfoId = selectedInfo.medicalInfoId;
  medicalInfo.description = selectedInfo.description;
}

async function submitForm() {
  touched.patient = true;
  touched.description = true;
  errors.patient = medicalInfo.patient ? "" : t("required");
  errors.description = medicalInfo.description ? "" : t("required");

  if (!isFormValid.value) return;

  try {
    isSubmitting.value = true;
    const res = await employeeGRPC.modifyMedicalInfo(medicalInfo);
    if (res.success) {
      showSuccess.value = true;
      successMessage.value = t("submitSuccess");
      resetForm();
    }
  } catch (e) {
    console.error(e);
    showError.value = true;
    errorMessage.value = t("submitError");
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  medicalInfo.patient = undefined;
  medicalInfo.description = "";
  medicalInfoList.value = [];
  searchPatient.value = "";
  Object.keys(touched).forEach((key) => (touched[key] = false));
}

function setError(value: boolean) {
  showError.value = value;
}

function setSuccess(value: boolean) {
  showSuccess.value = value;
}
</script>

<template>
  <v-snackbar
    v-model="showError"
    timeout="5000"
    color="error"
    location="top right"
  >
    {{ errorMessage }}
    <template #actions>
      <v-btn variant="text" icon="mdi-close" @click="setError(false)" />
    </template>
  </v-snackbar>

  <v-snackbar
    v-model="showSuccess"
    timeout="3000"
    color="success"
    location="top right"
  >
    {{ successMessage }}
    <template #actions>
      <v-btn variant="text" icon="mdi-close" @click="setSuccess(false)" />
    </template>
  </v-snackbar>

  <v-card class="mx-auto my-4" max-width="800">
    <v-card-title class="text-h5">
      {{ t("modifyMedicalInfoTitle") }}
    </v-card-title>
    <v-card-text>
      <form @submit.prevent="submitForm">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                :model-value="
                  patients.find((p) => p.user === medicalInfo.patient)
                "
                :items="patients"
                :search-input.sync="searchPatient"
                :label="t('patient')"
                :item-title="showPatientFullName"
                item-value="id"
                return-object
                clearable
                variant="outlined"
                :error="Boolean(errors.patient)"
                :error-messages="touched.patient ? errors.patient : ''"
                @blur="touched.patient = true"
                @update:model-value="onPatientChange"
              />
            </v-col>

            <v-col cols="12" v-if="medicalInfoList.length > 0">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 py-2">
                  {{ t("existingMedicalInfo") }}
                </v-card-title>
                <v-divider />
                <v-list density="compact">
                  <v-list-item
                    v-for="info in medicalInfoList"
                    :key="info.medicalInfoId"
                    @click="selectMedicalInfo(info)"
                    class="cursor-pointer"
                    prepend-icon="mdi-file-document-outline"
                  >
                    <v-list-item-title class="text-body-2">
                      {{ info.description.substring(0, 80)
                      }}{{ info.description.length > 80 ? "..." : "" }}
                    </v-list-item-title>
                    <template #append>
                      <v-icon size="small" color="primary">mdi-pencil</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="medicalInfo.description"
                :label="t('description')"
                :error="Boolean(errors.description)"
                :error-messages="touched.description ? errors.description : ''"
                variant="outlined"
                rows="4"
                @blur="touched.description = true"
              />
            </v-col>

            <v-col cols="12">
              <v-btn
                type="submit"
                color="primary"
                :loading="isSubmitting"
                block
              >
                {{ t("modify") }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </form>
    </v-card-text>
  </v-card>
</template>
