import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Target, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elevated">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">HireMind AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/signup"><Button size="sm" className="bg-gradient-primary border-0">Get started</Button></Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
          Adaptive Interview Intelligence
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight max-w-3xl mx-auto leading-[1.05]">
          The AI interviewer that thinks like a <span className="bg-gradient-primary bg-clip-text text-transparent">hiring manager</span>.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          HireMind AI runs adaptive mock interviews, measures performance under pressure, and produces objective, explainable hiring-readiness reports.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/signup"><Button size="lg" className="bg-gradient-primary border-0">Start free <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
          <Link to="/login"><Button size="lg" variant="outline">I have an account</Button></Link>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6 text-left">
          {[
            { icon: Brain, t: "Adaptive AI", d: "Difficulty shifts in real time based on your responses, stress signals, and recovery patterns." },
            { icon: Target, t: "Objective Scoring", d: "Multi-dimensional evaluation across accuracy, communication, problem solving, and time efficiency." },
            { icon: Shield, t: "Explainable Decisions", d: "Full audit trail of every difficulty shift, score, and recommendation for recruiter transparency." },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-card shadow-card">
              <f.icon className="w-5 h-5 text-primary mb-3" />
              <div className="font-semibold mb-1">{f.t}</div>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
          {["Resume Intelligence", "JD Match", "Panel Simulation", "Pressure Analytics", "Recruiter Audit Trail"].map((s) => (
            <span key={s} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" />{s}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
