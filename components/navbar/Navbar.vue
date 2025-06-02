<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLocale, useTheme } from "vuetify";
import { useAuthStore } from "@/stores/authStore";
import { getUserRoles } from "~/utils/user-roles";

const authStore = useAuthStore();
const { setLocale } = useI18n();
const { current } = useLocale();
const router = useRouter();
const theme = useTheme();
const isDrawerOpen = ref(false);

function logout() {
  authStore.clearTokens();
  router.push("/login");
}

function hasRole(role: string): boolean {
  return getUserRoles(authStore.getAccessToken()).includes(role);
}

onMounted(() => {
  const preferredTheme = localStorage.getItem("theme");
  if (preferredTheme) {
    theme.global.name.value = preferredTheme;
  }
  const preferredLocale = localStorage.getItem("locale");
  if (preferredLocale) {
    current.value = preferredLocale;
    setLocale(preferredLocale);
  }
});

watch(
  () => theme.global.name.value,
  (newTheme) => {
    localStorage.setItem("theme", newTheme);
  },
);

watch(
  () => current.value,
  (newLocale) => {
    localStorage.setItem("locale", newLocale);
  },
);

/**
 * Toggles theme preference.
 */
function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
}

/**
 * Changes current language.
 * @param {string} locale Locale to be set.
 */
function changeLocale(locale: string) {
  current.value = locale;
  setLocale(locale);
}

/**
 * Toggles the drawer open.
 */
function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value;
}
</script>

<template>
  <div>
    <v-app-bar app>
      <v-btn icon @click="toggleDrawer" v-if="authStore.isValidToken()">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-app-bar-title class="text-truncate">
        <v-btn @click="router.push('/')">
          {{ $t("hospitalName") }}
        </v-btn>
      </v-app-bar-title>
      <v-spacer />
      <div class="d-flex align-center gap-2">
        <v-btn icon @click="toggleTheme">
          <v-icon>mdi-theme-light-dark</v-icon>
        </v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-translate</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="changeLocale('en')">
              <v-list-item-title>English</v-list-item-title>
            </v-list-item>
            <v-list-item @click="changeLocale('it')">
              <v-list-item-title>Italiano</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn v-if="authStore.isValidToken()" variant="text" @click="logout">
          {{ $t("logout") }}
        </v-btn>
        <v-btn
          v-else
          color="primary"
          variant="text"
          @click="router.push('/login')"
        >
          {{ $t("login") }}
        </v-btn>
        <v-btn
          v-if="authStore.isPatient()"
          variant="text"
          @click="router.push('/patient/profile')"
        >
          <v-icon start>mdi-account-box</v-icon>
          {{ $t("profile") }}
        </v-btn>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="isDrawerOpen" temporary app>
      <v-list max-width="250">
        <template v-if="hasRole('/patient')">
          <v-divider class="my-2"></v-divider>

          <v-list-subheader>{{ $t("patient") }}</v-list-subheader>

          <v-list-item to="/patient/appointments" @click="isDrawerOpen = false">
            <template v-slot:prepend>
              <v-icon>mdi-medical-bag</v-icon>
            </template>
            <v-list-item-title>{{ $t("visitList") }}</v-list-item-title>
          </v-list-item>
          <v-list-item
            to="/patient/medical-exams"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-file-document</v-icon>
            </template>
            <v-list-item-title>{{ $t("reportList") }}</v-list-item-title>
          </v-list-item>
          <v-list-item
            to="/patient/medical-events"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-calendar-clock</v-icon>
            </template>
            <v-list-item-title>{{ $t("eventList") }}</v-list-item-title>
          </v-list-item>
        </template>
        <template v-if="hasRole('/staff')">
          <v-divider class="my-2"></v-divider>

          <v-list-subheader>{{ $t("administration") }}</v-list-subheader>

          <v-list-item
            to="/administration/patients"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-account-multiple</v-icon>
            </template>
            <v-list-item-title>{{ $t("managePatients") }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            to="/administration/doctors"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-doctor</v-icon>
            </template>
            <v-list-item-title>{{ $t("manageDoctors") }}</v-list-item-title>
          </v-list-item>

          <v-list-item to="/administration/staff" @click="isDrawerOpen = false">
            <template v-slot:prepend>
              <v-icon>mdi-account-tie</v-icon>
            </template>
            <v-list-item-title>{{ $t("manageStaff") }}</v-list-item-title>
          </v-list-item>
        </template>
        <template v-if="hasRole('/doctors')">
          <v-divider class="my-2"></v-divider>

          <v-list-subheader>{{ $t("doctor") }}</v-list-subheader>

          <v-list-item
            to="/doctor/create/appointment"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-calendar-plus</v-icon>
            </template>
            <v-list-item-title>{{ $t("createAppointment") }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            to="/doctor/edit/appointment"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-calendar-edit</v-icon>
            </template>
            <v-list-item-title>{{ $t("editAppointment") }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            to="/doctor/create/medical-event"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-calendar-clock-outline</v-icon>
            </template>
            <v-list-item-title>{{
              $t("createMedicalEvent")
            }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            to="/doctor/edit/medical-event"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-calendar-clock</v-icon>
            </template>
            <v-list-item-title>{{ $t("editMedicalEvent") }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            to="/doctor/create/medical-exam"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-file-document-plus</v-icon>
            </template>
            <v-list-item-title>{{ $t("createMedicalExam") }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            to="/doctor/edit/medical-exam"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-file-document-edit</v-icon>
            </template>
            <v-list-item-title>{{ $t("editMedicalExam") }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            to="/doctor/create/medical-info"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-information-outline</v-icon>
            </template>
            <v-list-item-title>{{ $t("createMedicalInfo") }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            to="/doctor/edit/medical-info"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <v-list-item-title>{{ $t("editMedicalInfo") }}</v-list-item-title>
          </v-list-item>

          <v-divider class="my-2"></v-divider>

          <v-list-subheader>{{ $t("emergency") }}</v-list-subheader>

          <v-list-item to="/emergency/add" @click="isDrawerOpen = false">
            <template v-slot:prepend>
              <v-icon>mdi-account-plus</v-icon>
            </template>
            <v-list-item-title>{{ $t("addPatient") }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            to="/emergency/call-for-visit"
            @click="isDrawerOpen = false"
          >
            <template v-slot:prepend>
              <v-icon>mdi-phone-alert</v-icon>
            </template>
            <v-list-item-title>{{ $t("callForVisit") }}</v-list-item-title>
          </v-list-item>

          <v-list-item to="/emergency/transfer" @click="isDrawerOpen = false">
            <template v-slot:prepend>
              <v-icon>mdi-ambulance</v-icon>
            </template>
            <v-list-item-title>{{ $t("transferPatient") }}</v-list-item-title>
          </v-list-item>

          <v-list-item to="/emergency/remove" @click="isDrawerOpen = false">
            <template v-slot:prepend>
              <v-icon>mdi-account-remove</v-icon>
            </template>
            <v-list-item-title>{{ $t("removePatient") }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>
