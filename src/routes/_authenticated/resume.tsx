import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, ArrowUpRight, TrendingUp, Sparkles, BrainCircuit } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useResumeContext } from "@/lib/ResumeContext";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Target, Compass, BookOpen, Layers } from "lucide-react";

export const Route = createFileRoute("/_authenticated/resume")({ component: ResumePage });

// Circular Progress Component SVG
function CircularProgress({ value, size = 120, strokeWidth = 10, color = "#6366f1", label }: { value: number, size?: number, strokeWidth?: number, color?: string, label?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold tracking-tighter" style={{ color }}>{value}</span>
      </div>
      {label && <div className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>}
    </div>
  );
}

function ResumePage() {
  const { user } = useAuth();
  const { resumes, activeResume, setActiveResume, refreshResumes } = useResumeContext();
  const [uploading, setUploading] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "jd-match" | "history" | "roadmap">("dashboard");

  // AI On-Demand States
  const [isCoaching, setIsCoaching] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [jdInput, setJdInput] = useState("");

  const [isMapping, setIsMapping] = useState(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [uploadingText, setUploadingText] = useState("Uploading Resume...");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File selection triggered.");
    if (!e.target.files || e.target.files.length === 0) {
      console.log("No file selected.");
      return;
    }
    const file = e.target.files[0];
    console.log("File selected:", file.name, "Type:", file.type);
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF too large. Maximum size is 10MB.");
      return;
    }

    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      console.error("Invalid file type. Found:", file.type);
      toast.error("Invalid file type. Only PDF files are supported.");
      return;
    }

    setUploading(true);
    setUploadingText("Uploading Resume...");
    
    const messages = [
      "Extracting Text...",
      "Analyzing Resume...",
      "Generating Insights...",
      "Saving Results..."
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      if (msgIndex < messages.length) {
        setUploadingText(messages[msgIndex]);
        msgIndex++;
      }
    }, 1500);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("email", user?.email || "test@hiremind.com");

    console.log("Sending upload request to /api/resumes/upload");
    try {
      const token = localStorage.getItem("hiremind.token");
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      clearInterval(interval);
      setUploadingText("Analysis Complete!");
      
      toast.success("Resume analyzed successfully!");
      await refreshResumes(); // Will refetch all and update activeResume logic

    } catch (err: any) {
      console.error(err);
      clearInterval(interval);
      toast.error(err.message || "Upload failed");
    } finally {
      setTimeout(() => setUploading(false), 500);
    }
  };

  const runCoach = async () => {
    if (!activeResume) return;
    setIsCoaching(true);
    try {
      const res = await fetch(`/api/resumes/${activeResume._id}/coach`, { method: "POST" });
      const data = await res.json();
      if (data.success) setCoachFeedback(data.data.coaching);
      else toast.error(data.error || "Coaching failed");
    } catch (err: any) {
      toast.error(err.message || "AI Coach failed");
    } finally {
      setIsCoaching(false);
    }
  };

  const runJDMatch = async () => {
    if (!activeResume) return;
    if (!jdInput.trim()) {
      toast.error("Please enter a Job Description first.");
      return;
    }
    setIsMatching(true);
    try {
      const res = await fetch(`/api/resumes/${activeResume._id}/match`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText: jdInput }) 
      });
      const data = await res.json();
      if (data.success) {
        setMatchData(data.data);
        toast.success("JD Match Analysis Complete!");
        await refreshResumes(); // Update snapshot globally
      } else {
        toast.error(data.error || "JD Match failed");
      }
    } catch (err: any) {
      toast.error(err.message || "JD Match failed");
    } finally {
      setIsMatching(false);
    }
  };

  const runRoadmap = async () => {
    if (!activeResume) return;
    setIsMapping(true);
    try {
      const res = await fetch(`/api/resumes/${activeResume._id}/roadmap`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, jdText: jdInput }) 
      });
      const data = await res.json();
      if (data.success) {
        setRoadmapData(data.data);
        toast.success("Career Roadmap Generated!");
        await refreshResumes(); // Update snapshot globally
      } else {
        toast.error(data.error || "Generation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Generation failed");
    } finally {
      setIsMapping(false);
    }
  };

  // Prepare Radar Chart Data
  const radarData = activeResume ? [
    { subject: 'Structure', A: activeResume.qualityAnalysis?.structure || 0, fullMark: 100 },
    { subject: 'Readability', A: activeResume.qualityAnalysis?.readability || 0, fullMark: 100 },
    { subject: 'Tech Depth', A: activeResume.qualityAnalysis?.technicalDepth || 0, fullMark: 100 },
    { subject: 'Achievements', A: activeResume.qualityAnalysis?.achievementOrientation || 0, fullMark: 100 },
    { subject: 'ATS Optimization', A: activeResume.qualityAnalysis?.keywordOptimization || 0, fullMark: 100 },
    { subject: 'Recruiter Score', A: activeResume.qualityAnalysis?.recruiterFriendliness || 0, fullMark: 100 },
  ] : [];

  // Prepare Trend Line Data
  const trendData = [...resumes].reverse().map(r => ({
    name: `V${r.versionNumber}`,
    ATS: r.atsScore || 0,
    HiringReadiness: r.aiAnalysis?.hiringReadinessScore || 0
  }));

  return (
    <>
      <PageHeader title="Resume Intelligence Engine" description="Upload your PDF. Gemini AI extracts skills, analyzes quality, and predicts hiring readiness." />
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
        
        {/* Upload Zone */}
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 text-center relative overflow-hidden transition-all hover:border-primary hover:bg-card">
          <input 
            type="file" 
            accept=".pdf" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            onChange={handleFileUpload}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center py-4">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 animate-pulse"></div>
                <BrainCircuit className="w-12 h-12 text-primary animate-bounce relative z-10" />
              </div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 animate-pulse">
                {uploadingText}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Extracting skills, predicting interview readiness, formatting radar charts, and drafting your recruiter summary.</p>
            </div>
          ) : (
            <div className="py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Drop your latest resume PDF here</h3>
              <p className="text-sm text-muted-foreground mt-1">Automatic version tracking & AI parsing</p>
            </div>
          )}
        </div>

        {activeResume && (
          <div className="space-y-6">
            
            {/* Context Header */}
            <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b">
              <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" /> 
                  {activeResume.fileName}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
                  <span className="bg-muted px-3 py-1 rounded-full border">Version {activeResume.versionNumber}</span>
                  <span>{new Date(activeResume.createdAt).toLocaleString()}</span>
                  <span className="text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{activeResume.experienceLevel || "Detected Level"}</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-muted p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "dashboard" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab("jd-match")}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "jd-match" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  JD Match Engine
                </button>
                <button 
                  onClick={() => setActiveTab("history")}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "history" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  History
                </button>
                <button 
                  onClick={() => setActiveTab("roadmap")}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "roadmap" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Career Roadmap
                </button>
              </div>
            </div>

            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Column 1: Top Line Metrics & Circular Progress */}
                <div className="xl:col-span-1 space-y-6">
                  <Card title="Overall Health">
                    <div className="flex justify-around items-center py-4">
                      <CircularProgress value={activeResume.atsScore || 0} color="#10b981" label="ATS Score" />
                      <CircularProgress value={activeResume.aiAnalysis?.hiringReadinessScore || 0} color="#6366f1" label="Hiring Readiness" />
                    </div>
                  </Card>

                  {/* Recruiter Summary */}
                  {activeResume.aiAnalysis?.recruiterSummary && (
                    <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 p-6 shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Gemini Recruiter Summary
                      </h3>
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                        "{activeResume.aiAnalysis.recruiterSummary}"
                      </p>
                    </div>
                  )}

                  <Card title="Priority Improvements">
                    <ul className="space-y-3">
                      {activeResume.suggestions?.map((suggestion: string, idx: number) => (
                        <li key={idx} className="flex gap-3 items-start bg-warning/5 border border-warning/20 p-3 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                          <span className="text-sm text-warning-foreground font-medium">{suggestion}</span>
                        </li>
                      ))}
                      {(!activeResume.suggestions || activeResume.suggestions.length === 0) && (
                        <div className="text-sm text-muted-foreground text-center py-4">No critical improvements detected!</div>
                      )}
                    </ul>
                  </Card>

                  <div className="pt-2">
                    <Button onClick={runCoach} disabled={isCoaching} className="w-full bg-gradient-primary border-0 text-white font-bold h-12 text-md">
                      {isCoaching ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                      Run AI Bullet Point Coach
                    </Button>
                  </div>
                  
                  {coachFeedback && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <Card title="AI Coaching Feedback">
                        <div className="space-y-4">
                          {coachFeedback.map((fb: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl bg-card border shadow-sm text-sm">
                              <div className="text-destructive/80 line-through mb-2 pb-2 border-b border-border/50">{fb.originalBullet}</div>
                              <div className="text-success font-semibold mb-2">{fb.improvedBullet}</div>
                              <div className="text-muted-foreground text-xs italic bg-muted p-2 rounded">{fb.reason}</div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Column 2 & 3: Radar Chart & Skills Breakdown */}
                <div className="xl:col-span-2 space-y-6">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <Card title="Resume Quality Radar">
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                            <PolarGrid stroke="currentColor" className="text-border" />
                            <PolarAngleAxis dataKey="subject" className="text-xs font-semibold fill-foreground" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs fill-muted-foreground" />
                            <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} strokeWidth={2} />
                            <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                    
                    {/* Granular Breakdown */}
                    <Card title="Detailed Quality Breakdown">
                       <div className="space-y-6 pt-4">
                        <Row label="Structural Integrity" v={activeResume.qualityAnalysis?.structure || 0} color="bg-blue-500" />
                        <Row label="Readability & Formatting" v={activeResume.qualityAnalysis?.readability || 0} color="bg-indigo-500" />
                        <Row label="Technical Depth" v={activeResume.qualityAnalysis?.technicalDepth || 0} color="bg-purple-500" />
                        <Row label="Achievement Orientation" v={activeResume.qualityAnalysis?.achievementOrientation || 0} color="bg-pink-500" />
                        <Row label="Keyword Optimization" v={activeResume.qualityAnalysis?.keywordOptimization || 0} color="bg-emerald-500" />
                      </div>
                    </Card>
                  </div>

                  {/* Skills Grid Visualization */}
                  <Card title="Extracted Skill Topology">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(activeResume.extractedSkills || {}).map(([category, skills]: [string, any]) => {
                        if (!skills || skills.length === 0) return null;
                        return (
                          <div key={category} className="bg-muted/50 p-4 rounded-xl border border-border/50">
                            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">{category}</div>
                            <div className="flex flex-wrap gap-2">
                              {skills.map((s: string) => (
                                <span key={s} className="px-3 py-1.5 rounded-lg bg-background text-foreground text-xs font-semibold border shadow-sm">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {(!activeResume.extractedSkills || Object.values(activeResume.extractedSkills).flat().length === 0) && (
                      <div className="text-center py-10 text-muted-foreground">No recognized technologies found in parsing.</div>
                    )}
                  </Card>

                </div>
              </div>
            )}


            {/* TAB: JD MATCH */}
            {activeTab === "jd-match" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-2">Target Job Description</h3>
                    <p className="text-sm text-muted-foreground mb-4">Paste the JD text below. Gemini AI will cross-reference your exact parsed skills and output a definitive Gap Analysis.</p>
                    <textarea 
                      placeholder="Paste the Job Description here..." 
                      className="w-full h-[400px] p-4 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono resize-none"
                      value={jdInput}
                      onChange={(e) => setJdInput(e.target.value)}
                    />
                    <Button onClick={runJDMatch} disabled={isMatching} className="w-full mt-4 h-12 font-bold text-md">
                      {isMatching ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <TrendingUp className="w-5 h-5 mr-2" />}
                      Execute Deep JD Match
                    </Button>
                  </div>
                </div>

                <div>
                  {isMatching ? (
                     <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                        <BrainCircuit className="w-16 h-16 text-primary animate-pulse mb-4" />
                        <h3 className="text-2xl font-bold">Correlating Keywords...</h3>
                        <p className="text-muted-foreground mt-2">Gemini 2.0 is mapping your resume against the JD constraints.</p>
                     </div>
                  ) : matchData ? (
                    <div className="space-y-6 animate-in fade-in zoom-in-95">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-card border rounded-2xl p-6 text-center shadow-sm">
                          <CircularProgress value={matchData.matchScore} size={100} color="#10b981" />
                          <div className="mt-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Overall Match</div>
                        </div>
                        <div className="bg-card border rounded-2xl p-6 text-center shadow-sm">
                          <CircularProgress value={matchData.technicalMatch} size={100} color="#6366f1" />
                          <div className="mt-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Tech Match</div>
                        </div>
                        <div className="bg-card border rounded-2xl p-6 text-center shadow-sm">
                          <CircularProgress value={matchData.atsMatch || matchData.experienceMatch || 0} size={100} color="#f59e0b" />
                          <div className="mt-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">ATS Match</div>
                        </div>
                      </div>

                      <Card title="Critical Missing Skills & Keywords">
                        <div className="flex flex-wrap gap-2 mb-6">
                          {matchData.missingSkills?.map((skill: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-md font-semibold text-sm">
                              {skill}
                            </span>
                          ))}
                          {matchData.missingKeywords?.map((kw: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-warning/10 text-warning-foreground border border-warning/20 rounded-md font-semibold text-sm">
                              {kw}
                            </span>
                          ))}
                          {(!matchData.missingSkills?.length && !matchData.missingKeywords?.length) && (
                            <span className="text-success font-medium">You have a perfect keyword match!</span>
                          )}
                        </div>
                      </Card>

                      <Card title="Recommended Action Plan">
                        <ul className="space-y-3">
                          {matchData.recommendedImprovements?.map((rec: string, i: number) => (
                            <li key={i} className="flex gap-3 items-start bg-muted p-3 rounded-lg border">
                              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <span className="text-sm font-medium">{rec}</span>
                            </li>
                          ))}
                          {(!matchData.recommendedImprovements || matchData.recommendedImprovements.length === 0) && (
                            <div className="text-sm text-muted-foreground">No specific actions recommended. You look good to go.</div>
                          )}
                        </ul>
                      </Card>

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-10 h-10 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-xl font-semibold">Waiting for JD...</h3>
                      <p className="text-muted-foreground mt-2 max-w-sm">Paste a job description on the left and hit analyze to see your granular match visualizations.</p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* TAB: CAREER ROADMAP */}
            {activeTab === "roadmap" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Target className="text-primary w-6 h-6" /> Target Career Role</h2>
                    <p className="text-muted-foreground">Select or type the exact role you are transitioning into. We will gap-analyze your resume and build a 90-day execution plan.</p>
                    {jdInput.trim() !== "" && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
                        <CheckCircle2 className="w-4 h-4" />
                        Targeting Specific Job Description (from JD Match tab)
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <input 
                      type="text" 
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="h-12 px-4 rounded-xl border border-input bg-background w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. AI Engineer"
                    />
                    <Button onClick={runRoadmap} disabled={isMapping} className="h-12 px-6 font-bold">
                      {isMapping ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Compass className="w-5 h-5 mr-2" />}
                      Generate Roadmap
                    </Button>
                  </div>
                </div>

                {isMapping ? (
                  <div className="py-20 text-center">
                    <div className="relative mb-6 mx-auto w-16 h-16">
                      <div className="absolute inset-0 rounded-full blur-xl bg-primary/40 animate-pulse"></div>
                      <Layers className="w-16 h-16 text-primary animate-bounce relative z-10" />
                    </div>
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Mapping Your Career Trajectory...</h3>
                    <p className="text-muted-foreground mt-2">Gemini is synthesizing a 90-day plan, comparing skills, and calculating selection probability.</p>
                  </div>
                ) : roadmapData ? (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Col: Diagnostics */}
                    <div className="xl:col-span-1 space-y-6">
                      <Card title="Predictive Analysis">
                        <div className="flex justify-around items-center py-4">
                          <CircularProgress value={roadmapData.careerReadiness || 0} color="#6366f1" label="Readiness" />
                          <CircularProgress value={roadmapData.predictions?.probabilityOfSelection || 0} color="#f59e0b" label="Selection Prob" />
                        </div>
                        <div className="mt-4 text-sm text-center text-muted-foreground italic px-2">
                          "{roadmapData.predictions?.explanation}"
                        </div>
                      </Card>

                      <Card title="Skill Gap Diagnostics">
                        <div className="mb-4">
                          <span className="text-xs font-bold uppercase text-muted-foreground">Severity Level: </span>
                          <span className={`text-sm font-black px-2 py-1 rounded ml-2 ${roadmapData.gapSeverity?.level === 'High' ? 'bg-destructive/10 text-destructive' : roadmapData.gapSeverity?.level === 'Medium' ? 'bg-warning/10 text-warning-foreground' : 'bg-success/10 text-success'}`}>
                            {roadmapData.gapSeverity?.level}
                          </span>
                        </div>
                        <div className="space-y-4 text-sm">
                          <div>
                            <div className="font-semibold text-destructive mb-2">Critical Missing</div>
                            <div className="flex flex-wrap gap-2">
                              {roadmapData.gapAnalysis?.critical?.map((s: string, i: number) => <span key={i} className="bg-destructive/10 text-destructive px-2 py-1 rounded">{s}</span>)}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-warning-foreground mb-2">Weak / Needs Focus</div>
                            <div className="flex flex-wrap gap-2">
                              {roadmapData.gapAnalysis?.weak?.map((s: string, i: number) => <span key={i} className="bg-warning/10 text-warning-foreground px-2 py-1 rounded">{s}</span>)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Right Col: 90 Day Plan & Resources */}
                    <div className="xl:col-span-2 space-y-6">
                      <Card title="90-Day Execution Timeline">
                        <div className="space-y-6">
                          {/* 30 Days */}
                          <div className="pl-6 border-l-2 border-primary relative">
                            <div className="absolute w-4 h-4 rounded-full bg-primary -left-[9px] top-1 ring-4 ring-background"></div>
                            <h4 className="font-bold text-lg text-primary mb-2">Days 1 - 30: Foundation Phase</h4>
                            <div className="text-sm space-y-2">
                              <div><span className="font-semibold text-muted-foreground">Focus Topics:</span> {roadmapData.roadmap?.first30Days?.topics?.join(", ")}</div>
                              <div><span className="font-semibold text-muted-foreground">Practice Goals:</span> {roadmapData.roadmap?.first30Days?.practiceGoals?.join(", ")}</div>
                            </div>
                          </div>
                          {/* 60 Days */}
                          <div className="pl-6 border-l-2 border-primary/50 relative">
                            <div className="absolute w-4 h-4 rounded-full bg-primary/50 -left-[9px] top-1 ring-4 ring-background"></div>
                            <h4 className="font-bold text-lg text-primary/80 mb-2">Days 31 - 60: Intermediate Phase</h4>
                            <div className="text-sm space-y-2">
                              <div><span className="font-semibold text-muted-foreground">Skills:</span> {roadmapData.roadmap?.days31To60?.intermediateSkills?.join(", ")}</div>
                              <div><span className="font-semibold text-muted-foreground">Mock Interviews:</span> {roadmapData.roadmap?.days31To60?.mockInterviews?.join(", ")}</div>
                            </div>
                          </div>
                          {/* 90 Days */}
                          <div className="pl-6 border-l-2 border-transparent relative">
                            <div className="absolute w-4 h-4 rounded-full bg-muted-foreground/30 -left-[9px] top-1 ring-4 ring-background"></div>
                            <h4 className="font-bold text-lg text-muted-foreground mb-2">Days 61 - 90: Mastery & Applications</h4>
                            <div className="text-sm space-y-2">
                              <div><span className="font-semibold text-muted-foreground">Portfolio Focus:</span> {roadmapData.roadmap?.days61To90?.portfolioBuilding?.join(", ")}</div>
                              <div><span className="font-semibold text-muted-foreground">Job Tactics:</span> {roadmapData.roadmap?.days61To90?.jobApplications?.join(", ")}</div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Tailored Project Recommendations">
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
                        </Card>

                        <Card title="Curated Learning Resources">
                           <div className="space-y-4">
                            {roadmapData.learningResources?.map((lr: any, i: number) => (
                              <div key={i} className="flex gap-3 items-start">
                                <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-sm font-bold">{lr.title} <span className="text-[10px] uppercase font-normal bg-muted text-muted-foreground px-2 rounded ml-2">{lr.type}</span></div>
                                  <div className="text-xs text-muted-foreground mt-1">{lr.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <Target className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
                    <h3 className="font-semibold text-lg">Define your target</h3>
                    <p className="text-muted-foreground text-sm">Enter the job title above to generate your customized roadmap.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <Card title="ATS Score Progression">
                  <div className="h-[400px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                        <XAxis dataKey="name" stroke="currentColor" className="text-xs opacity-50" />
                        <YAxis domain={[0, 100]} stroke="currentColor" className="text-xs opacity-50" />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem', color: 'hsl(var(--foreground))' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="ATS" stroke="#10b981" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} name="ATS Score" />
                        <Line type="monotone" dataKey="HiringReadiness" stroke="#6366f1" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Hiring Readiness" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resumes.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => { setActiveResume(r); setActiveTab("dashboard"); }}
                      className={`text-left p-6 rounded-2xl border transition-all ${
                        activeResume._id === r._id 
                          ? "bg-primary/5 border-primary shadow-md ring-1 ring-primary/20" 
                          : "bg-card border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-lg">Version {r.versionNumber}</span>
                        <span className="text-xs font-mono font-medium px-2 py-1 bg-muted rounded">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground truncate mb-6 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {r.fileName}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">ATS Grade</div>
                          <div className="text-3xl font-black text-success">{r.atsScore}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Readiness</div>
                          <div className="text-3xl font-black text-primary">{r.aiAnalysis?.hiringReadinessScore || 0}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-sm h-full flex flex-col">
      <h3 className="font-bold text-lg mb-6 tracking-tight">{title}</h3>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Row({ label, v, color = "bg-primary" }: { label: string; v: number, color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2 font-medium">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold">{v}/100</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${v}%` }}></div>
      </div>
    </div>
  );
}