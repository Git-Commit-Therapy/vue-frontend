<script setup lang="ts">
import type { Appointment } from "~/composable/protobuf/frontend/appointment";

const raw = localStorage.getItem("currentAppointment");
const appointment = raw ? (JSON.parse(raw) as Appointment) : null;
</script>
<template>
  <div></div>
</template>
