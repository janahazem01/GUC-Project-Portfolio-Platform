import { useState, useEffect, useContext, useId } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, SuccessToast } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

/** Faint gold “dust” + bottom chart hints — deterministic positions */
function LoginHeroAmbience() {
  const gid = useId().replace(/:/g, "");
  const fadeId = `login-hero-fade-${gid}`;
  const specks = [
    [8, 12],
    [22, 28],
    [45, 8],
    [72, 18],
    [88, 42],
    [15, 55],
    [38, 72],
    [55, 48],
    [78, 65],
    [92, 78],
    [28, 88],
    [60, 92],
  ];
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
        {specks.map(([x, y], i) => (
          <span
            key={`s-${i}`}
            className="absolute h-[3px] w-[3px] rounded-full bg-gradient-to-br from-amber-100 to-accent-gold shadow-[0_0_4px_rgba(255,245,220,0.9),0_0_10px_rgb(var(--c-accent-gold))] light:!bg-border/55 light:shadow-[0_0_8px_rgb(var(--c-border)_/_0.35)]"
            style={{ left: `${x}%`, top: `${y}%`, opacity: 0.35 + (i % 5) * 0.05 }}
          />
        ))}
      </div>
      <svg
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-28 w-full opacity-[0.14] light:opacity-[0.1]"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 55 L40 48 L80 52 L120 38 L160 44 L200 30 L240 36 L280 22 L320 28 L360 18 L400 12 V80 H0 Z"
          fill={`url(#${fadeId})`}
        />
        <path
          d="M0 48 L50 42 L100 46 L150 34 L200 40 L250 28 L300 32 L350 24 L400 20"
          fill="none"
          stroke={`url(#login-line-metal-${gid})`}
          strokeWidth="1.2"
          strokeOpacity="0.9"
        />
        <defs>
          <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--c-accent-gold))" stopOpacity="0.08" />
            <stop offset="100%" stopColor="rgb(var(--c-bg-base))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`login-line-metal-${gid}`} x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3d3020" stopOpacity="0.5" />
            <stop offset="35%" stopColor="rgb(var(--c-accent-gold))" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#fdf6e3" stopOpacity="0.5" />
            <stop offset="65%" stopColor="rgb(var(--c-accent-gold))" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#3d3020" stopOpacity="0.45" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}

