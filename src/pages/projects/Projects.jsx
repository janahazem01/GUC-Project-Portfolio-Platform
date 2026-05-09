import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Stars, Button, PageHeader, Modal, Input, SuccessToast } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";
import { projects } from "../../data/dummy";

const emptyError = "This field cannot be left empty";

export default function Projects() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState(projects);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    course: "",
    courseCode: "",
    description: "",
    languages: "",
    visibility: "",
    createdAt: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const myProjects = projectList.filter((project) => project.owner === user?.name);
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
      visibility: project.visibility,
      createdAt: project.createdAt,
    });
    setErrors({});
    setSuccessMessage("");
  };

  const closeEdit = () => {
    setEditingProject(null);
    setErrors({});
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const nextLanguages = editForm.languages
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean);

    setProjectList((current) =>
      current.map((project) =>
        project.id === editingProject.id
          ? {
              ...project,
              title: editForm.title.trim(),
              course: editForm.course.trim(),
              courseCode: editForm.courseCode.trim(),
              description: editForm.description.trim(),
              languages: nextLanguages,
              visibility: editForm.visibility.trim(),
              createdAt: editForm.createdAt.trim(),
            }
          : project
      )
    );
    closeEdit();
    setSuccessMessage("Edits were made successfully");
  };

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle="Manage and track your submitted projects"
        action={<Button variant="gold">+ New Project</Button>}
      />

      {successMessage && (
        <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
      )}

      <div className="flex flex-col gap-4">
        {myProjects.length > 0 ? (
          myProjects.map((project) => (
            <Card
              key={project.id}
              hover
              className="cursor-pointer"
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-lg text-text-primary">{project.title}</h3>
                    <Badge variant="blue">{project.courseCode}</Badge>
                    <Badge variant={project.visibility === "public" ? "success" : "default"}>{project.visibility}</Badge>
                  </div>
                  <p className="text-text-secondary text-sm font-sans mb-3 max-w-xl">{project.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {project.languages.map((language) => <Badge key={language}>{language}</Badge>)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 ml-6 shrink-0">
                  <Stars rating={project.rating} />
                  <p className="font-mono text-xs text-text-secondary">Created {project.createdAt}</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={(event) => openEdit(event, project)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={(event) => {
                      event.stopPropagation();
                      viewProject(project.id);
                    }}>View</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-text-secondary font-sans">
              {user ? "You do not have any projects yet." : "No active user is available."}
            </p>
          </Card>
        )}
      </div>

      <Modal isOpen={Boolean(editingProject)} onClose={closeEdit} title="Edit Project">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-text-secondary font-sans">Visibility</label>
              <select
                value={editForm.visibility}
                onChange={(event) => updateField("visibility", event.target.value)}
                className="mt-1.5 w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
              >
                <option value="">Select visibility</option>
                <option value="public">public</option>
                <option value="private">private</option>
              </select>
              {errors.visibility && <p className="text-danger text-xs font-sans mt-1">{errors.visibility}</p>}
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
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeEdit}>Cancel</Button>
            <Button type="submit" variant="gold">Done</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
