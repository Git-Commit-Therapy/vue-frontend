<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import AuthGRPC from '@/composable/clients/authGrpcClient';
import { LoginResponse, AuthStatus} from '@/composable/protobuf/frontend/auth_services';
const authStore = useAuthStore();
const authService: AuthGRPC = AuthGRPC.getInstance(authStore.getAuthUrl());
const fiscalCode = ref('');
const password = ref('');

const loginError = ref(false)
const validationError = ref('')

const login = async () => {
  validationError.value= ''
  loginError.value = false

  if (!fiscalCode.value || !password.value) {
    validationError.value = 'Fiscal Code and Password are required';
    return;
  }

  try {
    const authResult: LoginResponse = await authService.login(fiscalCode.value, password.value);
    if (authResult.loginStatus === AuthStatus.SUCCESS) {
      return navigateTo('/dashboard')
    }
  } catch (error) {
    console.log(error)
    loginError.value = true
  }
}
</script>


<template>
  <div>
    <h1>Login</h1>
    <p v-if="loginError" class="error-login">Invalid credentials</p>
    <p v-if="validationError" class="error-login">{{ validationError }}</p>
    <div>
      <label for="fiscalCode">Fiscal Code</label>
      <input type="text" id="fiscalCode" name="fiscalCode" v-model="fiscalCode" />
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" v-model="password" />
    </div>
    <button @click="login">Login</button>
    <p>Don't have an account? <router-link to="/signup">Sign Up</router-link></p>
  </div>
</template>


<style lang="scss">
.error-login {
  color: red;
}
</style>
