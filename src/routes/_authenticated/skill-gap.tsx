import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Zap, Target, AlertTriangle, ShieldCheck, Map } from "lucide-react";
import { useResumeContext } from "@/lib/ResumeContext";

export const Route = createFileRoute("/_authenticated/skill-gap")({ component: SkillGap });

function SkillGap() {
  const { activeResume } = useResumeContext();

  const gapData = activeResume?.skillGapSnapshot;

  if (!activeResume) {
    return (
      <>
        <PageHeader title="Skill Gap Intelligence" description="Identify exactly what separates you from your target role." />
        <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center border-2 border-dashed border-border rounded-2xl m-8">
          <Map className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Resume Found</h3>
          <p className="text-muted-foreground text-sm">Please upload a resume in the Overview tab to generate a Skill Gap analysis.</p>
        </div>
      </>
    );
  }

  if (!gapData) {
    return (
      <>
        <PageHeader title="Skill Gap Intelligence" description="Identify exactly what separates you from your target role." />
        <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center border-2 border-dashed border-border rounded-2xl m-8">
          <Zap className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg">No Gap Analysis Available</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            We haven't generated a gap analysis for this resume yet. Head over to the <strong>Career Roadmap</strong> tab and generate a roadmap to populate this data.
          </p>
        </div>
      </>
    );
  }

  const { gapAnalysis, gapSeverity } = gapData;

  return (
    <>
      <PageHeader title="Skill Gap Intelligence" description="Identify exactly what separates you from your target role based on your latest AI Roadmap scan." />
      <div className="p-8 space-y-6 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card flex items-center gap-6">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
              gapSeverity?.level === 'High' ? 'bg-destructive/10 text-destructive' : 
              gapSeverity?.level === 'Medium' ? 'bg-warning/10 text-warning' : 
              'bg-success/10 text-success'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gap Severity</div>
              <div className="text-2xl font-black">{gapSeverity?.level || "Unknown"}</div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{gapSeverity?.reasoning}</div>
            </div>
          </div>
        </div>

        {/* Diagnostic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Missing & Critical */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-6 shadow-sm">
              <h3 className="font-bold text-destructive mb-4 flex items-center gap-2"><Target className="w-5 h-5" /> Critical Missing Skills</h3>
              <p className="text-sm text-destructive/80 mb-4">You must acquire these skills immediately as they are hard requirements for your target role.</p>
              <div className="flex flex-wrap gap-2">
                {gapAnalysis?.critical?.length ? gapAnalysis.critical.map((s: string, i: number) => (
                  <span key={i} className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-sm font-semibold shadow-sm">{s}</span>
                )) : <span className="text-sm italic">No critical gaps detected!</span>}
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-warning" /> Weak Skills / Needs Focus</h3>
              <p className="text-sm text-muted-foreground mb-4">You have partial knowledge, but need more depth to pass technical interviews.</p>
              <div className="flex flex-wrap gap-2">
                {gapAnalysis?.weak?.length ? gapAnalysis.weak.map((s: string, i: number) => (
                  <span key={i} className="bg-warning/10 text-warning-foreground border border-warning/20 px-3 py-1.5 rounded-md text-sm font-medium">{s}</span>
                )) : <span className="text-sm italic text-muted-foreground">No weak skills detected.</span>}
              </div>
            </div>
          </div>

          {/* Existing / Strengths */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm h-full flex flex-col">
              <h3 className="font-bold mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-success" /> Validated Strengths</h3>
              <p className="text-sm text-muted-foreground mb-4">These are skills you already possess that align perfectly with your target role. Emphasize these in interviews.</p>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {gapAnalysis?.existing?.length ? gapAnalysis.existing.map((s: string, i: number) => (
                    <span key={i} className="bg-success/10 text-success border border-success/20 px-3 py-1.5 rounded-md text-sm font-medium">{s}</span>
                  )) : <span className="text-sm italic text-muted-foreground">No matching strengths recorded.</span>}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}