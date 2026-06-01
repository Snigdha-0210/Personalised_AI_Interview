import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { careerTracks } from "@/lib/mock-data";
import {
  Sparkles, Brain, Target, Shield, ArrowRight, CheckCircle2,
  Mic, FileText, Map, BarChart3, Users, Zap, Star, TrendingUp,
  Code2, MessageSquare, Volume2
} from "lucide-react";

export const Route = createFileRoute("/")(({
  component: Landing,
}));

const features = [
  {
    icon: Brain, title: "Adaptive AI Interviewer",
    desc: "Sage, your AI interviewer, dynamically adjusts difficulty based on your answers, stress signals, and recovery patterns — just like a real hiring manager.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Target, title: "Objective Multi-Dimensional Scoring",
    desc: "Get evaluated across 8 dimensions: accuracy, communication, depth, problem solving, time efficiency, adaptability, consistency, and clarity.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Shield, title: "Recruiter-Grade Analytics",
    desc: "Every score, difficulty change, and observation is logged with an explainable audit trail — the same transparency top hiring platforms use.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Volume2, title: "AI Voice Interviews",
    desc: "Practice speaking your answers out loud. The AI evaluates your pace, confidence, and clarity, and streams a live transcript of your voice.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: FileText, title: "Resume Intelligence Engine",
    desc: "Upload your resume and receive an ATS score, skill gap analysis, missing keywords, and actionable improvements aligned to your target role.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Map, title: "Personalized Career Roadmaps",
    desc: "AI generates a 30/60/90/180-day learning roadmap based on your skill gaps, chosen career track, and interview performance history.",
    color: "bg-teal-50 text-teal-600",
  },
];

const questionTypes = [
  { icon: CheckCircle2, label: "Multiple Choice", color: "text-blue-600 bg-blue-50" },
  { icon: MessageSquare, label: "Fill in the Blank", color: "text-purple-600 bg-purple-50" },
  { icon: FileText, label: "Short Answer", color: "text-amber-600 bg-amber-50" },
  { icon: Brain, label: "Subjective", color: "text-pink-600 bg-pink-50" },
  { icon: Zap, label: "Scenario Based", color: "text-orange-600 bg-orange-50" },
  { icon: Code2, label: "Coding Problems", color: "text-emerald-600 bg-emerald-50" },
];

const stats = [
  { value: "15+", label: "Career Tracks" },
  { value: "1000+", label: "Interview Questions" },
  { value: "8", label: "Evaluation Dimensions" },
  { value: "4", label: "Question Formats" },
];

const testimonials = [
  { name: "Priya S.", role: "Software Engineer @ Google", text: "HireMind's adaptive AI felt more realistic than any other mock interview platform I used. The difficulty changes kept me on my toes.", rating: 5 },
  { name: "Arjun M.", role: "PM @ Stripe", text: "The recruiter analytics view is insane. I could actually see WHY the AI rated me the way it did. That transparency is rare.", rating: 5 },
  { name: "Chloe R.", role: "Frontend Lead @ Airbnb", text: "I landed my dream job after 3 weeks of using HireMind. The resume ATS score alone saved me from sending a weak application.", rating: 5 },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elevated">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-sm">HireMind AI</span>
              <span className="ml-2 text-[10px] text-muted-foreground uppercase tracking-wider hidden md:inline">Interview Intelligence OS</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#tracks" className="hover:text-foreground transition-colors">Career Tracks</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it Works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/signup"><Button size="sm" className="bg-gradient-primary border-0">Get started free</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 border border-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
          AI-Powered Interview Intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight max-w-4xl mx-auto leading-[1.05] mb-6">
          Your AI hiring manager that{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">thinks, adapts,</span>
          {" "}and explains.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          HireMind AI is a complete Interview Intelligence OS. Simulate real interviews, get recruiter-grade analytics, build personalized roadmaps, and practice with voice AI — all in one platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-primary border-0 shadow-elevated text-base h-12 px-8">
              Start Free Interview <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-base h-12 px-8">
              I have an account
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground mb-16">
          {["Resume Intelligence", "JD Match Analysis", "Voice Interview AI", "Adaptive Difficulty", "Career Roadmaps", "Recruiter Analytics"].map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />{s}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-semibold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Question Types */}
      <section className="bg-gradient-subtle py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold mb-2">6 Interview Question Formats</h2>
            <p className="text-muted-foreground">The AI supports every format real companies use to evaluate candidates.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {questionTypes.map(q => (
              <div key={q.label} className="rounded-2xl bg-card border border-border p-5 text-center shadow-card hover:shadow-elevated transition-all hover:-translate-y-0.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${q.color}`}>
                  <q.icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium">{q.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3">Everything you need to get hired</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">A complete operating system for interview preparation, from resume to offer letter.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-card shadow-card hover:shadow-elevated transition-all hover:-translate-y-0.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Career Tracks */}
      <section id="tracks" className="bg-gradient-subtle py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-3">15 Career Tracks Supported</h2>
            <p className="text-muted-foreground">Domain-specific AI interview questions, roadmaps, and skill maps for every engineering path.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {careerTracks.map(t => (
              <div key={t.id} className="rounded-2xl bg-card border border-border p-4 text-center shadow-card hover:shadow-elevated transition-all hover:-translate-y-0.5">
                <div className="text-2xl mb-2">{t.icon}</div>
                <div className="text-xs font-medium">{t.label}</div>
                <div className="mt-2 text-[10px] text-muted-foreground">{t.demand} Demand</div>
                <div className="mt-1 text-[10px] font-semibold text-primary">{t.avgSalary} avg</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3">How HireMind works</h2>
          <p className="text-muted-foreground">From resume to hiring readiness in a structured, AI-guided flow.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Upload Resume", icon: FileText, desc: "AI parses your resume, computes ATS score, and identifies skill gaps." },
            { step: "02", title: "Choose Track", icon: Target, desc: "Select your career domain. AI calibrates questions to your experience level." },
            { step: "03", title: "Interview Live", icon: Mic, desc: "Answer questions in text or voice. AI adapts difficulty in real time." },
            { step: "04", title: "Get Insights", icon: BarChart3, desc: "Receive a recruiter-grade report with scores, roadmap, and learning plan." },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elevated">
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs text-muted-foreground font-mono mb-1">Step {s.step}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-subtle py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-3">Loved by candidates at top companies</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-6 shadow-card">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-7xl mx-auto px-6 text-center">
        <div className="rounded-3xl bg-gradient-primary p-12 shadow-elevated text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-semibold mb-3">Ready to get hired?</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Start your first AI-powered interview session in under 60 seconds. No credit card required.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 border-0 text-base h-12 px-8 font-semibold">
              Start for free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span>HireMind AI</span>
          </div>
          <div>© 2026 HireMind AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
