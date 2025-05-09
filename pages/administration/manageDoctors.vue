<script setup lang="ts">
import { useDataStore } from "@/stores/dataStore";
import Table from "@/components/Table.vue";

const dataStore = useDataStore();
const doctorList = ref([]);
const filterText = ref("");
const selectedEntity = ref(null);
const allWards = ref([]);

onMounted(async () => {
  doctorList.value = await dataStore.fetchAllDoctors();
  allWards.value = await dataStore.fetchAllWards();
});

const filteredDoctorList = computed(() => {
  return doctorList.value
    .filter(
      (doctor) =>
        doctor.user.name
          .toLowerCase()
          .includes(filterText.value.toLowerCase()) ||
        doctor.user.surname
          .toLowerCase()
          .includes(filterText.value.toLowerCase()),
    )
    .map((doctor) => doctor.user);
});

const tableHeader = [
  { key: "name", label: "Name" },
  { key: "surname", label: "Surname" },
  { key: "birthDate", label: "Birth Date" },
];

const editEntity = (user) => {
  selectedEntity.value = doctorList.value.find(
    (doctor) => doctor.user.id === user.id,
  );
};

const cancelEdit = () => {
  selectedEntity.value = null;
};

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
  if (selectedEntity.value.isNew) {
    const response = await dataStore.createDoctorEntity(selectedEntity.value);
    if (response && response.success) {
      alert("Doctor entity created successfully");
      cancelEdit();
    } else {
      alert(
        "Error creating doctor entity" +
          (response && response.message ? ": " + response.message : ""),
      );
    }
  } else {
    const response = await dataStore.modifyDoctorEntity(selectedEntity.value);
    if (response && response.success) {
      alert("Doctor entity saved successfully");
      cancelEdit();
    } else {
      alert(
        "Error saving doctor entity" +
          (response && response.message ? ": " + response.message : ""),
      );
    }
  }
};

const isSaveDisabled = computed(() => {
  if (!selectedEntity.value) return true;
  const user = selectedEntity.value.user;
  return (
    !user.name ||
    !user.surname ||
    !user.birthDate ||
    !user.phoneNumber ||
    !user.email ||
    !selectedEntity.value.medSpecialization ||
    !selectedEntity.value.officePhoneNumber ||
    !selectedEntity.value.ward
  );
});
</script>

<template>
  <div>
    <h1>Manage Doctors</h1>
    <div v-if="!selectedEntity">
      <input v-model="filterText" placeholder="Filter by name or surname" />
      <button @click="newEntity">New Doctor</button>
      <Table
        :header="tableHeader"
        :data="filteredDoctorList"
        :executeFunction="editEntity"
        buttonLabel="Edit"
      />
    </div>
    <div v-else>
      <h2>Edit Entity</h2>
      <div>
        <label>
          Fiscal Code:
          <input v-model="selectedEntity.user.id" placeholder="Fiscal Code" />
        </label>
      </div>
      <div>
        <label>
          Name:
          <input v-model="selectedEntity.user.name" placeholder="Name" />
        </label>
      </div>
      <div>
        <label>
          Surname:
          <input v-model="selectedEntity.user.surname" placeholder="Surname" />
        </label>
      </div>
      <div>
        <label>
          Birth Date:
          <input type="date" v-model="selectedEntity.user.birthDate" />
        </label>
      </div>
      <div>
        <label>
          Phone:
          <input
            v-model="selectedEntity.user.phoneNumber"
            placeholder="Phone"
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input v-model="selectedEntity.user.email" placeholder="Email" />
        </label>
      </div>
      <div>
        <label>
          Specialization:
          <input
            v-model="selectedEntity.medSpecialization"
            placeholder="Medical Specialization"
          />
        </label>
      </div>
      <div>
        <label>
          Office Phone:
          <input
            v-model="selectedEntity.officePhoneNumber"
            placeholder="Office Phone Number"
          />
        </label>
      </div>
      <div>
        <label>
          Ward:
          <select v-model="selectedEntity.ward">
            <option v-for="ward in allWards" :key="ward.id" :value="ward">
              {{ ward.name }}
            </option>
          </select>
        </label>
      </div>
      <button @click="saveEntity" :disabled="isSaveDisabled">Save</button>
      <button @click="cancelEdit">Back to List</button>
    </div>
  </div>
</template>

<style scoped>
input {
  margin-bottom: 10px;
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
}
select {
  margin-bottom: 10px;
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
}
button {
  margin-top: 10px;
  margin-right: 5px;
}
label {
  display: block;
  margin-bottom: 8px;
}
</style>
