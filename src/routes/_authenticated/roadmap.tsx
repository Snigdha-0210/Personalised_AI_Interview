import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Compass, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import { useResumeContext } from "@/lib/ResumeContext";

export const Route = createFileRoute("/_authenticated/roadmap")({ component: RoadmapPage });

function RoadmapPage() {
  const { activeResume } = useResumeContext();

  const roadmapData = activeResume?.roadmapSnapshot;

  if (!activeResume) {
    return (
      <>
        <PageHeader title="Career Roadmap" description="Your 90-Day Execution Timeline." />
        <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center border-2 border-dashed border-border rounded-2xl m-8">
          <Compass className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Resume Found</h3>
          <p className="text-muted-foreground text-sm">Please upload a resume in the Overview tab to build your roadmap.</p>
        </div>
      </>
    );
  }

  if (!roadmapData) {
    return (
      <>
        <PageHeader title="Career Roadmap" description="Your 90-Day Execution Timeline." />
        <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center border-2 border-dashed border-border rounded-2xl m-8">
          <Layers className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg">No Roadmap Available</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Head over to the <strong>Resume Intelligence</strong> overview, click on the Career Roadmap tab, and generate a new plan!
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="AI Career Roadmap" description="Your tailored 90-day execution timeline generated from your active Candidate Profile." />

      <div className="p-8 space-y-6 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Top Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
             <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Career Readiness Predictor</div>
             <div className="text-3xl font-black text-primary mb-2">{roadmapData.careerReadiness}%</div>
             <p className="text-sm text-muted-foreground">{roadmapData.predictions?.explanation}</p>
          </div>
        </div>

        {/* 30-60-90 Timeline */}
        <div className="rounded-2xl bg-card border border-border p-8 shadow-card">
          <h2 className="text-xl font-bold mb-8">90-Day Execution Timeline</h2>
          <div className="space-y-12">
            
            {/* Days 1-30 */}
            <div className="pl-8 border-l-2 border-primary relative">
              <div className="absolute w-5 h-5 rounded-full bg-primary -left-[11px] top-1 ring-4 ring-background flex items-center justify-center text-[10px] text-white font-bold">1</div>
              <h4 className="font-bold text-lg text-primary mb-4">Days 1 - 30: Foundation Phase</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Focus Topics</div>
                  <ul className="space-y-1 text-sm">{roadmapData.roadmap?.first30Days?.topics?.map((t: string, i: number) => <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {t}</li>)}</ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Practice Goals</div>
                  <ul className="space-y-1 text-sm">{roadmapData.roadmap?.first30Days?.practiceGoals?.map((t: string, i: number) => <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {t}</li>)}</ul>
                </div>
              </div>
            </div>

            {/* Days 31-60 */}
            <div className="pl-8 border-l-2 border-primary/50 relative">
              <div className="absolute w-5 h-5 rounded-full bg-primary/50 -left-[11px] top-1 ring-4 ring-background flex items-center justify-center text-[10px] text-white font-bold">2</div>
              <h4 className="font-bold text-lg text-primary/80 mb-4">Days 31 - 60: Intermediate Integration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Intermediate Skills</div>
                  <ul className="space-y-1 text-sm">{roadmapData.roadmap?.days31To60?.intermediateSkills?.map((t: string, i: number) => <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary/80 shrink-0" /> {t}</li>)}</ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Mock Interviews</div>
                  <ul className="space-y-1 text-sm">{roadmapData.roadmap?.days31To60?.mockInterviews?.map((t: string, i: number) => <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary/80 shrink-0" /> {t}</li>)}</ul>
                </div>
              </div>
            </div>

            {/* Days 61-90 */}
            <div className="pl-8 border-l-2 border-transparent relative">
              <div className="absolute w-5 h-5 rounded-full bg-muted-foreground/30 -left-[11px] top-1 ring-4 ring-background flex items-center justify-center text-[10px] text-white font-bold">3</div>
              <h4 className="font-bold text-lg text-muted-foreground mb-4">Days 61 - 90: Mastery & Execution</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Portfolio Building</div>
                  <ul className="space-y-1 text-sm">{roadmapData.roadmap?.days61To90?.portfolioBuilding?.map((t: string, i: number) => <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0" /> {t}</li>)}</ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Job Applications</div>
                  <ul className="space-y-1 text-sm">{roadmapData.roadmap?.days61To90?.jobApplications?.map((t: string, i: number) => <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0" /> {t}</li>)}</ul>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Recommended Projects & Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-bold mb-4 flex items-center gap-2">Tailored Projects</h3>
            <div className="space-y-4">
              {roadmapData.recommendedProjects?.map((p: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="font-bold flex justify-between items-start">
                    {p.name}
                    <span className="text-[10px] uppercase bg-background border px-2 py-0.5 rounded text-muted-foreground">{p.difficulty}</span>
                  </div>
                  <div className="text-xs text-primary mt-1 mb-2 font-medium">{p.skillsLearned?.join(", ")}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{p.careerImpact}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Learning Resources</h3>
            <div className="space-y-4">
              {roadmapData.learningResources?.map((lr: any, i: number) => (
                <div key={i} className="flex gap-3 items-start border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{lr.title} <span className="text-[10px] uppercase font-normal bg-muted border text-muted-foreground px-2 rounded ml-2">{lr.type}</span></div>
                    <div className="text-xs text-muted-foreground mt-1">{lr.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
