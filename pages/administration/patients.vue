<script setup lang="ts">
import Table from "@/components/Table";
import { ref, computed, onMounted } from "vue";
import EmployeeGRPC from "~/composable/clients/employeeGrpcClient";
import type { Patient } from "~/composable/protobuf/frontend/user";

const employeeGRPC = EmployeeGRPC.getInstance(env.EMPLOYEES_URL);

const patientList = ref<Patient[]>([]);
const filterText = ref("");
const selectedEntity = ref<any>(null);

onMounted(async () => {
  const response = await employeeGRPC.getAllPatients();
  patientList.value = response.patients;
});

const filteredPatientList = computed(() =>
  patientList.value
    .filter((patient) =>
      [patient.user!.name, patient.user!.surname].some((field) =>
        field.toLowerCase().includes(filterText.value.toLowerCase()),
      ),
    )
    .map((patient) => patient.user),
);

const tableHeader = [
  { key: "name", label: "Name" },
  { key: "surname", label: "Surname" },
  { key: "birthDate", label: "Birth Date" },
];

const editEntity = (user) => {
  selectedEntity.value = structuredClone(
    patientList.value.find((p) => p.user.id === user.id),
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
  };
};

const saveEntity = async () => {
  let response;
  if (selectedEntity.value.isNew) {
    response = await employeeGRPC.createPatient(selectedEntity.value);
  } else {
    response = await employeeGRPC.editPatient(selectedEntity.value);
  }

  if (response && response.success) {
    alert(
      selectedEntity.value.isNew
        ? "Patient entity created successfully"
        : "Patient entity saved successfully",
    );
    cancelEdit();
    const newPatients = await employeeGRPC.getAllPatients();
    patientList.value = newPatients.patients;
  } else {
    alert(
      "Error saving patient entity" +
        (response?.message ? ": " + response.message : ""),
    );
  }
};

const isSaveDisabled = computed(() => {
  const user = selectedEntity.value?.user;
  return (
    !user?.name ||
    !user?.surname ||
    !user?.birthDate ||
    !user?.phoneNumber ||
    !user?.email
  );
});
</script>
