/** Canonical course repository: every GitHub button/link uses this URL. */
export const OFFICIAL_GITHUB_REPO_URL =
  "https://github.com/Software-Engineering-Spring-2026/SE_Team27";

/** Always open the course repo (ignores stored project `github` values). */
export function resolveGithubHref(_url) {
  return OFFICIAL_GITHUB_REPO_URL;
}
