import type { Patient } from "~/composable/protobuf/frontend/user";

export function showFullName(patient: Patient) {
  return (
    patient.user?.name + " " + patient.user?.surname + ", " + patient.user?.id
  );
}
