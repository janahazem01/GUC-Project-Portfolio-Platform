import { useEffect, useState } from "react";
import { readDoNotDisturb } from "../utils/doNotDisturb";

/** True when Do not disturb is on for roles that support it (student, employer, instructor). */
export function useDoNotDisturb(user) {
  const applies = ["student", "employer", "instructor"].includes(user?.role);
  const [on, setOn] = useState(() => applies && readDoNotDisturb());

  useEffect(() => {
    if (!applies) {
      setOn(false);
      return undefined;
    }
    const sync = () => setOn(readDoNotDisturb());
    window.addEventListener("storage", sync);
    window.addEventListener("guc-dnd-changed", sync);
    sync();
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("guc-dnd-changed", sync);
    };
  }, [applies]);

  return applies && on;
}
