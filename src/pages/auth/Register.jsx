import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, SuccessToast } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [companyName, setCompanyName] = useState("");
  const [taxCertificate, setTaxCertificate] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setFieldErrors(prev => ({ ...prev, taxCertificate: "Please upload a PDF file." }));
        return;
      }
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.taxCertificate;
        return next;
      });
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTaxCertificate({
          id: Date.now(),
          name: file.name,
          uploadedAt: new Date().toISOString().split('T')[0],
          data: reader.result
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
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
      ...(role === "employer" && { 
        companyName, 
        companyEmail: email, // Set initial company email
        uploadedDocs: taxCertificate ? [taxCertificate] : []
      })
    };

    const result = register(payload);
    if (result.success) {
      setSuccess("Account registered successfully! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
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
          
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} placeholder = {(role == "student") ? "student@student.guc.edu.eg" : (role == "instructor") ? "instructor@guc.edu.eg" : "employer@company.com"} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />

          

          {role === "employer" && (
            <>
              <Input 
                label="Company Name" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                error={fieldErrors.companyName}
              />
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-sm text-text-secondary font-sans border-b border-border/50 pb-1 mb-1">Company Verification (PDF)</label>
                <div className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${taxCertificate ? 'border-success/50 bg-success/5' : fieldErrors.taxCertificate ? 'border-danger/50 bg-danger/5' : 'border-border hover:border-accent-gold/50'}`}>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    {isUploading ? (
                      <p className="text-sm text-text-secondary animate-pulse">Processing file...</p>
                    ) : taxCertificate ? (
                      <div className="flex items-center justify-center gap-2 text-success">
                        <span>📄</span>
                        <span className="text-sm font-medium truncate max-w-[200px]">{taxCertificate.name}</span>
                        <button type="button" onClick={() => setTaxCertificate(null)} className="ml-2 text-text-secondary hover:text-danger">×</button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-text-primary font-medium">Upload Tax Certificate</p>
                        <p className="text-xs text-text-secondary mt-1">Click or drag PDF (Required)</p>
                      </>
                    )}
                  </div>
                </div>
                {fieldErrors.taxCertificate && <p className="text-danger text-xs mt-1">{fieldErrors.taxCertificate}</p>}
              </div>
            </>
          )}

          <Button type="submit" variant="gold" className="mt-2" disabled={isUploading}>
            {role === "employer" ? "Register Company" : "Create account"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-text-secondary text-center">
          Already have an account? <a href="/login" className="text-accent-blue hover:underline">Sign in</a>
        </div>
      </div>
      <SuccessToast message={success} onClose={() => setSuccess("")} />
    </div>
  );
}
