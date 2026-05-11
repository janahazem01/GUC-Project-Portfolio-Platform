import { useId } from "react";

/** Same decorative sparkline as the admin dashboard Statistics cards (area + stroke). */
export function MiniSparkline() {
  const gid = useId().replace(/:/g, "");
  const fillUrl = `url(#spark-fill-${gid})`;
  return (
    <svg width="76" height="30" viewBox="0 0 80 32" className="shrink-0 opacity-95 text-inherit" aria-hidden>
      <defs>
        <linearGradient id={`spark-fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.38" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 2 26 L 2 19 C 18 17, 34 11, 78 5 L 78 26 Z" fill={fillUrl} />
      <path d="M 2 19 C 18 17, 34 11, 78 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconUsersAccent({ className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconProjectsAccent({ className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
      <path d="M12 11.25L20 6.75M12 11.25v8.5M12 11.25L4 6.75" />
    </svg>
  );
}

export function IconCoursesAccent({ className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h6" />
      <path d="M12 14v7M9 18l3 3 3-3" />
    </svg>
  );
}

export function IconInternshipsAccent({ className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21h18M5 21V7l7-3 7 3v14" />
      <path d="M9 9v4M15 9v4" />
      <path d="M8 14h8v7H8z" />
      <path d="M10 17h4" />
    </svg>
  );
}
