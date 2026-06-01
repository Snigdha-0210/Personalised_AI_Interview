import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/settings")({ component: Settings });

function Settings() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Profile & Settings" description="Manage your account, resume, and preferences." />
      <div className="p-8 max-w-3xl space-y-6">
        <Card title="User Profile">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-primary text-white text-xl font-semibold flex items-center justify-center">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <div className="font-semibold">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Name</Label><Input defaultValue={user?.name} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input defaultValue={user?.email} /></div>
          </div>
        </Card>

        <Card title="Resume Management">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">alex_chen_resume_v3.pdf</div>
              <div className="text-xs text-muted-foreground">Active · 248 KB</div>
            </div>
            <Button variant="outline" size="sm">Replace</Button>
          </div>
        </Card>

        <Card title="Preferences">
          <Row label="Default difficulty" hint="Used when starting a quick interview"><Input defaultValue="Adaptive" className="w-40" /></Row>
          <Row label="Voice input" hint="Enable microphone by default"><Switch defaultChecked /></Row>
          <Row label="Theme" hint="Light theme is recommended"><Input defaultValue="Light" className="w-40" /></Row>
        </Card>

        <Card title="Notifications">
          <Row label="Weekly progress email" hint="Summary every Monday"><Switch defaultChecked /></Row>
          <Row label="New question packs" hint="When fresh content is available"><Switch /></Row>
          <Row label="Interview reminders" hint="If you set a scheduled session"><Switch defaultChecked /></Row>
        </Card>

        <div className="flex justify-end"><Button className="bg-gradient-primary border-0">Save changes</Button></div>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div><div className="text-sm font-medium">{label}</div><div className="text-xs text-muted-foreground">{hint}</div></div>
      {children}
    </div>
  );
}