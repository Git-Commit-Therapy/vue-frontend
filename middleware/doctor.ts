import { useAuthStore } from "@/stores/authStore";
import type { RouteLocationNormalized } from "vue-router";

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const authStore = useAuthStore();

  if (
    !authStore.isValidToken() &&
    !authStore.isDoctor() &&
    !["/doctor"].includes(to.path)
  ) {
    console.log("[doctor.middleware] redirect to /login");
    return navigateTo("/login");
  }
  return;
});
