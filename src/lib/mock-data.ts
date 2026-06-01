export const performanceTrend = [
  { week: "W1", score: 62, target: 75 },
  { week: "W2", score: 68, target: 75 },
  { week: "W3", score: 71, target: 78 },
  { week: "W4", score: 76, target: 80 },
  { week: "W5", score: 79, target: 82 },
  { week: "W6", score: 84, target: 85 },
  { week: "W7", score: 87, target: 87 },
  { week: "W8", score: 91, target: 90 },
];

export const skillProgress = [
  { skill: "Algorithms", current: 84, prev: 62 },
  { skill: "System Design", current: 71, prev: 48 },
  { skill: "Frontend", current: 92, prev: 80 },
  { skill: "Backend", current: 78, prev: 60 },
  { skill: "Communication", current: 88, prev: 70 },
  { skill: "Problem Solving", current: 83, prev: 65 },
];

export const recentActivity = [
  { id: 1, type: "Interview", title: "Senior Frontend Engineer — Adaptive", date: "2h ago", score: 87 },
  { id: 2, type: "Resume", title: "Resume v3 analyzed", date: "Yesterday", score: 92 },
  { id: 3, type: "JD Match", title: "Stripe — Backend Engineer", date: "2d ago", score: 78 },
  { id: 4, type: "Interview", title: "System Design — Medium", date: "4d ago", score: 71 },
];

export const interviewHistory = [
  { id: "iv-001", date: "2026-05-30", role: "Senior Frontend Engineer", type: "Technical", score: 87, recommendation: "Hire", duration: "45m" },
  { id: "iv-002", date: "2026-05-26", role: "Full Stack Engineer", type: "System Design", score: 71, recommendation: "Borderline", duration: "60m" },
  { id: "iv-003", date: "2026-05-22", role: "Backend Engineer", type: "Technical", score: 92, recommendation: "Strong Hire", duration: "45m" },
  { id: "iv-004", date: "2026-05-18", role: "Data Scientist", type: "Behavioral", score: 64, recommendation: "Needs Improvement", duration: "30m" },
  { id: "iv-005", date: "2026-05-14", role: "Software Engineer", type: "HR", score: 81, recommendation: "Hire", duration: "30m" },
];

export const interviewQuestions = [
  { id: 1, q: "Walk me through how you'd design a rate-limiter for a public API.", difficulty: "Medium", skill: "System Design" },
  { id: 2, q: "Explain the difference between optimistic and pessimistic concurrency control.", difficulty: "Medium", skill: "Backend" },
  { id: 3, q: "How would you debug a memory leak in a long-running React app?", difficulty: "Hard", skill: "Frontend" },
  { id: 4, q: "Describe a time you disagreed with a tech lead. How did you resolve it?", difficulty: "Easy", skill: "Communication" },
  { id: 5, q: "Design a URL shortener that handles 1B writes/day.", difficulty: "Hard", skill: "System Design" },
];

export const skills = {
  matched: ["React", "TypeScript", "Node.js", "REST APIs", "PostgreSQL", "Git", "CI/CD", "Jest"],
  missing: ["Kubernetes", "GraphQL", "Redis", "gRPC"],
  recommended: ["System Design", "Distributed Systems", "AWS Lambda"],
};

export const aiStates = [
  { id: "resume", label: "Resume Analysis", status: "complete" },
  { id: "skill", label: "Skill Mapping", status: "complete" },
  { id: "gen", label: "Question Generation", status: "complete" },
  { id: "eval", label: "Response Evaluation", status: "active" },
  { id: "diff", label: "Difficulty Adjustment", status: "active" },
  { id: "score", label: "Scoring", status: "pending" },
  { id: "rec", label: "Recommendation", status: "pending" },
];

export const panel = [
  { id: "tl", name: "Maya Chen", role: "Technical Lead", focus: "Code quality, architecture", score: 88, status: "active" },
  { id: "em", name: "David Park", role: "Engineering Manager", focus: "Leadership, scope", score: 82, status: "idle" },
  { id: "rc", name: "Sarah Klein", role: "Recruiter", focus: "Fit, motivation", score: 90, status: "idle" },
  { id: "hr", name: "Liam O'Connor", role: "HR Manager", focus: "Values, culture", score: 85, status: "idle" },
];

export const auditTrail = [
  { t: "00:00", event: "Interview started — Difficulty: Medium", kind: "system" },
  { t: "01:42", event: "Q1 asked: Rate-limiter design", kind: "question" },
  { t: "03:10", event: "Response evaluated — Score 82", kind: "score" },
  { t: "03:12", event: "Confidence rose, difficulty → Hard", kind: "decision" },
  { t: "05:30", event: "Q2 asked: Memory leak debugging", kind: "question" },
  { t: "08:14", event: "Stress signal detected — pause +2s", kind: "decision" },
  { t: "10:02", event: "Response evaluated — Score 74", kind: "score" },
  { t: "10:05", event: "Difficulty held at Hard", kind: "decision" },
];

export const weekly = [
  { day: "Mon", interviews: 2, score: 78 },
  { day: "Tue", interviews: 1, score: 82 },
  { day: "Wed", interviews: 3, score: 85 },
  { day: "Thu", interviews: 2, score: 88 },
  { day: "Fri", interviews: 4, score: 91 },
  { day: "Sat", interviews: 1, score: 86 },
  { day: "Sun", interviews: 0, score: 0 },
];