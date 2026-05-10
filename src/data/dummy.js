// ===== DUMMY USERS =====
// Student: ahmed.elsayed@student.guc.edu.eg | password: password
// Admin: admin@guc.edu.eg | password: password
// Instructor: dr.sara@guc.edu.eg | password: password
// Employer: recruiter@techcompany.com | password: password

export const dummyUsers = [
  // Student
  {
    id: 1,
    name: "Ahmed El-Sayed",
    email: "ahmed.elsayed@student.guc.edu.eg",
    password: "password",
    role: "student",
    major: "Media Engineering & Technology",
    skills: ["React", "Node.js", "Python", "Figma"],
    bio: "Passionate about web development and AI",
    linkedIn: "https://linkedin.com/in/ahmed",
    avatar: null,
  },
  {
    id: 7,
    name: "Youssef Ahmed",
    email: "youssef.ahmed@student.guc.edu.eg",
    password: "password",
    role: "student",
    major: "Media Engineering & Technology",
    skills: ["React", "Express", "MongoDB"],
    bio: "Interested in full-stack product engineering",
    linkedIn: "https://linkedin.com/in/youssef",
    avatar: null,
  },
  {
    id: 8,
    name: "Mariam Hassan",
    email: "mariam.hassan@student.guc.edu.eg",
    password: "password",
    role: "student",
    major: "Computer Science",
    skills: ["UI Design", "Testing", "JavaScript"],
    bio: "Focused on usable and reliable web apps",
    linkedIn: "https://linkedin.com/in/mariam",
    avatar: null,
    status: "active",
    completedInternships: [
      {
        id: 1,
        title: "Frontend Engineer Intern",
        company: "Instabug",
        startDate: "2025-06-01",
        endDate: "2025-08-31",
        skills: ["React", "TypeScript", "UI Testing"],
        description: "Worked on customer-facing dashboards and reusable React components.",
      },
      {
        id: 2,
        title: "ML Research Intern",
        company: "Valeo Egypt",
        startDate: "2025-09-01",
        endDate: "2026-02-28",
        skills: ["Python", "PyTorch", "Data Analysis"],
        description: "Supported automotive AI experiments by preparing datasets and training models.",
      },
      {
        id: 3,
        title: "React Platform Intern",
        company: "TechCompany Egypt",
        startDate: "2026-01-10",
        endDate: "2026-04-10",
        skills: ["React", "Tailwind CSS", "UX"],
        description: "Shipped portfolio discovery flows and refined shared UI components with the product team.",
      },
    ],
  },
  // Admin
  {
    id: 2,
    name: "Admin User",
    email: "admin@guc.edu.eg",
    password: "password",
    role: "admin",
    bio: "Platform administrator",
    avatar: null,
    status: "active",
  },
  // Instructor
  {
    id: 3,
    name: "Dr. Sara Abdelhamid",
    email: "dr.sara@guc.edu.eg",
    password: "password",
    role: "instructor",
    bio: "Associate Professor in Software Engineering",
    researchInterests: ["Software Architecture", "Design Patterns", "Agile Methods"],
    education: ["PhD in Computer Science - Cairo University", "BSc in Computer Science"],
    coursesTaught: [1, 2, 4],
    officeHours: "Mon 12:00-14:00",
    linkedin: "https://linkedin.com/in/dr-sara",
    avatar: null,
    status: "active",
  },
  // Employer
  {
    id: 4,
    name: "Recruiter",
    email: "recruiter@techcompany.com",
    password: "password",
    role: "employer",
    companyName: "TechCompany Egypt",
    companyBio: "Leading tech solutions provider in Egypt",
    address: "123 Tahrir Square, Cairo, Egypt",
    location: "Tahrir Square, Cairo, Egypt",
    companyEmail: "careers@techcompany.com",
    companyPhone: "+20 2 1234 5678",
    logo: null,
    verificationStatus: "approved", // pending | approved | rejected
    uploadedDocs: [
      { id: 1, name: "tax_certificate.pdf", uploadedAt: "2026-03-15" },
    ],
    avatar: null,
    status: "active",
  },
  {
    id: 5,
    name: "Dr. Aya Salama",
    email: "dr.aya@gmail.com",
    password: "password",
    role: "instructor",
    bio: "Lecturer in Human-Computer Interaction",
    researchInterests: ["UX Research", "Usability Testing", "Interaction Design"],
    education: ["PhD in HCI - University of Warwick"],
    coursesTaught: [2, 3],
    officeHours: "Wed 10:00-12:00",
    linkedin: "https://linkedin.com/in/dr-aya",
    avatar: null,
    status: "active",
  },
];

export const currentUser = {
  id: 1,
  name: "Ahmed El-Sayed",
  email: "ahmed.elsayed@student.guc.edu.eg",
  role: "student",
  major: "Media Engineering & Technology",
  skills: ["React", "Node.js", "Python", "Figma"],
  avatar: null,
};

export const instructorDirectory = [
  {
    id: 1,
    name: "Dr. Sara Abdelhamid",
    email: "dr.sara@guc.edu.eg",
    bio: "Associate Professor in Software Engineering",
    researchInterests: ["Software Architecture", "Design Patterns", "Agile Methods"],
    education: ["PhD in Computer Science - Cairo University", "BSc in Computer Science"],
    coursesTaught: [1, 4],
  },
  {
    id: 2,
    name: "Dr. Aya Salama",
    email: "dr.aya@guc.edu.eg",
    bio: "Lecturer in Human-Computer Interaction",
    researchInterests: ["UX Research", "Usability Testing", "Interaction Design"],
    education: ["PhD in HCI - University of Warwick"],
    coursesTaught: [2, 3],
  },
];

