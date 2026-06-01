import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { skills } from "@/lib/mock-data";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/jd-match")({ component: JDMatch });

function JDMatch() {
  const [jd, setJd] = useState("Senior Full-Stack Engineer at Stripe — building payment APIs with TypeScript, Node, GraphQL, Kubernetes…");
  return (
    <>
      <PageHeader title="JD Match Intelligence" description="See how your resume stacks against a job description." />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-semibold mb-3">Job Description</h3>
            <Textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={8} placeholder="Paste a job description…" />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm">Upload JD</Button>
              <Button size="sm" className="bg-gradient-primary border-0"><Sparkles className="w-4 h-4 mr-1.5" />Analyze</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" />Matching Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.matched.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><XCircle className="w-4 h-4 text-destructive" />Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.missing.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Recommended to Learn</h3>
              <div className="flex flex-wrap gap-2">
                {skills.recommended.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card text-center">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Match</div>
            <div className="my-4 relative h-44 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-44 h-44 -rotate-90">
                <circle cx="60" cy="60" r="52" stroke="var(--muted)" strokeWidth="10" fill="none" />
                <circle cx="60" cy="60" r="52" stroke="var(--primary)" strokeWidth="10" fill="none"
                  strokeDasharray={`${0.78 * 326} 326`} strokeLinecap="round" />
              </svg>
              <div className="absolute"><div className="text-4xl font-semibold">78%</div><div className="text-xs text-muted-foreground">Fit score</div></div>
            </div>
            <p className="text-sm text-muted-foreground">Strong technical match. Bridge backend depth to push above 90%.</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-semibold mb-2">Candidate Fit Analysis</h3>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between"><span className="text-muted-foreground">Technical</span><span className="font-medium">86%</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Experience</span><span className="font-medium">82%</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Domain</span><span className="font-medium">71%</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Soft skills</span><span className="font-medium">89%</span></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}