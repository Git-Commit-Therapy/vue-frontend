/**
 * Checks the user's preferred CSS color scheme
 * @returns {"light"|"dark"} Preferred color scheme
 */
export default function getPreferredTheme(): string {
  // Checks if we're in the browser environment
  if (typeof window !== "undefined" && window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }
  return "light";
}