export const employerApplications = [
  {
    id: 1,
    name: "Instabug",
    contact: "hr@instabug.com",
    companyEmail: "hr@instabug.com",
    address: "Cairo Festival City, New Cairo",
    location: "New Cairo, Cairo, Egypt",
    companyBio: "Bug reporting and mobile observability platform.",
    verificationStatus: "pending",
    uploadedDocs: [
      { id: 1, name: "instabug_tax_certificate.pdf", uploadedAt: "2026-05-01" },
      { id: 2, name: "instabug_trade_register.pdf", uploadedAt: "2026-05-01" },
    ],
  },
  {
    id: 2,
    name: "Valeo Egypt",
    contact: "talent@valeo.com",
    companyEmail: "talent@valeo.com",
    address: "Smart Village, Giza",
    location: "6th of October City, Giza, Egypt",
    companyBio: "Automotive technology and software engineering teams.",
    verificationStatus: "pending",
    uploadedDocs: [
      { id: 1, name: "valeo_tax_certificate.pdf", uploadedAt: "2026-05-02" },
    ],
  },
  {
    id: 3,
    name: "Rabbit",
    contact: "people@rabbitmart.com",
    companyEmail: "people@rabbitmart.com",
    address: "Maadi, Cairo",
    location: "Maadi, Cairo, Egypt",
    companyBio: "On-demand delivery and logistics startup.",
    verificationStatus: "pending",
    uploadedDocs: [
      { id: 1, name: "rabbit_tax_certificate.pdf", uploadedAt: "2026-05-02" },
    ],
  },
];

export const projects = [
  {
    id: 1,
    title: "Smart Campus Navigator",
    course: "Software Engineering",
    courseCode: "CSEN401",
    owner: "Ahmed El-Sayed",
    supervisor: "Dr. Sara Abdelhamid",
    status: "Completed",
    github: "https://github.com/Software-Engineering-Spring-2026/SE_Team27",
    demo: "https://smart-campus-navigator.example.com",
    report: "Smart_Campus_Navigator_Report.pdf",
    languages: ["React", "Node.js", "MongoDB"],
    team: ["Ahmed El-Sayed", "Youssef Ahmed", "Mariam Hassan"],
    rating: 4.5,
    visibility: "public",
    createdAt: "2026-03-10",
    description:
      "A web app that helps GUC students navigate the campus, find rooms, and check lab availability in real time.",
    problem:
      "Students often lose time finding rooms, checking lab availability, and understanding building routes during busy academic days.",
    solution:
      "The project combines searchable campus maps, room metadata, and live availability indicators in one student-facing dashboard.",
    features: [
      "Interactive campus map with building and room search",
      "Room details with capacity, equipment, and floor information",
      "Live lab availability status for common computer labs",
      "Saved favorite rooms for repeated schedules",
      "Admin-ready structure for updating locations and lab data",
    ],
    outcomes: [
      "Reduced room lookup time during testing with students",
      "Created a reusable data model for rooms, buildings, and facilities",
      "Prepared the app for future integration with live campus systems",
    ],
    resources: [
      { label: "Project Repository", url: "https://github.com/Software-Engineering-Spring-2026/SE_Team27" },
      { label: "Live Project", url: "https://smart-campus-navigator.example.com" },
      { label: "Final Report", url: "#" },
    ],
    instructorInvitations: [
      {
        id: 1,
        instructorId: 1,
        instructorName: "Dr. Sara Abdelhamid",
        email: "dr.sara@guc.edu.eg",
        status: "accepted",
        sentAt: "2026-03-11",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Create room search",
        description: "Build the searchable room list and filters.",
        assignee: "Youssef Ahmed",
        status: "completed",
        deadline: "2026-03-20",
        createdAt: "2026-03-12",
      },
      {
        id: 2,
        title: "Polish map UI",
        description: "Improve the campus map labels and interactions.",
        assignee: "Mariam Hassan",
        status: "pending",
        deadline: "2026-03-28",
        createdAt: "2026-03-12",
      },
    ],
    platformActive: true,
    flagged: false,
    flagReason: null,
    hiddenFromPublic: false,
    appealSubmitted: false,
  },
  {
    id: 2,
    title: "Arabic NLP Sentiment Analyzer",
    course: "Machine Intelligence",
    courseCode: "CSEN901",
    owner: "Ahmed El-Sayed",
    supervisor: "Dr. Aya Salama",
    status: "Reviewed",
    github: "https://github.com/Software-Engineering-Spring-2026/SE_Team27",
    demo: "https://arabic-sentiment.example.com",
    report: "Arabic_NLP_Sentiment_Report.pdf",
    demoVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    languages: ["Python", "TensorFlow", "Flask"],
    team: ["Ahmed El-Sayed"],
    rating: 5,
    visibility: "public",
    createdAt: "2025-12-01",
    description: "An ML model trained on Egyptian Arabic tweets to classify sentiment with 91% accuracy.",
    problem:
      "Most sentiment models perform poorly on informal Egyptian Arabic because of dialect, slang, Arabizi, and mixed-language posts.",
    solution:
      "The project preprocesses Arabic social text, trains a neural classifier, and serves predictions through a Flask API.",
    features: [
      "Arabic text cleaning and normalization pipeline",
      "Support for dialect-heavy tweets and mixed Arabic-English phrases",
      "TensorFlow model trained on labeled sentiment data",
      "Flask endpoint for real-time sentiment prediction",
      "Evaluation dashboard with accuracy, precision, and recall",
    ],
    outcomes: [
      "Reached 91% validation accuracy on the prepared dataset",
      "Documented preprocessing steps for reproducible experiments",
      "Produced an API that can be connected to external applications",
    ],
    resources: [
      { label: "Project Repository", url: "https://github.com/Software-Engineering-Spring-2026/SE_Team27" },
      { label: "Live Project", url: "https://arabic-sentiment.example.com" },
      { label: "Final Report", url: "#" },
    ],
    instructorInvitations: [
      {
        id: 2,
        instructorId: 2,
        instructorName: "Dr. Aya Salama",
        email: "dr.aya@guc.edu.eg",
        status: "rejected",
        sentAt: "2025-12-03",
      },
    ],
    tasks: [],
    platformActive: false,
    flagged: true,
    flagReason: "Report appendix matches a publicly posted assignment solution without attribution.",
    hiddenFromPublic: false,
    appealSubmitted: false,
  },
  {
    id: 3,
    title: "GUC Portfolio Platform",
    course: "Bachelor Project",
    courseCode: "BP",
    owner: "Sara Mahmoud",
    supervisor: "Dr. Sara Abdelhamid",
    status: "In Progress",
    github: "https://github.com/Software-Engineering-Spring-2026/SE_Team27",
    demo: "https://guc-portfolio-platform.example.com",
    report: "GUC_Portfolio_Platform_Report.pdf",
    demoVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    languages: ["React", "FastAPI", "PostgreSQL"],
    team: ["Sara Mahmoud", "Omar Tarek", "Laila Mostafa"],
    rating: 4,
    visibility: "public",
    createdAt: "2026-01-15",
    description: "A central platform for GUC students to showcase their course and bachelor projects.",
    problem:
      "Student projects are scattered across private drives, repositories, and course submissions, making discovery difficult for instructors and employers.",
    solution:
      "The platform provides searchable project profiles, role-based access, and structured project metadata for students, instructors, employers, and administrators.",
    features: [
      "Public project profiles with course, owner, stack, and rating",
      "Role-based navigation for students, instructors, employers, and admins",
      "Project discovery with filtering by course, owner, date, and rating",
      "Employer-facing browsing for recruiting and internship matching",
      "Admin review flow for platform moderation",
    ],
    outcomes: [
      "Defined a complete project discovery workflow for multiple user roles",
      "Built reusable frontend components for cards, badges, modals, and headers",
      "Prepared the data model for backend integration and project submissions",
    ],
    resources: [
      { label: "Project Repository", url: "https://github.com/Software-Engineering-Spring-2026/SE_Team27" },
      { label: "Live Project", url: "https://guc-portfolio-platform.example.com" },
      { label: "Final Report", url: "#" },
    ],
    platformActive: false,
    flagged: true,
    flagReason: "Multiple students reported inconsistent team contribution claims in the project description.",
    hiddenFromPublic: false,
    appealSubmitted: true,
  },
];

