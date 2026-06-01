import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useResumeContext } from "@/lib/ResumeContext";
import { useState } from "react";
import { History as HistoryIcon, ArrowRightLeft, TrendingUp, TrendingDown, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({ component: History });

function History() {
  const { resumes, activeResume, setActiveResume } = useResumeContext();
  const [selectedForCompare, setSelectedForCompare] = useState<any[]>([]);

  const toggleCompare = (resume: any) => {
    if (selectedForCompare.find(r => r._id === resume._id)) {
      setSelectedForCompare(selectedForCompare.filter(r => r._id !== resume._id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], resume]);
      } else {
        setSelectedForCompare([...selectedForCompare, resume]);
      }
    }
  };

  const getComparison = () => {
    if (selectedForCompare.length !== 2) return null;
    const [older, newer] = selectedForCompare.sort((a, b) => a.versionNumber - b.versionNumber);
    
    const atsDiff = newer.atsScore - older.atsScore;
    const oldSkills = older.aiAnalysis?.skills?.technical || [];
    const newSkills = newer.aiAnalysis?.skills?.technical || [];
    
    const addedSkills = newSkills.filter((s: string) => !oldSkills.includes(s));
    const removedSkills = oldSkills.filter((s: string) => !newSkills.includes(s));

    return { older, newer, atsDiff, addedSkills, removedSkills };
  };

  const comparison = getComparison();

  return (
    <>
      <PageHeader title="Profile Version History" description="Track the evolution of your Candidate Intelligence Profile." />
      <div className="p-8 max-w-[1200px] mx-auto space-y-8">
        
        {/* Comparison Engine */}
        {comparison && (
          <div className="rounded-2xl bg-card border-2 border-primary/20 shadow-elevated p-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><ArrowRightLeft className="text-primary" /> Profile Comparison Engine</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                <div className="text-sm font-semibold text-muted-foreground uppercase">Version {comparison.older.versionNumber}</div>
                <div className="text-3xl font-bold mt-2">{comparison.older.atsScore} <span className="text-sm text-muted-foreground">ATS</span></div>
              </div>
              
              <div className="p-4 rounded-xl flex flex-col items-center justify-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">ATS Delta</div>
                <div className={`text-4xl font-black flex items-center gap-2 ${comparison.atsDiff > 0 ? 'text-success' : comparison.atsDiff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {comparison.atsDiff > 0 ? <TrendingUp className="w-8 h-8" /> : comparison.atsDiff < 0 ? <TrendingDown className="w-8 h-8" /> : null}
                  {comparison.atsDiff > 0 ? "+" : ""}{comparison.atsDiff}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                <div className="text-sm font-semibold text-muted-foreground uppercase">Version {comparison.newer.versionNumber}</div>
                <div className="text-3xl font-bold mt-2">{comparison.newer.atsScore} <span className="text-sm text-muted-foreground">ATS</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-6 rounded-xl bg-success/5 border border-success/20">
                <h3 className="font-bold text-success mb-3 flex items-center gap-2"><Star className="w-4 h-4" /> Skills Gained</h3>
                <div className="flex flex-wrap gap-2">
                  {comparison.addedSkills.length ? comparison.addedSkills.map((s: string) => (
                    <span key={s} className="px-2 py-1 rounded bg-success/10 text-success text-xs font-semibold">+{s}</span>
                  )) : <span className="text-sm text-muted-foreground">No new technical skills detected.</span>}
                </div>
              </div>

              <div className="p-6 rounded-xl bg-destructive/5 border border-destructive/20">
                <h3 className="font-bold text-destructive mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Skills Lost</h3>
                <div className="flex flex-wrap gap-2">
                  {comparison.removedSkills.length ? comparison.removedSkills.map((s: string) => (
                    <span key={s} className="px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-semibold">-{s}</span>
                  )) : <span className="text-sm text-muted-foreground">No skills were lost in this version.</span>}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Version List */}
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/20">
            <h2 className="font-semibold flex items-center gap-2"><HistoryIcon className="w-5 h-5 text-muted-foreground" /> Resume Versions</h2>
            <p className="text-sm text-muted-foreground mt-1">Select exactly two versions to trigger the comparison engine. Click "Restore" to make a version active across the platform.</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-4 font-medium w-16">Compare</th>
                <th className="text-left px-6 py-4 font-medium">Version</th>
                <th className="text-left px-6 py-4 font-medium">Date Uploaded</th>
                <th className="text-left px-6 py-4 font-medium">ATS Score</th>
                <th className="text-left px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resumes.map((r: any) => {
                const isActive = activeResume?._id === r._id;
                const isSelected = !!selectedForCompare.find(comp => comp._id === r._id);
                
                return (
                  <tr key={r._id} className={`hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        checked={isSelected}
                        onChange={() => toggleCompare(r)}
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold">v{r.versionNumber}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold tabular-nums text-primary">{r.atsScore}</td>
                    <td className="px-6 py-4">
                      {isActive ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-semibold border border-success/20">Active Profile</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">Archived</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isActive && (
                        <Button variant="outline" size="sm" onClick={() => setActiveResume(r)}>Restore Profile</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {resumes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No resumes uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}