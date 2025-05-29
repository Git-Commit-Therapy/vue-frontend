<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import EmployeeGRPC from "@/composable/clients/employeeGrpcClient";
import type { MedicalExam } from "@/composable/protobuf/frontend/medical_exam";
import type { Doctor, Patient } from "@/composable/protobuf/frontend/user";
import type { MedicalEvent } from "@/composable/protobuf/frontend/medical_event";

const { t } = useI18n();
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);

const currentDoctor = ref<Doctor | undefined>(undefined);
const patients = ref<Patient[]>([]);
const medicalEvents = ref<MedicalEvent[]>([]);

const form = ref<MedicalExam>({
  examId: -1,
  dateTime: undefined,
  medicalReport: "",
  examType: "",
  doctor: undefined,
  patient: undefined,
  medicalEvent: undefined,
});

const disabledFields = reactive({
  dateTime: false,
  doctor: false,
  patient: false,
  medicalEvent: false,
});

const touched = reactive({
  dateTime: false,
  medicalReport: false,
  examType: false,
});

const errors = computed(() => ({
  dateTime:
    touched.dateTime && !form.value.dateTime ? t("validation.required") : "",
  medicalReport:
    touched.medicalReport && !form.value.medicalReport.trim()
      ? t("validation.required")
      : "",
  examType:
    touched.examType && !form.value.examType.trim()
      ? t("validation.required")
      : "",
}));

const submit = async () => {
  const payload: MedicalExam = {
    examId: -1,
    dateTime: disabledFields.dateTime
      ? undefined
      : form.value.dateTime
        ? new Date(form.value.dateTime)
        : undefined,
    medicalReport: form.value.medicalReport,
    examType: form.value.examType,
    doctor: disabledFields.doctor ? undefined : form.value.doctor,
    patient: disabledFields.patient ? undefined : form.value.patient,
    medicalEvent: disabledFields.medicalEvent
      ? undefined
      : form.value.medicalEvent,
  };

  try {
    const response = await employeeGRPC.createMedicalExam(payload); // ← Fill this stub
    console.log("Exam created:", response);
  } catch (error) {
    console.error("Failed to create exam:", error);
  }
};

onBeforeMount(async () => {
  currentDoctor.value = await employeeGRPC.getDoctor(); // ← Fill this stub
  patients.value = (await employeeGRPC.getAllPatients()).patients; // ← Fill this stub
  medicalEvents.value = (await employeeGRPC.getAllMedicalEvents()).events; // ← Fill this stub
  form.value.doctor = currentDoctor.value;
});
</script>

<template>
  <v-container class="py-10">
    <v-card class="mx-auto" max-width="600">
      <v-card-title>{{ $t("createMedicalExam.title") }}</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="submit">
          <!-- dateTime -->
          <v-row align="center" justify="center">
            <v-col>
              <v-text-field
                v-model="form.dateTime"
                :label="$t('createMedicalExam.dateTime')"
                type="datetime-local"
                :disabled="disabledFields.dateTime"
                :error-messages="errors.dateTime"
                @blur="touched.dateTime = true"
              />
            </v-col>
            <v-col cols="auto" class="pl-2">
              <v-btn
                icon
                size="small"
                variant="text"
                class="mt-2"
                :color="disabledFields.dateTime ? 'error' : 'grey'"
                @click="disabledFields.dateTime = !disabledFields.dateTime"
              >
                <v-icon>
                  {{
                    disabledFields.dateTime
                      ? "mdi-eye-off-outline"
                      : "mdi-eye-outline"
                  }}
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <!-- examType -->
          <v-text-field
            v-model="form.examType"
            :label="$t('createMedicalExam.examType')"
            :error-messages="errors.examType"
            @blur="touched.examType = true"
            required
          />

          <!-- medicalReport -->
          <v-textarea
            v-model="form.medicalReport"
            :label="$t('createMedicalExam.medicalReport')"
            :error-messages="errors.medicalReport"
            @blur="touched.medicalReport = true"
            required
          />

          <!-- patient -->
          <v-row align="center" justify="center">
            <v-col>
              <v-select
                v-model="form.patient"
                :label="$t('createMedicalExam.patient')"
                :items="patients"
                item-title="label"
                item-value="value"
                :disabled="disabledFields.patient"
              />
            </v-col>
            <v-col cols="auto" class="pl-2">
              <v-btn
                icon
                size="small"
                variant="text"
                class="mt-2"
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
          </v-row>

          <!-- medicalEvent -->
          <v-row align="center" justify="center">
            <v-col>
              <v-select
                v-model="form.medicalEvent"
                :label="$t('createMedicalExam.medicalEvent')"
                :items="medicalEvents"
                item-title="label"
                item-value="value"
                :disabled="disabledFields.medicalEvent"
              />
            </v-col>
            <v-col cols="auto" class="pl-2">
              <v-btn
                icon
                size="small"
                variant="text"
                class="mt-2"
                :color="disabledFields.medicalEvent ? 'error' : 'grey'"
                @click="
                  disabledFields.medicalEvent = !disabledFields.medicalEvent
                "
              >
                <v-icon>
                  {{
                    disabledFields.medicalEvent
                      ? "mdi-eye-off-outline"
                      : "mdi-eye-outline"
                  }}
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <!-- Submit -->
          <v-btn type="submit" color="primary" class="mt-4">
            {{ $t("createMedicalExam.submit") }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
