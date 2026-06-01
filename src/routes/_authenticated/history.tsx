import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { interviewHistory } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/history")({ component: History });

const recColor: Record<string, string> = {
  "Strong Hire": "bg-success/10 text-success",
  "Hire": "bg-primary/10 text-primary",
  "Borderline": "bg-warning/10 text-warning",
  "Needs Improvement": "bg-destructive/10 text-destructive",
};

function History() {
  return (
    <>
      <PageHeader title="Interview History" description="Every interview you've completed." />
      <div className="p-8">
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Date</th>
                <th className="text-left px-6 py-3 font-medium">Role</th>
                <th className="text-left px-6 py-3 font-medium">Type</th>
                <th className="text-left px-6 py-3 font-medium">Duration</th>
                <th className="text-left px-6 py-3 font-medium">Score</th>
                <th className="text-left px-6 py-3 font-medium">Recommendation</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {interviewHistory.map((h) => (
                <tr key={h.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 text-muted-foreground">{h.date}</td>
                  <td className="px-6 py-4 font-medium">{h.role}</td>
                  <td className="px-6 py-4 text-muted-foreground">{h.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">{h.duration}</td>
                  <td className="px-6 py-4 font-semibold tabular-nums">{h.score}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${recColor[h.recommendation]}`}>{h.recommendation}</span></td>
                  <td className="px-6 py-4 text-right">
                    <Link to="/results"><Button variant="ghost" size="sm">View Report</Button></Link>
                    <Link to="/interview-setup"><Button variant="ghost" size="sm">Retake</Button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}