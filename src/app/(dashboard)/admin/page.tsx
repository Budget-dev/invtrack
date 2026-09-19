import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Building2, MapPin, Search, Filter } from "lucide-react";

export default function AdministrationPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline tracking-tight">System Administration</h2>
        <p className="text-muted-foreground">Manage organizational structure, site onboarding, and personnel credentials.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-headline">Auditor Management</CardTitle>
                <CardDescription>Global field agent roster and access levels</CardDescription>
              </div>
              <Button size="sm" className="bg-black text-white rounded-sm">
                <UserPlus size={16} className="mr-2" />
                Invite Agent
              </Button>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input placeholder="Filter agents by name or ID..." className="pl-9 h-9 border-secondary bg-secondary/20" />
              </div>
              <Button variant="outline" size="sm" className="h-9 border-secondary">
                <Filter size={16} className="mr-2" />
                Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-secondary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-headline text-sm border">
                    {i === 1 ? "JW" : i === 2 ? "SC" : "MR"}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{i === 1 ? "James Wilson" : i === 2 ? "Sarah Chen" : "Michael Ross"}</div>
                    <div className="text-xs text-muted-foreground">auditor_{i}@invtrack.system</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Region</div>
                    <div className="text-xs font-semibold">North America</div>
                  </div>
                  <div className="text-right w-24">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</div>
                    <div className="text-xs font-semibold">Active</div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-bold border rounded-sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Onboard Site</CardTitle>
              <CardDescription>Add new warehouse or distribution facility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Site Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input placeholder="e.g. Dallas Distribution Hub" className="pl-10 h-10 border-secondary focus:ring-black" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location ID / Code</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input placeholder="e.g. DAL-021" className="pl-10 h-10 border-secondary focus:ring-black font-code" />
                </div>
              </div>
              <Button className="w-full bg-black text-white hover:bg-black/90 rounded-sm mt-4">
                Initialize Site Data
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-black text-white">
            <CardHeader>
              <CardTitle className="text-lg font-headline text-white">System Logs</CardTitle>
              <CardDescription className="text-white/60">Recent infrastructure events</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-white/10">
              {[
                "New Site: SEA-09 Onboarded",
                "Auditor JW assigned to CHI-01",
                "Global Schema Update v2.1",
                "Security Audit Complete"
              ].map((log, idx) => (
                <div key={idx} className="p-4 border-b border-white/10 last:border-0 text-xs font-code flex items-start gap-3">
                  <span className="text-white/40 tabular-nums">14:02:11</span>
                  <span>{log}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
