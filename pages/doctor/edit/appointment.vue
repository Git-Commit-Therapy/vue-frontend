<script setup lang="ts">
import { formatDateTime } from "~/utils/date-format";
import { ref, onBeforeMount, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  GetAppointmentsFromDoctorRequest,
  GetAppointmentsFromDoctorResponse,
} from "~/composable/protobuf/frontend/employee_services";
import type { Appointment } from "~/composable/protobuf/frontend/appointment";
import { Doctor } from "~/composable/protobuf/frontend/user";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";

const { t } = useI18n();

const config = useRuntimeConfig();
const employeeGRPC = EmployeeGRPC.getInstance(config.public.employeesUrl);

const fromDate = ref<Date | null>(new Date());
const toDate = ref<Date | null>(new Date());
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

onBeforeMount(async () => {
  try {
    currentDoctor.value = await employeeGRPC.getDoctor();
  } catch (err) {
    showError.value = true;
    errorMessage.value = t("fetchError");
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
    editingAppointment.value.dateTime = new Date(
      String(editingAppointment.value.dateTime!),
    );
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
    errorMessage.value = t("updateSuccess");
  } catch (err) {
    console.error("Failed to update appointment", err);
    showError.value = true;
    errorMessage.value = t("updateError");
  } finally {
    editLoading.value = false;
  }
};

const fetchAppointments = async () => {
  if (!canSearch.value) {
    if (!isDateRangeValid.value) {
      showError.value = true;
      errorMessage.value = t("invalidDateRange");
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
    appointments.value = response.appointments.toSorted((a, b) =>
      Number(a.dateTime! < b.dateTime!),
    );
  } catch (err) {
    showError.value = true;
    errorMessage.value = t("fetchError");
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
                :label="t('fromDateTime')"
                type="datetime-local"
                variant="outlined"
                :error="!isDateRangeValid"
                :disabled="isEditing"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="toDate"
                :label="t('toDateTime')"
                type="datetime-local"
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
            {{ t("invalidDateRange") }}
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
            {{ formatDateTime(appt.dateTime!) }}
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
            {{ t("editing") }} {{ appt.patient?.user?.name }}
            {{ appt.patient?.user?.surname }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="saveEdit">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editingAppointment!.dateTime"
                    :label="t('fromDateTime')"
                    type="datetime-local"
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
              color="success"
              variant="flat"
              @click="saveEdit"
              :loading="editLoading"
            >
              <v-icon start>mdi-check</v-icon>
              {{ t("save") }}
            </v-btn>
            <v-btn
              color="grey"
              variant="outlined"
              @click="cancelEdit"
              :disabled="editLoading"
            >
              <v-icon start>mdi-close</v-icon>
              {{ t("cancel") }}
            </v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </div>

    <v-alert
      v-if="appointments.length === 0 && !loading"
      type="info"
      variant="tonal"
    >
      {{ t("noAppointments") }}
    </v-alert>
  </div>
</template>
