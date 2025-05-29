<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import EmployeeGRPC from "@/composable/clients/employeeGrpcClient";
import {
  SeverityCode,
  type MedicalEvent,
} from "@/composable/protobuf/frontend/medical_event";
import type { Doctor, Patient } from "~/composable/protobuf/frontend/user";
import type { Ward } from "~/composable/protobuf/frontend/ward";

const { t } = useI18n();
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);
const currentDoctor = ref<Doctor | undefined>(undefined);
const form = ref({
  eventId: 0,
  fromDateTime: "",
  toDateTime: "",
  severityCode: SeverityCode.UNRECOGNIZED,
  dischargeLetter: "",
  patient: undefined,
  ward: null as any,
  medicalExamIds: [],
});
const medicalExams = ref<number[]>([]);
const patients = ref<Patient[]>([]);
const severityOptions = [
  { label: t("severity.white"), value: SeverityCode.WHITE },
  { label: t("severity.green"), value: SeverityCode.GREEN },
  { label: t("severity.yellow"), value: SeverityCode.YELLOW },
  { label: t("severity.orange"), value: SeverityCode.ORANGE },
  { label: t("severity.red"), value: SeverityCode.RED },
];

const disabledFields = reactive({
  fromDateTime: false,
  toDateTime: false,
  patient: false,
  ward: false,
});

const touched = reactive({
  severityCode: false,
  dischargeLetter: false,
});

const errors = computed(() => ({
  severityCode:
    touched.severityCode &&
    form.value.severityCode === SeverityCode.UNRECOGNIZED
      ? t("validation.required")
      : "",
  dischargeLetter:
    touched.dischargeLetter && !form.value.dischargeLetter.trim()
      ? t("validation.required")
      : "",
}));

const submit = async () => {
  // We are always doing a new Date because we just want to not
  // have type mismatches, this ensures it.
  const medicalEvent: MedicalEvent = {
    eventId: -1,
    fromDateTime: disabledFields.fromDateTime
      ? undefined
      : form.value.fromDateTime
        ? new Date(form.value.fromDateTime)
        : undefined,
    toDateTime: disabledFields.toDateTime
      ? undefined
      : form.value.toDateTime
        ? new Date(form.value.toDateTime)
        : undefined,
    severityCode: form.value.severityCode,
    dischargeLetter: form.value.dischargeLetter,
    patient: disabledFields.patient ? undefined : form.value.patient,
    ward: currentDoctor.value?.ward,
    medicalExamIds: form.value.medicalExamIds,
  };

  try {
    const response = await employeeGRPC.createMedicalEvent(medicalEvent);
    console.log("Success:", response);
  } catch (error) {
    console.error("Error creating medical event:", error);
  }
};
onBeforeMount(async () => {
  currentDoctor.value = await employeeGRPC.getDoctor();
  patients.value = (await employeeGRPC.getAllPatients()).patients;
  form.value.ward = currentDoctor.value.ward;
});
</script>
<template>
  <v-container class="py-10">
    <v-card class="mx-auto" max-width="600">
      <v-card-title>{{ $t("createMedicalEvent.title") }}</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="submit">
          <v-row align="center" justify="center">
            <v-col>
              <v-text-field
                v-model="form.fromDateTime"
                :label="$t('createMedicalEvent.fromDateTime')"
                type="datetime-local"
                :disabled="disabledFields.fromDateTime"
              />
            </v-col>
            <v-col cols="auto" class="pl-2">
              <v-btn
                icon
                size="small"
                variant="text"
                class="mt-2"
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
          </v-row>
          <v-row align="center" justify="center">
            <v-col>
              <v-text-field
                v-model="form.toDateTime"
                :label="$t('createMedicalEvent.toDateTime')"
                type="datetime-local"
                :disabled="disabledFields.toDateTime"
              />
            </v-col>
            <v-col cols="auto" class="pl-2">
              <v-btn
                icon
                size="small"
                variant="text"
                class="mt-2"
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
          </v-row>
          <v-select
            v-model="form.severityCode"
            :label="$t('createMedicalEvent.severityCode')"
            :items="severityOptions"
            item-title="label"
            item-value="value"
            :error="Boolean(errors.severityCode)"
            :error-messages="errors.severityCode"
            @blur="touched.severityCode = true"
            required
          />
          <v-row align="center" justify="center">
            <v-col>
              <v-select
                v-model="form.patient"
                :label="$t('createMedicalEvent.patient')"
                :items="patients"
                item-title="label"
                item-value="value"
                :disabled="disabledFields.patient"
                required
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
          <v-textarea
            v-model="form.dischargeLetter"
            :label="$t('createMedicalEvent.dischargeLetter')"
            :error="Boolean(errors.dischargeLetter)"
            error-messages="errors.dischargeLetter"
            @blur="touched.dischargeLetter = true"
          />
          <v-select
            v-model="form.medicalExamIds"
            :label="$t('createMedicalEvent.medicalExamIds')"
            :items="medicalExams"
            item-title="label"
            item-value="id"
            multiple
            chips
            hint="Selected: {{ form.medicalExamIds.join(', ') || 'None' }}"
            persistent-hint
          />

          <v-btn type="submit" color="primary" class="mt-4">
            {{ $t("createMedicalEvent.submit") }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
