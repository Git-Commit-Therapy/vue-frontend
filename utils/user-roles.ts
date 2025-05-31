import jwtDecode from "jwt-decode";
import type { AuthToken } from "~/stores/authStore";
export function getUserRoles(jwtToken: string): string[] {
  if (!jwtToken) return [];
  try {
    const decodedToken = jwtDecode(jwtToken) as AuthToken;
    return Array.isArray(decodedToken.groups) ? decodedToken.groups : [""];
  } catch {
    return [""];
  }
}
