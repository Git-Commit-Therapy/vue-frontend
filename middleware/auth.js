export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  if (
    !authStore.isAuthenticated() &&
    !["/", "/login", "/signup"].includes(to.path)
  ) {
    return navigateTo("/login");
  }
});