/** Student appeals to lift moderation after a flag (admin inbox). */
export let projectAppeals = [
  {
    id: 1,
    projectId: 3,
    projectTitle: "GUC Portfolio Platform",
    studentName: "Sara Mahmoud",
    studentEmail: "sara.mahmoud@student.guc.edu.eg",
    message:
      "The contribution section was drafted as a placeholder before final team sign-off — we will update roles and percentages with receipts.",
    submittedAt: "2026-05-07",
    status: "pending",
  },
  {
    id: 2,
    projectId: 2,
    projectTitle: "Arabic NLP Sentiment Analyzer",
    studentName: "Ahmed El-Sayed",
    studentEmail: "ahmed.elsayed@student.guc.edu.eg",
    message:
      "We added full attribution in the report appendix and uploaded the revised PDF to the course submission folder.",
    submittedAt: "2026-04-20",
    status: "resolved",
  },
];

/** Majors shown in Explore → portfolios filter and on portfolio cards. */
export const GUC_MAJORS = ["MET", "IET", "BI", "Management", "Law", "Dentistry", "Mechatronics"];

export const portfolios = [
  {
    id: 101,
    owner: "Ahmed El-Sayed",
    studentName: "Ahmed El-Sayed",
    studentEmail: "ahmed.elsayed@student.guc.edu.eg",
    title: "Smart Campus Navigator Portfolio",
    headline: "MET",
    skills: ["React", "Node.js", "Python", "Figma"],
    projectIds: [1, 2],
    contributionScore: 96,
  },
  {
    id: 102,
    owner: "Mariam Hassan",
    studentName: "Mariam Hassan",
    studentEmail: "mariam.hassan@student.guc.edu.eg",
    title: "Mobile Observability Toolkit",
    headline: "IET",
    skills: ["React", "TypeScript", "Testing"],
    projectIds: [],
    contributionScore: 88,
  },
  {
    id: 103,
    owner: "Sara Mahmoud",
    studentName: "Sara Mahmoud",
    studentEmail: "sara.mahmoud@student.guc.edu.eg",
    title: "GUC Portfolio Platform",
    headline: "BI",
    skills: ["React", "FastAPI", "PostgreSQL"],
    projectIds: [3],
    contributionScore: 98,
  },
  {
    id: 104,
    owner: "Omar Tarek",
    studentName: "Omar Tarek",
    studentEmail: "omar.tarek@student.guc.edu.eg",
    title: "Arabic Vision Research Lab",
    headline: "Law",
    skills: ["Python", "PyTorch", "Computer Vision"],
    projectIds: [],
    contributionScore: 92,
  },
  {
    id: 105,
    owner: "Youssef Ahmed",
    studentName: "Youssef Ahmed",
    studentEmail: "youssef.ahmed@student.guc.edu.eg",
    title: "Course Planner Dashboard",
    headline: "Mechatronics",
    skills: ["React", "Figma", "Accessibility"],
    projectIds: [],
    contributionScore: 84,
  },
  {
    id: 106,
    owner: "Laila Mostafa",
    studentName: "Laila Mostafa",
    studentEmail: "laila.mostafa@student.guc.edu.eg",
    title: "Database Audit Console",
    headline: "Dentistry",
    skills: ["Node.js", "PostgreSQL", "Technical Writing"],
    projectIds: [],
    contributionScore: 91,
  },
];

