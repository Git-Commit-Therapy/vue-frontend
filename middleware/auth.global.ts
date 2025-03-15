import { useAuthStore } from '@/stores/authStore';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  if (!authStore.isValidToken() && !["/", "/login", "/signup"].includes(to.path)) {
    console.log("[auth.global middleware] redirect to /login");
    return navigateTo("/login");
  }
  return;
});
