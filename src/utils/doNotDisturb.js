const DO_NOT_DISTURB_KEY = "gucDoNotDisturb";

export function readDoNotDisturb() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DO_NOT_DISTURB_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeDoNotDisturb(next) {
  try {
    window.localStorage.setItem(DO_NOT_DISTURB_KEY, next ? "1" : "0");
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new Event("guc-dnd-changed"));
  } catch {
    /* ignore */
  }
}
