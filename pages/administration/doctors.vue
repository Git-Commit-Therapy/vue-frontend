<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import type { Doctor } from "~/composable/protobuf/frontend/user";
import type { Ward } from "~/composable/protobuf/frontend/ward";
const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);
const { t } = useI18n();

const doctorList = ref([] as Doctor[]);
const filterText = ref("");
const selectedEntity = ref<any>(null);
const allWards = ref([] as Ward[]);

onMounted(async () => {
  doctorList.value = (await employeeGRPC.getAllDoctors()).doctors;
  allWards.value = (await employeeGRPC.getAllWards()).ward;
});

const filteredDoctorList = computed(() =>
  doctorList.value
    .filter((d) =>
      [d.user!.name, d.user!.surname].some((s) =>
        s.toLowerCase().includes(filterText.value.toLowerCase()),
      ),
    )
    .map((d) => d.user),
);

const headers = [
  { text: t("name"), value: "name", sortable: true },
  { text: t("surname"), value: "surname", sortable: true },
  { text: t("birthDate"), value: "birthDate", sortable: true },
  { text: "", value: "actions", sortable: false },
];

const editEntity = (user: any) => {
  selectedEntity.value = doctorList.value.find((d) => d.user!.id === user.id);
};

const cancelEdit = () => (selectedEntity.value = null);

const newEntity = () => {
  selectedEntity.value = {
    isNew: true,
    user: {
      id: "",
      name: "",
      surname: "",
      birthDate: "",
      phoneNumber: "",
      email: "",
    },
    medSpecialization: "",
    officePhoneNumber: "",
    ward: null,
  };
};

const saveEntity = async () => {
  const fn = selectedEntity.value.isNew
    ? employeeGRPC.createDoctor
    : employeeGRPC.editDoctor;

  const response = await fn(selectedEntity.value);
  if (response?.success) {
    alert(t("successMessage"));
    cancelEdit();
  } else {
    alert(
      t("errorMessage") + (response?.message ? ": " + response.message : ""),
    );
  }
};

const isSaveDisabled = computed(() => {
  const e = selectedEntity.value;
  if (!e) return true;
  const u = e.user;
  return ![
    u.name,
    u.surname,
    u.birthDate,
    u.phoneNumber,
    u.email,
    e.medSpecialization,
    e.officePhoneNumber,
    e.ward,
  ].every(Boolean);
});
</script>

<template>
  <v-container>
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
            prepend-icon="mdi-magnify"
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
                :label="t('name')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.user.surname"
                :label="t('surname')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.user.birthDate"
                :label="t('birthDate')"
                type="date"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.user.phoneNumber"
                :label="t('phone')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedEntity.user.email"
                :label="t('email')"
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
