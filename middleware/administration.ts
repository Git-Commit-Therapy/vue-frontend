import { useAuthStore } from "@/stores/authStore";
import type { RouteLocationNormalized } from "vue-router";

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const authStore = useAuthStore();

  if (
    !authStore.isValidToken() &&
    !authStore.isStaff() &&
    !["/administration"].includes(to.path)
  ) {
    console.log("[administration.middleware] redirect to /login");
    return navigateTo("/login");
  }
  return;
});
