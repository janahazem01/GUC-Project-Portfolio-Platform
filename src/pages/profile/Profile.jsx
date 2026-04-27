import { Card, Badge, Stars, Button, PageHeader } from "../../components/ui";
import { currentUser, projects } from "../../data/dummy";

export default function Profile() {
  const myProjects = projects.filter((p) => p.owner === currentUser.name && p.visibility === "public");

  return (
    <div>
      {/* Profile header */}
      <div className="bg-bg-surface border border-border rounded-lg p-8 mb-6 flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-accent-gold/20 border-2 border-accent-gold flex items-center justify-center shrink-0">
          <span className="font-display text-2xl text-accent-gold">
            {currentUser.name.split(" ").map((n) => n[0]).join("")}
          </span>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl text-text-primary mb-1">{currentUser.name}</h1>
          <p className="text-text-secondary font-sans text-sm mb-3">{currentUser.email}</p>
          <p className="text-accent-gold font-mono text-xs mb-4">{currentUser.major}</p>
          <div className="flex gap-2 flex-wrap">
            {currentUser.skills.map((s) => (
              <Badge key={s} variant="blue">{s}</Badge>
            ))}
          </div>
        </div>
        <Button variant="secondary" size="sm">Edit Profile</Button>
      </div>

      {/* Public projects */}
      <PageHeader
        title="Portfolio"
        subtitle={`${myProjects.length} public projects`}
        action={<Button variant="ghost" size="sm">Manage visibility</Button>}
      />

      <div className="grid grid-cols-2 gap-4">
        {myProjects.map((p) => (
          <Card key={p.id} hover>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="blue">{p.courseCode}</Badge>
              <Stars rating={p.rating} />
            </div>
            <h3 className="font-display text-base text-text-primary mb-2">{p.title}</h3>
            <p className="text-text-secondary text-sm font-sans mb-3 line-clamp-2">{p.description}</p>
            <div className="flex gap-2 flex-wrap">
              {p.languages.map((l) => <Badge key={l}>{l}</Badge>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
