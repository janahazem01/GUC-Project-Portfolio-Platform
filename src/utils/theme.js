const THEME_KEY = "guc-theme";

export function readTheme() {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function setTheme(mode) {
  if (typeof document === "undefined") return;
  if (mode === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new Event("guc-theme-changed"));
  } catch {
    /* ignore */
  }
}

export function toggleTheme() {
  setTheme(readTheme() === "light" ? "dark" : "light");
}
