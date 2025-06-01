<script setup lang="ts">
import { showPatientFullName } from "~/utils/show-patient-full-name";
import { ref, reactive, computed, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import type { Appointment } from "~/composable/protobuf/frontend/appointment";
import type { Patient, Staff } from "~/composable/protobuf/frontend/user";
import env from "~/utils/env";

const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);
const { t } = useI18n();

const appointment = reactive<Appointment>({
  appointmentId: 0,
  dateTime: new Date(),
  staff: undefined,
  doctor: undefined,
  patient: undefined,
});

const searchPatient = ref("");
const searchStaff = ref("");
const isSubmitting = ref(false);
const showError = ref(false);
const errorMessage = ref("");

const patients = ref<Patient[]>([]);
const staffList = ref<Staff[]>([]);

const touched = reactive({ dateTime: false, patient: false, staff: false });
const errors = reactive({ dateTime: "", patient: "", staff: "" });

const isFormValid = computed(() => {
  return (
    appointment.dateTime &&
    appointment.patient &&
    appointment.staff &&
    !errors.dateTime &&
    !errors.patient &&
    !errors.staff
  );
});

onBeforeMount(async () => {
  await fetchAllPatients();
  await fetchAllStaff();
});

async function fetchAllPatients() {
  try {
    patients.value = (await employeeGRPC.getAllPatients()).patients;
  } catch {
    showError.value = true;
    errorMessage.value = t("fetchError");
  }
}

async function fetchAllStaff() {
  try {
    staffList.value = (await employeeGRPC.getAllStaff()).staffs;
  } catch {
    showError.value = true;
    errorMessage.value = t("fetchError");
  }
}

async function submitForm() {
  touched.dateTime = true;
  touched.patient = true;
  touched.staff = true;

  errors.dateTime = appointment.dateTime ? "" : t("required");
  errors.patient = appointment.patient ? "" : t("required");
  errors.staff = appointment.staff ? "" : t("required");

  if (!isFormValid.value) return;

  try {
    appointment.doctor = await employeeGRPC.getDoctor();
    appointment.dateTime = new Date(appointment.dateTime!);
    isSubmitting.value = true;
    const res = await employeeGRPC.createAppointment(appointment);
    if (res.success) resetForm();
  } catch (e) {
    console.error(e);
    showError.value = true;
    errorMessage.value = t("submitError");
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  appointment.dateTime = new Date();
  appointment.staff = undefined;
  appointment.patient = undefined;
  searchPatient.value = "";
  searchStaff.value = "";
  touched.dateTime = touched.staff = touched.patient = false;
}

function setError(value: boolean) {
  showError.value = value;
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

  <v-card class="mx-auto my-4" max-width="800">
    <v-card-title class="text-h5">
      {{ t("appointment.title") }}
    </v-card-title>
    <v-card-text>
      <form @submit.prevent="submitForm">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="appointment.dateTime"
                :label="t('dateTime')"
                :error="Boolean(errors.dateTime)"
                :error-messages="touched.dateTime ? errors.dateTime : ''"
                type="datetime-local"
                variant="outlined"
                @blur="touched.dateTime = true"
              />
            </v-col>

            <v-col cols="12">
              <v-autocomplete
                v-model="appointment.patient"
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
              />
            </v-col>

            <!-- I get that "showPatientFullName" is not ideal but it works -->
            <v-col cols="12">
              <v-autocomplete
                v-model="appointment.staff"
                :items="staffList"
                :search-input.sync="searchStaff"
                :label="t('staff')"
                :item-title="showPatientFullName"
                item-value="id"
                return-object
                clearable
                variant="outlined"
                :error="Boolean(errors.staff)"
                :error-messages="touched.staff ? errors.staff : ''"
                @blur="touched.staff = true"
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
      </form>
    </v-card-text>
  </v-card>
</template>
