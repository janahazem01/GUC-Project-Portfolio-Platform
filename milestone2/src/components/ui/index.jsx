// Shared primitive UI components

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
  const base = "font-sans font-medium rounded-lg transition-all duration-150 cursor-pointer";
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

export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-bg-elevated text-text-secondary",
    gold: "bg-accent-gold/10 text-accent-gold border border-accent-gold/30",
    blue: "bg-accent-blue/10 text-accent-blue border border-accent-blue/30",
    warning: "bg-warning/10 text-warning border border-warning/30",
    success: "bg-success/10 text-success border border-success/30",
    danger: "bg-danger/10 text-danger border border-danger/30",
  };
  return (
    <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
}

<<<<<<< HEAD
export function Input({ label, error, className = "", ...props }) {
=======
export function Input({ label, className = "", ...props }) {
>>>>>>> 947f23eb38b7a936206e6d7835bbbf2aa4fcb2e2
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-text-secondary font-sans">{label}</label>}
      <input
<<<<<<< HEAD
        className={`bg-bg-elevated border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors ${error ? "border-danger text-danger" : "border-border"} ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-sm">{error}</p>}
=======
        className={`bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans
          placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors ${className}`}
        {...props}
      />
>>>>>>> 947f23eb38b7a936206e6d7835bbbf2aa4fcb2e2
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
<<<<<<< HEAD
    <div className="flex items-center justify-between mb-8 gap-6">
=======
    <div className="flex items-start justify-between mb-8">
>>>>>>> 947f23eb38b7a936206e6d7835bbbf2aa4fcb2e2
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

<<<<<<< HEAD
export function Modal({ isOpen, onClose, title, children, backdropClassName = "", contentClassName = "" }) {
=======
export function Modal({ isOpen, onClose, title, children }) {
>>>>>>> 947f23eb38b7a936206e6d7835bbbf2aa4fcb2e2
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
<<<<<<< HEAD
        className={`fixed inset-0 bg-black/50 z-40 ${backdropClassName}`}
=======
        className="fixed inset-0 bg-black/50 z-40"
>>>>>>> 947f23eb38b7a936206e6d7835bbbf2aa4fcb2e2
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
<<<<<<< HEAD
        <Card className={`max-h-[90vh] overflow-y-auto ${contentClassName}`}>
=======
        <Card className="max-h-[90vh] overflow-y-auto">
>>>>>>> 947f23eb38b7a936206e6d7835bbbf2aa4fcb2e2
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-xl"
            >
              ✕
            </button>
          </div>
          {children}
        </Card>
      </div>
    </>
  );
}
