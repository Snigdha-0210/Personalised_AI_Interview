import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useResumeContext } from "@/lib/ResumeContext";
import type { Question } from "@/lib/mock-data";
import { startDefaultInterview } from "@/server/functions";
import {
  Mic, Send, Sparkles, Clock, TrendingUp, TrendingDown, Minus,
  ChevronRight, CheckCircle2, XCircle, Code2, Lightbulb, Info
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/interview-room")({ component: Room });

// Difficulty Engine
type Diff = "Easy" | "Medium" | "Hard";
const diffUp: Record<Diff, Diff> = { Easy: "Medium", Medium: "Hard", Hard: "Hard" };
const diffDown: Record<Diff, Diff> = { Easy: "Easy", Medium: "Easy", Hard: "Medium" };

const diffColor: Record<Diff, string> = {
  Easy: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Medium: "text-amber-600 bg-amber-50 border-amber-200",
  Hard: "text-red-600 bg-red-50 border-red-200",
};

interface DiffHistory { diff: Diff; reason: string }

// MCQ Component
function MCQCard({ q, onAnswer }: { q: Question; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const submit = () => {
    setRevealed(true);
    setTimeout(() => onAnswer(selected === q.answer), 1200);
  };
  return (
    <div className="space-y-3">
      {q.options?.map((opt, i) => {
        const isSelected = selected === opt;
        const isCorrect = revealed && opt === q.answer;
        const isWrong = revealed && isSelected && opt !== q.answer;
        return (
          <button
            key={i}
            onClick={() => !revealed && setSelected(opt)}
            className={cn(
              "w-full text-left p-4 rounded-xl border-2 text-sm transition-all",
              isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                isWrong ? "border-red-400 bg-red-50 text-red-700" :
                  isSelected ? "border-primary bg-primary/5 text-primary" :
                    "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0",
                isCorrect ? "border-emerald-500 bg-emerald-500 text-white" :
                  isWrong ? "border-red-400 bg-red-400 text-white" :
                    isSelected ? "border-primary bg-primary text-white" : "border-border"
              )}>
                {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : isWrong ? <XCircle className="w-3 h-3" /> : String.fromCharCode(65 + i)}
              </div>
              {opt}
            </div>
          </button>
        );
      })}
      <div className="flex justify-end pt-2">
        <Button
          className="bg-gradient-primary border-0"
          size="sm"
          disabled={!selected || revealed}
          onClick={submit}
        >
          Confirm <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Fill in the Blank Component
function FillCard({ q, onAnswer }: { q: Question; onAnswer: (correct: boolean) => void }) {
  const [val, setVal] = useState("");
  const [revealed, setRevealed] = useState(false);
  const submit = () => {
    setRevealed(true);
    const correct = val.trim().toLowerCase() === (q.answer ?? "").toLowerCase();
    setTimeout(() => onAnswer(correct), 1200);
  };
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm font-mono leading-loose">
        {q.q.split("________").map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <span className={cn(
                "inline-block min-w-[120px] px-3 py-0.5 rounded border-b-2 text-center font-semibold",
                revealed
                  ? val.trim().toLowerCase() === (q.answer ?? "").toLowerCase()
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : "border-red-400 text-red-600 bg-red-50"
                  : "border-primary text-primary bg-primary/5"
              )}>
                {revealed ? (val || "?") : (val || "_")}
              </span>
            )}
          </span>
        ))}
      </div>
      {revealed && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          ✓ Correct answer: <strong>{q.answer}</strong>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          disabled={revealed}
          placeholder={q.blankHint ? `Hint: ${q.blankHint}` : "Type your answer…"}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          onKeyDown={e => e.key === "Enter" && !revealed && val.trim() && submit()}
        />
        <Button className="bg-gradient-primary border-0" size="sm" disabled={!val.trim() || revealed} onClick={submit}>
          Submit
        </Button>
      </div>
    </div>
  );
}

