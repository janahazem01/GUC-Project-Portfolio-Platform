// import { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button, Input, SuccessToast } from "../../components/ui";
// import { AuthContext } from "../../context/AuthContext";

// function GpMark({ className = "" }) {
//   return (
//     <div
//       className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-accent-gold/60 bg-gradient-to-br from-accent-gold/25 via-bg-elevated to-bg-base shadow-lg shadow-black/30 ${className}`}
//       aria-hidden
//     >
//       <span className="font-display text-xl font-semibold tracking-tight text-accent-gold leading-none">G</span>
//       <span className="font-display text-xl font-semibold tracking-tight text-text-primary leading-none -ml-0.5">P</span>
//     </div>
//   );
// }

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [fieldErrors, setFieldErrors] = useState({});
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const validate = () => {
//     const errors = {};
//     if (!email.trim()) {
//       errors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       errors.email = "Please enter a valid email address";
//     }
//     if (!password) {
//       errors.password = "Password is required";
//     }
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleLogin = (e) => {
//     e.preventDefault();
//     setError("");
//     setFieldErrors({});

//     if (!validate()) return;

//     const result = login(email, password);
//     if (result.success) {
//       setSuccess("Logged in successfully! Redirecting...");
//       setTimeout(() => {
//         navigate("/");
//       }, 1000);
//     } else {
//       setError(result.error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-bg-base flex">
//       {/* Left panel */}
//       <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-bg-surface border-r border-border flex-col justify-between p-12">
//         <div
//           className="pointer-events-none absolute inset-0 opacity-[0.12]"
//           style={{
//             backgroundImage:
//               "radial-gradient(circle at 20% 20%, rgb(var(--c-accent-gold)) 0%, transparent 42%), radial-gradient(circle at 80% 10%, rgb(var(--c-accent-blue)) 0%, transparent 38%), linear-gradient(160deg, transparent 40%, rgb(var(--c-bg-base)) 100%)",
//           }}
//         />
//         <div
//           className="pointer-events-none absolute inset-0 opacity-[0.07]"
//           style={{
//             backgroundImage:
//               "linear-gradient(rgb(var(--c-text-primary)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--c-text-primary)) 1px, transparent 1px)",
//             backgroundSize: "28px 28px",
//           }}
//         />

//         <div className="relative z-10 flex items-start gap-4">
//           <GpMark />
//           <div>
//             <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-accent-gold/90 mb-1">Portal</p>
//             <p className="font-display text-sm text-text-primary">GUC Portfolio</p>
//           </div>
//         </div>

//         <div className="relative z-10">
//           <h1 className="font-display text-5xl text-text-primary leading-tight mb-4">
//             Showcase what<br />you&apos;ve built.
//           </h1>
//           <p className="text-text-secondary font-sans text-base max-w-sm leading-relaxed">
//             A home for every GUC project — from first-year labs to bachelor theses.
//           </p>
//         </div>

//         {/* Demo credentials — themed panel */}
//         <div className="relative z-10 rounded-2xl border border-accent-gold/25 bg-gradient-to-br from-bg-base/90 via-bg-elevated/80 to-[rgb(12,18,32)]/95 p-5 shadow-inner overflow-hidden">
//           <div
//             className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-gold/15 blur-2xl"
//             aria-hidden
//           />
//           <div
//             className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-accent-blue/10 blur-2xl"
//             aria-hidden
//           />
//           <div className="relative flex items-center gap-3 mb-3">
//             <GpMark className="!h-10 !w-10 !rounded-xl" />
//             <p className="font-display text-sm text-text-primary">Demo access</p>
//           </div>
//           <p className="font-bold text-accent-gold text-xs font-mono mb-3 tracking-wide">Credentials</p>
//           <div className="space-y-1.5 text-text-secondary text-xs font-mono leading-relaxed">
//             <p>📚 Student: ahmed.elsayed@student.guc.edu.eg</p>
//             <p>👨‍💼 Admin: admin@guc.edu.eg</p>
//             <p>🎓 Instructor: dr.sara@guc.edu.eg</p>
//             <p>🏢 Employer: recruiter@techcompany.com</p>
//             <p className="pt-2 border-t border-border/60 mt-3">
//               Password: <span className="text-accent-blue font-semibold">password</span>
//             </p>
//           </div>
//         </div>

//         <p className="relative z-10 text-text-secondary/50 font-mono text-xs">GUC Portfolio Platform © 2026</p>
//       </div>

//       {/* Right panel */}
//       <div className="flex-1 flex items-center justify-center p-8 bg-bg-base">
//         <div className="w-full max-w-sm lg:hidden flex justify-center mb-8">
//           <GpMark className="!h-12 !w-12" />
//         </div>
//         <div className="w-full max-w-sm">
//           <h2 className="font-display text-2xl text-text-primary mb-1">Welcome back</h2>
//           <p className="text-text-secondary text-sm font-sans mb-8">Sign in to your account</p>

//           {error && (
//             <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded mb-4 font-sans">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
//             <Input
//               label="Email"
//               type="email"
//               placeholder="you@gmail.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               error={fieldErrors.email}
//             />
//             <Input
//               label="Password"
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               error={fieldErrors.password}
//             />
//             <a href="/forgot-password" className="text-accent-blue text-xs font-sans hover:underline self-end -mt-2">
//               Forgot password?
//             </a>
//             <Button variant="gold" type="submit" className="w-full justify-center">Sign In</Button>
//           </form>

//           <p className="text-text-secondary text-sm font-sans mt-6 text-center">
//             New here?{" "}
//             <a href="/register" className="text-accent-blue hover:underline">Create an account</a>
//           </p>
//         </div>
//       </div>
//       <SuccessToast message={success} onClose={() => setSuccess("")} />
//     </div>
//   );
// }
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, SuccessToast } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";

/* ─── GP Icon ─────────────────────────────────────────────────────────────── */
function GpMark({ className = "", size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-12 w-12 rounded-xl",
    lg: "h-14 w-14 rounded-2xl",
  };
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center ${sizes[size]} bg-accent-gold ${className}`}
      aria-hidden
    >
      <span className={`font-display font-bold tracking-tight text-bg-base leading-none ${textSizes[size]}`}>
        GP
      </span>
    </div>
  );
}

/* ─── Blueprint / architectural SVG pattern ────────────────────────────────── */
function BlueprintPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.055]"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Fine grid */}
        <pattern id="fine" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(var(--c-accent-gold))" strokeWidth="0.4" />
        </pattern>
        {/* Major grid */}
        <pattern id="major" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#fine)" />
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgb(var(--c-accent-gold))" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#major)" />

      {/* Cross-hairs */}
      <circle cx="50%" cy="30%" r="60" fill="none" stroke="rgb(var(--c-accent-gold))" strokeWidth="0.6" strokeDasharray="4 6" />
      <circle cx="50%" cy="30%" r="110" fill="none" stroke="rgb(var(--c-accent-gold))" strokeWidth="0.4" strokeDasharray="2 8" />
      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgb(var(--c-accent-gold))" strokeWidth="0.4" strokeDasharray="6 10" />
      <line x1="0" y1="30%" x2="100%" y2="30%" stroke="rgb(var(--c-accent-gold))" strokeWidth="0.4" strokeDasharray="6 10" />

      {/* Corner brackets */}
      <path d="M 16 4 L 4 4 4 16" fill="none" stroke="rgb(var(--c-accent-gold))" strokeWidth="1.5" strokeLinecap="square" />
      <path d="M calc(100% - 16px) 4 L calc(100% - 4px) 4 calc(100% - 4px) 16" fill="none" stroke="rgb(var(--c-accent-gold))" strokeWidth="1.5" strokeLinecap="square" />
      <path d="M 16 calc(100% - 4px) L 4 calc(100% - 4px) 4 calc(100% - 16px)" fill="none" stroke="rgb(var(--c-accent-gold))" strokeWidth="1.5" strokeLinecap="square" />
      <path d="M calc(100% - 16px) calc(100% - 4px) L calc(100% - 4px) calc(100% - 4px) calc(100% - 4px) calc(100% - 16px)" fill="none" stroke="rgb(var(--c-accent-gold))" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

/* ─── Demo credentials panel ───────────────────────────────────────────────── */
function DemoPanel() {
  return (
    <div className="relative z-10 rounded-xl border border-accent-gold/30 bg-bg-base overflow-hidden">
      {/* Blueprint background inside panel */}
      <BlueprintPattern />

      {/* Top bar */}
      <div className="relative flex items-center gap-2 border-b border-accent-gold/20 px-4 py-2.5 bg-accent-gold/[0.06]">
        <GpMark size="sm" />
        <div>
          <p className="font-mono text-[15px] uppercase tracking-[0.3em] text-accent-gold/80 leading-none mb-0.5">GUC Portfolio</p>
          <p className="font-mono text-[15px] text-text-muted">Demo access credentials</p>
        </div>
        <div className="ml-auto flex gap-1">
          <span className="h-2 w-2 rounded-full bg-danger/60" />
          <span className="h-2 w-2 rounded-full bg-warning/60" />
          <span className="h-2 w-2 rounded-full bg-success/60" />
        </div>
      </div>

      {/* Credentials table */}
      <div className="relative p-4 space-y-2">
        {[
          { role: "Student", icon: "📚", email: "ahmed.elsayed@student.guc.edu.eg" },
          { role: "Admin", icon: "👨‍💼", email: "admin@guc.edu.eg" },
          { role: "Instructor", icon: "🎓", email: "dr.sara@guc.edu.eg" },
          { role: "Employer", icon: "🏢", email: "recruiter@techcompany.com" },
        ].map(({ role, icon, email }) => (
          <div key={role} className="flex items-center gap-3 py-1">
            <span className="text-sm w-5 shrink-0 text-center">{icon}</span>
            <span className="text-sm text-[15px] text-accent-gold w-16 shrink-0">{role}</span>
            <span className="text-sm text-[15px] text-text-secondary truncate">{email}</span>
          </div>
        ))}
        <div className="pt-2 mt-1 border-t border-border/50 flex items-center gap-3">
          <span className="text-sm text-[15px] text-text-muted">Password</span>
          <span className="text-sm text-[15px] text-accent-blue font-semibold tracking-wider">password</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Login page ───────────────────────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!validate()) return;
    const result = login(email, password);
    if (result.success) {
      setSuccess("Logged in successfully! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-bg-surface border-r border-border flex-col justify-between p-12">
        {/* Architectural grid background */}
        <BlueprintPattern />

        {/* Solid vertical accent stripe */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-1 bg-accent-gold" aria-hidden />

        {/* Logo row */}
        <div className="relative z-10 flex items-center gap-3">
          <GpMark size="lg" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent-gold/90 mb-0.5">Portal</p>
            <p className="font-display text-sm text-text-primary">GUC Portfolio</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          {/* Decorative measure line */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-accent-gold" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold/70">Showcase</span>
          </div>
          <h1 className="font-display text-5xl text-text-primary leading-tight mb-4">
            Showcase what<br />you&apos;ve built.
          </h1>
          <p className="text-text-secondary font-sans text-base max-w-sm leading-relaxed">
            A home for every GUC project — from first-year labs to bachelor theses.
          </p>
        </div>

        {/* Demo credentials */}
        <DemoPanel />

        <p className="relative z-10 text-text-muted font-mono text-[10px] tracking-widest">
          GUC PORTFOLIO PLATFORM © 2026
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-base">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <GpMark size="lg" />
          </div>

          <h2 className="font-display text-2xl text-text-primary mb-1">Welcome back</h2>
          <p className="text-text-secondary text-sm font-sans mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-lg mb-4 font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
            />
            <a href="/forgot-password" className="text-accent-blue text-xs font-sans hover:underline self-end -mt-2">
              Forgot password?
            </a>
            <Button variant="gold" type="submit" className="w-full justify-center">
              Sign In
            </Button>
          </form>

          <p className="text-text-secondary text-sm font-sans mt-6 text-center">
            New here?{" "}
            <a href="/register" className="text-accent-blue hover:underline">Create an account</a>
          </p>
        </div>
      </div>

      <SuccessToast message={success} onClose={() => setSuccess("")} />
    </div>
  );
}