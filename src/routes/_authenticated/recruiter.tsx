import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Shield, Download, TrendingUp, TrendingDown, Minus, CheckCircle2,
  AlertTriangle, Users, BarChart3, FileText, Activity, Clock
} from "lucide-react";
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/recruiter")({ component: RecruiterPage });

const recommendationConfig: Record<string, { color: string; bg: string }> = {
  "Strong Hire": { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-300" },
  "Hire": { color: "text-blue-700", bg: "bg-blue-50 border-blue-300" },
  "Borderline": { color: "text-amber-700", bg: "bg-amber-50 border-amber-300" },
  "Needs Improvement": { color: "text-red-700", bg: "bg-red-50 border-red-300" },
};

const radarData = [
  { dim: "Technical", v: 88 },
  { dim: "Communication", v: 84 },
  { dim: "Problem Solving", v: 91 },
  { dim: "Time Efficiency", v: 76 },
  { dim: "Relevance", v: 89 },
  { dim: "Adaptability", v: 85 },
];

const scoreProgression = recruiterSession.questionProgression.map(q => ({
  name: `Q${q.q}`,
  score: q.score,
  difficulty: q.difficulty === "Easy" ? 1 : q.difficulty === "Medium" ? 2 : 3,
}));

function RecruiterPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "transcript" | "analytics">("overview");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recruiter/sessions")
      .then(res => res.json())
      .then(data => {
        if (data.success) setSessions(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading sessions...</div>;
  if (!sessions.length) return <div className="p-8 text-center text-muted-foreground">No interview sessions recorded yet.</div>;

  const session = sessions[0]; // Display the most recent session
  const grade = session.transcript?.grade || {};

  const rec = {
    candidate: { 
      name: "Candidate", 
      role: session.track || "Software Engineer", 
      duration: session.transcript?.grade?.duration || "15m", 
      date: new Date(session.createdAt || Date.now()).toLocaleDateString() 
    },
    overallScore: session.overallScore || grade.score || 0,
    recommendation: grade.recommendation || "Borderline",
    hiringConfidence: session.hiringConfidence || grade.score || 0,
    questionProgression: [
      { q: 1, type: "Technical", timeSpent: "5m", difficulty: "Medium", score: grade.score || 85, difficultyChange: "Constant" }
    ],
    strengths: grade.feedback?.filter((f: any) => f.score >= 80).map((f: any) => `${f.aspect}: ${f.comments}`) || ["Solid technical fundamentals"],
    weaknesses: grade.feedback?.filter((f: any) => f.score < 80).map((f: any) => `${f.aspect}: ${f.comments}`) || ["Could provide deeper answers"],
    riskIndicators: [{ label: "Communication Risk", severity: "Low", detail: "Acceptable for role" }],
    difficultyHistory: [{ step: "Q1", level: "Medium" }],
    transcript: [{ time: "00:00", speaker: "Candidate", text: session.transcript?.raw || "No transcript recorded" }]
  };

  const rcfg = recommendationConfig[rec.recommendation] || recommendationConfig["Borderline"];

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Users },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "transcript" as const, label: "Transcript", icon: FileText },
  ];

  return (
    <>
      <PageHeader
        title="Recruiter Intelligence"
        description="Complete hiring-grade evaluation with explainable AI decisions."
        actions={
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1.5" />Export Report
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Candidate Header */}
        <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-elevated">
                {rec.candidate.name[0]}
              </div>
              <div>
                <div className="text-lg font-semibold">{rec.candidate.name}</div>
                <div className="text-sm text-muted-foreground">{rec.candidate.role}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rec.candidate.duration}</span>
                  <span>·</span>
                  <span>{rec.candidate.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Overall Score</div>
                <div className="text-4xl font-semibold tabular-nums">{rec.overallScore}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Recommendation</div>
                <div className={cn("px-4 py-2 rounded-xl border-2 text-sm font-bold", rcfg.bg, rcfg.color)}>
                  {rec.recommendation}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Hiring Confidence</div>
                <div className="text-4xl font-semibold text-primary tabular-nums">{rec.hiringConfidence}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === t.id ? "bg-card shadow-card text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-5">
              {/* Question Progression */}
              <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
                <div className="p-5 border-b border-border">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />Question Progression
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {rec.questionProgression.map(q => (
                    <div key={q.q} className="px-5 py-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                        {q.q}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{q.type}</div>
                        <div className="text-xs text-muted-foreground">{q.timeSpent}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          q.difficulty === "Hard" ? "bg-red-50 text-red-600" :
                            q.difficulty === "Medium" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        )}>{q.difficulty}</span>
                        <div className="text-right">
                          <div className="text-lg font-semibold tabular-nums">{q.score}</div>
                          <div className="text-[10px] text-muted-foreground">{q.difficultyChange}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-emerald-700 mb-3">
                    <CheckCircle2 className="w-4 h-4" />Candidate Strengths
                  </h3>
                  <ul className="space-y-2">
                    {rec.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-amber-700 mb-3">
                    <AlertTriangle className="w-4 h-4" />Candidate Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {rec.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-amber-500 shrink-0 mt-0.5">→</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />Risk Indicators
                </h3>
                <div className="space-y-3">
                  {rec.riskIndicators.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border">
                      <div className={cn(
                        "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5",
                        r.severity === "None" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          r.severity === "Low" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-red-50 text-red-700 border-red-200"
                      )}>{r.severity}</div>
                      <div>
                        <div className="text-sm font-medium">{r.label}</div>
                        <div className="text-xs text-muted-foreground">{r.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-4">
              {/* Radar */}
              <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
                <h3 className="font-semibold text-sm mb-2">Dimensional Scores</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <Radar dataKey="v" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Difficulty History */}
              <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
                <h3 className="font-semibold text-sm mb-3">Difficulty Progression</h3>
                <div className="space-y-2">
                  {rec.difficultyHistory.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{d.step}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-semibold border",
                        d.level === "Hard" ? "bg-red-50 text-red-600 border-red-200" :
                          d.level === "Easy" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            "bg-amber-50 text-amber-600 border-amber-200"
                      )}>{d.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              {[
                { label: "Risk Level", value: rec.riskLevel, color: "text-emerald-600" },
                { label: "Questions Asked", value: rec.questionProgression.length.toString() },
                { label: "Avg Score Per Q", value: Math.round(rec.questionProgression.reduce((a, q) => a + q.score, 0) / rec.questionProgression.length).toString() },
              ].map(s => (
                <div key={s.label} className="rounded-2xl bg-card border border-border p-4 shadow-card flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className={cn("font-semibold", s.color ?? "")}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
              <h3 className="font-semibold mb-3">Score Progression per Question</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={scoreProgression}>
                  <defs>
                    <linearGradient id="rg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} fill="url(#rg1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
              <h3 className="font-semibold mb-3">Dimensional Breakdown</h3>
              <div className="space-y-3 pt-2">
                {radarData.map(r => (
                  <div key={r.dim}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{r.dim}</span>
                      <span className="font-semibold">{r.v}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full" style={{ width: `${r.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transcript Tab */}
        {activeTab === "transcript" && (
          <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Interview Transcript</h3>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1.5" />Download</Button>
            </div>
            <div className="divide-y divide-border">
              {rec.transcript.map((t, i) => (
                <div key={i} className={cn("px-6 py-4 flex gap-4", t.speaker === "Candidate" && "bg-primary/5")}>
                  <div className="text-xs font-mono text-muted-foreground w-12 shrink-0 pt-0.5">{t.time}</div>
                  <div className={cn(
                    "text-xs font-semibold w-20 shrink-0 pt-0.5",
                    t.speaker === "AI" ? "text-primary" : "text-foreground"
                  )}>{t.speaker}</div>
                  <div className="text-sm flex-1">{t.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
