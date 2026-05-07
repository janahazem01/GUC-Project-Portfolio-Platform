import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";

export default function ForgotPassword() {
  const [step, setStep] = useState("email"); // email | otp
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [displayOtp, setDisplayOtp] = useState("");

  const { requestPasswordReset, verifyOtpAndReset } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const result = requestPasswordReset(email);
    if (result.success) {
      setDisplayOtp(result.otp);
      setSuccess("OTP sent! Check the display below or your email.");
      setStep("otp");
    } else {
      setError(result.error);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const result = verifyOtpAndReset(email, otp, newPassword);
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-bg-surface border border-border rounded-lg p-6">
        {step === "email" ? (
          <>
            <h2 className="font-display text-2xl text-text-primary mb-2">Reset password</h2>
            <p className="text-text-secondary text-sm mb-6">Enter your email to receive an OTP.</p>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 rounded mb-4">{success}</div>}

            <form onSubmit={handleRequestOtp} className="flex flex-col gap-3">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" variant="gold">Send OTP</Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl text-text-primary mb-2">Enter OTP & new password</h2>
            <p className="text-text-secondary text-sm mb-4">OTP displayed: <span className="font-mono font-bold text-accent-gold">{displayOtp}</span></p>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 rounded mb-4">{success}</div>}

            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              <Input label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <Input label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <Button type="submit" variant="gold">Reset password</Button>
            </form>
          </>
        )}

        <div className="mt-4 text-center">
          <p className="text-text-secondary text-xs">
            Remember your password? <a href="/login" className="text-accent-blue hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
