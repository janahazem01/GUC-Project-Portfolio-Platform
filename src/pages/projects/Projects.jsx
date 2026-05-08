import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Stars, Button, PageHeader, Modal, Input } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { courses } from "../../data/dummy";

// ─── helpers ────────────────────────────────────────────────────────────────
const REQUIRED = "This field cannot be left empty";

const blankForm = () => ({
  title: "",
  courseId: "",
  github: "",
  report: "",
  languages: "",
  demoVideo: "",
  visibility: "public",
});

function validate(form) {
  const errs = {};
  if (!form.title.trim())     errs.title     = REQUIRED;
  if (!form.courseId)         errs.courseId  = REQUIRED;
  if (!form.github.trim())    errs.github    = REQUIRED;
  if (!form.languages.trim()) errs.languages = REQUIRED;
  return errs;
}

// ─── ProjectForm lives OUTSIDE the page component so it never remounts ───────
function ProjectForm({ form, errors, onChange, onSubmit, onCancel, submitLabel }) {
  return (
    <div className="flex flex-col gap-4">

      {/* Title */}
      <div>
        <Input
          label="Project Title *"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Smart Campus Navigator"
        />
        {errors.title && <p className="text-danger text-xs font-sans mt-1">{errors.title}</p>}
      </div>

      {/* Course */}
      <div>
        <label className="text-sm text-text-secondary font-sans">Course *</label>
        <select
          value={form.courseId}
          onChange={(e) => onChange("courseId", e.target.value)}
          className="mt-1.5 w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                     text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue transition-colors"
        >
          <option value="">Select a course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
        {errors.courseId && <p className="text-danger text-xs font-sans mt-1">{errors.courseId}</p>}
      </div>

      {/* GitHub */}
      <div>
        <Input
          label="GitHub Link *"
          value={form.github}
          onChange={(e) => onChange("github", e.target.value)}
          placeholder="https://github.com/..."
        />
        {errors.github && <p className="text-danger text-xs font-sans mt-1">{errors.github}</p>}
      </div>

      {/* Languages */}
      <div>
        <Input
          label="Programming Languages *"
          value={form.languages}
          onChange={(e) => onChange("languages", e.target.value)}
          placeholder="React, Node.js, Python"
        />
        <p className="text-text-secondary text-xs font-sans mt-1">Separate with commas</p>
        {errors.languages && <p className="text-danger text-xs font-sans mt-1">{errors.languages}</p>}
      </div>

      {/* Demo video */}
      <div>
        <Input
          label="Demo Video URL"
          value={form.demoVideo}
          onChange={(e) => onChange("demoVideo", e.target.value)}
          placeholder="https://youtube.com/..."
        />
        <p className="text-text-secondary text-xs font-sans mt-1">Optional</p>
      </div>

      {/* Report */}
      <div>
        <Input
          label="Project Report Name"
          value={form.report}
          onChange={(e) => onChange("report", e.target.value)}
          placeholder="e.g. MyProject_Report.pdf"
        />
        <p className="text-text-secondary text-xs font-sans mt-1">Optional — not uploaded, just labeled</p>
      </div>

      {/* Req 20 — visibility */}
      <div>
        <label className="text-sm text-text-secondary font-sans">Portfolio Visibility *</label>
        <div className="mt-2 flex gap-3">
          {["public", "private"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange("visibility", v)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-sans border transition-all ${
                form.visibility === v
                  ? v === "public"
                    ? "bg-success/10 border-success text-success"
                    : "bg-bg-elevated border-accent-blue text-text-primary"
                  : "border-border text-text-secondary hover:border-accent-blue/50"
              }`}
            >
              {v === "public" ? "🌐 Public" : "🔒 Private"}
            </button>
          ))}
        </div>
        <p className="text-text-secondary text-xs font-sans mt-1">
          Public projects appear on your portfolio.
        </p>
      </div>

      <p className="text-text-secondary text-xs font-sans">
        * Creation date is set automatically by the system.
      </p>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="button" variant="gold" onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  );
}

// ─── Page component ──────────────────────────────────────────────────────────
export default function Projects() {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();
  const { projectList, addProject, updateProject, deleteProject, toggleVisibility } = useProjects();

  const [modal,         setModal]         = useState(null);   // null | { mode, project? }
  const [form,          setForm]          = useState(blankForm());
  const [errors,        setErrors]        = useState({});
  const [successMsg,    setSuccessMsg]    = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Req 21 — view list of MY projects
  const myProjects = projectList.filter((p) => p.owner === user?.name);

  const viewProject = (id) => navigate(`/projects/${id}`);

  // ── open modals ────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(blankForm());
    setErrors({});
    setSuccessMsg("");
    setModal({ mode: "create" });
  };

  const openEdit = (e, project) => {
    e.stopPropagation();
    const courseObj = courses.find((c) => c.name === project.course);
    setForm({
      title:      project.title,
      courseId:   courseObj ? String(courseObj.id) : "",
      github:     project.github    || "",
      report:     project.report    || "",
      languages:  project.languages.join(", "),
      demoVideo:  project.demoVideo || "",
      visibility: project.visibility || "public",
    });
    setErrors({});
    setSuccessMsg("");
    setModal({ mode: "edit", project });
  };

  const closeModal = () => { setModal(null); setErrors({}); };

  // ── field change ───────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── CRUD ───────────────────────────────────────────────────────────
  const handleCreate = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const course = courses.find((c) => c.id === Number(form.courseId));
    addProject({
      id:          Date.now(),
      title:       form.title.trim(),
      course:      course?.name || "",
      courseCode:  course?.code || "",
      owner:       user?.name,
      supervisor:  "",
      status:      "In Progress",
      github:      form.github.trim(),
      demo:        form.demoVideo.trim() || null,
      report:      form.report.trim()    || null,
      demoVideo:   form.demoVideo.trim() || null,
      languages:   form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      team:        [user?.name],
      rating:      0,
      visibility:  form.visibility,
      createdAt:   new Date().toISOString().slice(0, 10),
      description: "",
      problem:     "",
      solution:    "",
      features:    [],
      outcomes:    [],
      resources:   [{ label: "Project Repository", url: form.github.trim() }],
    });
    closeModal();
    setSuccessMsg("Project created successfully.");
  };

  const handleUpdate = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const course = courses.find((c) => c.id === Number(form.courseId));
    updateProject(modal.project.id, {
      title:      form.title.trim(),
      course:     course?.name     || modal.project.course,
      courseCode: course?.code     || modal.project.courseCode,
      github:     form.github.trim(),
      report:     form.report.trim()    || modal.project.report,
      demoVideo:  form.demoVideo.trim() || modal.project.demoVideo,
      demo:       form.demoVideo.trim() || modal.project.demo,
      languages:  form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      visibility: form.visibility,
    });
    closeModal();
    setSuccessMsg("Project updated successfully.");
  };

  const handleDelete = () => {
    deleteProject(deleteConfirm.id);
    setDeleteConfirm(null);
    setSuccessMsg("Project deleted.");
  };

  // ── render ─────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle="Manage and track your submitted projects"
        action={
          user?.role === "student" && (
            <Button variant="gold" onClick={openCreate}>+ New Project</Button>
          )
        }
      />

      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-success/40 bg-success/10">
          <p className="text-success text-sm font-sans">{successMsg}</p>
        </div>
      )}

      {/* Req 21 — list of all my projects */}
      <div className="flex flex-col gap-4">
        {myProjects.length > 0 ? (
          myProjects.map((project) => (
            <Card
              key={project.id}
              hover
              className="cursor-pointer"
              onClick={() => viewProject(project.id)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-display text-lg text-text-primary">{project.title}</h3>
                    <Badge variant="blue">{project.courseCode}</Badge>

                    {/* Req 20 & 22 — visibility badge + quick toggle */}
                    <Badge variant={project.visibility === "public" ? "success" : "default"}>
                      {project.visibility === "public" ? "🌐 public" : "🔒 private"}
                    </Badge>
                    {user?.role === "student" && project.owner === user?.name && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleVisibility(project.id); }}
                        className="text-xs font-mono text-text-secondary hover:text-accent-blue underline transition-colors"
                      >
                        {project.visibility === "public" ? "Hide from portfolio" : "Show on portfolio"}
                      </button>
                    )}
                  </div>

                  <p className="text-text-secondary text-sm font-sans mb-2">{project.course}</p>

                  {project.description && (
                    <p className="text-text-secondary text-sm font-sans mb-3 max-w-xl line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {project.languages.map((lang) => (
                      <Badge key={lang}>{lang}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-blue text-xs font-mono hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        GitHub ↗
                      </a>
                    )}
                    {project.demoVideo && (
                      <a
                        href={project.demoVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-gold text-xs font-mono hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Demo Video ▶
                      </a>
                    )}
                    {project.report && (
                      <span className="text-text-secondary text-xs font-mono">
                        📄 {project.report}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <Stars rating={project.rating} />
                  <p className="font-mono text-xs text-text-secondary">
                    Created {project.createdAt}
                  </p>
                  {user?.role === "student" && project.owner === user?.name && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => openEdit(e, project)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(project); }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); viewProject(project.id); }}
                      >
                        View
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-text-secondary font-sans">
              You have no projects yet. Click &ldquo;+ New Project&rdquo; to get started.
            </p>
          </Card>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={modal?.mode === "create"} onClose={closeModal} title="Create New Project">
        <ProjectForm
          form={form}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleCreate}
          onCancel={closeModal}
          submitLabel="Create Project"
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={modal?.mode === "edit"} onClose={closeModal} title="Edit Project">
        <ProjectForm
          form={form}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleUpdate}
          onCancel={closeModal}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Project"
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary font-sans text-sm">
            Are you sure you want to delete{" "}
            <span className="text-text-primary font-semibold">{deleteConfirm?.title}</span>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
