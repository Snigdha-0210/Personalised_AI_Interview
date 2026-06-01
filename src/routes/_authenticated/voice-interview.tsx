import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { voiceQuestions } from "@/lib/mock-data";
import { useState, useEffect, useRef } from "react";
import {
  Mic, MicOff, Sparkles, Volume2, Clock, ChevronRight, ArrowLeft,
  Activity, MessageSquare, Gauge, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/voice-interview")({ component: VoiceInterview });

type State = "idle" | "ai-speaking" | "listening" | "processing";

const aiGreetings = [
  "Welcome! I'm Sage, your AI interviewer. Let's begin. Please answer each question by speaking clearly. I'll evaluate your communication, confidence, and content.",
  "Great, let's move to the next question. Take a moment to collect your thoughts before answering.",
  "Excellent! Here's your next question. Remember, structure your answer with context, your actions, and the outcome.",
  "You're doing well. One more question to go. This one focuses on your career vision.",
];

function WaveformBar({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-150",
            active ? "bg-primary" : "bg-muted"
          )}
          style={{
            height: active ? `${Math.random() * 60 + 20}%` : "20%",
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}

function VoiceInterview() {
  const nav = useNavigate();
  const [qIdx, setQIdx] = useState(0);
  const [state, setState] = useState<State>("idle");
  const [transcript, setTranscript] = useState<{ speaker: "ai" | "you"; text: string }[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [scores, setScores] = useState({ pace: 78, confidence: 82, clarity: 74, overall: 78 });
  const transcriptRef = useRef<HTMLDivElement>(null);

  const q = voiceQuestions[qIdx];

  // Auto-start AI speaking on mount and question change
  useEffect(() => {
    setState("ai-speaking");
    const aiText = qIdx === 0 ? aiGreetings[0] + " " + q.q : aiGreetings[Math.min(qIdx, aiGreetings.length - 1)] + " " + q.q;
    const timer = setTimeout(() => {
      setTranscript(prev => [...prev, { speaker: "ai", text: aiText }]);
      setState("listening");
    }, 2500);
    return () => clearTimeout(timer);
  }, [qIdx]);

  // Timer
  useEffect(() => {
    const i = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(i);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const simulateSpeech = () => {
    if (state !== "listening") return;
    setState("processing");

    // Simulate Web Speech API transcription
    const userResponses = [
      "I have over 6 years of experience in frontend engineering, primarily building scalable React applications. I'm excited about this role because of the technical challenges and the opportunity to work on products that impact millions of users.",
      "At my previous company, we had a critical performance issue where our dashboard was taking over 8 seconds to load. I profiled the app, identified unnecessary re-renders, implemented virtualization, and reduced load time to under 1.5 seconds.",
      "When I disagree with a technical decision, I first make sure I fully understand the reasoning. Then I present my concerns with data. We had a case where I disagreed on using a monolith over microservices, and after a structured discussion, we reached a hybrid approach that worked well.",
      "In five years, I see myself in a senior architect role, contributing to platform strategy. This role aligns perfectly because it gives me exposure to large-scale engineering challenges early on.",
    ];

    const response = userResponses[qIdx] ?? "I think the key here is to approach this systematically, starting with understanding the requirements...";

    setTimeout(() => {
      setTranscript(prev => [...prev, { speaker: "you", text: response }]);
      setScores(s => ({
        pace: Math.min(s.pace + Math.floor(Math.random() * 5), 99),
        confidence: Math.min(s.confidence + Math.floor(Math.random() * 4), 99),
        clarity: Math.min(s.clarity + Math.floor(Math.random() * 6), 99),
        overall: Math.min(s.overall + Math.floor(Math.random() * 4), 99),
      }));
      setState("idle");
    }, 3000);
  };

  const nextQuestion = () => {
    if (qIdx >= voiceQuestions.length - 1) {
      nav({ to: "/results" });
    } else {
      setQIdx(i => i + 1);
    }
  };

  const stateConfig: Record<State, { label: string; color: string; icon: typeof Mic }> = {
    idle: { label: "Ready", color: "text-muted-foreground", icon: Mic },
    "ai-speaking": { label: "AI Speaking…", color: "text-primary", icon: Volume2 },
    listening: { label: "Listening…", color: "text-emerald-600", icon: Mic },
    processing: { label: "Transcribing…", color: "text-amber-600", icon: Activity },
  };

  const sc = stateConfig[state];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/interview-setup">
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Exit</Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="text-sm font-semibold">Voice Interview</div>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Live</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{mm}:{ss}</span>
            </div>
            <div className="text-xs text-muted-foreground">Q{qIdx + 1} / {voiceQuestions.length}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-0 max-h-[calc(100vh-56px)]">
        {/* Left — AI + Controls */}
        <div className="col-span-12 lg:col-span-4 border-r border-border flex flex-col p-6 gap-6">
          {/* AI Avatar */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center shadow-elevated relative transition-all",
              state === "ai-speaking" ? "bg-gradient-primary ring-4 ring-primary/30" :
                state === "listening" ? "bg-emerald-500 ring-4 ring-emerald-300" :
                  "bg-gradient-primary"
            )}>
              <Sparkles className="w-12 h-12 text-white" />
              {(state === "ai-speaking" || state === "listening") && (
                <div className="absolute inset-0 rounded-full border-4 border-current animate-ping opacity-20" />
              )}
            </div>
            <div>
              <div className="font-semibold">Sage</div>
              <div className="text-xs text-muted-foreground">AI Interviewer</div>
              <div className={cn("mt-1 text-xs font-medium", sc.color)}>
                {sc.label}
              </div>
            </div>

            {/* Waveform */}
            <div className="w-full px-4">
              <WaveformBar active={state === "ai-speaking" || state === "listening"} />
            </div>
          </div>

          {/* Current Question */}
          <div className="rounded-2xl bg-card border border-border p-4 shadow-card flex-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Question</div>
            <p className="text-sm font-medium leading-relaxed">{q.q}</p>
            <div className="mt-3 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary">
              💡 {q.hint}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Suggested: {Math.floor(q.timeLimitSec / 60)} min {q.timeLimitSec % 60 > 0 ? `${q.timeLimitSec % 60}s` : ""}
            </div>
          </div>

          {/* Voice Control Buttons */}
          <div className="space-y-2">
            <Button
              onClick={simulateSpeech}
              disabled={state !== "listening"}
              className={cn(
                "w-full h-14 text-base font-semibold transition-all",
                state === "listening"
                  ? "bg-emerald-500 hover:bg-emerald-600 border-0 shadow-lg scale-100"
                  : "bg-muted text-muted-foreground border border-border"
              )}
            >
              {state === "listening" ? (
                <><Mic className="w-5 h-5 mr-2" />Speak Now</>
              ) : state === "processing" ? (
                <><Activity className="w-5 h-5 mr-2 animate-pulse" />Processing…</>
              ) : state === "ai-speaking" ? (
                <><Volume2 className="w-5 h-5 mr-2" />AI Speaking…</>
              ) : (
                <><Mic className="w-5 h-5 mr-2" />Ready</>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={state !== "idle" || transcript.filter(t => t.speaker === "you").length === 0}
              onClick={nextQuestion}
            >
              Next Question <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Center — Transcript */}
        <div className="col-span-12 lg:col-span-5 flex flex-col border-r border-border">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Live Transcript</span>
            </div>
          </div>
          <div ref={transcriptRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {transcript.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                The transcript will appear here as the interview progresses…
              </div>
            )}
            {transcript.map((t, i) => (
              <div key={i} className={cn("flex gap-3", t.speaker === "you" ? "flex-row-reverse" : "")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold",
                  t.speaker === "ai" ? "bg-gradient-primary text-white" : "bg-muted border border-border"
                )}>
                  {t.speaker === "ai" ? <Sparkles className="w-4 h-4" /> : "Y"}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  t.speaker === "ai"
                    ? "bg-card border border-border rounded-tl-none"
                    : "bg-primary text-white rounded-tr-none"
                )}>
                  {t.text}
                </div>
              </div>
            ))}
            {state === "processing" && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold border border-border">Y</div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-3 border-t border-border">
            <Progress value={((qIdx) / voiceQuestions.length) * 100} className="h-1.5" />
            <div className="text-xs text-muted-foreground mt-1.5">Question {qIdx + 1} of {voiceQuestions.length}</div>
          </div>
        </div>

        {/* Right — Metrics */}
        <div className="col-span-12 lg:col-span-3 p-6 space-y-4 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Communication Score</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Speaking Pace", v: scores.pace, note: "Words per minute" },
                { label: "Confidence", v: scores.confidence, note: "Vocal steadiness" },
                { label: "Clarity", v: scores.clarity, note: "Articulation" },
              ].map(m => (
                <div key={m.label} className="rounded-xl bg-card border border-border p-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium">{m.label}</span>
                    <span className="font-semibold text-primary">{m.v}</span>
                  </div>
                  <Progress value={m.v} className="h-1.5" />
                  <div className="text-[10px] text-muted-foreground mt-1">{m.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4 shadow-card text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Overall Voice Score</div>
            <div className="text-5xl font-semibold mt-2 tabular-nums">{scores.overall}</div>
            <div className="text-xs text-success mt-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />Improving
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
            <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">AI Observations</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2"><span className="text-success">✓</span>Confident opening</li>
              <li className="flex gap-2"><span className="text-success">✓</span>Structured responses</li>
              <li className="flex gap-2"><span className="text-amber-500">→</span>Slow down slightly</li>
              <li className="flex gap-2"><span className="text-primary">↑</span>Add specific metrics</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
            <div className="text-xs font-medium text-primary mb-2">💡 Interview Tip</div>
            <div className="text-xs text-muted-foreground">
              Use the STAR method: <strong>S</strong>ituation, <strong>T</strong>ask, <strong>A</strong>ction, <strong>R</strong>esult. Keep answers under 2 minutes each.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
