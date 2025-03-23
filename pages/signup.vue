<script setup lang="ts">
import { ref, reactive } from "vue";
import AuthGRPC from "@/composable/clients/authGrpcClient";
import {
  AuthStatus,
  type SignUpResponse,
} from "@/composable/protobuf/frontend/auth_services";

const error = ref<string | null>(null);
const showError = ref<boolean>(false);
const { t } = useI18n();
const authGRPC: AuthGRPC = AuthGRPC.getInstance(useAuthStore().getAuthUrl());

const values = reactive({
  fiscalCode: "",
  name: "",
  surname: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  dateOfBirth: new Date(),
});

const errors = reactive({
  fiscalCode: "",
  name: "",
  surname: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  dateOfBirth: "",
});

const touched = reactive({
  fiscalCode: false,
  name: false,
  surname: false,
  email: false,
  password: false,
  confirmPassword: false,
  phoneNumber: false,
  dateOfBirth: false,
});

/**
 * Hide error snackbar
 */
function hideError() {
  showError.value = false;
}

/**
 * Validates fiscal code format
 */
function validateFiscalCode(fiscalCode: string): string {
  if (!fiscalCode) {
    return t("required");
  }
  if (
    !/^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$/.test(
      fiscalCode,
    )
  ) {
    return t("wrongFormat");
  }
  return "";
}

/**
 * Validates that a field has a value
 */
function validateRequired(value: string): string {
  return value ? "" : t("required");
}

/**
 * Validates email format
 */
function validateEmail(email: string): string {
  if (!email) {
    return t("required");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return t("invalidEmail");
  }
  return "";
}

/**
 * Validates password
 */
function validatePassword(password: string): string {
  if (!password) {
    return t("required");
  }
  return "";
}

/**
 * Validates confirmation password matches password
 */
function validateConfirmPassword(confirmPassword: string): string {
  if (!confirmPassword) {
    return t("required");
  }
  if (confirmPassword !== values.password) {
    return t("passwordMatch");
  }
  return "";
}

/**
 * Validates date of birth
 */
function validateDateOfBirth(date: Date): string {
  if (!date) {
    return t("required");
  }
  return "";
}

/**
 * Handle blur event on form fields
 */
function handleBlur(field: keyof typeof values): void {
  touched[field as keyof typeof touched] = true;

  switch (field) {
    case "fiscalCode":
      errors.fiscalCode = validateFiscalCode(values.fiscalCode);
      break;
    case "name":
      errors.name = validateRequired(values.name);
      break;
    case "surname":
      errors.surname = validateRequired(values.surname);
      break;
    case "email":
      errors.email = validateEmail(values.email);
      break;
    case "password":
      errors.password = validatePassword(values.password);
      break;
    case "confirmPassword":
      errors.confirmPassword = validateConfirmPassword(values.confirmPassword);
      break;
    case "phoneNumber":
      errors.phoneNumber = validateRequired(values.phoneNumber);
      break;
    case "dateOfBirth":
      errors.dateOfBirth = validateDateOfBirth(values.dateOfBirth);
      break;
  }
}

/**
 * Validates the entire form
 */
function validateForm(): boolean {
  errors.fiscalCode = validateFiscalCode(values.fiscalCode);
  errors.name = validateRequired(values.name);
  errors.surname = validateRequired(values.surname);
  errors.email = validateEmail(values.email);
  errors.password = validatePassword(values.password);
  errors.confirmPassword = validateConfirmPassword(values.confirmPassword);
  errors.phoneNumber = validateRequired(values.phoneNumber);
  errors.dateOfBirth = validateDateOfBirth(values.dateOfBirth);

  // Set all fields as touched
  Object.keys(touched).forEach((key) => {
    touched[key as keyof typeof touched] = true;
  });

  // Check if there are any errors
  return !Object.values(errors).some((error) => error !== "");
}

/**
 * Handle form submission
 */
async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  try {
    console.log(JSON.stringify(values));
    const response: SignUpResponse = await authGRPC.signUp(
      values.fiscalCode,
      values.name,
      values.surname,
      // This is a workaround, for some reason we have to do it.
      // We refuse to investigate further.
      // TODO: remove the duplicate new call.
      new Date(values.dateOfBirth),
      values.phoneNumber,
      values.email,
      values.password,
    );

    if (response.signUpStatus === AuthStatus.SUCCESS) {
      return navigateTo("/login");
    } else {
      error.value = t("signupFailed");
      showError.value = true;
    }
  } catch (err: unknown) {
    console.error(err);
    error.value = t("genericError");
    showError.value = true;
  }
}
</script>

<template>
  <div>
    <v-snackbar
      v-model="showError"
      :timeout="10000"
      color="error"
      location="top right"
    >
      {{ error }}
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" @click="hideError"></v-btn>
      </template>
    </v-snackbar>

    <v-card class="mx-auto my-4" max-width="500" rounded="lg">
      <v-card-text>
        <form @submit.prevent="handleSubmit">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="values.name"
                  :label="t('firstName')"
                  :error-messages="
                    touched.name && errors.name ? errors.name : ''
                  "
                  @blur="handleBlur('name')"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="values.surname"
                  :label="t('lastName')"
                  :error-messages="
                    touched.surname && errors.surname ? errors.surname : ''
                  "
                  @blur="handleBlur('surname')"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="values.fiscalCode"
                  :label="t('fiscalCode')"
                  :error-messages="
                    touched.fiscalCode && errors.fiscalCode
                      ? errors.fiscalCode
                      : ''
                  "
                  @blur="handleBlur('fiscalCode')"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="values.phoneNumber"
                  :label="t('phoneNumber')"
                  :error-messages="
                    touched.phoneNumber && errors.phoneNumber
                      ? errors.phoneNumber
                      : ''
                  "
                  @blur="handleBlur('phoneNumber')"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="values.dateOfBirth"
                  :label="t('dateOfBirth')"
                  type="date"
                  :error-messages="
                    touched.dateOfBirth && errors.dateOfBirth
                      ? errors.dateOfBirth
                      : ''
                  "
                  @blur="handleBlur('dateOfBirth')"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="values.email"
                  :label="t('email')"
                  type="email"
                  :error-messages="
                    touched.email && errors.email ? errors.email : ''
                  "
                  @blur="handleBlur('email')"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="values.password"
                  :label="t('password')"
                  type="password"
                  :error-messages="
                    touched.password && errors.password ? errors.password : ''
                  "
                  @blur="handleBlur('password')"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="values.confirmPassword"
                  :label="t('confirmPassword')"
                  type="password"
                  :error-messages="
                    touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : ''
                  "
                  @blur="handleBlur('confirmPassword')"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-btn color="primary" type="submit" block size="large">
                  {{ $t("signUp") }}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </form>
        <div class="text-center mt-4">
          <NuxtLink to="/login">{{ $t("haveAccount") }}</NuxtLink>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
