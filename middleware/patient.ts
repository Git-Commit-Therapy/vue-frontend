import { useAuthStore } from "@/stores/authStore";
import type { RouteLocationNormalized } from "vue-router";

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const authStore = useAuthStore();

  if (
    !authStore.isValidToken() &&
    !authStore.isPatient() &&
    !["/patient"].includes(to.path)
  ) {
    console.log("[patient.middleware] redirect to /login");
    return navigateTo("/login");
  }
  return;
});
