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
├── context/        # Global state contexts (AuthContext.jsx for role-based auth, ProjectsContext.jsx)
├── data/           # Mock data and fixtures (dummy.js contains all mock entities and update subscribers)
├── hooks/          # Custom React hooks (useFavorites.js, useProjects.js)
└── pages/          # Individual view components representing route destinations
```

---

## Core Domains & Pages (`src/pages/`)

*   **Authentication (`auth/`)**: Contains `Login.jsx`, `Register.jsx`, `RegisterEmployer.jsx`, and `ForgotPassword.jsx`.
*   **Dashboard**:
    *   `Dashboard.jsx`: Default entry view for students, employers, and instructors.
    *   `admin/Admin.jsx`: Specialized control panel with analytics/charts for admin users.
*   **Projects Management (`projects/`)**: `Projects.jsx` (List), `ProjectDetails.jsx` (View single project), and `ProjectPreview.jsx`.
*   **Discovery (`discovery/`)**: 
    *   `Explore.jsx`: Search engine/feed for projects and talent.
    *   `Instructors.jsx`: Directory of academic staff with name and course filtering.
*   **Academic/Courses (`courses/`)**: `CoursesDirectory.jsx` and `CourseDetail.jsx`.
*   **Careers/Internships (`internships/`)**: `Internships.jsx` for job board functionality.
*   **User Management**: 
    *   `profile/Profile.jsx`: Unified profile component. Handles both personal "My Profile" (editable) and public "Portfolio" views (read-only) for Instructors, Students, and Employers via `:portfolioId` routing.
    *   `favorites/Favorites.jsx`: Bookmarked projects/profiles.
*   **Administration (`admin/`)**: 
    *   `AdminDataPage.jsx`: Dynamic data-grid viewer for Sections (Users, Approvals, Requests, Flagged Projects, Appeals). Supports document viewing/downloading for employer verification.
    *   `AdminAccountManagement.jsx` and `AdminCreateAdmin.jsx`.
*   **Communication**: `Messages.jsx` (Chat functionality) and `Notifications.jsx` (System alerts).

---

## Technical Patterns & Constraints

### Profile Read-Only Mode
The `Profile.jsx` component uses a logic check: `const isReadOnly = isPublicView && user?.email !== authUser?.email;`. This pattern ensures that while admins or other users can view a portfolio, they cannot modify it unless they are the owner. Public views are accessed via `/explore/portfolio/:portfolioId`.

### Admin Document Handling
Admins can review employer legitimacy via `AdminDataPage.jsx`'s Approvals section. This includes a modal-based "Company Documentation" viewer that supports:
- **View Details**: Full company bio and contact info.
- **Document Preview/Download**: Logic in `handleDownload` simulates file retrieval for `uploadedDocs` found in `dummy.js`.

### Theming & UI
- **Dark Theme Tokens:** `bg-bg-base`, `bg-bg-surface`, `bg-bg-elevated`, `text-text-primary`, `accent-gold`, `accent-blue`.
- **Form Controls:** Native `select` and `option` elements must have explicit background classes (`bg-bg-surface`) to prevent "white flashing" in dark mode.

---

## Routing and Security
Routing is handled in `src/App.jsx`.
The application utilizes a `<ProtectedRoute>` wrapper that filters access based on user roles (`student`, `instructor`, `employer`, `admin`).
*Example*: `/admin/*` routes are strictly limited to `["admin"]`, while `/explore` allows all authenticated roles.

---

## Agent Guidelines & Future Modifications
1. **Data flow**: Heavy reliance on `src/data/dummy.js`. Use `subscribeDummyUpdates` for real-time UI synchronization when modifying mock data.
2. **Styling**: Always use existing Tailwind utility classes and theme-compliant colors.
3. **Hierarchy**: The sidebar in `AppLayout.jsx` dynamically renders links based on `currentUser.role`. Always check sidebar visibility when adding new pages.
4. **Documentation**: Per architectural rules, **any significant feature addition, structural modification, or major dependency update must be documented in `README.md`**.