import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Target, Map, Settings2, Mic, Users, FileBarChart,
  BarChart3, Brain, Shield, History, Settings, LogOut, Sparkles,
  Route, Volume2
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Preparation",
    items: [
      { to: "/resume", label: "Resume Intelligence", icon: FileText },
      { to: "/jd-match", label: "JD Match Intelligence", icon: Target },
      { to: "/skill-gap", label: "Skill Gap", icon: Map },
      { to: "/roadmap", label: "Career Roadmap", icon: Route },
    ],
  },
  {
    label: "Interview",
    items: [
      { to: "/interview-setup", label: "Interview Setup", icon: Settings2 },
      { to: "/interview-room", label: "Interview Room", icon: Mic },
      { to: "/voice-interview", label: "Voice Interview", icon: Volume2 },
      { to: "/panel", label: "Panel Interview", icon: Users },
    ],
  },
  {
    label: "Results",
    items: [
      { to: "/results", label: "Results", icon: FileBarChart },
      { to: "/ai-monitor", label: "AI Decision Engine", icon: Brain },
      { to: "/recruiter", label: "Recruiter Intelligence", icon: Shield },
      { to: "/audit", label: "Recruiter Audit", icon: Shield },
      { to: "/history", label: "History", icon: History },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const nav2 = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col">
        {/* Logo */}
        <div className="h-16 px-5 flex items-center gap-2.5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elevated">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">HireMind AI</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Intelligence OS</div>
          </div>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
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
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-sidebar-border p-3">
          {/* Readiness Badge */}
          <div className="mx-2 mb-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-primary">Readiness Score</span>
              <span className="text-[11px] font-bold text-primary">87</span>
            </div>
            <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "87%" }} />
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
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

      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
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