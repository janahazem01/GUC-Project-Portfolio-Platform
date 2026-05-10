# GUC Portfolio - Codebase Context

## Overview
GUC Portfolio is a React web application built with Vite tailored for a university ecosystem. It serves as a unified platform for **students** to showcase their projects, **instructors** to manage courses, **employers** to post internships and discover talent, and **admins** to manage the platform.

### Tech Stack
- **Framework:** React 19 (via Vite)
- **Routing:** `react-router-dom` v7
- **Styling:** Tailwind CSS v3 + PostCSS
- **State Management:** React Context API (`AuthContext.jsx`)
- **Linting:** ESLint

---

## Directory Structure
```
src/
├── assets/         # Static assets, images, and sample files
├── components/     # Reusable React components
│   ├── layout/     # Application layout shells (e.g., AppLayout.jsx)
│   ├── ui/         # Base UI components (buttons, inputs, cards)
│   └── viz/        # Data visualization and charts (Charts.jsx, chartColors.js)
├── context/        # Global state contexts (AuthContext.jsx for role-based auth)
├── data/           # Mock data and fixtures (dummy.js contains all mock users, projects, etc.)
├── hooks/          # Custom React hooks (useFavorites.js)
└── pages/          # Individual view components representing route destinations
```

---

## Core Domains & Pages (`src/pages/`)

*   **Authentication (`auth/`)**: Contains `Login.jsx`, `Register.jsx`, and `ForgotPassword.jsx`.
*   **Dashboard**:
    *   `Dashboard.jsx`: Default entry view for students, employers, and instructors.
    *   `admin/Admin.jsx`: Specialized control panel entry for admin users.
*   **Projects Management (`projects/`)**: `Projects.jsx` (List), `ProjectDetails.jsx` (View single project), and `ProjectPreview.jsx`.
*   **Discovery (`discovery/`)**: `Explore.jsx` (Search engine/feed for projects and talent) and `PortfolioDetail.jsx` (Viewing student portfolios).
*   **Academic/Courses (`courses/`)**: `CoursesDirectory.jsx` and `CourseDetail.jsx`.
*   **Careers/Internships (`internships/`)**: `Internships.jsx` for job board functionality.
*   **User Management**: `profile/Profile.jsx` for user settings, `favorites/Favorites.jsx` for bookmarked content.
*   **Administration (`admin/`)**: Sub-views for system management like `AdminDataPage.jsx`, `AdminAccountManagement.jsx`, and `AdminCreateAdmin.jsx`.
*   **Communication**: `Messages.jsx` (Chat functionality) and `Notifications.jsx` (System alerts).

---

## Routing and Security
Routing is handled in `src/App.jsx`.
The application utilizes a `<ProtectedRoute>` wrapper that filters access based on user roles (`student`, `instructor`, `employer`, `admin`).
*Example*: `/admin/*` routes are strictly limited to `["admin"]`, while `/explore` allows `["student", "instructor", "employer", "admin"]`.

---

## Agent Guidelines & Future Modifications
1. **Data flow**: As of now, data is heavily reliant on `src/data/dummy.js`. Any UI behavior mapping should match these mock structures.
2. **Styling**: Always use existing Tailwind utility classes.
3. **Documentation**: Per architectural rules, **any significant feature addition, structural modification, or major dependency update must be documented in `README.md`**.