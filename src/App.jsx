// import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { useContext, useEffect } from "react";
// import { AuthProvider, AuthContext } from "./context/AuthContext";
// import { ProjectsProvider } from "./context/ProjectsContext";
// import { AppLayout } from "./components/layout/AppLayout";
// import Login        from "./pages/auth/Login";
// import Register     from "./pages/auth/Register";
// import ForgotPassword from "./pages/auth/ForgotPassword";
// import Dashboard    from "./pages/Dashboard";
// import Projects     from "./pages/projects/Projects";
// import ProjectDetails from "./pages/projects/ProjectDetails";
// import ProjectPreview from "./pages/projects/ProjectPreview";
// import Explore      from "./pages/discovery/Explore";
// import Instructors  from "./pages/discovery/Instructors";
// import Favorites    from "./pages/favorites/Favorites";
// import Profile      from "./pages/profile/Profile";
// import Admin        from "./pages/admin/Admin";
// import AdminDataPage from "./pages/admin/AdminDataPage";
// import AdminAccountManagement from "./pages/admin/AdminAccountManagement";
// import Internships  from "./pages/internships/Internships";
// import Notifications from "./pages/Notifications";
// import Requests from "./pages/Requests";
// import Tasks from "./pages/Tasks";
// import Messages     from "./pages/Messages";
// import CoursesDirectory from "./pages/courses/CoursesDirectory";
// import CourseDetail from "./pages/courses/CourseDetail";

// // ✅ Protected route wrapper (UPDATED LOGIC ONLY)
// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const { user, loading } = useContext(AuthContext);
  
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-bg-base flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   }
  
//   if (!user) return <Navigate to="/login" replace />;

//   // ✅ Role-based protection (added)
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/" replace />;
//   }
  
//   return children;
// };

// function RoleDashboard() {
//   const { user } = useContext(AuthContext);
//   return user?.role === "admin" ? <Admin /> : <Dashboard />;
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/forgot-password" element={<ForgotPassword />} />

//       <Route 
//         path="/" 
//         element={
//           <ProtectedRoute>
//             <AppLayout><RoleDashboard /></AppLayout>
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
//         path="/projects/:projectId"
//         element={
//           <ProtectedRoute>
//             <AppLayout><ProjectDetails /></AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/projects/:projectId/preview"
//         element={
//           <ProtectedRoute>
//             <AppLayout><ProjectPreview /></AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/explore/portfolio/:portfolioId"
//         element={
//           <ProtectedRoute allowedRoles={["student", "instructor", "employer", "admin"]}>
//             <AppLayout><Profile /></AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       <Route 
//         path="/explore" 
//         element={
//           <ProtectedRoute allowedRoles={["student", "instructor", "employer", "admin"]}>
//             <AppLayout><Explore /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />

//       <Route 
//         path="/instructors" 
//         element={
//           <ProtectedRoute allowedRoles={["student", "instructor", "employer", "admin"]}>
//             <AppLayout><Instructors /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />

//       <Route
//         path="/courses/:courseId"
//         element={
//           <ProtectedRoute allowedRoles={["admin", "instructor"]}>
//             <AppLayout><CourseDetail /></AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/courses"
//         element={
//           <ProtectedRoute allowedRoles={["admin", "instructor"]}>
//             <AppLayout><CoursesDirectory /></AppLayout>
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
//         path="/favorites"
//         element={
//           <ProtectedRoute allowedRoles={["student", "employer"]}>
//             <AppLayout><Favorites /></AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/admin"
//         element={
//           <ProtectedRoute allowedRoles={["admin"]}>
//             <AppLayout><Admin /></AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/admin/:section"
//         element={
//           <ProtectedRoute allowedRoles={["admin"]}>
//             <AppLayout><AdminDataPage /></AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/admin/account-management"
//         element={
//           <ProtectedRoute allowedRoles={["admin"]}>
//             <AppLayout><AdminAccountManagement /></AppLayout>
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
//         path="/internships/:internshipId"
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
//         path="/requests"
//         element={
//           <ProtectedRoute allowedRoles={["student", "instructor", "admin"]}>
//             <AppLayout><Requests /></AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/tasks"
//         element={
//           <ProtectedRoute allowedRoles={["student", "instructor"]}>
//             <AppLayout><Tasks /></AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       <Route 
//         path="/messages" 
//         element={
//           <ProtectedRoute allowedRoles={["student", "instructor", "employer"]}>
//             <AppLayout><Messages /></AppLayout>
//           </ProtectedRoute>
//         } 
//       />
//     </Routes>
//   );
// }

