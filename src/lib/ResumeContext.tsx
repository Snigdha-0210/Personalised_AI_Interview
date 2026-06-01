import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth";

interface ResumeContextType {
  activeResume: any | null;
  resumes: any[];
  loading: boolean;
  refreshResumes: () => Promise<void>;
  setActiveResume: (resume: any) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [activeResume, setActiveResume] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshResumes = async () => {
    if (!user?.email) return;
    try {
      const userRes = await fetch(`/api/users/${user.email}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        const resumeRes = await fetch(`/api/resumes/${userData._id}`);
        if (resumeRes.ok) {
          const data = await resumeRes.json();
          if (data.success) {
            setResumes(data.data);
            if (data.data.length > 0) {
              // If we already had an active resume selected, update it to the refreshed version
              if (activeResume) {
                const updated = data.data.find((r: any) => r._id === activeResume._id);
                if (updated) setActiveResume(updated);
                else setActiveResume(data.data[0]);
              } else {
                setActiveResume(data.data[0]);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch resumes globally:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshResumes();
  }, [user]);

  return (
    <ResumeContext.Provider value={{ activeResume, resumes, loading, refreshResumes, setActiveResume }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumeContext() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResumeContext must be used within a ResumeProvider");
  }
  return context;
}
