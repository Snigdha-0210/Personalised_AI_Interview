import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Target, Map, Settings2, Mic, Users, FileBarChart,
  BarChart3, Brain, Shield, History, Settings, LogOut, Sparkles
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Resume Intelligence", icon: FileText },
  { to: "/jd-match", label: "JD Match Intelligence", icon: Target },
  { to: "/skill-gap", label: "Skill Gap Roadmap", icon: Map },
  { to: "/interview-setup", label: "Interview Setup", icon: Settings2 },
  { to: "/interview-room", label: "Interview Room", icon: Mic },
  { to: "/panel", label: "Panel Interview", icon: Users },
  { to: "/results", label: "Results", icon: FileBarChart },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ai-monitor", label: "AI Decision Engine", icon: Brain },
  { to: "/audit", label: "Recruiter Audit", icon: Shield },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const nav2 = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col">
        <div className="h-16 px-5 flex items-center gap-2 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elevated">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">HireMind AI</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Interview Intelligence</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
            <button
              onClick={() => { logout(); nav2({ to: "/login" }); }}
              className="p-1.5 rounded hover:bg-sidebar-accent text-muted-foreground"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
      <div className="px-8 py-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}