// function ScrollToTop() {
//   const { pathname } = useLocation();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [pathname]);

//   return null;
// }

// function App() {
//   return (
//     <AuthProvider>
//       <ProjectsProvider>
//         <BrowserRouter>
//           <ScrollToTop />
//           <AppRoutes />
//         </BrowserRouter>
//       </ProjectsProvider>
//     </AuthProvider>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ProjectsProvider } from "./context/ProjectsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppLayout } from "./components/layout/AppLayout";
import Login        from "./pages/auth/Login";
import Register     from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard    from "./pages/Dashboard";
import Projects     from "./pages/projects/Projects";
import ProjectDetails from "./pages/projects/ProjectDetails";
import ProjectPreview from "./pages/projects/ProjectPreview";
import Explore      from "./pages/discovery/Explore";
import Instructors  from "./pages/discovery/Instructors";
import Favorites    from "./pages/favorites/Favorites";
import Profile      from "./pages/profile/Profile";
import Admin        from "./pages/admin/Admin";
import AdminStatistics from "./pages/admin/AdminStatistics";
import AdminDataPage from "./pages/admin/AdminDataPage";
import AdminAccountManagement from "./pages/admin/AdminAccountManagement";
import Internships  from "./pages/internships/Internships";
import Notifications from "./pages/Notifications";
import Requests from "./pages/Requests";
import Tasks from "./pages/Tasks";
import Messages     from "./pages/Messages";
import CoursesDirectory from "./pages/courses/CoursesDirectory";
import CourseDetail from "./pages/courses/CourseDetail";

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
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/" element={<ProtectedRoute><AppLayout><RoleDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><AppLayout><Projects /></AppLayout></ProtectedRoute>} />
      <Route path="/projects/:projectId" element={<ProtectedRoute><AppLayout><ProjectDetails /></AppLayout></ProtectedRoute>} />
      <Route path="/projects/:projectId/preview" element={<ProtectedRoute><AppLayout><ProjectPreview /></AppLayout></ProtectedRoute>} />
      <Route path="/explore/portfolio/:portfolioId" element={<ProtectedRoute allowedRoles={["student","instructor","employer","admin"]}><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute allowedRoles={["student","instructor","employer","admin"]}><AppLayout><Explore /></AppLayout></ProtectedRoute>} />
      <Route path="/instructors" element={<ProtectedRoute allowedRoles={["student","instructor","employer","admin"]}><AppLayout><Instructors /></AppLayout></ProtectedRoute>} />
      <Route path="/courses/:courseId" element={<ProtectedRoute allowedRoles={["admin","instructor"]}><AppLayout><CourseDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute allowedRoles={["admin","instructor"]}><AppLayout><CoursesDirectory /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute allowedRoles={["student","employer"]}><AppLayout><Favorites /></AppLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AppLayout><Admin /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/statistics" element={<ProtectedRoute allowedRoles={["admin"]}><AppLayout><AdminStatistics /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/:section" element={<ProtectedRoute allowedRoles={["admin"]}><AppLayout><AdminDataPage /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/account-management" element={<ProtectedRoute allowedRoles={["admin"]}><AppLayout><AdminAccountManagement /></AppLayout></ProtectedRoute>} />
      <Route path="/internships" element={<ProtectedRoute><AppLayout><Internships /></AppLayout></ProtectedRoute>} />
      <Route path="/internships/:internshipId" element={<ProtectedRoute><AppLayout><Internships /></AppLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute allowedRoles={["student","instructor","admin"]}><AppLayout><Requests /></AppLayout></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute allowedRoles={["student"]}><AppLayout><Tasks /></AppLayout></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute allowedRoles={["student","instructor","employer"]}><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
    </Routes>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectsProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </ProjectsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;