/** Demo direct messages (student / instructor / employer only in UI). */
export let messageThreads = [
  {
    id: "thread-1",
    lastReadMessageIdByUserId: {
      1: "m2",
      3: "m2",
    },
    participants: [
      { userId: 1, name: "Ahmed El-Sayed", email: "ahmed.elsayed@student.guc.edu.eg", role: "student" },
      { userId: 3, name: "Dr. Sara Abdelhamid", email: "dr.sara@guc.edu.eg", role: "instructor" },
    ],
    messages: [
      {
        id: "m1",
        senderId: 3,
        text: "Thanks for submitting the milestone — the architecture section reads clearly.",
        time: "May 7 · 9:14 AM",
      },
      { id: "m2", senderId: 1, text: "Appreciate the quick feedback!", time: "May 7 · 11:02 AM" },
    ],
  },
  {
    id: "thread-2",
    lastReadMessageIdByUserId: {
      4: "m3",
    },
    participants: [
      { userId: 1, name: "Ahmed El-Sayed", email: "ahmed.elsayed@student.guc.edu.eg", role: "student" },
      { userId: 4, name: "Recruiter", email: "recruiter@techcompany.com", role: "employer" },
    ],
    messages: [
      {
        id: "m3",
        senderId: 4,
        text: "We would like to invite you to discuss internship opportunities next week.",
        time: "May 6 · 3:20 PM",
      },
    ],
  },
  {
    id: "thread-3",
    lastReadMessageIdByUserId: {
      3: "m4",
    },
    participants: [
      { userId: 3, name: "Dr. Sara Abdelhamid", email: "dr.sara@guc.edu.eg", role: "instructor" },
      { userId: 4, name: "Recruiter", email: "recruiter@techcompany.com", role: "employer" },
    ],
    messages: [
      {
        id: "m4",
        senderId: 3,
        text: "Sharing the list of students who opted in for company presentations.",
        time: "May 5 · 2:01 PM",
      },
    ],
  },
];

export function getThreadsForUser(user) {
  if (!user?.id) return [];
  return messageThreads.filter((thread) => thread.participants.some((p) => p.userId === user.id));
}

export function getThreadById(threadId) {
  return messageThreads.find((t) => t.id === threadId) || null;
}

export function getOtherParticipant(thread, user) {
  if (!thread || !user) return null;
  return thread.participants.find((p) => p.userId !== user.id) || null;
}

function readCursorIndex(thread, userId) {
  if (!thread?.messages?.length) return -1;
  const map = thread.lastReadMessageIdByUserId || {};
  const readId = map[userId] ?? map[String(userId)];
  if (!readId) return -1;
  const idx = thread.messages.findIndex((m) => m.id === readId);
  return idx >= 0 ? idx : -1;
}

/** DM preview row: unread = messages from everyone else after last read marker */
export function getThreadUnreadInboundCount(thread, user) {
  if (!thread?.messages?.length || !user?.id) return 0;
  const uid = user.id;
  const afterIdx = readCursorIndex(thread, uid);
  return thread.messages
    .slice(afterIdx + 1)
    .filter((m) => m.senderId !== uid).length;
}

export function markThreadReadForViewer(threadId, user) {
  const thread = messageThreads.find((t) => t.id === threadId);
  if (!thread?.messages?.length || !user?.id) return;
  const last = thread.messages[thread.messages.length - 1];
  if (!thread.lastReadMessageIdByUserId) thread.lastReadMessageIdByUserId = {};
  if (thread.lastReadMessageIdByUserId[user.id] === last.id) return;
  thread.lastReadMessageIdByUserId[user.id] = last.id;
  emitDummyUpdate();
}

export function getUnreadInboundThreadTotal(user) {
  if (!user?.id) return 0;
  return getThreadsForUser(user).reduce((sum, t) => sum + getThreadUnreadInboundCount(t, user), 0);
}

