import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, Modal, PageHeader } from "../../components/ui";
import { courses, dummyUsers, employerApplications, projects } from "../../data/dummy";

const roleLabels = {
  student: "Student",
  instructor: "Course Instructor",
  employer: "Employer",
  admin: "Administrator",
};

const pageTitles = {
  users: ["Users", "Full name, email, and role for all platform users."],
  courses: ["Courses", "All courses currently available on the platform."],
  projects: ["Projects", "All submitted projects and their owners."],
  employers: ["Employers", "Employer accounts registered on the platform."],
  approvals: ["Approvals", "Employer verification requests and statuses."],
  flagged: ["Flagged Projects", "Reported or flagged project records."],
};

function DataHeader({ columns }) {
  return (
    <div className="grid gap-4 border-b border-border px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
      {columns.map((column) => (
        <p key={column} className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">{column}</p>
      ))}
    </div>
  );
}

function DataRow({ children, columns }) {
  return (
    <div className="grid gap-4 px-4 py-4 items-center border-b border-border last:border-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {children}
    </div>
  );
}

export default function AdminDataPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtersAddedOpen, setFiltersAddedOpen] = useState(false);
  const page = pageTitles[section];

  if (!page) return <Navigate to="/" replace />;

  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "instructor", label: "Course Instructor" },
    { value: "employer", label: "Employer" },
    { value: "admin", label: "Administrator" },
  ];

  const employerUsers = dummyUsers.filter((user) => user.role === "employer");
  const availableRoles = roleOptions.map((option) => option.value);
  const visibleRoles = selectedRoles.length > 0 ? selectedRoles : availableRoles;
  const isFiltered = selectedRoles.length > 0;
  const filteredUsers = useMemo(
    () => dummyUsers.filter((user) => visibleRoles.includes(user.role)),
    [visibleRoles]
  );
  const groupedUsers = useMemo(
    () =>
      selectedRoles
        .map((role) => ({ role, users: dummyUsers.filter((user) => user.role === role) }))
        .filter((group) => group.users.length > 0),
    [selectedRoles]
  );


  return (
    <div>
      <PageHeader
        title={page[0]}
        subtitle={page[1]}
        action={<Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
      />

      {section === "users" && (
        <>
          <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-start lg:justify-between relative">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="blue">{filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}</Badge>
              </div>
            </div>

            <div className="relative">
              <Button variant="secondary" className="inline-flex items-center gap-2" onClick={() => setFilterOpen((open) => !open)}>
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
                  </svg>
                </span>
                Filter by role
              </Button>
              {filterOpen && (
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border bg-bg-base p-3 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-display text-text-primary">Select roles</p>
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
                    onClick={() => setSelectedRoles([])}
                    className="mb-2 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-left text-sm font-sans text-text-secondary hover:border-text-primary hover:text-text-primary"
                  >
                    Clear filter
                  </button>
                  <div className="grid gap-2">
                    {roleOptions.map((roleOption) => (
                      <button
                        key={roleOption.value}
                        type="button"
                        onClick={() => setSelectedRoles((current) =>
                          current.includes(roleOption.value)
                            ? current.filter((role) => role !== roleOption.value)
                            : [...current, roleOption.value]
                        )}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-sans transition-colors ${
                          selectedRoles.includes(roleOption.value)
                            ? "border-accent-blue bg-accent-blue/10 text-text-primary"
                            : "border-border bg-bg-elevated text-text-secondary hover:border-text-primary hover:text-text-primary"
                        }`}
                      >
                        {roleOption.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={() => {
                        setFilterOpen(false);
                        setFiltersAddedOpen(true);
                      }}
                      className="w-full"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>


          <Card className="p-0 overflow-hidden">
            <DataHeader columns={["Full Name", "Email", "Role"]} />
            {isFiltered ? (
              groupedUsers.map(({ role, users }) => (
                <div key={role}>
                  <div className="bg-bg-elevated border-b border-border px-4 py-3">
                    <p className="font-display text-sm text-text-primary">
                      {roleLabels[role]} ({users.length})
                    </p>
                  </div>
                  {users.map((user) => (
                    <DataRow key={`${role}-${user.id}`} columns={3}>
                      <p className="text-sm text-text-primary font-sans truncate">{user.name}</p>
                      <p className="text-sm text-text-secondary font-sans truncate">{user.email}</p>
                      <div>
                        <Badge variant="blue">{roleLabels[user.role]}</Badge>
                      </div>
                    </DataRow>
                  ))}
                </div>
              ))
            ) : (
              filteredUsers.map((user) => (
                <DataRow key={user.id} columns={3}>
                  <p className="text-sm text-text-primary font-sans truncate">{user.name}</p>
                  <p className="text-sm text-text-secondary font-sans truncate">{user.email}</p>
                  <div>
                    <Badge variant="blue">{roleLabels[user.role]}</Badge>
                  </div>
                </DataRow>
              ))
            )}
          </Card>

          <Modal
            isOpen={filtersAddedOpen}
            onClose={() => setFiltersAddedOpen(false)}
            title="Filters were added successfully"
          >
            <p className="text-text-secondary text-sm mb-6">Your filter selection has been applied.</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setFiltersAddedOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setFiltersAddedOpen(false)}>Okay</Button>
            </div>
          </Modal>
        </>
      )}

      {section === "courses" && (
        <Card className="p-0 overflow-hidden">
          <DataHeader columns={["Course Name", "Code", "Linked Projects"]} />
          {courses.map((course) => (
            <DataRow key={course.id} columns={3}>
              <p className="text-sm text-text-primary font-sans">{course.name}</p>
              <p className="text-sm text-text-secondary font-mono">{course.code}</p>
              <Badge variant="blue">{projects.filter((project) => project.courseCode === course.code).length}</Badge>
            </DataRow>
          ))}
        </Card>
      )}

      {section === "projects" && (
        <Card className="p-0 overflow-hidden">
          <DataHeader columns={["Project", "Owner", "Course", "Created"]} />
          {projects.map((project) => (
            <DataRow key={project.id} columns={4}>
              <p className="text-sm text-text-primary font-sans truncate">{project.title}</p>
              <p className="text-sm text-text-secondary font-sans truncate">{project.owner}</p>
              <Badge variant="blue">{project.courseCode}</Badge>
              <p className="text-sm text-text-secondary font-mono">{project.createdAt}</p>
            </DataRow>
          ))}
        </Card>
      )}

      {section === "employers" && (
        <Card className="p-0 overflow-hidden">
          <DataHeader columns={["Company", "Email", "Location", "Status"]} />
          {employerUsers.map((user) => (
            <DataRow key={user.id} columns={4}>
              <p className="text-sm text-text-primary font-sans truncate">{user.companyName || user.name}</p>
              <p className="text-sm text-text-secondary font-sans truncate">{user.companyEmail || user.email}</p>
              <p className="text-sm text-text-secondary font-sans truncate">{user.location || user.address}</p>
              <Badge variant={user.verificationStatus === "approved" ? "success" : "warning"}>{user.verificationStatus || "pending"}</Badge>
            </DataRow>
          ))}
        </Card>
      )}

      {section === "approvals" && (
        <Card className="p-0 overflow-hidden">
          <DataHeader columns={["Employer", "Contact", "Location", "Status"]} />
          {employerApplications.map((application) => (
            <DataRow key={application.id} columns={4}>
              <p className="text-sm text-text-primary font-sans truncate">{application.name}</p>
              <p className="text-sm text-text-secondary font-sans truncate">{application.companyEmail}</p>
              <p className="text-sm text-text-secondary font-sans truncate">{application.location}</p>
              <Badge variant={application.verificationStatus === "pending" ? "warning" : "success"}>{application.verificationStatus}</Badge>
            </DataRow>
          ))}
        </Card>
      )}

      {section === "flagged" && (
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-text-secondary text-sm font-sans">No flagged projects at this time.</p>
            <Badge variant="danger">0 flagged</Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
