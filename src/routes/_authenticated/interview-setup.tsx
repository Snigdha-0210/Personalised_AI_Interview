import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { careerTracks } from "@/lib/mock-data";
import { useState } from "react";
import { ArrowRight, Brain, CheckCircle2, Clock, Mic, Code2, MessageSquare, FileText, Lightbulb, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/interview-setup")({ component: InterviewSetup });

const formats = [
  { id: "technical", label: "Technical Deep Dive", icon: Code2, desc: "DSA, system design, architecture" },
  { id: "behavioral", label: "Behavioral & HR", icon: MessageSquare, desc: "STAR method, leadership, culture fit" },
  { id: "mixed", label: "Full Interview", icon: Brain, desc: "All question types, adaptive flow" },
  { id: "voice", label: "Voice Interview", icon: Mic, desc: "Speak your answers, AI evaluates speech" },
  { id: "coding", label: "Coding Assessment", icon: Code2, desc: "Live code editor, problem solving" },
  { id: "scenario", label: "Scenario Based", icon: Lightbulb, desc: "Real-world situational challenges" },
];

const durations = [
  { id: "15", label: "15 min", desc: "Quick round" },
  { id: "30", label: "30 min", desc: "Standard" },
  { id: "45", label: "45 min", desc: "Full round" },
  { id: "60", label: "60 min", desc: "Deep dive" },
];

const difficulties = [
  { id: "Easy", label: "Beginner", desc: "Foundational concepts", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "Medium", label: "Intermediate", desc: "Mid-level expectations", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "Hard", label: "Advanced", desc: "Senior / FAANG level", color: "text-red-600 bg-red-50 border-red-200" },
  { id: "Adaptive", label: "Adaptive AI", desc: "AI adjusts in real time", color: "text-primary bg-primary/10 border-primary/20" },
];

function InterviewSetup() {
  const nav = useNavigate();
  const [track, setTrack] = useState<string | null>(null);
  const [format, setFormat] = useState<string>("mixed");
  const [difficulty, setDifficulty] = useState<string>("Adaptive");
  const [duration, setDuration] = useState<string>("30");
  const [step, setStep] = useState(1);

  const canProceed = step === 1 ? !!track : true;

  const launch = () => {
    if (format === "voice") nav({ to: "/voice-interview" });
    else nav({ to: "/interview-room" });
  };

  return (
    <>
      <PageHeader title="Interview Setup" description="Configure your interview session." />
      <div className="p-8 max-w-5xl space-y-8">

        {/* Step Indicator */}
        <div className="flex items-center gap-3">
          {["Choose Track", "Format & Options", "Launch"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all",
                step > i + 1 ? "bg-primary border-primary text-white" :
                  step === i + 1 ? "border-primary text-primary bg-primary/10" :
                    "border-border text-muted-foreground"
              )}>
                {step > i + 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={cn("text-sm", step === i + 1 ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</span>
              {i < 2 && <div className="w-12 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Select Career Track</h2>
            <p className="text-sm text-muted-foreground mb-5">The AI will tailor questions, difficulty, and evaluation to your chosen domain.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {careerTracks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrack(t.id)}
                  className={cn(
                    "relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all hover:shadow-md cursor-pointer",
                    track === t.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  {track === t.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="text-2xl mb-2">{t.icon}</span>
                  <div className="text-xs font-medium leading-tight">{t.label}</div>
                  <div className="mt-1.5 text-[10px] text-muted-foreground">{t.demand} Demand</div>
                  <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${t.readinessScore}%` }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Readiness: {t.readinessScore}%</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Format */}
            <div>
              <h2 className="text-lg font-semibold mb-1">Interview Format</h2>
              <p className="text-sm text-muted-foreground mb-4">Choose what type of interview experience you want.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                      format === f.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", format === f.id ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                      <f.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{f.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <h2 className="text-lg font-semibold mb-1">Starting Difficulty</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {difficulties.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={cn(
                      "p-4 rounded-2xl border-2 text-left transition-all",
                      difficulty === d.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <div className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border mb-2", d.color)}>{d.label}</div>
                    <div className="text-xs text-muted-foreground">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <h2 className="text-lg font-semibold mb-1">Duration</h2>
              <div className="flex gap-3">
                {durations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDuration(d.id)}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-2xl border-2 min-w-[80px] transition-all",
                      duration === d.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <Clock className="w-4 h-4 mb-1" />
                    <span className="text-sm font-semibold">{d.label}</span>
                    <span className="text-[10px] text-muted-foreground">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl bg-card border border-border p-8 shadow-card max-w-xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 shadow-elevated">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Ready to Interview</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Your AI interviewer is configured and ready to begin.</p>
            <div className="space-y-2 text-sm">
              {[
                { label: "Career Track", value: careerTracks.find(t => t.id === track)?.label },
                { label: "Format", value: formats.find(f => f.id === format)?.label },
                { label: "Difficulty", value: difficulties.find(d => d.id === difficulty)?.label },
                { label: "Duration", value: `${duration} minutes`},
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex gap-2 text-xs text-primary">
              <ListChecks className="w-4 h-4 shrink-0 mt-0.5" />
              The AI will adapt difficulty in real time based on your responses, stress signals, and recovery patterns.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
          )}
          {step < 3 ? (
            <Button
              className="bg-gradient-primary border-0"
              disabled={!canProceed}
              onClick={() => setStep(s => s + 1)}
            >
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button className="bg-gradient-primary border-0" onClick={launch}>
              <Mic className="w-4 h-4 mr-1.5" /> Launch Interview
            </Button>
          )}
        </div>
      </div>
    </>
  );
}