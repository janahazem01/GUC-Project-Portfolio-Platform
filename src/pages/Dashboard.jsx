import { useContext } from "react";
import { Card, Badge, Stars, Button, PageHeader } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { projects, getVisibleNotifications } from "../data/dummy";

function StatCard({ label, value }) {
  return (
    <Card>
      <p className="text-text-secondary text-xs font-sans uppercase tracking-widest mb-2">{label}</p>
      <p className="font-mono text-3xl text-text-primary">{value}</p>
    </Card>
  );
}

function getDisplayName(name) {
  if (!name) return "there";

  const parts = name.split(" ").filter(Boolean);
  if (parts[0] === "Dr." && parts[1]) {
    return parts[1].replace(/\.$/, "");
  }

  return parts[0].replace(/\.$/, "");
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const myProjects = projects.filter((p) => p.owner === user?.name);
  const visibleNotifications = getVisibleNotifications(user);
  const roleLabel = {
    student: user?.major,
    instructor: "Instructor",
    employer: "Employer",
    admin: "Administrator",
  };

  return (
    <div>
      <PageHeader
        title={`Hello, ${getDisplayName(user?.name)}.`}
        subtitle={roleLabel[user?.role] || "Administrator"}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Projects" value={myProjects.length} />
        <StatCard label="Public Projects" value={myProjects.filter((p) => p.visibility === "public").length} />
        <StatCard label="Unread Notifications" value={visibleNotifications.filter((n) => !n.read).length} />
      </div>

      {/* Recent projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-text-primary">My Projects</h2>
          <Button variant="ghost" size="sm">View all →</Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {myProjects.map((p) => (
            <Card key={p.id} hover>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-base text-text-primary">{p.title}</h3>
                <Badge variant={p.visibility === "public" ? "success" : "default"}>
                  {p.visibility}
                </Badge>
              </div>
              <p className="text-text-secondary text-sm font-sans mb-3 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {p.languages.map((l) => (
                  <Badge key={l}>{l}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Stars rating={p.rating} />
                <Badge variant="blue">{p.courseCode}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h2 className="font-display text-lg text-text-primary mb-4">Recent Notifications</h2>
        <Card>
          <div className="flex flex-col divide-y divide-border">
            {visibleNotifications.length > 0 ? visibleNotifications.map((n) => (
              <div key={n.id} className={`py-3 flex items-start gap-3 ${!n.read ? "opacity-100" : "opacity-50"}`}>
                {!n.read && <span className="w-2 h-2 rounded-full bg-accent-blue mt-1.5 shrink-0" />}
                {n.read && <span className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm font-sans text-text-primary">{n.text}</p>
                  <p className="text-xs font-mono text-text-secondary mt-0.5">{n.time}</p>
                </div>
              </div>
            )) : (
              <p className="py-4 text-sm text-text-secondary font-sans">No notifications for your role yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
