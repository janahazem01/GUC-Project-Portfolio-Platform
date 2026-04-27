import { Card, Button, PageHeader } from "../components/ui";
import { notifications } from "../data/dummy";

export default function Notifications() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        action={<Button variant="ghost" size="sm">Mark all as read</Button>}
      />
      <Card>
        <div className="flex flex-col divide-y divide-border">
          {notifications.map((n) => (
            <div key={n.id} className={`py-4 flex items-start gap-3 ${!n.read ? "opacity-100" : "opacity-50"}`}>
              <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? "bg-accent-blue" : "bg-transparent border border-border"}`} />
              <div className="flex-1">
                <p className="text-sm font-sans text-text-primary">{n.text}</p>
                <p className="text-xs font-mono text-text-secondary mt-1">{n.time}</p>
              </div>
              {!n.read && (
                <Button variant="ghost" size="sm">Mark read</Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
