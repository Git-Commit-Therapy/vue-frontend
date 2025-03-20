<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLocale, useTheme } from "vuetify";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const { setLocale } = useI18n();
const { current } = useLocale();
const theme = useTheme();
const isDrawerOpen = ref(false);

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
    <v-app-bar>
      <v-btn icon @click="toggleDrawer" v-if="authStore.isValidToken()">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-app-bar-title class="text-truncate">
        <v-btn @click="navigateTo('/')">
          {{ $t("hospitalName") }}
        </v-btn>
      </v-app-bar-title>
      <v-spacer />
      <div class="d-flex align-center gap-2">
        <v-btn
          v-if="authStore.isValidToken()"
          variant="outlined"
          :to="'/profile'"
        >
          <v-icon start>mdi-account-box</v-icon>
          {{ $t("profile") }}
        </v-btn>
        <v-btn v-else color="primary" variant="outlined" :to="'/login'">
          {{ $t("login") }}
        </v-btn>
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
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="isDrawerOpen" temporary>
      <v-list max-width="250">
        <v-list-item to="/patient/appointments" @click="isDrawerOpen = false">
          <template v-slot:prepend>
            <v-icon>mdi-medical-bag</v-icon>
          </template>
          <v-list-item-title>{{ $t("visitList") }}</v-list-item-title>
        </v-list-item>
        <v-list-item to="/patient/medical-exams" @click="isDrawerOpen = false">
          <template v-slot:prepend>
            <v-icon>mdi-file-document</v-icon>
          </template>
          <v-list-item-title>{{ $t("reportList") }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>
