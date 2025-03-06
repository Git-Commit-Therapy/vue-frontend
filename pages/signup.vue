<script setup>
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();

const fiscalCode = ref('');
const name = ref('');
const surname = ref('');
const dateOfBirth = ref('');
const phoneNumber = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const signUpError = ref(false);
const validationError = ref('');

const signUp = async () => {
  validationError.value = '';
  signUpError.value = false;

  if (!fiscalCode.value || !name.value || !surname.value || !dateOfBirth.value || !phoneNumber.value || !email.value || !password.value || !confirmPassword.value) {
    validationError.value = 'All fields are ';
    return;
  }

  if (password.value !== confirmPassword.value) {
    validationError.value = 'Passwords do not match';
    return;
  }

  try {
    await authStore.signUp(fiscalCode.value, name.value, surname.value, dateOfBirth.value, phoneNumber.value, email.value, password.value);
    router.push('/dashboard');
  } catch (error) {
    console.log(error);
    signUpError.value = true;
  }
};
</script>

<template>
  <div>
    <h1>Sign Up</h1>
    <p v-if="signUpError" class="error-signup">Sign Up failed</p>
    <p v-if="validationError" class="error-signup">{{ validationError }}</p>
    <div>
      <label for="fiscalCode">Fiscal Code</label>
      <input type="text" id="fiscalCode" name="fiscalCode" v-model="fiscalCode" />
    </div>
    <div>
      <label for="name">Name</label>
      <input type="text" id="name" name="name" v-model="name" />
    </div>
    <div>
      <label for="surname">Surname</label>
      <input type="text" id="surname" name="surname" v-model="surname" />
    </div>
    <div>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" v-model="email" />
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" v-model="password" />
    </div>
    <div>
      <label for="confirmPassword">Confirm Password</label>
      <input type="password" id="confirmPassword" name="confirmPassword" v-model="confirmPassword" />
    </div>
    <div>
      <label for="phoneNumber">Phone Number</label>
      <input type="text" id="phoneNumber" name="phoneNumber" v-model="phoneNumber" />
    </div>
    <div>
      <label for="dateOfBirth">Date of Birth</label>
      <input type="date" id="dateOfBirth" name="dateOfBirth" v-model="dateOfBirth" />
    </div>
    <button @click="signUp">Sign Up</button>
    <p>Already have an account? <router-link to="/login">Login</router-link></p>
  </div>
</template>

<style lang="scss">
.error-signup {
  color: red;
}
</style>
