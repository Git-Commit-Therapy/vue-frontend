<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import env from "~/utils/env";
import EmployeeGRPC from "@/composable/clients/employeeGrpcClient";
import {
  SeverityCode,
  type MedicalEvent,
} from "@/composable/protobuf/frontend/medical_event";
import type { Doctor, Patient } from "@/composable/protobuf/frontend/user";
import type { Ward } from "@/composable/protobuf/frontend/ward";
import type { MedicalExam } from "~/composable/protobuf/frontend/medical_exam";

const { t } = useI18n();
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);

const searchPatient = ref("");
const patients = ref<Patient[]>([]);
const doctor = ref<Doctor | undefined>();
const medicalExams = ref<MedicalExam[]>([]);
const isSubmitting = ref(false);
const showError = ref(false);
const errorMessage = ref("");

const form = reactive<MedicalEvent>({
  eventId: 0,
  fromDateTime: undefined,
  toDateTime: undefined,
  severityCode: SeverityCode.UNRECOGNIZED,
  dischargeLetter: "",
  patient: undefined,
  ward: undefined,
  medicalExamIds: [],
});

const touched = reactive({
  patient: false,
  severityCode: false,
  dischargeLetter: false,
});

const errors = computed(() => ({
  patient: touched.patient && !form.patient ? t("required") : "",
  severityCode:
    touched.severityCode && form.severityCode === SeverityCode.UNRECOGNIZED
      ? t("required")
      : "",
  dischargeLetter:
    touched.dischargeLetter && !form.dischargeLetter.trim()
      ? t("required")
      : "",
}));

const severityOptions = computed(() => [
  { label: t("white"), value: SeverityCode.WHITE },
  { label: t("green"), value: SeverityCode.GREEN },
  { label: t("yellow"), value: SeverityCode.YELLOW },
  { label: t("orange"), value: SeverityCode.ORANGE },
  { label: t("red"), value: SeverityCode.RED },
]);

onBeforeMount(async () => {
  try {
    doctor.value = await employeeGRPC.getDoctor();
    form.ward = doctor.value?.ward;
    patients.value = (await employeeGRPC.getAllPatients()).patients;
    medicalExams.value = (
      await employeeGRPC.getAllMedicalExams({
        fromDate: undefined,
        toDate: undefined,
      })
    ).medicalExams;
  } catch (err) {
    showError.value = true;
    errorMessage.value = t("fetchError");
  }
});

const disabledFields = reactive({
  fromDateTime: false,
  toDateTime: false,
  patient: false,
});

async function submitForm() {
  touched.severityCode = true;
  touched.dischargeLetter = true;

  if (errors.value.severityCode || errors.value.dischargeLetter) return;

  form.fromDateTime = form.fromDateTime
    ? new Date(form.fromDateTime)
    : undefined;
  form.toDateTime = form.toDateTime ? new Date(form.toDateTime) : undefined;

  try {
    isSubmitting.value = true;
    const res = await employeeGRPC.createMedicalEvent(form);
    if (res.success) resetForm();
  } catch (err) {
    showError.value = true;
    errorMessage.value = t("submitError");
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  form.dischargeLetter = "";
  form.toDateTime = form.fromDateTime = new Date();
  form.ward = form.patient = undefined;
  form.severityCode = SeverityCode.UNRECOGNIZED;
  isSubmitting.value = false;
  searchPatient.value = "";
  touched.patient = touched.severityCode = touched.dischargeLetter = false;
}

function setError(state: boolean) {
  showError.value = state;
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

  <v-card class="mx-auto my-4" max-width="600">
    <v-card-title class="text-h5">
      {{ t("createMedicalEventTitle") }}
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="submitForm">
        <v-container>
          <v-row>
            <v-col cols="11">
              <v-text-field
                v-model="form.fromDateTime"
                :label="t('fromDateTime')"
                type="datetime-local"
                variant="outlined"
                :disabled="disabledFields.fromDateTime"
              />
            </v-col>

            <v-col cols="1" class="d-flex align-center">
              <v-btn
                icon
                size="small"
                variant="text"
                :color="disabledFields.fromDateTime ? 'error' : 'grey'"
                @click="
                  disabledFields.fromDateTime = !disabledFields.fromDateTime
                "
              >
                <v-icon>
                  {{
                    disabledFields.fromDateTime
                      ? "mdi-eye-off-outline"
                      : "mdi-eye-outline"
                  }}
                </v-icon>
              </v-btn>
            </v-col>

            <v-col cols="11">
              <v-text-field
                v-model="form.toDateTime"
                :label="t('toDateTime')"
                type="datetime-local"
                variant="outlined"
                :disabled="disabledFields.toDateTime"
              />
            </v-col>

            <v-col cols="1" class="d-flex align-center">
              <v-btn
                icon
                size="small"
                variant="text"
                :color="disabledFields.toDateTime ? 'error' : 'grey'"
                @click="disabledFields.toDateTime = !disabledFields.toDateTime"
              >
                <v-icon>
                  {{
                    disabledFields.toDateTime
                      ? "mdi-eye-off-outline"
                      : "mdi-eye-outline"
                  }}
                </v-icon>
              </v-btn>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="form.severityCode"
                :label="t('severityCode')"
                :items="severityOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                :error="Boolean(errors.severityCode)"
                :error-messages="
                  touched.severityCode ? errors.severityCode : ''
                "
                @blur="touched.severityCode = true"
                required
              />
            </v-col>

            <v-col cols="11">
              <v-autocomplete
                v-model="form.patient"
                :items="patients"
                :label="t('patient')"
                :item-title="showPatientFullName"
                item-value="id"
                return-object
                clearable
                variant="outlined"
                :search-input.sync="searchPatient"
                :disabled="disabledFields.patient"
                :error="Boolean(errors.patient)"
                :error-messages="touched.patient ? errors.patient : ''"
                @blur="touched.patient = true"
              />
            </v-col>

            <v-col cols="1" class="d-flex align-center">
              <v-btn
                icon
                size="small"
                variant="text"
                :color="disabledFields.patient ? 'error' : 'grey'"
                @click="disabledFields.patient = !disabledFields.patient"
              >
                <v-icon>
                  {{
                    disabledFields.patient
                      ? "mdi-eye-off-outline"
                      : "mdi-eye-outline"
                  }}
                </v-icon>
              </v-btn>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.dischargeLetter"
                :label="t('dischargeLetter')"
                variant="outlined"
                :error="Boolean(errors.dischargeLetter)"
                :error-messages="
                  touched.dischargeLetter ? errors.dischargeLetter : ''
                "
                @blur="touched.dischargeLetter = true"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="form.medicalExamIds"
                :label="t('medicalExamIds')"
                :items="medicalExams"
                :item-title="(exam) => `#${exam.examId} - ${exam.examType}`"
                item-value="examId"
                multiple
                chips
                variant="outlined"
                persistent-hint
              />
            </v-col>

            <v-col cols="12">
              <v-btn
                type="submit"
                color="primary"
                :loading="isSubmitting"
                block
              >
                {{ t("submit") }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card-text>
  </v-card>
</template>
