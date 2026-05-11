import { Link } from "react-router-dom";

/**
 * Renders a project title as a link to `/projects/:id`.
 * Default: stops click propagation so this works inside cards/table rows that have their own click handlers.
 */
export function ProjectTitleLink({
  project,
  projectId,
  children,
  className = "",
  navState,
  stopPropagation = true,
}) {
  const id = projectId ?? project?.id;
  const text = children ?? project?.title;
  if (id == null) {
    return <span className={className}>{text ?? ""}</span>;
  }
  return (
    <Link
      to={`/projects/${id}`}
      state={navState}
      className={`inline text-inherit hover:text-accent-gold hover:underline ${className}`.trim()}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {text}
    </Link>
  );
}
