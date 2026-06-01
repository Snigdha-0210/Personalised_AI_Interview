import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Play } from "lucide-react";

export const Route = createFileRoute("/_authenticated/interview-setup")({ component: Setup });

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Scientist", "Software Engineer"];
const TYPES = ["Technical", "Behavioral", "HR", "System Design"];
const DIFFS = ["Easy", "Medium", "Hard", "Adaptive"];
const DURS = ["15 Minutes", "30 Minutes", "45 Minutes", "60 Minutes"];

function Setup() {
  const nav = useNavigate();
  const [role, setRole] = useState(ROLES[2]);
  const [type, setType] = useState(TYPES[0]);
  const [diff, setDiff] = useState(DIFFS[3]);
  const [dur, setDur] = useState(DURS[2]);

  return (
    <>
      <PageHeader title="Interview Setup" description="Configure the simulation. The AI calibrates difficulty in real time." />
      <div className="p-8 max-w-4xl space-y-6">
        <Group title="Role" options={ROLES} value={role} onChange={setRole} />
        <Group title="Interview Type" options={TYPES} value={type} onChange={setType} />
        <Group title="Difficulty" options={DIFFS} value={diff} onChange={setDiff} hint="Adaptive shifts difficulty based on your responses." />
        <Group title="Duration" options={DURS} value={dur} onChange={setDur} />

        <div className="flex items-center justify-between rounded-2xl bg-card border border-border p-6 shadow-card">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Ready to start</div>
            <div className="font-medium mt-0.5">{role} · {type} · {diff} · {dur}</div>
          </div>
          <Button className="bg-gradient-primary border-0" onClick={() => nav({ to: "/interview-room" })}>
            <Play className="w-4 h-4 mr-1.5" />Start Interview
          </Button>
        </div>
      </div>
    </>
  );
}

function Group({ title, options, value, onChange, hint }: { title: string; options: readonly string[]; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)}
            className={`px-4 py-2 rounded-lg border text-sm transition ${value === o ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/40"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}