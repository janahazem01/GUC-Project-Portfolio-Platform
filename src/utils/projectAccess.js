/** Same rules as the Projects page: owned, supervised, team, or accepted invitation access. */
export function canAccessProject(project, user) {
  if (!user?.name) return false;
  if (project.owner === user.name) return true;
  if (user.role === "instructor" && project.supervisor === user.name) return true;
  if ((project.team || []).includes(user.name)) return true;

  if (user.role === "instructor") {
    return (project.instructorInvitations || []).some(
      (inv) =>
        inv.status === "accepted" &&
        (inv.email === user.email || inv.instructorName === user.name)
    );
  }

  return (project.collaboratorInvitations || []).some(
    (inv) =>
      inv.status === "accepted" &&
      (inv.email === user.email || inv.collaboratorName === user.name)
  );
}
