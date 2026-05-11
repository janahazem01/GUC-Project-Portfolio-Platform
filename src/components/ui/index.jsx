// Shared primitive UI components

import { useEffect } from "react";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={`bg-bg-surface border border-border rounded-lg p-6 ${
        hover ? "transition-transform duration-200 hover:-translate-y-0.5 hover:border-accent-blue/30" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base = "font-sans font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  const variants = {
    primary: "bg-accent-blue text-white hover:bg-accent-blue/80",
    secondary: "border border-accent-blue text-accent-blue hover:bg-accent-blue/10",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
    danger: "bg-danger text-white hover:bg-danger/80",
    gold: "bg-accent-gold text-bg-base hover:bg-accent-gold/80",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-bg-elevated text-text-secondary",
    gold: "bg-accent-gold/10 text-accent-gold border border-accent-gold/30",
    blue: "bg-accent-blue/10 text-accent-blue border border-accent-blue/30",
    warning: "bg-warning/10 text-warning border border-warning/30",
    success: "bg-success/10 text-success border border-success/30",
    danger: "bg-danger/10 text-danger border border-danger/30",
  };
  return (
    <span className={`inline-flex items-center justify-center font-mono text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-text-secondary font-sans">{label}</label>}
      <input
        className={`bg-bg-elevated border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors ${error ? "border-danger text-danger" : "border-border"} ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-8 gap-6">
      <div>
        <h1 className="font-display text-2xl text-text-primary mb-1">{title}</h1>
        {subtitle && <p className="text-text-secondary text-sm font-sans">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Stars({ rating, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.floor(rating) ? "text-accent-gold" : "text-border"}>★</span>
      ))}
    </div>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  backdropClassName = "",
  contentClassName = "",
  panelClassName = "",
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 ${backdropClassName}`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md ${panelClassName}`}
      >
        <Card className={`max-h-[90vh] overflow-y-auto ${contentClassName}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-text-primary">{title}</h2>
            <button
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-xl leading-none px-2 py-1 rounded-md hover:bg-bg-elevated transition-colors"
            >
              ×
            </button>
          </div>
          {children}
        </Card>
      </div>
    </>
  );
}

export function DocumentPreviewModal({ document, onClose }) {
  const title = document?.title || document?.name || "Document";
  const src = document?.src || "";

  return (
    <Modal
      isOpen={Boolean(document)}
      onClose={onClose}
      title={title}
      panelClassName="max-w-3xl px-4"
      contentClassName="p-5"
    >
      <div className="flex flex-col gap-4">
        {src ? (
          <iframe
            title={title}
            src={src}
            className="h-[70vh] min-h-[28rem] w-full rounded-lg border border-border bg-white"
          />
        ) : (
          <div className="rounded-lg border border-border bg-bg-elevated px-5 py-8 text-center">
            <p className="font-display text-lg text-text-primary mb-2">{document?.name}</p>
            <p className="text-text-secondary text-sm font-sans">
              No preview file is attached for this demo document yet.
            </p>
          </div>
        )}
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ConfirmActionModal({ isOpen, action, onClose, onConfirm, variant = "gold" }) {
  const handleConfirm = () => {
    Promise.resolve(onConfirm?.()).finally(() => onClose?.());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm action">
      <p className="text-text-secondary text-sm font-sans mb-6">
        Are you sure you want to {action}?
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>No</Button>
        <Button variant={variant} onClick={handleConfirm}>Yes</Button>
      </div>
    </Modal>
  );
}

/** Shared layout: dark panel, left status glyph, primary text, dismiss control — all in-app toasts use this. */
const TOAST_STYLES = {
  success: {
    border: "border-success/45",
    iconRing: "border border-success/35 bg-success/10",
    icon: "✓",
    iconClass: "text-success",
  },
  error: {
    border: "border-danger/45",
    iconRing: "border border-danger/35 bg-danger/10",
    icon: "✕",
    iconClass: "text-danger",
  },
  warning: {
    border: "border-warning/45",
    iconRing: "border border-warning/35 bg-warning/10",
    icon: "⚠",
    iconClass: "text-warning",
  },
  info: {
    border: "border-accent-blue/45",
    iconRing: "border border-accent-blue/30 bg-accent-blue/10",
    icon: "◉",
    iconClass: "text-accent-blue",
  },
};

/**
 * @param {object} props
 * @param {string} [props.message] Single-line body (most pages use this).
 * @param {string} [props.title] Optional headline; when set, `description` or `message` is shown as secondary.
 * @param {string} [props.description] Second line when `title` is set.
 * @param {"success"|"error"|"warning"|"info"} [props.variant]
 * @param {number} [props.durationMs] Auto-dismiss after ms; 0 = only manual dismiss.
 */
export function Toast({ message = "", title, description, variant = "success", onClose, durationMs = 4200 }) {
  const hasHeadline = Boolean(title?.trim());
  const bodyLine = hasHeadline ? (description ?? message) : message;
  const visible = Boolean(hasHeadline ? title?.trim() : message?.trim());

  useEffect(() => {
    if (!visible || !onClose || !durationMs || durationMs <= 0) return undefined;
    const t = window.setTimeout(() => onClose(), durationMs);
    return () => window.clearTimeout(t);
  }, [visible, durationMs, onClose]);

  if (!visible) return null;

  const palette = TOAST_STYLES[variant] || TOAST_STYLES.success;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] max-w-md w-[calc(100%-2rem)] animate-in fade-in slide-in-from-bottom-3 duration-200"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-bg-surface px-4 py-3 shadow-2xl ${palette.border}`}
      >
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold leading-none ${palette.iconRing} ${palette.iconClass}`}
          aria-hidden
        >
          {palette.icon}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          {hasHeadline ? (
            <>
              <p className="font-display text-sm text-text-primary leading-snug break-words">{title}</p>
              {bodyLine ? (
                <p className="mt-1 font-sans text-sm text-text-secondary leading-relaxed break-words">{bodyLine}</p>
              ) : null}
            </>
          ) : (
            <p className="font-sans text-sm text-text-primary leading-relaxed break-words">{message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-md p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** @deprecated Prefer `<Toast variant="success" />` — kept for existing imports. */
export function SuccessToast({ message, onClose, durationMs = 4200 }) {
  return <Toast variant="success" message={message} onClose={onClose} durationMs={durationMs} />;
}

