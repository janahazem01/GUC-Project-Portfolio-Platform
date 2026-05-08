import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [companyName, setCompanyName] = useState("");
  const [taxCertificate, setTaxCertificate] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address with @";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (role === "employer") {
      if (!companyName.trim()) errors.companyName = "Company name is required";
      if (!taxCertificate) errors.taxCertificate = "Tax certificate is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validate()) return;

    const payload = {
      name,
      email,
      password,
      role,
      ...(role === "employer" && { companyName, taxCertificateName: taxCertificate?.name })
    };

    const result = register(payload);
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
        <p className="text-text-secondary text-sm mb-6">Register to join the GUC portfolio platform.</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-3" noValidate>
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-sans">Account type</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className={`bg-bg-elevated border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue transition-colors ${fieldErrors.role ? "border-danger" : "border-border"}`}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="employer">Employer</option>
            </select>
            {fieldErrors.role && <p className="text-danger text-sm">{fieldErrors.role}</p>}
          </div>

          {role === "employer" && (
            <>
              <Input 
                label="Company Name" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                error={fieldErrors.companyName}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text-secondary font-sans">Tax Certificate (Proof)</label>
                <input 
                  type="file" 
                  onChange={(e) => setTaxCertificate(e.target.files[0])}
                  className="text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-sans file:bg-bg-elevated file:text-text-primary hover:file:bg-bg-elevated/80 cursor-pointer"
                />
                {fieldErrors.taxCertificate && <p className="text-danger text-sm">{fieldErrors.taxCertificate}</p>}
              </div>
            </>
          )}

          <Button type="submit" variant="gold" className="mt-2">
            {role === "employer" ? "Register Company" : "Create account"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-text-secondary text-center">
          Already have an account? <a href="/login" className="text-accent-blue hover:underline">Sign in</a>
        </div>
      </div>
    </div>
  );
}
