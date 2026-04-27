import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Login        from "./pages/auth/Login";
import Dashboard    from "./pages/Dashboard";
import Projects     from "./pages/projects/Projects";
import Explore      from "./pages/discovery/Explore";
import Profile      from "./pages/profile/Profile";
import Admin        from "./pages/admin/Admin";
import Internships  from "./pages/internships/Internships";
import Notifications from "./pages/Notifications";
import Messages     from "./pages/Messages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/projects" element={<AppLayout><Projects /></AppLayout>} />
        <Route path="/explore" element={<AppLayout><Explore /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
        <Route path="/admin" element={<AppLayout><Admin /></AppLayout>} />
        <Route path="/internships" element={<AppLayout><Internships /></AppLayout>} />
        <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />
        <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
