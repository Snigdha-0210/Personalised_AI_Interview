import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { aiStates } from "@/lib/mock-data";
import { Brain, Cpu, AlertTriangle, GitBranch, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ai-monitor")({ component: Monitor });

const reasoning = [
  { t: "00:00", state: "Resume Analysis", msg: "Parsed 8 skills, 3 roles, 6 projects. Confidence 0.94." },
  { t: "00:08", state: "Skill Mapping", msg: "Mapped to JD requirements. Coverage 78%." },
  { t: "00:14", state: "Question Generation", msg: "Generated 12 candidates. Selected 5 spanning Medium → Hard." },
  { t: "02:11", state: "Response Evaluation", msg: "Q1 scored 82 (strong framing, weak depth). Confidence rising." },
  { t: "02:13", state: "Difficulty Adjustment", msg: "Threshold met. Bumped Medium → Hard." },
  { t: "05:42", state: "Difficulty Adjustment", msg: "Stress signal detected (+latency). Held difficulty stable." },
];

function Monitor() {
  return (
    <>
      <PageHeader title="AI Decision Engine" description="Live state machine driving the interview." />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><GitBranch className="w-4 h-4 text-primary" />State Machine</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />Running
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              {aiStates.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`px-4 py-2 rounded-lg border text-sm font-medium
                    ${s.status === "complete" ? "bg-success/10 border-success/30 text-success" :
                      s.status === "active" ? "bg-primary/10 border-primary text-primary" :
                      "bg-muted border-border text-muted-foreground"}`}>
                    {s.label}
                  </div>
                  {i < aiStates.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-4">
            <Metric icon={Cpu} label="Current Threshold" v="0.74" hint="Confidence required to bump difficulty" />
            <Metric icon={Brain} label="Adaptation Logic" v="Sigmoid · k=2.4" hint="Smooth ramp-up under correct streak" />
            <Metric icon={AlertTriangle} label="Termination Risk" v="Low" hint="No fatigue / repeat-failure signals" />
            <Metric icon={Brain} label="Confidence Level" v="0.88" hint="In current recommendation" />
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-card">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold">AI Reasoning Trail</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Why the engine made each decision.</p>
          </div>
          <div className="divide-y divide-border">
            {reasoning.map((r, i) => (
              <div key={i} className="px-6 py-4 grid grid-cols-12 gap-4 items-start">
                <div className="col-span-2 text-xs text-muted-foreground tabular-nums">{r.t}</div>
                <div className="col-span-3 text-xs font-medium text-primary">{r.state}</div>
                <div className="col-span-7 text-sm">{r.msg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Metric({ icon: Icon, label, v, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; v: string; hint: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon className="w-4 h-4" /></div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold">{v}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
      </div>
    </div>
  );
}