import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { panel } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/panel")({ component: Panel });

function Panel() {
  return (
    <>
      <PageHeader title="AI Panel Interview" description="Four AI interviewers evaluating different dimensions in parallel." />
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {panel.map((p) => (
          <div key={p.id}
            className={`rounded-2xl bg-card border p-6 shadow-card transition ${p.status === "active" ? "border-primary shadow-elevated" : "border-border"}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold relative">
                {p.name.split(" ").map((n) => n[0]).join("")}
                {p.status === "active" && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success pulse-dot border-2 border-card" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.role}</div>
              </div>
              {p.status === "active" && <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">Live</span>}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{p.focus}</p>
            <div className="mt-5">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Live evaluation</span><span className="font-semibold tabular-nums">{p.score}</span></div>
              <Progress value={p.score} className="mt-1" />
            </div>
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground italic">
              {p.status === "active" ? "Asking follow-up about scalability constraints…" : "Awaiting their round"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}