// Coding Component
function CodingCard({ q, onAnswer }: { q: Question; onAnswer: (correct: boolean) => void }) {
  const [code, setCode] = useState(q.starterCode ?? "");
  const [submitted, setSubmitted] = useState(false);
  const submit = () => {
    setSubmitted(true);
    setTimeout(() => onAnswer(code.length > 50), 1500);
  };
  return (
    <div className="space-y-4">
      {q.examples && (
        <div className="grid grid-cols-2 gap-3">
          {q.examples.map((ex, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/50 border border-border text-xs font-mono">
              <div className="text-muted-foreground mb-1">Example {i + 1}</div>
              <div><span className="text-primary">Input:</span> {ex.input}</div>
              <div><span className="text-emerald-600">Output:</span> {ex.output}</div>
            </div>
          ))}
        </div>
      )}
      {q.constraints && (
        <div className="flex flex-wrap gap-2">
          {q.constraints.map((c, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">{c}</span>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Code2 className="w-3.5 h-3.5" />
            TypeScript
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
        </div>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          disabled={submitted}
          rows={12}
          className="w-full px-4 py-3 bg-[#1e1e2e] text-[#cdd6f4] text-sm font-mono resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">{code.split("\n").length} lines · {code.length} chars</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Run Tests</Button>
          <Button className="bg-gradient-primary border-0" size="sm" disabled={submitted} onClick={submit}>
            {submitted ? "Submitted ✓" : <><Send className="w-3.5 h-3.5 mr-1.5" />Submit</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Text Answer Component (Short / Subjective / Scenario)
function TextCard({ q, onAnswer }: { q: Question; onAnswer: (correct: boolean) => void }) {
  const [val, setVal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const words = val.trim().split(/\s+/).filter(Boolean).length;
  const submit = () => {
    setSubmitted(true);
    setTimeout(() => onAnswer(words >= 20), 1500);
  };
  return (
    <div className="space-y-3">
      {q.type === "scenario" && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex gap-2 text-xs text-amber-700">
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
          Walk through your reasoning step-by-step. Mention trade-offs, who you involve, and the outcome.
        </div>
      )}
      {q.wordGuide && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="w-3.5 h-3.5" /> Suggested length: {q.wordGuide}
        </div>
      )}
      <Textarea
        rows={q.type === "short" ? 5 : 9}
        value={val}
        onChange={e => setVal(e.target.value)}
        disabled={submitted}
        placeholder={q.type === "scenario" ? "Describe your approach…" : "Type your response here…"}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{words} words · {val.length} chars</span>
        <Button
          size="sm"
          className="bg-gradient-primary border-0"
          disabled={!val.trim() || submitted}
          onClick={submit}
        >
          {submitted ? "Submitted ✓" : <><Send className="w-3.5 h-3.5 mr-1.5" />Submit</>}
        </Button>
      </div>
    </div>
  );
}

function Room() {
  const nav = useNavigate();
  const { activeResume } = useResumeContext();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [qIdx, setQIdx] = useState(0);
  const [askedQs, setAskedQs] = useState<number[]>([0]);
  const [seconds, setSeconds] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [score, setScore] = useState(78);
  const [diffHistory, setDiffHistory] = useState<DiffHistory[]>([
    { diff: "Medium", reason: "Starting difficulty" },
  ]);
  const currentDiff = diffHistory[diffHistory.length - 1].diff;

  useEffect(() => {
    async function loadInterview() {
      try {
        if (!activeResume) {
          console.log("No resume active, starting default interview via Server Function");
          const res = await startDefaultInterview();
          if (res.success && res.data) {
            setQuestions(res.data);
          }
        } else {
          const response = await fetch(`/api/interview/${activeResume._id}/start`, { method: "POST" });
          const data = await response.json();
          if (data.success && data.data.questions) {
            setQuestions(data.data.questions);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInterview();
  }, [activeResume]);

  useEffect(() => {
    if (loading) return;
    const i = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(i);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <h2 className="text-xl font-bold">Generating Tailored Interview...</h2>
        <p className="text-muted-foreground">Analyzing your skill gaps to build dynamic questions.</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return <div className="p-10 text-center">No questions found or you haven't uploaded a resume yet.</div>;
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const q = questions[qIdx % questions.length];

  const handleAnswer = (correct: boolean) => {
    setThinking(true);
    const newScore = correct ? Math.min(score + 5, 99) : Math.max(score - 4, 40);
    setScore(newScore);
    const newDiff = correct ? diffUp[currentDiff] : diffDown[currentDiff];
    const reason = correct
      ? `Strong answer → difficulty raised to ${newDiff}`
      : `Answer needs improvement → difficulty eased to ${newDiff}`;
    setTimeout(() => {
      setThinking(false);
      setDiffHistory(h => [...h, { diff: newDiff, reason }]);
      
      let nextIndex = questions.findIndex((q, i) => !askedQs.includes(i) && q.difficulty === newDiff);
      if (nextIndex === -1) nextIndex = questions.findIndex((q, i) => !askedQs.includes(i));
      
      if (nextIndex === -1) {
        nav({ to: "/results" });
      } else {
        setAskedQs(prev => [...prev, nextIndex]);
        setQIdx(nextIndex);
      }
    }, 1600);
  };

  const questionTypeLabel: Record<string, string> = {
    mcq: "Multiple Choice",
    fill: "Fill in the Blank",
    short: "Short Answer",
    subjective: "Subjective",
    scenario: "Scenario Based",
    coding: "Coding Problem",
  };

  return (
    <>
      <PageHeader
        title="Interview Room"
        description="Adaptive interview in progress — AI is evaluating in real time."
        actions={
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border font-mono">
              <Clock className="w-3.5 h-3.5" />{mm}:{ss}
            </span>
            <span className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border", diffColor[currentDiff])}>
              {currentDiff}
            </span>
            <span className="text-xs text-muted-foreground">Q{qIdx + 1} of {questions.length}</span>
          </div>
        }
      />

      <div className="p-6 grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* AI Avatar */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-elevated relative">
              <Sparkles className="w-9 h-9 text-white" />
              {thinking && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success pulse-dot border-2 border-card" />
              )}
            </div>
            <div className="mt-3 font-semibold">Sage</div>
            <div className="text-xs text-muted-foreground">AI Interviewer</div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              {thinking ? "Evaluating…" : "Listening"}
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-3">Session Progress</h3>
            <Progress value={((qIdx) / questions.length) * 100} className="mb-3" />
            <ul className="space-y-1.5">
              {questions.map((iq, i) => (
                <li key={iq.id} className={cn(
                  "flex items-center gap-2 text-xs",
                  i === qIdx ? "text-primary font-medium" :
                    i < qIdx ? "text-muted-foreground line-through" :
                      "text-muted-foreground"
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  Q{i + 1} · {iq.skill}
                </li>
              ))}
            </ul>
          </div>

          {/* Current Score */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Live Score</div>
            <div className="mt-1 flex items-end gap-2">
              <div className="text-4xl font-semibold tabular-nums">{score}</div>
              <span className="pb-1 text-xs text-success font-medium flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />Live
              </span>
            </div>
          </div>

          {/* Difficulty History */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-3">Difficulty History</h3>
            <div className="space-y-2">
              {diffHistory.slice(-5).map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={cn("shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold border", diffColor[h.diff])}>{h.diff}</span>
                  <span className="text-muted-foreground leading-tight">{h.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center — Question */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {questionTypeLabel[q.type || ""] || q.type || "Question"}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span className="text-xs text-muted-foreground">{q.skill}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", diffColor[q.difficulty])}>{q.difficulty}</span>
            </div>
            <h2 className="text-lg font-semibold leading-snug mb-1">{q.q}</h2>
            <div className="text-xs text-muted-foreground">Source: {q.source}</div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Your Answer</h3>
              <Button variant="outline" size="sm">
                <Mic className="w-4 h-4 mr-1.5" />Voice
              </Button>
            </div>

            {thinking ? (
              <div className="h-40 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <div className="text-sm">AI is evaluating your response…</div>
              </div>
            ) : (
              <>
                {q.type === "mcq" && <MCQCard key={qIdx} q={q} onAnswer={handleAnswer} />}
                {q.type === "fill" && <FillCard key={qIdx} q={q} onAnswer={handleAnswer} />}
                {q.type === "coding" && <CodingCard key={qIdx} q={q} onAnswer={handleAnswer} />}
                {(!["mcq", "fill", "coding"].includes(q.type || "")) && (
                  <TextCard key={qIdx} q={q} onAnswer={handleAnswer} />
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Evaluation Metrics */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-3">Real-Time Evaluation</h3>
            <div className="space-y-3">
              {[
                { label: "Technical Accuracy", v: 84 },
                { label: "Communication", v: 79 },
                { label: "Problem Solving", v: 88 },
                { label: "Depth", v: 72 },
                { label: "Time Efficiency", v: 76 },
              ].map(x => (
                <div key={x.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{x.label}</span>
                    <span className="font-medium">{x.v}</span>
                  </div>
                  <Progress value={x.v} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Notes */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-3">AI Interview Notes</h3>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-success mt-0.5">✓</span>Strong problem framing observed</li>
              <li className="flex gap-2"><span className="text-success mt-0.5">✓</span>Trade-offs explicitly mentioned</li>
              <li className="flex gap-2"><span className="text-warning mt-0.5">→</span>Could deepen on caching layer</li>
              <li className="flex gap-2"><span className="text-primary mt-0.5">↑</span>Difficulty adjusted based on response</li>
            </ul>
          </div>

          {/* Difficulty Change Indicator */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-2">Adaptive Engine</h3>
            <div className="flex items-center gap-3">
              {currentDiff === "Hard" ? (
                <TrendingUp className="w-8 h-8 text-red-500" />
              ) : currentDiff === "Easy" ? (
                <TrendingDown className="w-8 h-8 text-emerald-500" />
              ) : (
                <Minus className="w-8 h-8 text-amber-500" />
              )}
              <div>
                <div className="text-sm font-semibold">Current: {currentDiff}</div>
                <div className="text-xs text-muted-foreground">AI adapts after each question</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}