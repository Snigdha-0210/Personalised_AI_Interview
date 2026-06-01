import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { auditTrail } from "@/lib/mock-data";
import { Shield, MessageSquare, TrendingUp, Settings2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/audit")({ component: Audit });

const transcript = [
  { who: "AI", msg: "Walk me through how you'd design a rate-limiter for a public API." },
  { who: "You", msg: "I'd start with a token-bucket per API key, sized to the published quota..." },
  { who: "AI", msg: "How would you persist state across nodes?" },
  { who: "You", msg: "Redis with atomic INCR + EXPIRE; fall back to local LRU if Redis is unreachable." },
];

const iconFor = (k: string) => k === "decision" ? Settings2 : k === "score" ? TrendingUp : k === "question" ? MessageSquare : Shield;

function Audit() {
  return (
    <>
      <PageHeader title="Recruiter Audit Trail" description="Complete transparency into every decision, score, and difficulty shift." />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card">
          <div className="p-6 border-b border-border"><h3 className="font-semibold">Interview Transcript</h3></div>
          <div className="divide-y divide-border">
            {transcript.map((t, i) => (
              <div key={i} className="px-6 py-4 flex gap-4">
                <div className={`text-[10px] font-semibold w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${t.who === "AI" ? "bg-gradient-primary text-white" : "bg-muted text-foreground"}`}>{t.who === "AI" ? "AI" : "You"}</div>
                <p className="text-sm leading-relaxed">{t.msg}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border shadow-card">
          <div className="p-6 border-b border-border"><h3 className="font-semibold">Decision History</h3></div>
          <div className="divide-y divide-border">
            {auditTrail.map((e, i) => {
              const Icon = iconFor(e.kind);
              return (
                <div key={i} className="px-5 py-3 flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground tabular-nums">{e.t}</div>
                    <div className="text-sm">{e.event}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}