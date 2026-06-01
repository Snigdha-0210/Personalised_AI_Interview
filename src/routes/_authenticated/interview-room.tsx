import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { interviewQuestions } from "@/lib/mock-data";
import { Mic, Send, Sparkles, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/interview-room")({ component: Room });

function Room() {
  const nav = useNavigate();
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [thinking, setThinking] = useState(false);
  const q = interviewQuestions[qIdx];

  useEffect(() => { const i = setInterval(() => setSeconds((s) => s + 1), 1000); return () => clearInterval(i); }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const submit = () => {
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      if (qIdx >= interviewQuestions.length - 1) nav({ to: "/results" });
      else { setQIdx((i) => i + 1); setAnswer(""); }
    }, 1400);
  };

  return (
    <>
      <PageHeader
        title="Interview Room"
        description="Live adaptive interview in progress."
        actions={
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border"><Clock className="w-3.5 h-3.5" />{mm}:{ss}</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 text-warning font-medium">{q.difficulty}</span>
            <span className="text-xs text-muted-foreground">Round {qIdx + 1} / {interviewQuestions.length}</span>
          </div>
        }
      />
      <div className="p-8 grid grid-cols-12 gap-6">
        {/* Left */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-elevated relative">
              <Sparkles className="w-10 h-10 text-white" />
              {thinking && <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success pulse-dot border-2 border-card" />}
            </div>
            <div className="mt-3 font-semibold">Sage</div>
            <div className="text-xs text-muted-foreground">AI Interviewer</div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              {thinking ? "Evaluating…" : "Listening"}
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-semibold text-sm mb-3">Interview Progress</h3>
            <Progress value={((qIdx + 1) / interviewQuestions.length) * 100} />
            <ul className="mt-4 space-y-1.5 text-sm">
              {interviewQuestions.map((iq, i) => (
                <li key={iq.id} className={`flex items-center gap-2 ${i === qIdx ? "text-primary font-medium" : i < qIdx ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />Q{i + 1}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="rounded-2xl bg-card border border-border p-8 shadow-card">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Question {qIdx + 1} · {q.skill}</div>
            <h2 className="mt-2 text-xl font-semibold leading-snug">{q.q}</h2>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Your Response</h3>
              <Button variant="outline" size="sm"><Mic className="w-4 h-4 mr-1.5" />Voice</Button>
            </div>
            <Textarea rows={8} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your response or use voice…" />
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{answer.length} chars · Real-time signals captured</span>
              <Button size="sm" className="bg-gradient-primary border-0" onClick={submit} disabled={thinking || !answer.trim()}>
                {thinking ? "AI scoring…" : <>Submit <Send className="w-3.5 h-3.5 ml-1.5" /></>}
              </Button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-semibold text-sm mb-3">Skills Being Evaluated</h3>
            <div className="space-y-2">
              {[{ s: "Technical Accuracy", v: 84 }, { s: "Communication", v: 79 }, { s: "Problem Solving", v: 88 }, { s: "Depth", v: 72 }].map((x) => (
                <div key={x.s}>
                  <div className="flex justify-between text-xs"><span>{x.s}</span><span className="font-medium">{x.v}</span></div>
                  <Progress value={x.v} className="h-1 mt-1" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Score Estimate</div>
            <div className="mt-1 flex items-end gap-2">
              <div className="text-4xl font-semibold tracking-tight">82</div>
              <span className="pb-1.5 text-xs text-success font-medium flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+4</span>
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-semibold text-sm mb-2">Interview Notes</h3>
            <ul className="text-xs space-y-1.5 text-muted-foreground">
              <li>• Strong opening framing</li>
              <li>• Mentioned trade-offs explicitly</li>
              <li>• Could deepen on caching layer</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}