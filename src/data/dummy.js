export const currentUser = {
  id: 1,
  name: "Ahmed El-Sayed",
  email: "ahmed.elsayed@student.guc.edu.eg",
  role: "student", // student | instructor | employer | admin
  major: "Media Engineering & Technology",
  skills: ["React", "Node.js", "Python", "Figma"],
  avatar: null,
};

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
  { id: 1, text: "Dr. Sara rated your project Smart Campus Navigator 4.5/5", read: false, time: "2h ago" },
  { id: 2, text: "Youssef Ahmed accepted your collaboration invite", read: false, time: "5h ago" },
  { id: 3, text: "New feedback on task: Design DB Schema", read: true, time: "1d ago" },
];

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
