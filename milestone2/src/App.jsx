// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useContext } from "react";
// import { AuthProvider, AuthContext } from "./context/AuthContext";
// import { AppLayout } from "./components/layout/AppLayout";
// import Login        from "./pages/auth/Login";
// import Register     from "./pages/auth/Register";
// import RegisterEmployer from "./pages/auth/RegisterEmployer";
// import ForgotPassword from "./pages/auth/ForgotPassword";
// import Dashboard    from "./pages/Dashboard";
// import Projects     from "./pages/projects/Projects";
// import Explore      from "./pages/discovery/Explore";
// import Profile      from "./pages/profile/Profile";
// import Admin        from "./pages/admin/Admin";
// import Internships  from "./pages/internships/Internships";
// import Notifications from "./pages/Notifications";
// import Messages     from "./pages/Messages";

// // Protected route wrapper
// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useContext(AuthContext);
  
//   if (loading) return <div className="min-h-screen bg-bg-base flex items-center justify-center">Loading...</div>;
  
//   if (!user) return <Navigate to="/login" replace />;
  
//   return children;
// };

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/register/employer" element={<RegisterEmployer />} />
//       <Route path="/forgot-password" element={<ForgotPassword />} />
//       <Route 
//         path="/" 
//         element={
//           <ProtectedRoute>
//             <AppLayout><Dashboard /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />
//       <Route 
//         path="/projects" 
//         element={
//           <ProtectedRoute>
//             <AppLayout><Projects /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />
//       <Route 
//         path="/explore" 
//         element={
//           <ProtectedRoute>
//             <AppLayout><Explore /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />
//       <Route 
//         path="/profile" 
//         element={
//           <ProtectedRoute>
//             <AppLayout><Profile /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />
//       <Route 
//         path="/admin" 
//         element={
//           <ProtectedRoute>
//             <AppLayout><Admin /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />
//       <Route 
//         path="/internships" 
//         element={
//           <ProtectedRoute>
//             <AppLayout><Internships /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />
//       <Route 
//         path="/notifications" 
//         element={
//           <ProtectedRoute>
//             <AppLayout><Notifications /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />
//       <Route 
//         path="/messages" 
//         element={
//           <ProtectedRoute>
//             <AppLayout><Messages /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />
//     </Routes>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <AppRoutes />
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import Login        from "./pages/auth/Login";
import Register     from "./pages/auth/Register";
import RegisterEmployer from "./pages/auth/RegisterEmployer";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard    from "./pages/Dashboard";
import Projects     from "./pages/projects/Projects";
import ProjectDetails from "./pages/projects/ProjectDetails";
import ProjectPreview from "./pages/projects/ProjectPreview";
import Explore      from "./pages/discovery/Explore";
import Profile      from "./pages/profile/Profile";
import Admin        from "./pages/admin/Admin";
import AdminDataPage from "./pages/admin/AdminDataPage";
import Internships  from "./pages/internships/Internships";
import Notifications from "./pages/Notifications";
import Messages     from "./pages/Messages";

// ✅ Protected route wrapper (UPDATED LOGIC ONLY)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        Loading...
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;

  // ✅ Role-based protection (added)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function RoleDashboard() {
  const { user } = useContext(AuthContext);
  return user?.role === "admin" ? <Admin /> : <Dashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/employer" element={<RegisterEmployer />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AppLayout><RoleDashboard /></AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <AppLayout><Projects /></AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <AppLayout><ProjectDetails /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:projectId/preview"
        element={
          <ProtectedRoute>
            <AppLayout><ProjectPreview /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/explore" 
        element={
          <ProtectedRoute allowedRoles={["student", "instructor", "employer", "admin"]}>
            <AppLayout><Explore /></AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <AppLayout><Profile /></AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Navigate to="/" replace />
          </ProtectedRoute>
        } 
      />

      <Route
        path="/admin/:section"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout><AdminDataPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/internships" 
        element={
          <ProtectedRoute>
            <AppLayout><Internships /></AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <AppLayout><Notifications /></AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <AppLayout><Messages /></AppLayout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
