/**
 * Checks the user's preferred CSS color scheme
 * @returns {"light"|"dark"} Preferred color scheme
 */
export default function getPreferredTheme() {
  // Checks if we're in the browser environment
  // Since we are using SSR, we can't be sure that we're
  // always in a client environment.
  if (typeof window !== "undefined" && window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }
  return "light";
}
