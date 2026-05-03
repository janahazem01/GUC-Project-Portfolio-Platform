import { useMemo, useState } from "react";
import { Card, Badge, Button, PageHeader, Modal } from "../../components/ui";
import { courses, employerApplications, projects } from "../../data/dummy";

export default function Admin() {
  const [applications, setApplications] = useState(employerApplications);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const stats = useMemo(() => ([
    { label: "Total Users", value: "142" },
    { label: "Total Projects", value: String(projects.length) },
    { label: "Courses", value: String(courses.length) },
    { label: "Pending Approvals", value: String(applications.filter((application) => application.verificationStatus === "pending").length) },
  ]), [applications]);

  const handleDecision = (applicationId, nextStatus) => {
    setApplications((previous) =>
      previous.map((application) =>
        application.id === applicationId
          ? { ...application, verificationStatus: nextStatus }
          : application
      )
    );

    if (selectedApplication?.id === applicationId) {
      setSelectedApplication((previous) => previous ? { ...previous, verificationStatus: nextStatus } : previous);
    }
  };

  const pendingApplications = applications.filter((application) => application.verificationStatus === "pending");

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and controls" />

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-text-secondary text-xs font-sans uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="font-mono text-3xl text-text-primary">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base text-text-primary">Courses</h2>
            <Button variant="secondary" size="sm">+ Add Course</Button>
          </div>
          <div className="flex flex-col gap-2">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-sans text-text-primary">{course.name}</p>
                  <p className="text-xs font-mono text-text-secondary">{course.code}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="danger" size="sm">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base text-text-primary">Flagged Projects</h2>
            <Badge variant="danger">0 flagged</Badge>
          </div>
          <p className="text-text-secondary text-sm font-sans">No flagged projects at this time.</p>
        </Card>

        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base text-text-primary">Employer Approvals</h2>
            <Badge variant="warning">{pendingApplications.length} pending</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {applications.map((application) => (
              <div key={application.id} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-sans text-text-primary">{application.name}</p>
                    <Badge variant={application.verificationStatus === "approved" ? "success" : application.verificationStatus === "rejected" ? "danger" : "warning"}>
                      {application.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">{application.companyEmail}</p>
                  <p className="text-xs text-text-secondary">{application.location}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(application)}>View Docs</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleDecision(application.id, "approved")}>Accept</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDecision(application.id, "rejected")}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={Boolean(selectedApplication)}
        onClose={() => setSelectedApplication(null)}
        title={selectedApplication ? `${selectedApplication.name} Documents` : "Documents"}
      >
        {selectedApplication && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-text-secondary mb-1">Company</p>
              <p className="text-text-primary">{selectedApplication.name}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-2">Uploaded Documents</p>
              <div className="flex flex-col gap-2">
                {selectedApplication.uploadedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-bg-elevated border border-border rounded-lg px-3 py-2">
                    <div>
                      <p className="text-text-primary text-sm">{doc.name}</p>
                      <p className="text-text-secondary text-xs">Uploaded {doc.uploadedAt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="secondary" size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="secondary" className="flex-1" onClick={() => handleDecision(selectedApplication.id, "approved")}>Accept</Button>
              <Button variant="danger" className="flex-1" onClick={() => handleDecision(selectedApplication.id, "rejected")}>Reject</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}