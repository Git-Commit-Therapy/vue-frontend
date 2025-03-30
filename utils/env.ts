interface Environment {
  AUTH_URL: string;
  PATIENTS_URL: string;
}
const env: Environment = { AUTH_URL: "", PATIENTS_URL: "" };
// Yes, technically we're showing the user the env values.
// However:
// 1) We are not storing any sensitive information, we just didn't want to hard-code
// any URL.
// 2) There is a problem when we build for production, so we ensure that
// we have the variables that we need from the environment here.
if (process.env.NODE_ENV === "production") {
  env.AUTH_URL =
    (process.env.AUTH_URL as string) || "http://auth.sancommitto.local";
  env.PATIENTS_URL =
    (process.env.PATIENTS_URL as string) || "http://patients.sancommitto.local";
} else {
  env.AUTH_URL = process.env.AUTH_URL as string;
  env.PATIENTS_URL = process.env.PATIENTS_URL as string;
}
export default env;
