import { Card, PageHeader } from "../components/ui";

export default function Messages() {
  return (
    <div>
      <PageHeader title="Messages" subtitle="Private conversations" />
      <Card>
        <p className="text-text-secondary font-sans text-sm">No messages yet.</p>
      </Card>
    </div>
  );
}
