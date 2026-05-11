import { dummyUsers, instructorDirectory, portfolios } from "../data/dummy";

/**
 * Public portfolio path for the user. Administrators use `/explore/portfolio/admin-{id}`.
 */
export function getPortfolioOrProfilePathForUser(user) {
  if (!user?.role) return null;
  if (user.role === "admin" && user.id != null) {
    return `/explore/portfolio/admin-${user.id}`;
  }

  if (user.role === "student") {
    const portfolioEntry = portfolios.find(
      (p) =>
        (user.email && p.studentEmail === user.email) ||
        (user.name && (p.owner === user.name || p.studentName === user.name))
    );
    return portfolioEntry ? `/explore/portfolio/${portfolioEntry.id}` : null;
  }

  if (user.role === "instructor") {
    const instructorEntry =
      instructorDirectory.find((ins) => user.email && ins.email === user.email) ||
      instructorDirectory.find((ins) => user.name && ins.name === user.name);
    return instructorEntry ? `/explore/portfolio/instructor-${instructorEntry.id}` : null;
  }

  if (user.role === "employer" && user.id != null) {
    return `/explore/portfolio/employer-${user.id}`;
  }

  return null;
}

function instructorRowToUserLike(ins) {
  const account = dummyUsers.find(
    (u) => u.role === "instructor" && ((ins.email && u.email === ins.email) || (ins.name && u.name === ins.name))
  );
  if (account) return account;
  return { id: ins.id, name: ins.name, email: ins.email, role: "instructor" };
}

/**
 * Resolve a platform user (dummyUsers) or instructor directory row for linking.
 */
export function resolveUserForProfileLink(participant) {
  if (!participant || typeof participant !== "object") return null;
  const { id, userId, email, name } = participant;
  const uid = id ?? userId;
  if (uid != null) {
    const byId = dummyUsers.find((u) => String(u.id) === String(uid));
    if (byId) return byId;
  }
  if (email) {
    const byEmail = dummyUsers.find((u) => u.email === email);
    if (byEmail) return byEmail;
  }
  if (name) {
    const byName = dummyUsers.find((u) => u.name === name);
    if (byName) return byName;
    const ins =
      instructorDirectory.find((d) => d.name === name) ||
      (email ? instructorDirectory.find((d) => d.email === email) : null);
    if (ins) return instructorRowToUserLike(ins);
  }
  return null;
}

export function ownerNameToUser(ownerName) {
  if (!ownerName) return null;
  return resolveUserForProfileLink({ name: ownerName });
}
