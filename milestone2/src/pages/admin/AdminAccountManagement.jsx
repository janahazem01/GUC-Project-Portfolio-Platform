import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Modal, PageHeader } from "../../components/ui";
import { dummyUsers } from "../../data/dummy";

const roleLabels = {
  student: "Student",
  instructor: "Course Instructor",
  employer: "Employer",
  admin: "Administrator",
};

export default function AdminAccountManagement() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, user: null });
  const [alertModal, setAlertModal] = useState({ open: false, message: "" });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const visibleStatuses = selectedStatus ? [selectedStatus] : statusOptions.map((opt) => opt.value);
  const filteredUsers = useMemo(
    () => dummyUsers.filter((user) => visibleStatuses.includes(user.status)),
    [visibleStatuses]
  );

  const handleActivate = (user) => {
    if (user.status === "active") {
      setAlertModal({ open: true, message: "This account is already activated." });
      return;
    }
    setConfirmModal({ open: true, action: "activate", user });
  };

  const handleDeactivate = (user) => {
    if (user.status === "inactive") {
      setAlertModal({ open: true, message: "This account is already deactivated." });
      return;
    }
    setConfirmModal({ open: true, action: "deactivate", user });
  };

  const confirmAction = () => {
    const { action, user } = confirmModal;
    user.status = action === "activate" ? "active" : "inactive";
    setConfirmModal({ open: false, action: null, user: null });
    setAlertModal({ open: true, message: `Account ${action}d successfully.` });
  };

  return (
    <div>
      <PageHeader
        title="Account Management"
        subtitle="Activate or deactivate user accounts"
        action={
          <Button variant="secondary" onClick={() => navigate("/admin")}>Back</Button>
        }
      />

      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-start lg:justify-between relative">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="blue">{filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}</Badge>
          </div>
        </div>

        <div className="relative">
          <Button variant="secondary" onClick={() => setFilterOpen((open) => !open)}>
            <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
            </span>
            {selectedStatus ? `Filter: ${selectedStatus}` : "Filter by status"}
          </Button>
          {filterOpen && (
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border bg-bg-base p-3 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-display text-text-primary">Select statuses</p>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Close
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("");
                  setFilterOpen(false);
                }}
                className="mb-2 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-left text-sm font-sans text-text-secondary hover:border-text-primary hover:text-text-primary"
              >
                Clear filter
              </button>
              <div className="grid gap-2">
                {statusOptions.map((statusOption) => (
                        <button
                    key={statusOption.value}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(statusOption.value);
                      setFilterOpen(false);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-sans transition-colors ${
                      selectedStatus === statusOption.value
                        ? "border-accent-blue bg-accent-blue/10 text-text-primary"
                        : "border-border bg-bg-elevated text-text-secondary hover:border-text-primary hover:text-text-primary"
                    }`}
                  >
                    {statusOption.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="grid gap-4 border-b border-border px-4 py-4 bg-bg-elevated/50 items-center" style={{ gridTemplateColumns: "2.4fr 2.3fr 1.4fr 1.2fr 1fr" }}>
          <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Full Name</p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Email</p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Role</p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Status</p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-center">Actions</p>
        </div>
        {filteredUsers.map((user) => (
          <div key={user.id} className="grid gap-4 px-4 py-5 items-center border-b border-border last:border-0" style={{ gridTemplateColumns: "2.4fr 2.3fr 1.4fr 1.2fr 1fr" }}>
            <div className="truncate text-left">
              <p className="text-sm text-text-primary font-semibold truncate">{user.name}</p>
            </div>
            <div className="truncate text-left">
              <p className="text-sm text-text-secondary font-sans truncate">{user.email}</p>
            </div>
            <div className="truncate text-left">
              <Badge variant="blue">{roleLabels[user.role]}</Badge>
            </div>
            <div className="flex items-center justify-start">
              <Badge variant={user.status === "active" ? "success" : "danger"}>{user.status}</Badge>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                disabled={user.status === "active"}
                className={user.status === "active" ? "opacity-50 cursor-not-allowed" : ""}
                onClick={() => handleActivate(user)}
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={user.status === "inactive"}
                className={user.status === "inactive" ? "opacity-50 cursor-not-allowed" : ""}
                onClick={() => handleDeactivate(user)}
              >
                Deactivate
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <Modal isOpen={confirmModal.open} onClose={() => setConfirmModal({ open: false, action: null, user: null })} title="Confirm Action">
        <p className="text-text-secondary text-sm mb-6">
          Are you sure you want to {confirmModal.action} the account for {confirmModal.user?.name}?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmModal({ open: false, action: null, user: null })}>Cancel</Button>
          <Button onClick={confirmAction}>Yes</Button>
        </div>
      </Modal>

      <Modal isOpen={alertModal.open} onClose={() => setAlertModal({ open: false, message: "" })} title="Alert">
        <p className="text-text-secondary text-sm mb-6">{alertModal.message}</p>
        <div className="flex justify-end">
          <Button onClick={() => setAlertModal({ open: false, message: "" })}>Okay</Button>
        </div>
      </Modal>
    </div>
  );
}