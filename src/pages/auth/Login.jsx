import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, SuccessToast } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";

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
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-bg-surface border-r border-border flex-col justify-between p-12">
        <span className="font-mono text-accent-gold text-lg">GP</span>
        <div>
          <h1 className="font-display text-5xl text-text-primary leading-tight mb-4">
            Showcase what<br />you've built.
          </h1>
          <p className="text-text-secondary font-sans text-base max-w-xs">
            A home for every GUC project — from first-year labs to bachelor theses.
          </p>
        </div>
        
        {/* Demo credentials */}
        <div className="bg-bg-base p-4 rounded border border-border text-text-secondary text-xs font-mono">
          <p className="font-bold text-accent-gold mb-2">Demo Credentials:</p>
          <p>📚 Student: ahmed.elsayed@gmail.com</p>
          <p>👨‍💼 Admin: admin@gmail.com</p>
          <p>🎓 Instructor: dr.sara@gmail.com</p>
          <p>🏢 Employer: recruiter@techcompany.com</p>
          <p className="mt-2">Password: <span className="text-accent-blue">password</span></p>
        </div>
        
        <p className="text-text-secondary/40 font-mono text-xs">GUC Portfolio Platform © 2026</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl text-text-primary mb-1">Welcome back</h2>
          <p className="text-text-secondary text-sm font-sans mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded mb-4 font-sans">
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
            <Button variant="gold" type="submit" className="w-full justify-center">Sign In</Button>
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
