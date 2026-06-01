import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { BookOpen, Zap, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/skill-gap")({ component: SkillGap });

const weeks = [
  { w: "Week 1", focus: "System Design Foundations", items: ["Load balancing patterns", "Caching layers (Redis, CDN)", "Database scaling (read replicas, sharding)"], hours: 8 },
  { w: "Week 2", focus: "Kubernetes & Containers", items: ["Pods, Deployments, Services", "Helm + GitOps basics", "Hands-on: deploy a 3-tier app"], hours: 10 },
  { w: "Week 3", focus: "GraphQL & API Design", items: ["Schema design + resolvers", "DataLoader & N+1 prevention", "Federation overview"], hours: 7 },
  { w: "Week 4", focus: "Mock Interviews & Review", items: ["3 timed system-design rounds", "2 behavioral STAR drills", "Final readiness assessment"], hours: 9 },
];

function SkillGap() {
  return (
    <>
      <PageHeader title="Skill Gap Roadmap" description="A focused 4-week plan to close the gaps that block your next role." />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Priority Gaps", v: "4", icon: Zap, accent: "bg-warning/10 text-warning" },
            { label: "Plan Length", v: "4 weeks", icon: BookOpen, accent: "bg-primary/10 text-primary" },
            { label: "Estimated Lift", v: "+14 pts", icon: CheckCircle2, accent: "bg-success/10 text-success" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-card border border-border p-5 shadow-card flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.accent}`}><s.icon className="w-5 h-5" /></div>
              <div><div className="text-xl font-semibold">{s.v}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {weeks.map((wk, i) => (
            <div key={wk.w} className="rounded-2xl bg-card border border-border p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-primary uppercase tracking-wider">{wk.w}</div>
                  <h3 className="font-semibold mt-1">{wk.focus}</h3>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">{wk.hours}h</span>
              </div>
              <ol className="mt-4 space-y-2">
                {wk.items.map((it, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">{idx + 1}</span>
                    {it}
                  </li>
                ))}
              </ol>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Difficulty: {["Easy", "Medium", "Medium", "Hard"][i]}</span>
                <span>3 resources · 2 drills</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}