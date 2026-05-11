/** Canonical course repository for this platform (all GitHub links resolve here). */
export const OFFICIAL_GITHUB_REPO_URL =
  "https://github.com/Software-Engineering-Spring-2026/SE_Team27";

export function resolveGithubHref(url) {
  if (url == null || typeof url !== "string") return OFFICIAL_GITHUB_REPO_URL;
  const trimmed = url.trim();
  if (!trimmed) return OFFICIAL_GITHUB_REPO_URL;
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    if (host === "github.com" || host.endsWith(".github.com")) {
      return OFFICIAL_GITHUB_REPO_URL;
    }
  } catch {
    if (trimmed.toLowerCase().includes("github.com")) return OFFICIAL_GITHUB_REPO_URL;
  }
  return trimmed;
}
