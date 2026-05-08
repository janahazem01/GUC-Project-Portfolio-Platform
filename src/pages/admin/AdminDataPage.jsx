import { useMemo, useState } from "react";
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

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "instructor", label: "Course Instructor" },
  { value: "employer", label: "Employer" },
  { value: "admin", label: "Administrator" },
];

function DataHeader({ columns, style, alignments = [] }) {
  return (
    <div className="grid gap-4 border-b border-border px-4 py-4 items-center" style={style ?? { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
      {columns.map((column, index) => (
        <p
          key={column}
          className={`font-mono text-[11px] uppercase tracking-widest text-text-secondary ${alignments[index] || "text-left"}`}
        >
          {column}
        </p>
      ))}
    </div>
  );
}

function DataRow({ children, columns, style }) {
  return (
    <div className="grid gap-4 px-4 py-5 items-center border-b border-border last:border-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }}>
      {children}
    </div>
  );
}

export default function AdminDataPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtersAddedOpen, setFiltersAddedOpen] = useState(false);
  const [courseList, setCourseList] = useState([...courses]);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseAction, setCourseAction] = useState("create");
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ name: "", code: "" });
  const [courseErrors, setCourseErrors] = useState({});
  const [courseConfirmOpen, setCourseConfirmOpen] = useState(false);
  const [courseDeleteOpen, setCourseDeleteOpen] = useState(false);
  const [courseSuccessOpen, setCourseSuccessOpen] = useState(false);
  const [courseSuccessMessage, setCourseSuccessMessage] = useState("");
  const page = pageTitles[section];

  const employerUsers = dummyUsers.filter((user) => user.role === "employer");
  const isFiltered = Boolean(selectedRole);
  const filteredUsers = useMemo(() => {
    const availableRoles = roleOptions.map((option) => option.value);
    const visibleRoles = selectedRole ? [selectedRole] : availableRoles;
    return dummyUsers.filter((user) => visibleRoles.includes(user.role));
  }, [selectedRole]);
  const groupedUsers = useMemo(() => (
    selectedRole
      ? [{ role: selectedRole, users: dummyUsers.filter((user) => user.role === selectedRole) }]
      : []
  ), [selectedRole]);

  if (!page) return <Navigate to="/" replace />;

  const resetCourseForm = () => {
    setCourseForm({ name: "", code: "" });
    setCourseErrors({});
    setEditingCourse(null);
    setCourseAction("create");
  };

  const openCourseModal = (action, course = null) => {
    if (action === "edit" && course) {
      setCourseAction("edit");
      setEditingCourse(course);
      setCourseForm({ name: course.name, code: course.code });
    } else {
      resetCourseForm();
      setCourseAction("create");
    }
    setCourseModalOpen(true);
  };

  const validateCourseForm = () => {
    const errors = {};
    if (!courseForm.name.trim()) errors.name = "Course name is required.";
    if (!courseForm.code.trim()) errors.code = "Course code is required.";
    setCourseErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCourseSave = (event) => {
    event.preventDefault();
    if (!validateCourseForm()) return;
    setCourseConfirmOpen(true);
  };

  const applyCourseSave = () => {
    if (courseAction === "create") {
      const id = courseList.length ? Math.max(...courseList.map((course) => course.id)) + 1 : 1;
      const newCourse = { id, name: courseForm.name.trim(), code: courseForm.code.trim() };
      courses.push(newCourse);
      setCourseList([...courseList, newCourse]);
      setCourseSuccessMessage("Course created successfully.");
    } else if (editingCourse) {
      const updatedCourse = { ...editingCourse, name: courseForm.name.trim(), code: courseForm.code.trim() };
      const nextList = courseList.map((course) => (course.id === editingCourse.id ? updatedCourse : course));
      const index = courses.findIndex((course) => course.id === editingCourse.id);
      if (index !== -1) courses[index] = updatedCourse;
      setCourseList(nextList);
      setCourseSuccessMessage("Course updated successfully.");
    }

    setCourseConfirmOpen(false);
    setCourseModalOpen(false);
    setCourseSuccessOpen(true);
  };

  const handleCourseDelete = (course) => {
    setEditingCourse(course);
    setCourseDeleteOpen(true);
  };

  const confirmCourseDelete = () => {
    if (!editingCourse) return;
    setCourseList(courseList.filter((course) => course.id !== editingCourse.id));
    const index = courses.findIndex((course) => course.id === editingCourse.id);
    if (index !== -1) courses.splice(index, 1);
    setCourseDeleteOpen(false);
    setCourseSuccessMessage("Course deleted successfully.");
    setCourseSuccessOpen(true);
  };

  const closeCourseModals = () => {
    setCourseModalOpen(false);
    setCourseConfirmOpen(false);
    setCourseDeleteOpen(false);
    setCourseErrors({});
  };

  const courseHeaderAction = (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      <Button onClick={() => openCourseModal("create")}>+ Create Course</Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4">
      <PageHeader
        title={page[0]}
        subtitle={page[1]}
        action={section === "courses" ? courseHeaderAction : <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
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
                {selectedRole ? `Filter: ${roleLabels[selectedRole]}` : "Filter by role"}
              </Button>
              {filterOpen && (
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border bg-bg-base p-3 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-display text-text-primary">Select role</p>
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
                      setSelectedRole("");
                      setFilterOpen(false);
                    }}
                    className="mb-2 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-left text-sm font-sans text-text-secondary hover:border-text-primary hover:text-text-primary"
                  >
                    Clear filter
                  </button>
                  <div className="grid gap-2">
                    {roleOptions.map((roleOption) => (
                      <button
                        key={roleOption.value}
                        type="button"
                        onClick={() => {
                          setSelectedRole(roleOption.value);
                          setFilterOpen(false);
                          setFiltersAddedOpen(true);
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-sans transition-colors ${
                          selectedRole === roleOption.value
                            ? "border-accent-blue bg-accent-blue/10 text-text-primary"
                            : "border-border bg-bg-elevated text-text-secondary hover:border-text-primary hover:text-text-primary"
                        }`}
                      >
                        {roleOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>


          <Card className="p-0 overflow-hidden">
            <div className="grid gap-4 border-b border-border px-4 py-4 bg-bg-elevated/50 items-center" style={{ gridTemplateColumns: "2.6fr 2.3fr 1.4fr 1.1fr" }}>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Full Name</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Email</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Role</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Status</p>
            </div>
            {isFiltered ? (
              groupedUsers.map(({ role, users }) => (
                <div key={role}>
                  <div className="bg-bg-elevated border-b border-border px-4 py-3">
                    <p className="font-display text-sm text-text-primary">
                      {roleLabels[role]} ({users.length})
                    </p>
                  </div>
                  {users.map((user) => (
                    <DataRow key={`${role}-${user.id}`} columns={4} style={{ gridTemplateColumns: "2.6fr 2.3fr 1.4fr 1.1fr" }}>
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
                    </DataRow>
                  ))}
                </div>
              ))
            ) : (
              filteredUsers.map((user) => (
                <DataRow key={user.id} columns={4} style={{ gridTemplateColumns: "2.6fr 2.3fr 1.4fr 1.1fr" }}>
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
        <>
          <div className="w-full">
            <Card className="p-0 overflow-hidden">
              <DataHeader
                columns={["Course Name", "Code", "Linked Projects", "Actions"]}
                style={{ gridTemplateColumns: "2.7fr 1.6fr 1.2fr 1fr" }}
                alignments={["text-left", "text-left", "text-center", "text-center"]}
              />
              {courseList.map((course) => (
                <DataRow key={course.id} columns={4} style={{ gridTemplateColumns: "2.7fr 1.6fr 1.2fr 1fr" }}>
                  <div className="truncate text-left">
                    <p className="text-sm text-text-primary font-semibold truncate">{course.name}</p>
                  </div>
                  <div className="truncate text-left">
                    <p className="text-sm text-text-secondary font-mono truncate">{course.code}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge variant="blue">{projects.filter((project) => project.courseCode === course.code).length}</Badge>
                  </div>
                  <div className="flex gap-2 justify-center w-full">
                    <Button size="sm" onClick={() => openCourseModal("edit", course)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleCourseDelete(course)}>
                      Delete
                    </Button>
                  </div>
                </DataRow>
              ))}
            </Card>
          </div>

          <Modal isOpen={courseModalOpen} onClose={closeCourseModals} title={courseAction === "edit" ? "Edit Course" : "Create Course"}>
            <form onSubmit={handleCourseSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary font-sans">Course Name</label>
                <input
                  value={courseForm.name}
                  onChange={(e) => setCourseForm((current) => ({ ...current, name: e.target.value }))}
                  className={`w-full rounded-lg border px-4 py-2.5 text-text-primary bg-bg-elevated focus:outline-none focus:border-accent-blue transition ${courseErrors.name ? "border-danger" : "border-border"}`}
                />
                {courseErrors.name && <p className="text-danger text-sm">{courseErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary font-sans">Course Code</label>
                <input
                  value={courseForm.code}
                  onChange={(e) => setCourseForm((current) => ({ ...current, code: e.target.value }))}
                  className={`w-full rounded-lg border px-4 py-2.5 text-text-primary bg-bg-elevated focus:outline-none focus:border-accent-blue transition ${courseErrors.code ? "border-danger" : "border-border"}`}
                />
                {courseErrors.code && <p className="text-danger text-sm">{courseErrors.code}</p>}
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={closeCourseModals}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Modal>

          <Modal isOpen={courseConfirmOpen} onClose={() => setCourseConfirmOpen(false)} title="Confirm action">
            <p className="text-text-secondary text-sm mb-6">
              Are you sure you want to {courseAction === "edit" ? "save changes to" : "create"} this course?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setCourseConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={applyCourseSave}>Yes</Button>
            </div>
          </Modal>

          <Modal isOpen={courseDeleteOpen} onClose={() => setCourseDeleteOpen(false)} title="Delete course">
            <p className="text-text-secondary text-sm mb-6">
              Are you sure you want to delete {editingCourse?.name}?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setCourseDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmCourseDelete}>Yes</Button>
            </div>
          </Modal>

          <Modal isOpen={courseSuccessOpen} onClose={() => setCourseSuccessOpen(false)} title="Success">
            <p className="text-text-secondary text-sm mb-6">{courseSuccessMessage}</p>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setCourseSuccessOpen(false)}>Okay</Button>
            </div>
          </Modal>
        </>
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
