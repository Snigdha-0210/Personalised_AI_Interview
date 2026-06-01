import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/resume")({ component: ResumePage });

const technical = ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "Jest", "Git", "REST APIs", "Tailwind"];
const experience = [
  { co: "Acme Corp", role: "Senior Frontend Engineer", years: "2022 — Present", hl: "Led migration of 40k-LOC app to React 19." },
  { co: "Globex", role: "Frontend Engineer", years: "2019 — 2022", hl: "Built design system used across 6 products." },
  { co: "Initech", role: "Software Engineer", years: "2017 — 2019", hl: "Owned billing dashboards (Stripe integration)." },
];

function ResumePage() {
  const [uploaded, setUploaded] = useState(true);
  return (
    <>
      <PageHeader title="Resume Intelligence" description="AI parses skills, experience, and projects to compute a quality score." />
      <div className="p-8 space-y-6">
        {!uploaded ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-16 text-center">
            <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
            <h3 className="mt-3 font-semibold">Upload your resume</h3>
            <p className="text-sm text-muted-foreground">PDF, DOCX up to 5 MB</p>
            <Button className="mt-4 bg-gradient-primary border-0" onClick={() => setUploaded(true)}>Choose file</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
                    <div>
                      <div className="font-medium">alex_chen_resume_v3.pdf</div>
                      <div className="text-xs text-muted-foreground">Uploaded 2 hours ago · 248 KB</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setUploaded(false)}>Replace</Button>
                </div>
                <div className="mt-6 aspect-[4/3] rounded-xl bg-muted border border-border flex items-center justify-center text-sm text-muted-foreground">
                  PDF preview
                </div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resume Quality</div>
                <div className="mt-2 flex items-end gap-2">
                  <div className="text-5xl font-semibold tracking-tight">92</div>
                  <div className="text-sm text-success pb-2">Excellent</div>
                </div>
                <Progress value={92} className="mt-3" />
                <div className="mt-5 space-y-2 text-sm">
                  <Row label="ATS Compatibility" v={96} />
                  <Row label="Skill Density" v={88} />
                  <Row label="Impact Statements" v={91} />
                  <Row label="Clarity & Length" v={94} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Technical Skills">
                <div className="flex flex-wrap gap-2">
                  {technical.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{s}</span>
                  ))}
                </div>
              </Card>
              <Card title="Experience Breakdown">
                <ul className="space-y-3">
                  {experience.map((e) => (
                    <li key={e.co} className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div>
                        <div className="text-sm font-medium">{e.role} · {e.co}</div>
                        <div className="text-xs text-muted-foreground">{e.years} — {e.hl}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card title="Strength Areas">
                <ul className="space-y-2 text-sm">
                  {["Frontend architecture at scale", "Design system ownership", "Performance optimization", "Cross-functional collaboration"].map((s) => (
                    <li key={s} className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-success mt-0.5" />{s}</li>
                  ))}
                </ul>
              </Card>
              <Card title="Weak Areas">
                <ul className="space-y-2 text-sm">
                  {["Backend system design depth", "Kubernetes / container orchestration", "Quantified business outcomes"].map((s) => (
                    <li key={s} className="flex gap-2 items-start"><AlertTriangle className="w-4 h-4 text-warning mt-0.5" />{s}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Row({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="font-medium">{v}</span></div>
      <Progress value={v} className="h-1 mt-1" />
    </div>
  );
}