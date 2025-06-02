import type { Patient } from "~/composable/protobuf/frontend/user";

export function showPatientFullName(patient: Patient): string {
  if (!patient.user) return "";
  return (
    patient.user.name + " " + patient.user.surname + ", " + patient.user.id
  );
}
