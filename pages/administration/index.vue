<script setup lang="ts"></script>

<!--Todo manage roles-->
<template>
  <div>
    <h1>Administration Page</h1>
    <p>Welcome to the administration section.</p>
    <router-link :to="{ path: '/staff/administration/manageStaff' }"
      >Manage Staff</router-link
    >
    <router-link :to="{ path: '/staff/administration/manageDoctors' }"
      >Manage Doctors</router-link
    >
    <router-link :to="{ path: '/staff/administration/managePatients' }"
      >Manage Patients</router-link
    >
  </div>
</template>

<style scoped></style>
