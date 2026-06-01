import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useResumeContext } from "@/lib/ResumeContext";
import { Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/panel")({ component: Panel });

function Panel() {
  const { activeResume } = useResumeContext();
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [panel, setPanel] = useState<any[]>([
    { id: 1, name: "Arin", role: "Tech Lead", focus: "Architecture & Code Quality", score: 0, status: "idle", feedback: "" },
    { id: 2, name: "Sam", role: "Engineering Manager", focus: "Project Impact & Scope", score: 0, status: "idle", feedback: "" },
    { id: 3, name: "Taylor", role: "HR Recruiter", focus: "Communication & Culture", score: 0, status: "idle", feedback: "" },
  ]);

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    setPanel(p => p.map(x => ({ ...x, status: "active", feedback: "Evaluating..." })));
    
    try {
      const url = activeResume ? `/api/interview/${activeResume._id}/panel-grade` : `/api/interview/default/panel-grade`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: answer })
      });
      const data = await res.json();
      
      if (data.success && data.data.evaluations) {
        setPanel(p => p.map(x => {
          const evalData = data.data.evaluations.find((e: any) => e.role === x.role);
          return evalData ? { ...x, score: evalData.score, feedback: evalData.feedback, status: "evaluated" } : x;
        }));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setAnswer("");
  };

  return (
    <>
      <PageHeader title="AI Panel Interview" description="Three AI interviewers evaluating different dimensions in parallel." />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">Prompt: Describe your approach to handling a production database migration with zero downtime.</h2>
            <Textarea 
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={loading}
              placeholder="Type your detailed response here..."
              rows={8}
            />
            <div className="flex justify-end mt-4">
              <Button disabled={!answer.trim() || loading} onClick={submitAnswer} className="bg-gradient-primary border-0">
                {loading ? <Sparkles className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit for Panel Review
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
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
            <p className="mt-4 text-xs font-medium text-muted-foreground">{p.focus}</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Score</span>
                <span className="font-semibold tabular-nums">{p.score}/100</span>
              </div>
              <Progress value={p.score} className="h-1.5" />
            </div>
            {p.feedback && (
              <div className="mt-4 pt-4 border-t border-border text-xs italic text-muted-foreground">
                "{p.feedback}"
              </div>
            )}
          </div>
        ))}
        </div>
      </div>
    </>
  );
}