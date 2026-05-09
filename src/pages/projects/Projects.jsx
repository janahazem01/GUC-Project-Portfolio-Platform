import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Stars, Button, PageHeader, Modal, Input, SuccessToast, ConfirmActionModal } from "../../components/ui";
import { MiniDonutChart } from "../../components/viz/Charts.jsx";
import { CHART_COLORS } from "../../components/viz/chartColors.js";
import { AuthContext } from "../../context/AuthContext";
import { emitDummyUpdate, projects, subscribeDummyUpdates } from "../../data/dummy";

const emptyError = "This field cannot be left empty";

export default function Projects() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rev, setRev] = useState(0);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    course: "",
    courseCode: "",
    description: "",
    languages: "",
    createdAt: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  useEffect(() => subscribeDummyUpdates(() => setRev((r) => r + 1)), []);

  const myProjects = useMemo(
    () => projects.filter((project) => project.owner === user?.name),
    [user?.name, rev]
  );

  const languageInsights = useMemo(() => {
    const tallies = {};
    myProjects.forEach((project) => {
      project.languages.forEach((lang) => {
        tallies[lang] = (tallies[lang] || 0) + 1;
      });
    });
    const total = Object.values(tallies).reduce((acc, count) => acc + count, 0);
    const sorted = Object.entries(tallies)
      .sort((a, b) => b[1] - a[1])
      .map(([language, count], index) => ({
        language,
        count,
        pct: total ? Math.round((count / total) * 100) : 0,
        key: language,
        label: language,
        value: count,
        sliceIndex: index,
      }));
    return { total, sorted };
  }, [myProjects]);

  const viewProject = (projectId) => navigate(`/projects/${projectId}`, { state: { activeNav: "/projects" } });

  const openEdit = (event, project) => {
    event.stopPropagation();
    setEditingProject(project);
    setEditForm({
      title: project.title,
      course: project.course,
      courseCode: project.courseCode,
      description: project.description,
      languages: project.languages.join(", "),
      createdAt: project.createdAt,
    });
    setErrors({});
    setSuccessMessage("");
  };

  const closeEdit = () => {
    setEditingProject(null);
    setErrors({});
    setSaveConfirmOpen(false);
  };

  const updateField = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
    if (errors[field] && value.trim()) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    Object.entries(editForm).forEach(([field, value]) => {
      if (!value.trim()) {
        nextErrors[field] = emptyError;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaveConfirmOpen(true);
  };

  const applyEdit = () => {
    if (!editingProject) return;
    const target = projects.find((p) => p.id === editingProject.id);
    if (!target) return;
    const nextLanguages = editForm.languages
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean);

    Object.assign(target, {
      title: editForm.title.trim(),
      course: editForm.course.trim(),
      courseCode: editForm.courseCode.trim(),
      description: editForm.description.trim(),
      languages: nextLanguages,
      createdAt: editForm.createdAt.trim(),
    });
    emitDummyUpdate();
    closeEdit();
    setSuccessMessage("Edits were made successfully");
  };

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle="Manage and track your submitted projects"
        action={
          <div className="flex flex-wrap items-center gap-2 justify-end">
            {user?.role === "student" && (
              <Button type="button" variant="secondary" onClick={() => navigate("/")}>
                Back
              </Button>
            )}
            <Button variant="gold">+ New Project</Button>
          </div>
        }
      />

      {successMessage && (
        <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
      )}

      {user?.role === "student" && myProjects.length > 0 && (
        <div className="space-y-4 mb-8">
          <Card>
            <h2 className="font-display text-base text-text-primary mb-1">Programming languages across projects</h2>
            <p className="text-xs text-text-secondary font-sans mb-4 leading-snug">
              Percentages reflect how often each language appears across your project stack lists (sums to 100% of all language mentions).
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <MiniDonutChart
                segments={languageInsights.sorted.map((segment, i) => ({
                  key: segment.key,
                  label: segment.language,
                  value: segment.value,
                  color: CHART_COLORS[i % CHART_COLORS.length],
                }))}
                size={150}
              />
              <ul className="flex-1 space-y-2 min-w-0">
                {languageInsights.sorted.map((segment) => (
                  <li key={segment.language} className="flex items-center justify-between gap-3 text-sm font-sans">
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[segment.sliceIndex % CHART_COLORS.length] }}
                        aria-hidden
                      />
                      <span className="text-text-primary truncate">{segment.language}</span>
                    </span>
                    <span className="text-text-secondary font-mono tabular-nums shrink-0">{segment.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          <Card>
            <h2 className="font-display text-base text-text-primary mb-1">Top collaborators per project</h2>
            <p className="text-xs text-text-secondary font-sans mb-4">Teammates listed on each of your projects (excluding you).</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {myProjects.map((project) => (
                <div key={project.id} className="rounded-lg border border-border bg-bg-elevated/40 px-4 py-3">
                  <h3 className="font-display text-sm text-text-primary mb-2 line-clamp-2">{project.title}</h3>
                  <div className="flex flex-wrap gap-1">
                    {project.team
                      .filter((member) => member !== user?.name)
                      .map((collaborator) => (
                        <Badge key={collaborator} variant="blue" className="text-xs">
                          {collaborator}
                        </Badge>
                      ))}
                    {project.team.filter((member) => member !== user?.name).length === 0 && (
                      <span className="text-xs text-text-secondary font-sans">No other collaborators listed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {myProjects.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-base">
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal min-w-[10rem]">
                    Projects ({myProjects.length})
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal w-[7rem]">
                    Course
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[8rem]">
                    Status
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[6rem]">
                    Rating
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[8.5rem]">
                    Created
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-right w-[11rem]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {myProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-border last:border-0 hover:bg-bg-elevated/20 transition-colors cursor-pointer align-middle"
                    onClick={() => viewProject(project.id)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        viewProject(project.id);
                      }
                    }}
                  >
                    <td className="px-4 py-4">
                      <p className="font-display text-sm text-text-primary break-words">{project.title}</p>
                      <p className="text-text-secondary text-xs font-sans mt-1 line-clamp-2 max-w-md">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.languages.map((language) => (
                          <Badge key={language}>{language}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="blue">{project.courseCode}</Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={project.flagged ? "danger" : "success"}>
                        {project.flagged ? "Flagged" : "Not flagged"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Stars rating={project.rating} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-mono text-xs text-text-secondary whitespace-nowrap">{project.createdAt}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" size="sm" onClick={(event) => openEdit(event, project)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            viewProject(project.id);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-text-secondary font-sans">
            {user ? "You do not have any projects yet." : "No active user is available."}
          </p>
        </Card>
      )}

      <Modal isOpen={Boolean(editingProject)} onClose={closeEdit} title="Edit Project">
        <form className="flex flex-col gap-4" onSubmit={handleFormSubmit} noValidate>
          <div>
            <Input
              label="Project Title"
              value={editForm.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
            {errors.title && <p className="text-danger text-xs font-sans mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Course"
                value={editForm.course}
                onChange={(event) => updateField("course", event.target.value)}
              />
              {errors.course && <p className="text-danger text-xs font-sans mt-1">{errors.course}</p>}
            </div>
            <div>
              <Input
                label="Course Code"
                value={editForm.courseCode}
                onChange={(event) => updateField("courseCode", event.target.value)}
              />
              {errors.courseCode && <p className="text-danger text-xs font-sans mt-1">{errors.courseCode}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm text-text-secondary font-sans">Description</label>
            <textarea
              value={editForm.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="mt-1.5 min-h-24 w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors resize-none"
            />
            {errors.description && <p className="text-danger text-xs font-sans mt-1">{errors.description}</p>}
          </div>

          <div>
            <Input
              label="Languages"
              value={editForm.languages}
              onChange={(event) => updateField("languages", event.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
            {errors.languages && <p className="text-danger text-xs font-sans mt-1">{errors.languages}</p>}
          </div>

          <div>
            <Input
              label="Creation Date"
              type="date"
              value={editForm.createdAt}
              onChange={(event) => updateField("createdAt", event.target.value)}
            />
            {errors.createdAt && <p className="text-danger text-xs font-sans mt-1">{errors.createdAt}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeEdit}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Done
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmActionModal
        isOpen={saveConfirmOpen}
        action="save these changes to your project"
        variant="gold"
        onClose={() => setSaveConfirmOpen(false)}
        onConfirm={() => {
          applyEdit();
          setSaveConfirmOpen(false);
        }}
      />
    </div>
  );
}
