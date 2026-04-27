import { useState } from "react";
import { Button, Input } from "../../components/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        <p className="text-text-secondary/40 font-mono text-xs">GUC Portfolio Platform © 2026</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl text-text-primary mb-1">Welcome back</h2>
          <p className="text-text-secondary text-sm font-sans mb-8">Sign in to your account</p>

          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@student.guc.edu.eg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <a href="/forgot-password" className="text-accent-blue text-xs font-sans hover:underline self-end -mt-2">
              Forgot password?
            </a>
            <Button variant="gold" className="w-full justify-center">Sign In</Button>
          </div>

          <p className="text-text-secondary text-sm font-sans mt-6 text-center">
            New here?{" "}
            <a href="/register" className="text-accent-blue hover:underline">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}
