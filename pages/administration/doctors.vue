<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import type { Doctor, User } from "~/composable/protobuf/frontend/user";
import type { Ward } from "~/composable/protobuf/frontend/ward";

const config = useRuntimeConfig();
const employeeGRPC = EmployeeGRPC.getInstance(config.public.employeesUrl);
// const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);
const { t } = useI18n();

const doctorList = ref<Doctor[]>([]);
const filterText = ref<string>("");
const selectedEntity = ref<any>(null);
const allWards = ref<Ward[]>([]);
const showError = ref<boolean>(false);
const error = ref<string | null>(null);

function hideError() {
  showError.value = false;
}
onMounted(async () => {
  try {
    doctorList.value = (await employeeGRPC.getAllDoctors()).doctors;
    allWards.value = (await employeeGRPC.getAllWards()).ward;
  } catch (err) {
    error.value = t("unexpectedError");
    showError.value = true;
  }
});

const filteredDoctorList = computed(() =>
  doctorList.value
    .filter((doctor: Doctor) =>
      [doctor.user!.name, doctor.user!.surname].some((s) =>
        s.toLowerCase().includes(filterText.value.toLowerCase()),
      ),
    )
    .map((doctor: Doctor) => doctor.user),
);

const headers = computed(() => [
  { title: t("firstName"), value: "name", sortable: true },
  { title: t("lastName"), value: "surname", sortable: true },
  { title: t("dateOfBirth"), value: "birthDate", sortable: true },
  { title: t("actions"), value: "actions", sortable: false },
]).value;

const editEntity = (user?: User) => {
  selectedEntity.value = doctorList.value.find((d) => d.user!.id === user!.id);
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
    medSpecialization: "",
    officePhoneNumber: "",
    ward: null,
  };
};

const saveEntity = async () => {
  try {
    const fn = selectedEntity.value.isNew
      ? employeeGRPC.createDoctor
      : employeeGRPC.editDoctor;

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
    entity.medSpecialization,
    entity.officePhoneNumber,
    entity.ward,
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
        <h1>{{ t("manageDoctors") }}</h1>
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
          <v-btn color="primary" @click="newEntity">{{ t("newDoctor") }}</v-btn>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredDoctorList"
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
        <v-card-title>{{ t("editDoctor") }}</v-card-title>
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
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.medSpecialization"
                :label="t('specialization')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.officePhoneNumber"
                :label="t('officePhone')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedEntity.ward"
                :items="allWards"
                item-title="name"
                item-value="id"
                :label="t('ward')"
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