export function sendThreadMessage(threadId, senderUser, text) {
  const thread = messageThreads.find((t) => t.id === threadId);
  if (!thread || !senderUser || !text?.trim()) return { ok: false, error: "Invalid message." };
  const trimmed = text.trim();
  const mid = `m-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const timeLabel = new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  thread.messages.push({ id: mid, senderId: senderUser.id, text: trimmed, time: timeLabel });

  if (!thread.lastReadMessageIdByUserId) thread.lastReadMessageIdByUserId = {};
  thread.lastReadMessageIdByUserId[senderUser.id] = mid;

  const others = thread.participants.filter((p) => p.userId !== senderUser.id);
  others.forEach((recipient) => {
    const nid = notifications.length ? Math.max(...notifications.map((n) => n.id)) + 1 : 1;
    const preview = trimmed.length > 120 ? `${trimmed.slice(0, 120)}…` : trimmed;
    notifications.push({
      id: nid,
      kind: "private_message",
      title: "New message",
      text: `${senderUser.name}: ${preview}`,
      read: false,
      time: "Just now",
      audience: ["student", "instructor", "employer"],
      targetUserEmail: recipient.email,
      actionPath: `/messages?thread=${encodeURIComponent(threadId)}`,
      messageThreadId: threadId,
    });
  });
  emitDummyUpdate();
  return { ok: true };
}

export const courses = [
  {
    id: 1,
    name: "Software Engineering",
    code: "CSEN401",
    creditHours: 4,
    brief:
      "End-to-end software engineering practice: requirements, design, implementation, testing, and teamwork using an iterative lifecycle.",
    materials: ["Lecture slides", "Team project briefs", "Git / CI lab sheets", "IEEE-style documentation guide"],
    enrolledCount: 128,
  },
  {
    id: 2,
    name: "Machine Intelligence",
    code: "CSEN901",
    creditHours: 3,
    brief:
      "Core ideas in machine learning and intelligent systems, from classical models to neural networks and responsible deployment.",
    materials: ["Recorded lectures", "Jupyter lab notebooks", "Textbook chapters (selected)", "Kaggle-style mini assignments"],
    enrolledCount: 96,
  },
  {
    id: 3,
    name: "Database II",
    code: "CSEN604",
    creditHours: 3,
    brief:
      "Advanced database concepts including normalization beyond basics, query optimization, transactions, and practical SQL engineering.",
    materials: ["ER modeling sheets", "PostgreSQL lab VMs", "Past exam problem sets"],
    enrolledCount: 74,
  },
  {
    id: 4,
    name: "Bachelor Project",
    code: "BP",
    creditHours: 12,
    brief:
      "Capstone research and engineering project with faculty supervision, milestones, and a final report and defense.",
    materials: ["Supervision charter", "Milestone rubric", "Thesis template", "Ethics & plagiarism checklist"],
    enrolledCount: 210,
  },
];

export function createCourseRecord(name, code) {
  const trimmedName = name?.trim() || "";
  const trimmedCode = code?.trim() || "";
  if (!trimmedName || !trimmedCode) return { ok: false, error: "Name and code are required." };
  const codeNorm = trimmedCode.toUpperCase();
  if (courses.some((course) => course.code.toUpperCase() === codeNorm)) {
    return { ok: false, error: "A course with this code already exists." };
  }
  const id = courses.length ? Math.max(...courses.map((course) => course.id)) + 1 : 1;
  const row = {
    id,
    name: trimmedName,
    code: trimmedCode,
    creditHours: 3,
    brief: "Overview for this catalog entry — update the description from the course detail view context as the term progresses.",
    materials: ["Course syllabus", "Lecture materials"],
    enrolledCount: 0,
  };
  courses.push(row);
  emitDummyUpdate();
  return { ok: true, course: row };
}

export function updateCourseRecord(courseId, name, code) {
  const trimmedName = name?.trim() || "";
  const trimmedCode = code?.trim() || "";
  if (!trimmedName || !trimmedCode) return { ok: false, error: "Name and code are required." };
  const index = courses.findIndex((course) => course.id === courseId);
  if (index === -1) return { ok: false, error: "Course not found." };
  const codeNorm = trimmedCode.toUpperCase();
  const clash = courses.some(
    (course, idx) => idx !== index && course.code.toUpperCase() === codeNorm
  );
  if (clash) return { ok: false, error: "Another course already uses this code." };
  const updated = { ...courses[index], name: trimmedName, code: trimmedCode };
  courses[index] = updated;
  emitDummyUpdate();
  return { ok: true, course: updated };
}

export function deleteCourseRecord(courseId) {
  const index = courses.findIndex((course) => course.id === courseId);
  if (index === -1) return { ok: false, error: "Course not found." };
  courses.splice(index, 1);
  emitDummyUpdate();
  return { ok: true };
}

export const notifications = [
  {
    id: 1,
    kind: "rating",
    title: "Instructor rated your project",
    text: "Dr. Sara rated your project Smart Campus Navigator 4.5/5",
    read: false,
    time: "2h ago",
    audience: ["student"],
    targetProjectId: 1,
  },
  {
    id: 2,
    kind: "collab",
    title: "Collaboration update",
    text: "Youssef Ahmed accepted your collaboration invite",
    read: false,
    time: "5h ago",
    audience: ["student"],
    actionPath: "/messages",
  },
  {
    id: 3,
    kind: "feedback",
    title: "Task feedback",
    text: "New feedback on task: Design DB Schema",
    read: true,
    time: "1d ago",
    audience: ["student", "instructor"],
    actionPath: "/projects",
  },
  {
    id: 4,
    kind: "employer_verification",
    title: "Verification in progress",
    text: "Your company verification documents are under review",
    read: false,
    time: "3h ago",
    audience: ["employer"],
    actionPath: "/profile",
  },
  {
    id: 5,
    kind: "employer_verification",
    title: "Company profile approved",
    text: "Admin approved your company profile",
    read: true,
    time: "1d ago",
    audience: ["employer"],
    actionPath: "/profile",
  },
  {
    id: 6,
    kind: "admin_employer",
    title: "Employer application",
    text: "New employer application waiting for review",
    read: false,
    time: "45m ago",
    audience: ["admin"],
    actionPath: "/admin/approvals",
  },
  {
    id: 7,
    kind: "course_link_request",
    title: "Instructor wants to link a course",
    text: "Dr. Aya Salama requested to link to course CSEN401 (Software Engineering).",
    read: false,
    time: "12m ago",
    audience: ["admin"],
    courseLinkMeta: { type: "link", courseCode: "CSEN401", instructorName: "Dr. Aya Salama" },
    actionPath: "/admin/requests",
  },
  {
    id: 8,
    kind: "course_unlink_request",
    title: "Instructor wants to unlink a course",
    text: "Dr. Sara Abdelhamid submitted a request to unlink from course CSEN901 (Machine Intelligence).",
    read: true,
    time: "1d ago",
    audience: ["admin"],
    courseLinkMeta: { type: "unlink", courseCode: "CSEN901", instructorName: "Dr. Sara Abdelhamid" },
    actionPath: "/admin/requests",
  },
  {
    id: 9,
    kind: "project_flagged",
    title: "Your project needs review",
    text: 'Your project "Arabic NLP Sentiment Analyzer" was flagged for review. Reason: Report appendix matches a publicly posted assignment solution without attribution. Visibility is paused until administrators process an appeal.',
    read: false,
    time: "18h ago",
    audience: ["student"],
    targetStudentEmail: "ahmed.elsayed@student.guc.edu.eg",
    targetProjectId: 2,
  },
];

const dummyUpdateListeners = new Set();

export function subscribeDummyUpdates(listener) {
  dummyUpdateListeners.add(listener);
  return () => dummyUpdateListeners.delete(listener);
}

export function emitDummyUpdate() {
  dummyUpdateListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      /* ignore */
    }
  });
}

/** Pending instructor link/unlink course requests (admin queue). */
export let instructorCourseRequests = [
  {
    id: 1,
    instructorId: 5,
    instructorName: "Dr. Aya Salama",
    instructorEmail: "dr.aya@guc.edu.eg",
    courseId: 1,
    courseCode: "CSEN401",
    courseName: "Software Engineering",
    type: "link",
    requestedAt: "2026-05-09",
  },
  {
    id: 2,
    instructorId: 3,
    instructorName: "Dr. Sara Abdelhamid",
    instructorEmail: "dr.sara@guc.edu.eg",
    courseId: 2,
    courseCode: "CSEN901",
    courseName: "Machine Intelligence",
    type: "unlink",
    requestedAt: "2026-05-08",
  },
];

export function removeInstructorCourseRequest(requestId) {
  const index = instructorCourseRequests.findIndex((request) => request.id === requestId);
  if (index === -1) return false;
  instructorCourseRequests.splice(index, 1);
  emitDummyUpdate();
  return true;
}

function findCourseByCode(code) {
  return courses.find((course) => course.code === code);
}

export function applyInstructorCourseRequestDecision(requestId, accept) {
  const request = instructorCourseRequests.find((item) => item.id === requestId);
  if (!request) return { ok: false };

  const instructorUser = dummyUsers.find(
    (user) => user.role === "instructor" && user.email === request.instructorEmail
  );

  if (accept && instructorUser && Array.isArray(instructorUser.coursesTaught)) {
    const courseMeta = findCourseByCode(request.courseCode);
    const courseKey = courseMeta ? courseMeta.id : request.courseId;
    if (request.type === "link") {
      if (!instructorUser.coursesTaught.includes(courseKey)) {
        instructorUser.coursesTaught.push(courseKey);
      }
    } else {
      instructorUser.coursesTaught = instructorUser.coursesTaught.filter((courseId) => courseId !== courseKey);
    }
  }

  removeInstructorCourseRequest(requestId);

  const decisionWord = accept ? "approved" : "declined";
  const nid = notifications.length ? Math.max(...notifications.map((notification) => notification.id)) + 1 : 1;
  notifications.push({
    id: nid,
    kind: request.type === "unlink" ? "course_unlink_decision" : "course_link_decision",
    title: `Course ${request.type === "unlink" ? "unlink" : "link"} ${decisionWord}`,
    text: `${request.instructorName}, your ${request.type === "unlink" ? "unlink" : "link"} request for ${request.courseCode} was ${decisionWord} by an administrator.`,
    read: false,
    time: "Just now",
    audience: ["instructor"],
    targetInstructorEmail: request.instructorEmail,
    actionPath: "/courses",
    courseLinkMeta: {
      type: request.type,
      courseCode: request.courseCode,
      decision: decisionWord,
    },
  });
  emitDummyUpdate();

  return { ok: true };
}

export function appendInstructorCourseRequest(payload) {
  const nextId = instructorCourseRequests.length
    ? Math.max(...instructorCourseRequests.map((request) => request.id)) + 1
    : 1;
  const courseMeta = courses.find((course) => course.id === payload.courseId || course.code === payload.courseCode);
  const row = {
    id: nextId,
    instructorId: payload.instructorId,
    instructorName: payload.instructorName,
    instructorEmail: payload.instructorEmail,
    courseId: courseMeta?.id ?? payload.courseId,
    courseCode: courseMeta?.code ?? payload.courseCode,
    courseName: courseMeta?.name ?? payload.courseName,
    type: payload.type === "unlink" ? "unlink" : "link",
    requestedAt: payload.requestedAt || new Date().toISOString().slice(0, 10),
  };
  instructorCourseRequests.push(row);

  const linkVerb = row.type === "link" ? "link to" : "unlink from";
  const nid = notifications.length ? Math.max(...notifications.map((notification) => notification.id)) + 1 : 1;
  notifications.push({
    id: nid,
    kind: row.type === "unlink" ? "course_unlink_request" : "course_link_request",
    title: row.type === "unlink" ? "Instructor unlink request" : "Instructor link request",
    text: `${row.instructorName} submitted a request to ${linkVerb} course ${row.courseCode} (${row.courseName}).`,
    read: false,
    time: "Just now",
    audience: ["admin"],
    actionPath: "/admin/requests",
    courseLinkMeta: {
      type: row.type,
      courseCode: row.courseCode,
      courseName: row.courseName,
      instructorName: row.instructorName,
    },
  });
  emitDummyUpdate();
}

export function markNotificationReadForUser(notificationId, user) {
  const visible = getVisibleNotifications(user);
  const target = visible.find((notification) => notification.id === notificationId);
  if (!target) return false;
  const stored = notifications.find((notification) => notification.id === notificationId);
  if (stored) stored.read = true;
  else target.read = true;
  emitDummyUpdate();
  return true;
}

export function markAllNotificationsReadForUser(user) {
  const visibleIds = new Set(getVisibleNotifications(user).map((notification) => notification.id));
  let changed = false;
  notifications.forEach((notification) => {
    if (visibleIds.has(notification.id) && !notification.read) {
      notification.read = true;
      changed = true;
    }
  });
  if (changed) emitDummyUpdate();
}

/** True if the student must see "Applied" / cannot apply again: they submitted (nominated) or were accepted. Rejected allows re-applying. */
export function internshipStudentCannotSubmitAnotherApplication(internship, user) {
  if (!internship?.applications?.length || !user?.email) return false;
  const email = String(user.email).toLowerCase().trim();
  return internship.applications.some(
    (app) =>
      String(app.studentEmail || "").toLowerCase().trim() === email &&
      (app.status === "nominated" || app.status === "accepted")
  );
}

/** Employer login email for a company name (demo catalog match on companyName). */
export function getEmployerEmailForInternshipCompany(companyName) {
  const norm = companyName?.trim();
  if (!norm) return null;
  const employer = dummyUsers.find((u) => u.role === "employer" && u.companyName?.trim() === norm);
  return employer?.email || null;
}

/** Employer inbox: student submitted an application (demo). */
export function pushInternshipApplicationReceivedNotification({
  employerEmail,
  studentName,
  internshipTitle,
  internshipId,
}) {
  if (!employerEmail) return;
  const nid = notifications.length ? Math.max(...notifications.map((notification) => notification.id)) + 1 : 1;
  const who = studentName?.trim() || "A student";
  const roleTitle = internshipTitle?.trim() || "an internship";
  notifications.push({
    id: nid,
    kind: "internship_application_received",
    title: "New internship application",
    text: `${who} has applied for the ${roleTitle} internship.`,
    read: false,
    time: "Just now",
    audience: ["employer"],
    targetUserEmail: employerEmail,
    actionPath: internshipId != null ? `/internships/${internshipId}` : "/internships",
    internshipId: internshipId ?? undefined,
  });
  emitDummyUpdate();
}

/** Student receives inbox row + toast when an employer accepts or rejects their internship application (demo). */
export function pushInternshipApplicationDecisionNotification({
  studentEmail,
  internshipTitle,
  companyName,
  decision,
}) {
  if (!studentEmail || !decision) return;
  const nid = notifications.length ? Math.max(...notifications.map((notification) => notification.id)) + 1 : 1;
  const accepted = decision === "accepted";
  const rejected = decision === "rejected";
  const title = accepted
    ? "Internship application accepted"
    : rejected
      ? "Internship application rejected"
      : "Internship application update";
  const body = accepted
    ? `${companyName || "An employer"} has accepted your application for "${internshipTitle || "an internship"}".`
    : rejected
      ? `Your application for "${internshipTitle || "an internship"}" at ${companyName || "the company"} was not successful — you have not been selected for this role.`
      : `${companyName || "An employer"} has updated your application for "${internshipTitle || "an internship"}".`;

  notifications.push({
    id: nid,
    kind: "internship_application_decision",
    title,
    text: `${body} Open Internships for details.`,
    read: false,
    time: "Just now",
    audience: ["student"],
    targetUserEmail: studentEmail,
    actionPath: "/internships",
  });
  emitDummyUpdate();
}

export function setProjectPlatformActive(projectId, active) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return false;
  project.platformActive = active;
  emitDummyUpdate();
  return true;
}

function emailsMatchForNotification(target, userEmail) {
  if (!target || !userEmail) return !target;
  return String(target).toLowerCase().trim() === String(userEmail).toLowerCase().trim();
}

export function getVisibleNotifications(user) {
  if (!user?.role) return notifications;

  return notifications.filter((notification) => {
    if (notification.audience && !notification.audience.includes(user.role)) {
      return false;
    }
    if (notification.targetStudentEmail && !emailsMatchForNotification(notification.targetStudentEmail, user.email)) {
      return false;
    }
    if (notification.targetInstructorEmail && !emailsMatchForNotification(notification.targetInstructorEmail, user.email)) {
      return false;
    }
    if (notification.targetUserEmail && !emailsMatchForNotification(notification.targetUserEmail, user.email)) {
      return false;
    }
    return true;
  });
}

/** UI helper: icon bubble for notification rows (dock + full page). */
export function getNotificationPresentation(notification) {
  const kind = notification.kind || "";
  if (kind === "course_link_request" || kind === "course_link_decision") {
    return { glyph: "🔗", label: "Course link", bubble: "bg-accent-gold/15 text-accent-gold border-accent-gold/25" };
  }
  if (kind === "course_unlink_request" || kind === "course_unlink_decision") {
    return { glyph: "⎋", label: "Course unlink", bubble: "bg-warning/10 text-warning border-warning/25" };
  }
  if (kind === "project_flagged") {
    return { glyph: "⚑", label: "Moderation", bubble: "bg-danger/10 text-danger border-danger/25" };
  }
  if (kind === "student_appeal") {
    return { glyph: "✉", label: "Appeal", bubble: "bg-accent-blue/10 text-accent-blue border-accent-blue/25" };
  }
  if (kind === "rating" || kind === "feedback") {
    return { glyph: "✦", label: "Academic", bubble: "bg-accent-blue/10 text-accent-blue border-accent-blue/25" };
  }
  if (kind === "employer_verification" || kind === "admin_employer") {
    return { glyph: "🏢", label: "Employer", bubble: "bg-bg-elevated text-text-secondary border-border" };
  }
  if (kind === "collab") {
    return { glyph: "👥", label: "Social", bubble: "bg-success/10 text-success border-success/25" };
  }
  if (kind === "private_message") {
    return { glyph: "✉", label: "Message", bubble: "bg-accent-blue/10 text-accent-blue border-accent-blue/25" };
  }
  if (kind === "internship_application_decision") {
    return { glyph: "◐", label: "Internship", bubble: "bg-accent-gold/15 text-accent-gold border-accent-gold/25" };
  }
  if (kind === "internship_application_received") {
    return { glyph: "◐", label: "Internship", bubble: "bg-accent-blue/10 text-accent-blue border-accent-blue/25" };
  }
  return { glyph: "🔔", label: "Update", bubble: "bg-bg-elevated text-text-secondary border-border" };
}

/** Route to open when the user follows a notification (full page + dock). */
export function getNotificationActionPath(notification) {
  if (!notification) return null;
  if (notification.actionPath) return notification.actionPath;
  if (notification.targetProjectId != null) return `/projects/${notification.targetProjectId}`;

  const kind = notification.kind || "";
  switch (kind) {
    case "rating":
    case "feedback":
      return "/projects";
    case "collab":
      return "/messages";
    case "employer_verification":
      return "/profile";
    case "admin_employer":
      return "/admin/approvals";
    case "course_link_request":
    case "course_unlink_request":
      return "/admin/requests";
    case "course_link_decision":
    case "course_unlink_decision":
      return "/courses";
    case "project_flagged":
      return "/projects";
    case "student_appeal":
      return "/admin/appeals";
    case "private_message":
      return "/messages";
    case "internship_application_decision":
      return "/internships";
    case "internship_application_received":
      return notification.actionPath || "/internships";
    default:
      return null;
  }
}

export function isProjectListedPublicly(project) {
  const active = project.platformActive !== false;
  const hidden = project.hiddenFromPublic === true;
  const isPublicVisibility = project.visibility === "public";
  return Boolean(active && !hidden && isPublicVisibility && !project.flagged);
}

export function exploreProjectsForUser(user) {
  if (!user) return projects.filter((project) => isProjectListedPublicly(project));
  const listedInExplore = (project) => project.platformActive !== false && project.hiddenFromPublic !== true;
  if (user.role === "admin" || user.role === "instructor") {
    return projects.filter(listedInExplore);
  }
  return projects.filter((project) => isProjectListedPublicly(project));
}

function studentPortfolioEmailForOwner(ownerName) {
  const portfolioEntry = portfolios.find((portfolio) => portfolio.owner === ownerName);
  return portfolioEntry?.studentEmail || null;
}

export function getProjectAppeals() {
  return [...projectAppeals].sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
}

export function flagProjectModeration(actorUser, projectId, reason) {
  const project = projects.find((item) => item.id === projectId);
  if (!project || !reason?.trim()) return { ok: false, error: "Missing project or reason." };
  const role = actorUser?.role;
  if (!["admin", "instructor"].includes(role)) return { ok: false, error: "Not allowed." };

  project.flagged = true;
  project.flagReason = reason.trim();
  project.platformActive = false;
  project.hiddenFromPublic = false;
  project.appealSubmitted = false;

  const targetEmail =
    dummyUsers.find((student) => student.role === "student" && student.name === project.owner)?.email ||
    studentPortfolioEmailForOwner(project.owner);

  const nid = notifications.length ? Math.max(...notifications.map((notification) => notification.id)) + 1 : 1;
  const actorLabel =
    actorUser?.name || (role === "admin" ? "An administrator" : "A course instructor");
  notifications.push({
    id: nid,
    kind: "project_flagged",
    title: "Project flagged for policy review",
    text: `${actorLabel} flagged your project "${project.title}". Reason: ${project.flagReason}. The project is deactivated on the platform until you submit an appeal or an administrator clears the flag.`,
    read: false,
    time: "Just now",
    audience: ["student"],
    targetStudentEmail: targetEmail || undefined,
    targetProjectId: projectId,
  });
  emitDummyUpdate();
  return { ok: true };
}

export function submitProjectAppeal(studentUser, projectId, message) {
  const project = projects.find((item) => item.id === projectId);
  if (!project?.flagged || project.owner !== studentUser?.name) {
    return { ok: false, error: "You can only appeal your own flagged projects." };
  }
  const hasPendingAppeal = projectAppeals.some(
    (appeal) => appeal.projectId === projectId && appeal.status === "pending"
  );
  if (hasPendingAppeal || project.appealSubmitted) {
    return { ok: false, error: "You already have a pending appeal for this project." };
  }
  const trimmed = message?.trim() || "";
  if (trimmed.length < 16) return { ok: false, error: "Please write a slightly longer explanation (at least 16 characters)." };
  if (trimmed.length > 420) return { ok: false, error: "Please keep your explanation under 420 characters." };

  const nextAppealId = projectAppeals.length
    ? Math.max(...projectAppeals.map((appeal) => appeal.id)) + 1
    : 1;
  projectAppeals.push({
    id: nextAppealId,
    projectId,
    projectTitle: project.title,
    studentName: studentUser.name,
    studentEmail: studentUser.email,
    message: trimmed,
    submittedAt: new Date().toISOString().slice(0, 10),
    status: "pending",
  });
  project.appealSubmitted = true;

  const aid = notifications.length ? Math.max(...notifications.map((notification) => notification.id)) + 1 : 1;
  notifications.push({
    id: aid,
    kind: "student_appeal",
    title: "Student submitted an appeal",
    text: `${studentUser.name} submitted an appeal for "${project.title}".`,
    read: false,
    time: "Just now",
    audience: ["admin"],
    actionPath: "/admin/appeals",
  });
  emitDummyUpdate();
  return { ok: true };
}

export function adminHideFlaggedProject(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project || !project.flagged) return { ok: false };
  project.hiddenFromPublic = true;
  project.platformActive = false;
  emitDummyUpdate();
  return { ok: true };
}

export function adminClearProjectFlag(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project || !project.flagged) return { ok: false };
  project.flagged = false;
  project.flagReason = null;
  project.hiddenFromPublic = false;
  project.platformActive = true;
  project.appealSubmitted = false;
  projectAppeals.forEach((appeal) => {
    if (appeal.projectId === projectId && appeal.status === "pending") {
      appeal.status = "resolved";
    }
  });
  emitDummyUpdate();
  return { ok: true };
}

export function getUnreadNotificationCount(user) {
  return getVisibleNotifications(user).filter((notification) => !notification.read).length;
}

export function getFlaggedProjects() {
  return projects.filter((project) => project.flagged === true);
}

export const internships = [
  {
    id: 1,
    title: "Frontend Engineer Intern",
    company: "Instabug",
    details:
      "Work with the product team on customer-facing dashboards, reusable React components, and mobile observability workflows.",
    duration: "3 months",
    skills: ["React", "TypeScript", "UI Testing"],
    languages: ["TypeScript", "JavaScript", "CSS"],
    deadline: "2026-05-01",
    postedAt: "2026-04-10",
    status: "hiring",
    archived: false,
    applications: [
      {
        id: 1001,
        studentName: "Mariam Hassan",
        studentEmail: "mariam.hassan@student.guc.edu.eg",
        portfolioId: 102,
        portfolioTitle: "Mobile Observability Toolkit",
        skills: ["React", "TypeScript", "Testing"],
        languages: ["TypeScript", "JavaScript"],
        contributionScore: 88,
        projectCount: 4,
        matchScore: 82,
        appliedAt: "2026-04-27",
        status: "nominated",
        coverLetter: "I am very interested in this role as it aligns with my front-end development goals.",
      },
    ],
  },
];

