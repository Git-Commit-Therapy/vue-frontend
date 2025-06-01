<script setup lang="ts">
import { showPatientFullName } from "~/utils/show-patient-full-name";
import { ref, reactive, computed, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import type { MedicalEvent } from "~/composable/protobuf/frontend/medical_event";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import type { Doctor, Patient } from "~/composable/protobuf/frontend/user";
import type { GetAllMedicalEventRequest } from "~/composable/protobuf/frontend/employee_services";

const { t } = useI18n();
const config = useRuntimeConfig();
const employeeGRPC = EmployeeGRPC.getInstance(config.public.employeesUrl);

const searchParams = reactive<GetAllMedicalEventRequest>({
  patient: undefined,
  fromDate: undefined,
  toDate: undefined,
});

const loading = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const events = ref<MedicalEvent[]>([]);
const currentDoctor = ref<Doctor>();

// Edit state
const editingEventId = ref<number | null>(null);
const editingEvent = ref<MedicalEvent | null>(null);
const isSubmittingEdit = ref(false);

const touched = reactive({ fromDate: false, toDate: false, patient: false });
const errors = reactive({ fromDate: "", toDate: "", patient: "", general: "" });

const editTouched = reactive({ eventDate: false, description: false });
const editErrors = reactive({ eventDate: "", description: "" });

const isFormValid = computed(() => {
  return (
    !errors.fromDate && !errors.toDate && !errors.patient && !errors.general
  );
});

const searchPatient = ref("");
const isEditFormValid = computed(() => {
  return (
    editingEvent.value?.fromDateTime &&
    editingEvent.value?.dischargeLetter &&
    !editErrors.eventDate &&
    !editErrors.description
  );
});

const now = new Date();

const patients = ref<Patient[]>([]);
onBeforeMount(async () => {
  await fetchCurrentDoctor();
  await fetchAllPatients();
});

async function fetchCurrentDoctor() {
  try {
    currentDoctor.value = await employeeGRPC.getDoctor();
  } catch {
    showError.value = true;
    errorMessage.value = t("fetchError");
  }
}

async function fetchAllPatients() {
  try {
    patients.value = (await employeeGRPC.getAllPatients()).patients;
  } catch {
    showError.value = true;
    errorMessage.value = t("fetchError");
  }
}

async function fetchEvents() {
  touched.fromDate = true;
  touched.toDate = true;
  touched.patient = true;

  errors.fromDate = "";
  errors.toDate = "";
  errors.patient = "";
  errors.general = "";

  if (
    searchParams.fromDate &&
    searchParams.toDate &&
    new Date(searchParams.fromDate) > new Date(searchParams.toDate)
  ) {
    errors.general = t("invalidDateRange");
    return;
  }

  if (!isFormValid.value) return;

  loading.value = true;

  try {
    searchParams.fromDate = new Date(searchParams.fromDate!);
    searchParams.toDate = new Date(searchParams.toDate!);
    const res = await employeeGRPC.getAllMedicalEvents(searchParams);
    events.value = res.medicalEvent;
  } catch (err) {
    showError.value = true;
    errorMessage.value = t("fetchError");
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  searchParams.fromDate = undefined;
  searchParams.toDate = undefined;
  searchParams.patient = undefined;
  searchPatient.value = "";
  events.value = [];
  touched.fromDate = touched.toDate = touched.patient = false;
  errors.fromDate = errors.toDate = errors.patient = errors.general = "";
}

function setError(value: boolean) {
  showError.value = value;
}

const canEdit = (date: string | Date) => new Date(date) > now;

function startEdit(event: MedicalEvent) {
  editingEventId.value = event.eventId!;
  editingEvent.value = { ...event };
  editTouched.eventDate = false;
  editTouched.description = false;
  editErrors.eventDate = "";
  editErrors.description = "";
}

function cancelEdit() {
  editingEventId.value = null;
  editingEvent.value = null;
  editTouched.eventDate = false;
  editTouched.description = false;
  editErrors.eventDate = "";
  editErrors.description = "";
}

async function submitEdit() {
  if (!editingEvent.value) return;

  editTouched.eventDate = true;
  editTouched.description = true;

  editErrors.eventDate = editingEvent.value.fromDateTime ? "" : t("required");
  editErrors.description = editingEvent.value.dischargeLetter
    ? ""
    : t("required");

  if (!isEditFormValid.value) return;

  isSubmittingEdit.value = true;

  try {
    await employeeGRPC.updateMedicalEvent(editingEvent.value);

    // Update the event in the list
    const index = events.value.findIndex(
      (e) => e.eventId === editingEvent.value!.eventId,
    );
    if (index !== -1) {
      events.value[index] = { ...editingEvent.value };
    }

    cancelEdit();
  } catch (err) {
    showError.value = true;
    errorMessage.value = t("updateError");
  } finally {
    isSubmittingEdit.value = false;
  }
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
      {{ t("searchMedicalEvents") }}
    </v-card-title>
    <v-card-text>
      <form @submit.prevent="fetchEvents">
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchParams.fromDate"
                :label="t('fromDate')"
                :error="Boolean(errors.fromDate)"
                :error-messages="touched.fromDate ? errors.fromDate : ''"
                type="date"
                variant="outlined"
                @blur="touched.fromDate = true"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchParams.toDate"
                :label="t('toDate')"
                :error="Boolean(errors.toDate)"
                :error-messages="touched.toDate ? errors.toDate : ''"
                type="date"
                variant="outlined"
                @blur="touched.toDate = true"
              />
            </v-col>

            <v-col cols="12">
              <v-autocomplete
                v-model="searchParams.patient"
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
            <v-col cols="12" v-if="errors.general">
              <v-alert type="error" variant="outlined">
                {{ errors.general }}
              </v-alert>
            </v-col>

            <v-col cols="12">
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                class="mr-2"
              >
                {{ t("search") }}
              </v-btn>
              <v-btn variant="outlined" @click="resetForm">
                {{ t("reset") }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </form>
    </v-card-text>
  </v-card>

  <div v-if="events.length" class="mt-4">
    <v-card v-for="event in events" :key="event.eventId" class="mb-3">
      <!-- Read-only view -->
      <div v-if="editingEventId !== event.eventId">
        <v-card-title>
          {{ event.patient?.user?.name }} {{ event.patient?.user?.surname }} —
          {{ event.fromDateTime }}
        </v-card-title>
        <v-card-text v-if="event.dischargeLetter">
          {{ event.dischargeLetter }}
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="canEdit(event.fromDateTime!)"
            color="warning"
            @click="startEdit(event)"
          >
            {{ t("edit") }}
          </v-btn>
          <span v-else class="text-disabled">{{ t("pastEvent") }}</span>
        </v-card-actions>
      </div>

      <!-- Edit mode -->
      <div v-else>
        <v-card-title>
          {{ t("editMedicalEvent") }}
        </v-card-title>
        <v-card-text>
          <form @submit.prevent="submitEdit">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="editingEvent!.fromDateTime"
                    :label="t('eventDate')"
                    :error="Boolean(editErrors.eventDate)"
                    :error-messages="
                      editTouched.eventDate ? editErrors.eventDate : ''
                    "
                    type="datetime-local"
                    variant="outlined"
                    @blur="editTouched.eventDate = true"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="editingEvent!.fromDateTime"
                    :label="t('description')"
                    :error="Boolean(editErrors.description)"
                    :error-messages="
                      editTouched.description ? editErrors.description : ''
                    "
                    variant="outlined"
                    rows="3"
                    @blur="editTouched.description = true"
                  />
                </v-col>
              </v-row>
            </v-container>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            :loading="isSubmittingEdit"
            @click="submitEdit"
          >
            {{ t("save") }}
          </v-btn>
          <v-btn
            variant="outlined"
            @click="cancelEdit"
            :disabled="isSubmittingEdit"
          >
            {{ t("cancel") }}
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </div>
</template>
