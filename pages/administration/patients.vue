<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { Patient } from "~/composable/protobuf/frontend/user";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";

const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);
const { t } = useI18n();

const patientList = ref<Patient[]>([]);
const filterText = ref<string>("");
const selectedEntity = ref<any>(null);
const showError = ref<boolean>(false);
const error = ref<string | null>(null);

function hideError() {
  showError.value = false;
}

onMounted(async () => {
  try {
    patientList.value = (await employeeGRPC.getAllPatients()).patients;
  } catch (err) {
    error.value = t("unexpectedError");
    showError.value = true;
  }
});

const filteredPatientList = computed(() =>
  patientList.value
    .filter((patient: Patient) =>
      [patient.user!.name, patient.user!.surname].some((s) =>
        s.toLowerCase().includes(filterText.value.toLowerCase()),
      ),
    )
    .map((patient: Patient) => patient.user),
);

const headers = computed(() => [
  { title: t("firstName"), value: "name", sortable: true },
  { title: t("lastName"), value: "surname", sortable: true },
  { title: t("dateOfBirth"), value: "birthDate", sortable: true },
  { title: t("actions"), value: "actions", sortable: false },
]).value;

const editEntity = (user: any) => {
  selectedEntity.value = patientList.value.find(
    (patient) => patient.user!.id === user.id,
  );
};

const cancelEdit = () => (selectedEntity.value = null);

const newEntity = () => {
  selectedEntity.value = {
    isNew: true,
    user: {
      id: "",
      name: "",
      surname: "",
      birthDate: new Date(),
      phoneNumber: "",
      email: "",
    },
  };
};

const saveEntity = async () => {
  try {
    const fn = selectedEntity.value.isNew
      ? employeeGRPC.createPatient
      : employeeGRPC.editPatient;

    const response = await fn(selectedEntity.value);
    if (response?.success) {
      cancelEdit();
    } else {
      error.value =
        t("errorMessage") + (response?.message ? ": " + response.message : "");
      showError.value = true;
    }
  } catch (err) {
    error.value = t("unexpectedError");
    showError.value = true;
  }
};

const isSaveDisabled = computed(() => {
  const entity = selectedEntity.value;
  if (!entity) return true;
  const user = entity.user;
  return ![
    user.name,
    user.surname,
    user.birthDate,
    user.phoneNumber,
    user.email,
  ].every(Boolean);
});
</script>

<template>
  <v-container>
    <v-snackbar
      v-model="showError"
      :timeout="5000"
      color="error"
      location="top right"
    >
      {{ error }}
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" @click="hideError"></v-btn>
      </template>
    </v-snackbar>
    <v-row>
      <v-col cols="12">
        <h1>{{ t("managePatients") }}</h1>
      </v-col>
    </v-row>

    <template v-if="!selectedEntity">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filterText"
            :label="t('filterPlaceholder')"
            prepend-inner-icon="mdi-magnify"
            clearable
          />
        </v-col>
        <v-col cols="12" md="6" class="text-right">
          <v-btn color="primary" @click="newEntity">{{
            t("newPatient")
          }}</v-btn>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredPatientList"
        item-value="id"
        class="elevation-1"
      >
        <template #item.actions="{ item }">
          <v-btn size="small" @click="editEntity(item)">
            {{ t("edit") }}
          </v-btn>
        </template>
      </v-data-table>
    </template>

    <template v-else>
      <v-card class="pa-4">
        <v-card-title>{{ t("editPatient") }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.user.id"
                :label="t('fiscalCode')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.user.name"
                :label="t('firstName')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.user.surname"
                :label="t('lastName')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.user.birthDate"
                :label="t('dateOfBirth')"
                type="date"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.user.phoneNumber"
                :label="t('phoneNumber')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.user.email"
                label="E-mail"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveEntity" :disabled="isSaveDisabled">
            {{ t("save") }}
          </v-btn>
          <v-btn @click="cancelEdit">{{ t("cancel") }}</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-container>
</template>
