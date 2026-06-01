import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, TrendingUp, Activity, RotateCcw } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_authenticated/results")({ component: Results });

const breakdown = [
  { dim: "Technical", v: 88 },
  { dim: "Communication", v: 84 },
  { dim: "Problem Solving", v: 91 },
  { dim: "Time Efficiency", v: 76 },
  { dim: "Relevance", v: 89 },
];

function Results() {
  return (
    <>
      <PageHeader
        title="Executive Summary Report"
        description="Objective evaluation across five hiring dimensions."
        actions={<div className="flex gap-2">
          <Link to="/audit"><Button variant="outline" size="sm">View audit trail</Button></Link>
          <Link to="/interview-setup"><Button size="sm" className="bg-gradient-primary border-0"><RotateCcw className="w-4 h-4 mr-1.5" />Retake</Button></Link>
        </div>}
      />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-gradient-primary p-7 text-white shadow-elevated">
            <div className="text-xs uppercase tracking-wider opacity-80">Readiness Score</div>
            <div className="mt-2 text-6xl font-semibold tracking-tight">87</div>
            <div className="mt-1 text-sm opacity-90">Top 12% of candidates this week</div>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />Recommendation: Hire
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-semibold mb-2">Dimensional Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={breakdown}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Radar dataKey="v" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {breakdown.map((b) => (
            <div key={b.dim} className="rounded-2xl bg-card border border-border p-5 shadow-card">
              <div className="flex justify-between items-baseline">
                <h4 className="font-medium">{b.dim}</h4>
                <span className="text-xl font-semibold tabular-nums">{b.v}</span>
              </div>
              <Progress value={b.v} className="mt-2" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Strengths" icon={CheckCircle2} accent="text-success" items={["Clear, structured framing of problems", "Strong trade-off analysis under pressure", "Excellent communication of technical concepts"]} />
          <Card title="Weaknesses" icon={AlertTriangle} accent="text-warning" items={["Hesitation on deep system-design questions", "Time spent on low-impact details", "Occasional jargon without definition"]} />
          <Card title="Improvement Areas" icon={TrendingUp} accent="text-primary" items={["Practice 3 system design rounds / week", "Time-box answers to 4 min each", "Add concrete metrics to STAR answers"]} />
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-primary" />Pressure Performance Intelligence</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Stress Adaptability", v: 82, note: "Strong recovery curve" },
              { label: "Response Latency", v: "1.8s", note: "Below cohort avg" },
              { label: "Consistency Under Difficulty", v: 79, note: "Held score on Hard tier" },
              { label: "Recovery After Mistakes", v: 91, note: "Quick reframing observed" },
            ].map((m) => (
              <div key={m.label}>
                <div className="text-xs text-muted-foreground">{m.label}</div>
                <div className="text-2xl font-semibold mt-1">{m.v}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Card({ title, icon: Icon, accent, items }: { title: string; icon: React.ComponentType<{ className?: string }>; accent: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
      <h3 className={`font-semibold flex items-center gap-2 mb-3 ${accent}`}><Icon className="w-4 h-4" />{title}</h3>
      <ul className="space-y-2 text-sm">
        {items.map((s, i) => <li key={i} className="flex gap-2"><span className="text-muted-foreground">·</span>{s}</li>)}
      </ul>
    </div>
  );
}