import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";

export default function RegisterEmployer() {
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [password, setPassword] = useState("");
  const [taxCertificate, setTaxCertificate] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!contactName.trim()) errors.contactName = "Your name is required";
    if (!companyName.trim()) errors.companyName = "Company name is required";
    
    if (!companyEmail.trim()) {
      errors.companyEmail = "Company email is required";
    } else if (!/\S+@\S+\.\S+/.test(companyEmail)) {
      errors.companyEmail = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!taxCertificate) {
      errors.taxCertificate = "Tax certificate is required";
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
    if (!validate()) return;
    setError("");

    const result = register({ 
      name: contactName, 
      companyName, 
      companyEmail, 
      password, 
      role: "employer", 
      email: companyEmail,
      verificationStatus: "pending",
      uploadedDocs: [taxCertificate] 
    });
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

        <form onSubmit={handleRegister} className="flex flex-col gap-3" noValidate>
          <Input 
            label="Your full name" 
            value={contactName} 
            onChange={(e) => setContactName(e.target.value)} 
            error={fieldErrors.contactName}
          />
          <Input 
            label="Company name" 
            value={companyName} 
            onChange={(e) => setCompanyName(e.target.value)} 
            error={fieldErrors.companyName}
          />
          <Input 
            label="Company email" 
            type="email" 
            value={companyEmail} 
            onChange={(e) => setCompanyEmail(e.target.value)} 
            error={fieldErrors.companyEmail}
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            error={fieldErrors.password}
          />
          
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-sm text-text-secondary font-sans border-b border-border/50 pb-1 mb-1">Company Verification</label>
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
                    <p className="text-xs text-text-secondary mt-1">PDF only (Required)</p>
                  </>
                )}
              </div>
            </div>
            {fieldErrors.taxCertificate && <p className="text-danger text-xs mt-1">{fieldErrors.taxCertificate}</p>}
          </div>

          <Button type="submit" variant="gold" className="mt-4" disabled={isUploading}>
            Create company account
          </Button>
        </form>
      </div>
    </div>
  );
}
