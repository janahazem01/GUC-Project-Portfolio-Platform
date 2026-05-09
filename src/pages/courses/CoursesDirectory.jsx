import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Input, Modal, PageHeader } from "../../components/ui";
import {
  courses,
  createCourseRecord,
  deleteCourseRecord,
  projects,
  subscribeDummyUpdates,
  updateCourseRecord,
} from "../../data/dummy";

export default function CoursesDirectory() {
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);
  const bump = () => setRevision((r) => r + 1);

  useEffect(() => subscribeDummyUpdates(bump), []);

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => a.code.localeCompare(b.code)),
    [revision]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [formErrors, setFormErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm({ name: "", code: "" });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (course) => {
    setMode("edit");
    setEditingId(course.id);
    setForm({ name: course.name, code: course.code });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setConfirmOpen(false);
    setFormErrors({});
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Course name is required.";
    if (!form.code.trim()) err.code = "Course code is required.";
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const submitForm = (event) => {
    event.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const applySave = () => {
    if (mode === "create") {
      const result = createCourseRecord(form.name, form.code);
      if (!result.ok) {
        setFeedback({ variant: "error", message: result.error });
        setConfirmOpen(false);
        return;
      }
      setFeedback({ variant: "ok", message: "Course created." });
    } else if (editingId != null) {
      const result = updateCourseRecord(editingId, form.name, form.code);
      if (!result.ok) {
        setFeedback({ variant: "error", message: result.error });
        setConfirmOpen(false);
        return;
      }
      setFeedback({ variant: "ok", message: "Course updated." });
    }
    setConfirmOpen(false);
    closeModal();
    bump();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const result = deleteCourseRecord(deleteTarget.id);
    if (!result.ok) {
      setFeedback({ variant: "error", message: result.error });
    } else {
      setFeedback({ variant: "ok", message: "Course removed from the catalog." });
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
    bump();
  };

  const linkedCount = (code) =>
    projects.filter((project) => project.courseCode === code).length;

  return (
    <div className="mx-auto max-w-5xl px-4">
      <PageHeader
        title="Courses"
        subtitle="Create, edit, or remove catalog entries. Every course has a display name and a unique course code."
        action={
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button onClick={openCreate}>+ Add course</Button>
          </div>
        }
      />

      {feedback && (
        <Card
          className={`mb-6 ${
            feedback.variant === "error"
              ? "border-danger/50 bg-danger/10"
              : "border-success/40 bg-success/10"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p
              className={`text-sm font-sans ${
                feedback.variant === "error" ? "text-danger" : "text-success"
              }`}
            >
              {feedback.message}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setFeedback(null)}>
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border bg-bg-elevated/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue">{sortedCourses.length} courses</Badge>
            <span className="text-text-secondary text-sm font-sans">
              Name and code appear everywhere projects and instructors reference the catalog.
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-base">
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal">
                  Course name
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal w-[9rem]">
                  Code
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[7rem]">
                  Projects
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-right w-[11rem]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCourses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-border last:border-0 hover:bg-bg-elevated/25 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-gold/40 text-xs font-mono text-accent-gold">
                        {course.code.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-display text-sm text-text-primary truncate">
                        {course.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="blue">{course.code}</Badge>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-mono text-sm text-text-secondary">{linkedCount(course.code)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(course)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setDeleteTarget(course);
                          setDeleteOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedCourses.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-text-secondary font-sans">
            No courses yet. Use &quot;Add course&quot; to create the first entry.
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={mode === "edit" ? "Edit course" : "New course"}
      >
        <form onSubmit={submitForm} className="space-y-5">
          <Input
            label="Course name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formErrors.name}
          />
          <Input
            label="Course code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="e.g. CSEN401"
            error={formErrors.code}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">{mode === "edit" ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm">
        <p className="text-text-secondary text-sm font-sans mb-6">
          {mode === "edit"
            ? "Save changes to this course?"
            : "Add this course to the catalog?"}
        </p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={applySave}>
            Confirm
          </Button>
        </div>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete course">
        <p className="text-text-secondary text-sm font-sans mb-6">
          Remove <span className="text-text-primary font-medium">{deleteTarget?.name}</span> ({deleteTarget?.code}
          ) from the catalog? Linked projects keep their stored course code in data.
        </p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
