import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, Modal, PageHeader, SuccessToast } from "../../components/ui";
import { dummyUsers } from "../../data/dummy";

export default function AdminCreateAdmin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required to be filled.";
    if (!password.trim()) newErrors.password = "Password is required to be filled.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Simulate adding new admin
    const newAdmin = {
      id: dummyUsers.length + 1,
      name: username,
      email: username, // Assuming username is email for simplicity
      password,
      role: "admin",
      bio: "New administrator",
      avatar: null,
      status: "active",
    };
    dummyUsers.push(newAdmin);

    setSuccessMessage("New admin account created successfully!");
    setShowModal(true);
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <PageHeader title="Create Admin Account" subtitle="Add a new administrator to the platform" />
          </div>
          <Button variant="secondary" onClick={() => navigate("/admin")}>Back to Dashboard</Button>
        </div>

        <Card className="p-10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <div className="flex flex-wrap gap-3 justify-end">
              <Button type="submit">Create Admin</Button>
              <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
            </div>
          </form>
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Success">
        <p className="text-text-secondary text-sm mb-6">{successMessage}</p>
        <div className="flex justify-end gap-3">
          <Button onClick={() => navigate("/admin/users")}>View Users</Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}