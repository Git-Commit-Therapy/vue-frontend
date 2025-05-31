<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  GetAppointmentsFromDoctorRequest,
  GetAppointmentsFromDoctorResponse,
} from "~/composable/protobuf/frontend/employee_services";
import type { Appointment } from "~/composable/protobuf/frontend/appointment";
import { Doctor } from "~/composable/protobuf/frontend/user";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import env from "~/utils/env";

const { t } = useI18n();
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);

const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);
const loading = ref<boolean>(false);
const appointments = ref<Appointment[]>([]);
const currentDoctor = ref<Doctor>();
const showError = ref(false);
const errorMessage = ref("");

// Edit state
const editingAppointmentId = ref<number | null>(null);
const editingAppointment = ref<Appointment | null>(null);
const editLoading = ref(false);

const now = new Date();

const isDateRangeValid = computed(() => {
  if (!fromDate.value || !toDate.value) return true;
  return fromDate.value <= toDate.value;
});

const canSearch = computed(() => {
  return !loading.value && isDateRangeValid.value && currentDoctor.value;
});

const isEditing = computed(() => editingAppointmentId.value !== null);

onMounted(async () => {
  try {
    currentDoctor.value = await employeeGRPC.getDoctor();
  } catch (err) {
    console.error("Failed to fetch current doctor", err);
    showError.value = true;
    errorMessage.value =
      t("doctor.fetchError") || "Failed to load doctor information";
  }
});

const startEdit = (appt: Appointment) => {
  editingAppointmentId.value = appt.appointmentId;
  editingAppointment.value = JSON.parse(JSON.stringify(appt));
};

const cancelEdit = () => {
  editingAppointmentId.value = null;
  editingAppointment.value = null;
};

const saveEdit = async () => {
  if (!editingAppointment.value) return;

  editLoading.value = true;

  try {
    // Send the entire appointment object (keeping the ID intact)
    await employeeGRPC.updateAppointment(editingAppointment.value);

    // Update the local appointment data
    const appointmentIndex = appointments.value.findIndex(
      (appt) => appt.appointmentId === editingAppointment.value!.appointmentId,
    );

    if (appointmentIndex !== -1) {
      appointments.value[appointmentIndex] = { ...editingAppointment.value };
    }

    // Reset edit state
    cancelEdit();

    // Show success message
    showError.value = true;
    errorMessage.value =
      t("appointment.updateSuccess") || "Appointment updated successfully";
  } catch (err) {
    console.error("Failed to update appointment", err);
    showError.value = true;
    errorMessage.value =
      t("appointment.updateError") || "Failed to update appointment";
  } finally {
    editLoading.value = false;
  }
};

const fetchAppointments = async () => {
  if (!canSearch.value) {
    if (!isDateRangeValid.value) {
      showError.value = true;
      errorMessage.value =
        t("dateRange.invalid") || "Please select a valid date range";
      return;
    }
    return;
  }

  loading.value = true;

  const req: GetAppointmentsFromDoctorRequest = {
    doctor: currentDoctor.value!,
    fromDate: new Date(fromDate.value!) ?? undefined,
    toDate: new Date(toDate.value!) ?? undefined,
  };

  try {
    const response: GetAppointmentsFromDoctorResponse =
      await employeeGRPC.getAppointmentFromDoctor(req);
    appointments.value = response.appointments || [];
  } catch (err) {
    console.error("Failed to fetch appointments", err);
    showError.value = true;
    errorMessage.value =
      t("appointments.fetchError") || "Failed to fetch appointments";
  } finally {
    loading.value = false;
  }
};

const canEdit = (dateTime: string | Date | undefined) => {
  if (!dateTime) return false;
  try {
    return new Date(dateTime) > now;
  } catch {
    return false;
  }
};

const formatDateTime = (dateTime: string | Date | undefined) => {
  if (!dateTime) return "";
  try {
    return new Date(dateTime).toLocaleString();
  } catch {
    return String(dateTime);
  }
};

const setError = (value: boolean) => {
  showError.value = value;
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

  <div class="p-4 space-y-4">
    <v-card>
      <v-card-title>{{ t("searchAppointments") }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="fetchAppointments">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="fromDate"
                :label="t('fromDate') || 'From date'"
                type="date"
                variant="outlined"
                :error="!isDateRangeValid"
                :disabled="isEditing"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="toDate"
                :label="t('toDate') || 'To date'"
                type="date"
                variant="outlined"
                :error="!isDateRangeValid"
                :disabled="isEditing"
              />
            </v-col>
          </v-row>

          <v-alert
            v-if="!isDateRangeValid"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            {{ t("dateRange.invalid") || "From date must be before to date" }}
          </v-alert>

          <v-btn
            :loading="loading"
            :disabled="!canSearch || isEditing"
            type="submit"
            color="primary"
          >
            {{ t("search") }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <div v-if="appointments.length">
      <v-card
        v-for="appt in appointments"
        :key="appt.appointmentId"
        class="my-2"
        :class="{ 'elevation-8': editingAppointmentId === appt.appointmentId }"
      >
        <!-- Normal view -->
        <template v-if="editingAppointmentId !== appt.appointmentId">
          <v-card-title>
            {{ appt.patient?.user?.name }} {{ appt.patient?.user?.surname }} —
            {{ formatDateTime(appt.dateTime) }}
          </v-card-title>
          <v-card-actions>
            <v-btn
              v-if="canEdit(appt.dateTime)"
              color="warning"
              variant="tonal"
              @click="startEdit(appt)"
              :disabled="isEditing"
            >
              <v-icon start>mdi-pencil</v-icon>
              {{ t("edit") }}
            </v-btn>
            <span v-else class="text-grey">
              <v-icon start>mdi-clock-outline</v-icon>
              {{ t("pastAppointment") }}
            </span>
          </v-card-actions>
        </template>

        <!-- Edit form -->
        <template v-else>
          <v-card-title class="bg-warning-lighten-5">
            <v-icon start>mdi-pencil</v-icon>
            Editing: {{ appt.patient?.user?.name }}
            {{ appt.patient?.user?.surname }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="saveEdit">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editingAppointment!.dateTime"
                    label="Date & Time"
                    type="datetime-local"
                    variant="outlined"
                    :rules="[(v) => !!v || 'Date and time is required']"
                    required
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="success"
              variant="flat"
              @click="saveEdit"
              :loading="editLoading"
            >
              <v-icon start>mdi-check</v-icon>
              {{ t("save") || "Save" }}
            </v-btn>
            <v-btn
              color="grey"
              variant="outlined"
              @click="cancelEdit"
              :disabled="editLoading"
            >
              <v-icon start>mdi-close</v-icon>
              {{ t("cancel") || "Cancel" }}
            </v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </div>

    <v-alert
      v-else-if="appointments.length === 0 && !loading"
      type="info"
      variant="tonal"
    >
      {{ t("noAppointments") || "No appointments found" }}
    </v-alert>
  </div>
</template>
