import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";

export default function RegisterEmployer() {
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    const result = register({ name: contactName, companyName, companyEmail, password, role: "employer", email: companyEmail });
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-bg-surface border border-border rounded-lg p-6">
        <h2 className="font-display text-2xl text-text-primary mb-2">Register your company</h2>
        <p className="text-text-secondary text-sm mb-6">Create an employer account to post internships and review applications.</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <Input label="Your full name" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
          <Input label="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          <Input label="Company email" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <Button type="submit" variant="gold">Create company account</Button>
        </form>
      </div>
    </div>
  );
}
