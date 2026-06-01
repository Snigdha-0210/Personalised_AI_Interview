import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { getDashboardAnalytics } from "@/server/db-functions";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, CheckCircle2, Activity, Upload, FileText, Mic, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useResumeContext } from "@/lib/ResumeContext";

export const Route = createFileRoute("/_authenticated/dashboard")({ 
  component: Dashboard,
  loader: async () => {
    const res = await getDashboardAnalytics();
    return res.data;
  }
});

function Dashboard() {
  const analyticsData = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState("overview");
  const { profile } = useResumeContext();

  const readinessScore = profile?.readinessScore || 0;
  const hiringConfidence = profile?.hiringProbability > 70 ? "High" : profile?.hiringProbability > 40 ? "Medium" : "Low";
  const interviewsCompleted = profile?.interviewHistory?.length || 0;

  const stats = [
    { label: "Readiness Score", value: readinessScore.toString(), delta: "+12", icon: Award, accent: "bg-primary/10 text-primary" },
    { label: "Hiring Confidence", value: hiringConfidence, delta: "Strong Hire", icon: CheckCircle2, accent: "bg-success/10 text-success" },
    { label: "Interviews Completed", value: interviewsCompleted.toString(), delta: "Lifetime", icon: Activity, accent: "bg-warning/10 text-warning" },
    { label: "Improvement Trend", value: "+18%", delta: "8-wk avg", icon: TrendingUp, accent: "bg-chart-4/10 text-chart-4" },
  ];

  // Placeholder for missing real data in this scope
  const performanceTrend = [
    { week: "W1", score: 40, target: 50 },
    { week: "W2", score: 55, target: 55 },
    { week: "W3", score: Math.max(60, readinessScore - 10), target: 60 },
    { week: "W4", score: readinessScore || 70, target: 65 },
  ];
  
  const skillProgress = [
    { skill: "React", prev: 50, current: 80 },
    { skill: "Node", prev: 40, current: 75 },
    { skill: "System Design", prev: 30, current: 60 },
  ];

  const recentActivity = (profile?.interviewHistory || []).map((s: any, i: number) => ({
    id: s._id || i,
    type: "Technical Interview",
    date: new Date(s.createdAt || Date.now()).toLocaleDateString(),
    title: s.track || "Software Engineer",
    score: s.overallScore || 0,
  }));

  if (recentActivity.length === 0) {
    recentActivity.push({ id: 1, type: "System", date: "Today", title: "Profile Initialized", score: readinessScore });
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your interview readiness, at a glance."
        actions={
          <div className="flex gap-2">
            <Link to="/resume"><Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1.5" />Upload Resume</Button></Link>
            <Link to="/jd-match"><Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-1.5" />Analyze JD</Button></Link>
            <Link to="/interview-setup"><Button size="sm" className="bg-gradient-primary border-0"><Mic className="w-4 h-4 mr-1.5" />Start Interview</Button></Link>
          </div>
        }
      />
      {!profile ? (
        <div className="p-8">
          <div className="rounded-2xl bg-card border border-primary/20 p-8 shadow-card text-center max-w-2xl mx-auto mt-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to HireMind OS</h2>
            <p className="text-muted-foreground mb-8">
              Your intelligent interview preparation journey starts here. Upload your resume to unlock personalized mock interviews, AI analysis, skill gap mapping, and precise readiness tracking.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/resume">
                <Button size="lg" className="bg-gradient-primary border-0">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Resume
                </Button>
              </Link>
              <Link to="/interview-setup">
                <Button size="lg" variant="outline">
                  Try Basic Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-card border border-border p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.accent}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">{s.delta}</span>
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Performance Trend</h3>
                  <p className="text-xs text-muted-foreground">8-week composite score vs. target</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">+29 pts</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={performanceTrend}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} fill="url(#g1)" />
                  <Line type="monotone" dataKey="target" stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
              <h3 className="font-semibold">Skill Progress</h3>
              <p className="text-xs text-muted-foreground mb-3">Current vs. 8 weeks ago</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={skillProgress} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="skill" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                  <Bar dataKey="prev" fill="var(--muted)" radius={[4, 4, 4, 4]} />
                  <Bar dataKey="current" fill="var(--primary)" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Recent Activity</h3>
                <Link to="/history" className="text-xs text-primary font-medium inline-flex items-center gap-0.5">View all <ArrowUpRight className="w-3 h-3" /></Link>
              </div>
              <div className="divide-y divide-border">
                {recentActivity.map((a) => (
                  <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">{a.type} · {a.date}</div>
                      <div className="font-medium text-sm">{a.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold tabular-nums">{a.score}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
              <h3 className="font-semibold">Interview Success Rate</h3>
              <p className="text-xs text-muted-foreground mb-3">Last 8 weeks</p>
              <div className="relative h-40 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-40 h-40 -rotate-90">
                  <circle cx="60" cy="60" r="50" stroke="var(--muted)" strokeWidth="12" fill="none" />
                  <circle cx="60" cy="60" r="50" stroke="var(--primary)" strokeWidth="12" fill="none"
                    strokeDasharray={`${0.83 * 314} 314`} strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <div className="text-3xl font-semibold">83%</div>
                  <div className="text-xs text-muted-foreground">Pass rate</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 text-center text-xs">
                <div><div className="font-semibold text-sm">20</div><div className="text-muted-foreground">Hire</div></div>
                <div><div className="font-semibold text-sm">3</div><div className="text-muted-foreground">Borderline</div></div>
                <div><div className="font-semibold text-sm">1</div><div className="text-muted-foreground">Reject</div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}