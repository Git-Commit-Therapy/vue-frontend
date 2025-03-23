import { useAuthStore } from "@/stores/authStore";
import type { RouteLocationNormalized } from "vue-router";

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const authStore = useAuthStore();

  if (
    !authStore.isValidToken() &&
    !["/", "/login", "/signup"].includes(to.path)
  ) {
    console.log("[auth.global middleware] redirect to /login");
    return navigateTo("/login");
  }
  return;
});
