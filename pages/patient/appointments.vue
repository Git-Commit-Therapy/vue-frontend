<script setup lang="ts">
import PatientGRPC from "@/composable/clients/patientGrpcClient";
import env from "@/utils/env";
import type { GetAppointmentsResponse } from "@/composable/protobuf/frontend/employee_services";
import { formatDateTime } from "@/utils/date-format";
const { t } = useI18n();
// const patientGRPC: PatientGRPC = PatientGRPC.getInstance(env.PATIENTS_URL);
// const patientAppointments = await patientGRPC.getAppointments();
const patientAppointments: GetAppointmentsResponse = {
  appointments: [
    {
      appointmentId: 1,
      dateTime: new Date("2025-04-15T09:30:00Z"),
      staff: {
        user: {
          id: "s001",
          name: "Alice",
          surname: "Nguyen",
          birthDate: new Date("1985-11-22"),
          phoneNumber: "+1234567890",
          email: "alice.nguyen@clinic.com",
        },
      },
      doctor: {
        user: {
          id: "d001",
          name: "John",
          surname: "Doe",
          birthDate: new Date("1975-04-10"),
          phoneNumber: "+1234560001",
          email: "john.doe@hospital.com",
        },
        medSpecialization: "Cardiology",
        officePhoneNumber: "+1234561001",
        ward: {
          wardId: 10,
          name: "Cardiac Unit",
        },
      },
      patient: {
        user: {
          id: "p001",
          name: "Maria",
          surname: "Lopez",
          birthDate: new Date("1990-06-15"),
          phoneNumber: "+1234567899",
          email: "maria.lopez@example.com",
        },
      },
    },
    {
      appointmentId: 2,
      dateTime: new Date("2025-04-16T11:00:00Z"),
      staff: {
        user: {
          id: "s002",
          name: "Brian",
          surname: "Kim",
          birthDate: new Date("1990-02-08"),
          phoneNumber: "+1234567891",
          email: "brian.kim@clinic.com",
        },
      },
      doctor: {
        user: {
          id: "d002",
          name: "Emma",
          surname: "Stone",
          birthDate: new Date("1980-09-20"),
          phoneNumber: "+1234560002",
          email: "emma.stone@hospital.com",
        },
        medSpecialization: "Dermatology",
        officePhoneNumber: "+1234561002",
        ward: {
          wardId: 12,
          name: "Skin & Dermatology",
        },
      },
      patient: {
        user: {
          id: "p002",
          name: "James",
          surname: "Miller",
          birthDate: new Date("1988-12-03"),
          phoneNumber: "+1234567800",
          email: "james.miller@example.com",
        },
      },
    },
    {
      appointmentId: 3,
      dateTime: new Date("2025-04-17T14:00:00Z"),
      staff: {
        user: {
          id: "s003",
          name: "Lena",
          surname: "Takahashi",
          birthDate: new Date("1982-07-14"),
          phoneNumber: "+1234567892",
          email: "lena.takahashi@clinic.com",
        },
      },
      doctor: {
        user: {
          id: "d003",
          name: "Raj",
          surname: "Patel",
          birthDate: new Date("1979-01-11"),
          phoneNumber: "+1234560003",
          email: "raj.patel@hospital.com",
        },
        medSpecialization: "Neurology",
        officePhoneNumber: "+1234561003",
        ward: {
          wardId: 15,
          name: "Neuro Sciences",
        },
      },
      patient: {
        user: {
          id: "p003",
          name: "Anna",
          surname: "Smith",
          birthDate: new Date("1995-03-27"),
          phoneNumber: "+1234567810",
          email: "anna.smith@example.com",
        },
      },
    },
  ],
};

patientAppointments.appointments = [];
</script>

<template>
  <h1>
    {{ t("appointments") }}
  </h1>
  <v-card variant="outlined"></v-card>
  <v-card variant="flat" class="overflow-y-auto" max-height="400">
    <v-card-text v-if="patientAppointments.appointments.length > 0">
      <v-timeline align="start" density="compact">
        <v-timeline-item
          v-for="appointment in patientAppointments.appointments"
          :key="appointment.appointmentId"
          size="x-small"
        >
          <div class="mb-4">
            <strong
              >{{ formatDateTime(appointment.dateTime!) }} @
              {{ appointment.doctor?.user?.name }}
              {{ appointment.doctor?.user?.surname }},
              {{ appointment.doctor?.ward?.name }}
            </strong>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
    <v-card-text v-else>{{ t("noAppointments") }}</v-card-text>
  </v-card>
</template>

<style scoped></style>
