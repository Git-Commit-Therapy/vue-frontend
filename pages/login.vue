<script setup lang="ts">
import { ref, reactive} from 'vue';
import AuthGRPC from '@/composable/clients/authGrpcClient';
import { AuthStatus, type LoginResponse } from '@/composable/protobuf/frontend/auth_services';

const error = ref<string|null>(null);
const showError = ref<boolean>(false);
const { t } = useI18n();
const authGRPC: AuthGRPC = AuthGRPC.getInstance(useAuthStore().getAuthUrl());
const authStore = useAuthStore();

const values = reactive({
  fiscalCode: '',
  password: ''
});
const errors = reactive({
  fiscalCode: '',
  password: ''
});
const touched = reactive({
  fiscalCode: false,
  password: false
});

/** This is a stupid function, however for some reason vue does not want to
  * "directly" set values and we're forced to do this.
  */
function hideError() {
  showError.value = false;
}

/**
 * This function validates the given fiscalCode parameter.
 * @param {string} fiscalCode Input value.
 * @returns {string} Error message or empty string.
*/
function validateFiscalCode(fiscalCode: string): string {
  if (!fiscalCode) {
    return t('required');
  }
  if (fiscalCode.length !== 16) {
    return t('wrongFormat')
  }
  if (!/^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$/.test(fiscalCode)) {
    return t('wrongFormat')
  }
  return '';
};

/**
 * This function validates the given password parameter.
 * @param {string} password Input value.
 * @returns {string} Error message or empty string.
*/
function validatePassword (password: string): string {
  if (!password) {
    return t('required');
  }
  if (password.length < 8) {
    return t('invalidPassword');
  }
  return '';
};

/**
 * This function handles blur of the given input field
 * and sets the {error} value accordingly.
 * @param {'fiscalCode'|'password'} field Form field to check.
*/
function handleBlur(field: 'fiscalCode' | 'password'): void {
  touched[field] = true;
  if (field === 'fiscalCode') {
    errors.fiscalCode = validateFiscalCode(values.fiscalCode);
  } else {
    errors.password = validatePassword(values.password);
  }
};

/**
 * This function validates the form fields and sets the {error} values
 * accordingly if something was not valid.
 * @returns {boolean} Returns true if both fields are valid (i.e. no errors), false otherwise.
*/
function validateForm(): boolean {
  errors.fiscalCode = validateFiscalCode(values.fiscalCode);
  errors.password = validatePassword(values.password);
  touched.fiscalCode = true;
  touched.password = true;

  return !errors.fiscalCode && !errors.password;
};

/**
 * Handles login, if credentials are valid, navigates to dashboard,
 * else sets erorr message
 */
async function handleSubmit(){
  if (!validateForm()) {
    return;
  }
  const response: LoginResponse= await authGRPC.login(values.fiscalCode, values.password);
  if (response.loginStatus === AuthStatus.SUCCESS) {
    authStore.setAccessToken(response.accessToken);
    authStore.setRefreshToken(response.refreshToken);
    return navigateTo('/dashboard');
  }
  if ([AuthStatus.UNRECOGNIZED, AuthStatus.FAIL].includes(response.loginStatus)) {
    error.value = t('loginFailed');
    showError.value = true;
  }
  return;
};
</script>

<template>
  <div>
    <v-snackbar
      v-model="showError"
      :timeout="5000"
      color="error"
      location="top right"
    >
      {{ error }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          @click="hideError"
        ></v-btn>
      </template>
    </v-snackbar>

    <v-card class="mx-auto my-4" max-width="500" rounded="lg">
      <v-card-text>
        <form @submit.prevent="handleSubmit">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="values.fiscalCode"
                  label="Fiscal Code"
                  :error-messages="touched.fiscalCode && errors.fiscalCode ? errors.fiscalCode : ''"
                  @blur="handleBlur('fiscalCode')"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="values.password"
                  label="Password"
                  type="password"
                  :error-messages="touched.password && errors.password ? errors.password : ''"
                  @blur="handleBlur('password')"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-btn
                  color="primary"
                  type="submit"
                  block
                  size="large"
                >
                  Login
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </form>
        <div class="text-center mt-4">
          <NuxtLink to="/register">{{$t("noAccount")}}</NuxtLink>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
