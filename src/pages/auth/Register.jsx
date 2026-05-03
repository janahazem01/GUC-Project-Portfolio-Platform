import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    const result = register({ name, email, password, role });
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-bg-surface border border-border rounded-lg p-6">
        <h2 className="font-display text-2xl text-text-primary mb-2">Create an account</h2>
        <p className="text-text-secondary text-sm mb-6">Register as a student or instructor.</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <div>
            <label className="text-sm text-text-secondary font-sans mb-1 block">Account type</label>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="role" value="student" checked={role === "student"} onChange={() => setRole("student")} />
                <span className="text-sm">Student</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="role" value="instructor" checked={role === "instructor"} onChange={() => setRole("instructor")} />
                <span className="text-sm">Instructor</span>
              </label>
            </div>
          </div>

          <Button type="submit" variant="gold">Create account</Button>
        </form>
        <div className="mt-4 text-sm text-text-secondary">
          Or <a href="/register/employer" className="text-accent-blue hover:underline">register your company</a>
        </div>
      </div>
    </div>
  );
}
