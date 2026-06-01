import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Sparkles, Target, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useResumeContext } from "@/lib/ResumeContext";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/jd-match")({ component: JDMatch });

function JDMatch() {
  const { activeResume, refreshResumes } = useResumeContext();
  const [jd, setJd] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const runAnalysis = async () => {
    if (!activeResume) {
      toast.error("Please upload a resume first.");
      return;
    }
    if (!jd.trim()) {
      toast.error("Please paste a job description.");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/resumes/${activeResume._id}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText: jd })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Job Description Match complete!");
        await refreshResumes(); // This updates the global context and triggers re-render
      } else {
        toast.error(data.error || "Analysis failed.");
      }
    } catch (err: any) {
      toast.error("Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const matchData = activeResume?.jdMatchSnapshot;

  if (!activeResume) {
    return (
      <>
        <PageHeader title="JD Match Intelligence" description="See how your resume stacks against a job description." />
        <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center border-2 border-dashed border-border rounded-2xl m-8">
          <Target className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Resume Found</h3>
          <p className="text-muted-foreground text-sm">Please upload a resume in the Overview tab before matching a Job Description.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="JD Match Intelligence" description="See how your resume stacks against a job description." />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: JD Input & Skill Breakdowns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-semibold mb-3">Target Job Description</h3>
            <Textarea 
              value={jd} 
              onChange={(e) => setJd(e.target.value)} 
              rows={8} 
              placeholder="Paste the target job description here to compare against your parsed resume skills..." 
              className="resize-none"
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={runAnalysis} disabled={analyzing} className="bg-gradient-primary border-0 font-bold h-10 px-6">
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
                Analyze Match
              </Button>
            </div>
          </div>

          {matchData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Existing / Matching Skills */}
              <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" />Validated Resume Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {matchData.gapAnalysis?.existingSkills?.length ? matchData.gapAnalysis.existingSkills.map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">{s}</span>
                  )) : <span className="text-sm text-muted-foreground">No explicit matching skills found.</span>}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><XCircle className="w-4 h-4 text-destructive" />Critical Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {matchData.missingSkills?.length ? matchData.missingSkills.map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">{s}</span>
                  )) : <span className="text-sm text-muted-foreground">No critical missing skills found.</span>}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="md:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-card">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" />Missing ATS Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {matchData.missingKeywords?.length ? matchData.missingKeywords.map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-md bg-warning/10 text-warning-foreground text-xs font-medium border border-warning/20">{s}</span>
                  )) : <span className="text-sm text-muted-foreground">You hit all required ATS keywords!</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Predictive Analytics */}
        <div className="space-y-6">
          {matchData ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-card text-center mb-6">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overall Match Score</div>
                <div className="my-6 relative h-44 flex items-center justify-center mx-auto">
                  <svg viewBox="0 0 120 120" className="w-44 h-44 -rotate-90">
                    <circle cx="60" cy="60" r="52" stroke="var(--muted)" strokeWidth="10" fill="none" className="opacity-20" />
                    <circle cx="60" cy="60" r="52" stroke={matchData.matchScore > 75 ? "#10b981" : matchData.matchScore > 50 ? "#f59e0b" : "#ef4444"} strokeWidth="10" fill="none"
                      strokeDasharray={`${(matchData.matchScore / 100) * 326} 326`} strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <div className="text-4xl font-bold">{matchData.matchScore}%</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                <h3 className="font-semibold mb-4">Candidate Fit Breakdown</h3>
                <ul className="text-sm space-y-4">
                  <li>
                    <div className="flex justify-between mb-1"><span className="text-muted-foreground font-medium">Technical Match</span><span className="font-bold">{matchData.technicalMatch}%</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{width: `${matchData.technicalMatch}%`}} /></div>
                  </li>
                  <li>
                    <div className="flex justify-between mb-1"><span className="text-muted-foreground font-medium">Experience Match</span><span className="font-bold">{matchData.experienceMatch}%</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{width: `${matchData.experienceMatch}%`}} /></div>
                  </li>
                  <li>
                    <div className="flex justify-between mb-1"><span className="text-muted-foreground font-medium">ATS Match</span><span className="font-bold">{matchData.atsMatch || 0}%</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: `${matchData.atsMatch || 0}%`}} /></div>
                  </li>
                </ul>
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Recommendations</h3>
                <ul className="space-y-2 text-sm">
                  {matchData.recommendedImprovements?.map((rec: string, idx: number) => (
                    <li key={idx} className="flex gap-2"><Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>{rec}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <Target className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
              <h3 className="font-semibold">Awaiting Job Description</h3>
              <p className="text-sm text-muted-foreground mt-2">Paste a job description and click analyze to see how your current resume aligns with the role requirements.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}