/** Split hero — semantic colors; `light:` polishes for light theme */
function LoginWelcomePanel({ className = "" }) {
  return (
    <div
      className={`relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-bg-base ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgb(var(--c-accent-gold)_/_0.09),transparent_55%)] light:bg-[radial-gradient(ellipse_115%_85%_at_50%_-10%,rgb(var(--c-accent-gold)_/_0.08),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-30 light:hidden"
        style={{
          backgroundImage: `radial-gradient(rgb(var(--c-accent-gold) / 0.12) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] hidden opacity-[0.22] light:block"
        style={{
          backgroundImage: `radial-gradient(rgb(var(--c-border) / 0.55) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />
      <LoginHeroAmbience />

      {/* Brushed metal light sweep */}
      <div className="login-metal-sheen" aria-hidden />
      <div className="login-metal-sheen login-metal-sheen--subtle" aria-hidden />

      {/* Dark: metallic gold rail — light: minimal border */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[4] w-[3px] bg-gradient-to-b from-transparent via-[rgb(var(--c-accent-gold))] to-transparent opacity-90 shadow-[0_0_14px_rgb(var(--c-accent-gold)),0_0_28px_rgb(var(--c-accent-gold)_/_0.45),inset_0_0_6px_rgba(255,250,235,0.5)] light:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-[8%] right-0 z-[4] w-px bg-gradient-to-b from-white/25 via-white/10 to-transparent opacity-70 light:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[4] hidden w-px bg-border light:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-[8%] right-0 z-[4] hidden w-px bg-gradient-to-b from-transparent via-black/[0.08] to-transparent light:block"
        aria-hidden
      />

      <div className="relative z-20 flex min-h-0 w-full flex-1 flex-col justify-center px-8 py-12 sm:px-10 lg:px-12 xl:px-16 lg:py-16">
        <div className="mx-auto w-full max-w-xl">
          <header className="text-left">
            <div className="inline-flex rounded-full bg-gradient-to-br from-[#d4b87a] via-[rgb(var(--c-accent-gold))] to-[#4a3820] p-[1.5px] shadow-[0_4px_24px_rgb(var(--c-accent-gold)_/_0.25),inset_0_1px_0_rgba(255,255,255,0.35)] light:shadow-[0_2px_16px_rgb(var(--c-accent-gold)_/_0.18),inset_0_1px_0_rgba(255,255,255,0.5)]">
              <div className="flex items-center gap-3 rounded-full border border-white/5 bg-bg-surface/85 px-4 py-2.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)] backdrop-blur-md light:border-border light:bg-bg-surface light:shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#f2e0b8] via-[rgb(var(--c-accent-gold))] to-[#5a4422] font-display text-[11px] font-bold leading-none text-[#0a0c0f] shadow-[inset_0_2px_3px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.35)] light:to-[rgb(var(--c-bg-elevated))] light:shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]">
                  GP
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-text-primary/95 drop-shadow-sm">
                  GUC Portal
                </span>
              </div>
            </div>

            <h1 className="mt-12 font-display text-[3rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.5rem] lg:mt-14 lg:text-[4rem] xl:text-[4.25rem]">
              <span className="block bg-gradient-to-br from-[#faf3e3] via-[rgb(var(--c-accent-gold))] to-[#4d3d24] bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(200,169,110,0.35)] light:from-[#5a4828] light:via-[rgb(var(--c-accent-gold))] light:to-[#8a723e] light:drop-shadow-[0_1px_12px_rgba(155,120,62,0.22)]">
                Learn.
              </span>
              <span className="mt-2 block bg-gradient-to-br from-[#faf3e3] via-[rgb(var(--c-accent-gold))] to-[#4d3d24] bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(200,169,110,0.35)] light:from-[#5a4828] light:via-[rgb(var(--c-accent-gold))] light:to-[#8a723e] light:drop-shadow-[0_1px_12px_rgba(155,120,62,0.22)] sm:mt-2.5">
                Teach.
              </span>
              <span className="mt-2 block bg-gradient-to-br from-[#c5e3ff] via-[rgb(var(--c-accent-blue))] to-[#1a4a7c] bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(74,143,212,0.35)] light:from-[#1a4a72] light:via-[rgb(var(--c-accent-blue))] light:to-[#3d7ab8] light:drop-shadow-[0_1px_10px_rgba(42,108,176,0.2)] sm:mt-2.5">
                Hire.
              </span>
            </h1>

            <p className="mt-10 max-w-lg font-sans text-lg leading-relaxed text-text-secondary sm:mt-12 sm:text-xl">
              One platform connecting students, instructors, and employers ready to hire talent.
            </p>
          </header>

          <div className="mt-14 grid grid-cols-3 gap-3 sm:mt-16 sm:gap-4">
            {[
              { n: "42k", l: "Active students" },
              { n: "1.8k", l: "Instructors" },
              { n: "320", l: "Partner companies" },
            ].map(({ n, l }) => (
              <div
                key={l}
                className="rounded-xl bg-gradient-to-br from-[#c9a86a] via-[rgb(var(--c-accent-gold))] to-[#2a2218] p-px shadow-[0_6px_28px_rgb(var(--c-accent-gold)_/_0.22),inset_0_1px_0_rgba(255,255,255,0.25)] light:from-amber-200/90 light:to-[rgb(var(--c-bg-elevated))] light:shadow-[0_4px_22px_rgb(var(--c-accent-gold)_/_0.12),inset_0_1px_0_rgba(255,255,255,0.5)] sm:rounded-2xl"
              >
                <div className="rounded-[11px] bg-gradient-to-b from-bg-surface/95 to-bg-base px-3 py-4 text-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.06),inset_0_-3px_10px_rgba(0,0,0,0.5)] backdrop-blur-sm light:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_4px_rgba(0,0,0,0.06)] sm:rounded-[15px] sm:px-4 sm:py-5">
                  <p className="font-display text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl lg:text-[2.35rem]">
                    <span className="bg-gradient-to-b from-[#fff6e5] via-[rgb(var(--c-accent-gold))] to-[#5c4a28] bg-clip-text text-transparent [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.12))] light:from-[#4a3d24] light:to-[#9b7c42]">
                      {n}
                    </span>
                  </p>
                  <p className="mt-2 font-sans text-[11px] font-medium leading-snug text-text-primary/90 sm:text-xs">
                    {l}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSuccessExit, setIsSuccessExit] = useState(false);
  const [isHeroFullscreen, setIsHeroFullscreen] = useState(false);
  const [expandHero, setExpandHero] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const SLIDE_MS = 700;
  const EXPAND_MS = 500;

  useEffect(() => {
    if (!isHeroFullscreen) {
      setExpandHero(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setExpandHero(true));
    });
    return () => cancelAnimationFrame(id);
  }, [isHeroFullscreen]);

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
      setIsSuccessExit(true);
      window.setTimeout(() => setIsHeroFullscreen(true), SLIDE_MS);
      window.setTimeout(() => navigate("/"), SLIDE_MS + EXPAND_MS + 120);
    } else {
      setError(result.error);
    }
  };

  const slideHero =
    isSuccessExit && !isHeroFullscreen
      ? "translate-y-full lg:translate-y-0 lg:translate-x-full"
      : "";
  const easeSlide =
    "transition-transform duration-[700ms] ease-in-out will-change-transform";

  const heroFullscreenClasses = expandHero
    ? "max-lg:inset-0 max-lg:min-h-dvh max-lg:w-full lg:left-0 lg:top-0 lg:h-[100dvh] lg:w-full"
    : "max-lg:inset-0 max-lg:min-h-dvh max-lg:w-full lg:left-1/2 lg:top-0 lg:h-[100dvh] lg:w-1/2";

  const heroOuter = isHeroFullscreen
    ? `fixed z-[60] transition-[left,width] duration-500 ease-in-out ${heroFullscreenClasses}`
    : `relative z-[2] w-full shrink-0 lg:w-1/2 lg:min-h-screen ${easeSlide} ${slideHero}`;

  const heroPanelRadius = isHeroFullscreen
    ? "rounded-none !border-0"
    : "rounded-b-3xl border-b border-accent-gold/20 lg:rounded-b-none lg:rounded-r-3xl lg:border-b-0 lg:border-r lg:border-accent-gold/35 light:border-border";

  const heroPanelMinH = isHeroFullscreen
    ? "min-h-dvh"
    : "min-h-[40vh] lg:min-h-screen";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-base lg:flex-row">
      <div className={heroOuter}>
        <LoginWelcomePanel
          className={`h-full w-full ${heroPanelMinH} ${heroPanelRadius}`}
        />
      </div>

      <div className="relative z-[1] flex flex-1 items-center justify-center bg-bg-base px-6 py-12 sm:px-10 lg:min-h-screen lg:border-l-0 lg:py-16 lg:pl-14 lg:pr-12">
        <div className="mx-auto w-full max-w-sm">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.35em] text-text-muted lg:hidden">
            GUC Portal
          </p>
          <h2 className="font-display text-3xl font-semibold text-text-primary">Sign in</h2>
          <p className="mt-2 font-sans text-sm text-text-secondary">
            Use your PORTAL-affiliated credentials
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-danger/30 bg-danger/10 p-3 font-sans text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-10 flex flex-col gap-5" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
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
            <a
              href="/forgot-password"
              className="-mt-1 self-end font-sans text-xs text-accent-blue hover:underline"
            >
              Forgot password?
            </a>
            <Button variant="gold" type="submit" className="w-full justify-center py-3 text-[15px]">
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center font-sans text-sm text-text-secondary">
            New here?{" "}
            <a href="/register" className="text-accent-blue hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>

      <SuccessToast message={success} onClose={() => setSuccess("")} />

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={!isDark}
        title={isDark ? "Light mode" : "Dark mode"}
        className="fixed bottom-6 right-6 z-[80] flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg-surface text-xl leading-none text-text-primary shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-[background-color,box-shadow,color] hover:bg-bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold light:shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
      >
        <span aria-hidden>{isDark ? "☀" : "☽"}</span>
      </button>
    </div>
  );
}
