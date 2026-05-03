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
  // Admin
  {
    id: 2,
    name: "Admin User",
    email: "admin@guc.edu.eg",
    password: "password",
    role: "admin",
    bio: "Platform administrator",
    avatar: null,
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
    coursesTaught: [1, 4], // IDs from courses array
    officeHours: "Mon 12:00-14:00",
    linkedin: "https://linkedin.com/in/dr-sara",
    avatar: null,
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
      { id: 1, name: "tax_certificate.pdf", uploadedAt: "2026-03-15" }
    ],
    avatar: null,
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
    github: "https://github.com",
    demo: null,
    languages: ["React", "Node.js", "MongoDB"],
    rating: 4.5,
    visibility: "public",
    createdAt: "2026-03-10",
    description: "A web app that helps GUC students navigate the campus, find rooms, and check lab availability in real time.",
  },
  {
    id: 2,
    title: "Arabic NLP Sentiment Analyzer",
    course: "Machine Intelligence",
    courseCode: "CSEN901",
    owner: "Ahmed El-Sayed",
    github: "https://github.com",
    demo: null,
    languages: ["Python", "TensorFlow", "Flask"],
    rating: 5,
    visibility: "public",
    createdAt: "2025-12-01",
    description: "An ML model trained on Egyptian Arabic tweets to classify sentiment with 91% accuracy.",
  },
  {
    id: 3,
    title: "GUC Portfolio Platform",
    course: "Bachelor Project",
    courseCode: "BP",
    owner: "Sara Mahmoud",
    github: "https://github.com",
    demo: null,
    languages: ["React", "FastAPI", "PostgreSQL"],
    rating: 4,
    visibility: "public",
    createdAt: "2026-01-15",
    description: "A central platform for GUC students to showcase their course and bachelor projects.",
  },
];

export const courses = [
  { id: 1, name: "Software Engineering", code: "CSEN401" },
  { id: 2, name: "Machine Intelligence", code: "CSEN901" },
  { id: 3, name: "Database II", code: "CSEN604" },
  { id: 4, name: "Bachelor Project", code: "BP" },
];

export const notifications = [
  { id: 1, text: "Dr. Sara rated your project Smart Campus Navigator 4.5/5", read: false, time: "2h ago", audience: ["student"] },
  { id: 2, text: "Youssef Ahmed accepted your collaboration invite", read: false, time: "5h ago", audience: ["student"] },
  { id: 3, text: "New feedback on task: Design DB Schema", read: true, time: "1d ago", audience: ["student", "instructor"] },
  { id: 4, text: "Your company verification documents are under review", read: false, time: "3h ago", audience: ["employer"] },
  { id: 5, text: "Admin approved your company profile", read: true, time: "1d ago", audience: ["employer"] },
  { id: 6, text: "New employer application waiting for review", read: false, time: "45m ago", audience: ["admin"] },
];

export function getVisibleNotifications(user) {
  if (!user?.role) return notifications;

  return notifications.filter((notification) =>
    !notification.audience || notification.audience.includes(user.role)
  );
}

export function getUnreadNotificationCount(user) {
  return getVisibleNotifications(user).filter((notification) => !notification.read).length;
}

export const internships = [
  {
    id: 1,
    title: "Frontend Engineer Intern",
    company: "Instabug",
    duration: "3 months",
    skills: ["React", "TypeScript"],
    deadline: "2026-05-01",
    status: "hiring",
  },
  {
    id: 2,
    title: "ML Research Intern",
    company: "Valeo Egypt",
    duration: "6 months",
    skills: ["Python", "PyTorch"],
    deadline: "2026-04-15",
    status: "hiring",
  },
];
