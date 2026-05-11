import { Link, useNavigate } from "react-router-dom";
import { getPortfolioOrProfilePathForUser, resolveUserForProfileLink } from "../utils/userPortfolioPath";

function resolveFromProps({ user, participant, ownerName }) {
  if (user) return user;
  if (participant) return resolveUserForProfileLink(participant);
  if (ownerName) return resolveUserForProfileLink({ name: ownerName });
  return null;
}

/**
 * Router link to a user's public portfolio (or `/explore/portfolio/admin-{id}` for administrators).
 */
export function UserProfileLink({ user, participant, ownerName, className = "", children }) {
  const resolved = resolveFromProps({ user, participant, ownerName });
  const label = children ?? resolved?.name ?? participant?.name ?? ownerName ?? "";
  if (!resolved) {
    return <span className={className}>{label}</span>;
  }
  const path = getPortfolioOrProfilePathForUser(resolved);
  if (!path) {
    return <span className={className}>{label}</span>;
  }
  return (
    <Link
      to={path}
      className={`text-inherit hover:text-accent-gold hover:underline ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </Link>
  );
}

/**
 * Same destinations as {@link UserProfileLink}, for use inside buttons/cards where nested links are invalid.
 * Call `e.stopPropagation()` before navigating so parent click handlers do not run.
 */
export function UserProfileNavSpan({
  user,
  participant,
  ownerName,
  className = "",
  children,
  onBeforeNavigate,
}) {
  const navigate = useNavigate();
  const resolved = resolveFromProps({ user, participant, ownerName });
  const label = children ?? resolved?.name ?? participant?.name ?? ownerName ?? "";
  const path = resolved ? getPortfolioOrProfilePathForUser(resolved) : null;

  if (!path) {
    return <span className={className}>{label}</span>;
  }

  return (
    <span
      role="link"
      tabIndex={0}
      className={`cursor-pointer text-inherit hover:text-accent-gold hover:underline ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onBeforeNavigate?.();
        navigate(path);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onBeforeNavigate?.();
          navigate(path);
        }
      }}
    >
      {label}
    </span>
  );
}
