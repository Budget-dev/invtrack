"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  MoreVertical, 
  Plus, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

const audits = [
  {
    id: "AUD-2024-001",
    client: "Global Logistics Hub",
    site: "Chicago Central (CHI-01)",
    status: "In Progress",
    requestedDate: "2024-05-01",
    auditor: "James Wilson",
    progress: 65,
  },
  {
    id: "AUD-2024-002",
    client: "Retail Solutions Inc.",
    site: "Austin North (AUS-04)",
    status: "Requested",
    requestedDate: "2024-05-12",
    auditor: "TBD",
    progress: 0,
  },
  {
    id: "AUD-2024-003",
    client: "Industrial Parts Co.",
    site: "Seattle Port (SEA-09)",
    status: "Approved",
    requestedDate: "2024-05-08",
    auditor: "Sarah Chen",
    progress: 0,
  },
  {
    id: "AUD-2024-004",
    client: "MedTech Distribution",
    site: "Denver East (DEN-02)",
    status: "Final Sign-off",
    requestedDate: "2024-04-28",
    auditor: "Michael Ross",
    progress: 100,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "In Progress": return <Clock size={14} />;
    case "Requested": return <ClipboardList size={14} />;
    case "Approved": return <CheckCircle2 size={14} />;
    case "Final Sign-off": return <CheckCircle2 size={14} />;
    default: return <AlertCircle size={14} />;
  }
};

export default function AuditLifecyclePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline tracking-tight">Audit Lifecycle</h2>
          <p className="text-muted-foreground">Manage inventory audit sequences from request to final sign-off.</p>
        </div>
        <Button className="bg-black text-white hover:bg-black/90 rounded-sm">
          <Plus size={18} className="mr-2" strokeWidth={2} />
          Create New Audit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">08</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Field Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Awaiting Sign-off</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">03</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-b">
                <TableHead className="w-[150px]">Audit ID</TableHead>
                <TableHead>Client & Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auditor</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead className="text-right">Completion</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((audit) => (
                <TableRow key={audit.id} className="hover:bg-secondary/20 border-b last:border-0 transition-colors">
                  <TableCell className="font-medium font-code text-xs">{audit.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{audit.client}</span>
                      <span className="text-xs text-muted-foreground">{audit.site}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-sm border-black flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight">
                      {getStatusIcon(audit.status)}
                      {audit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{audit.auditor}</TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">{audit.requestedDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-secondary h-1 rounded-full overflow-hidden">
                        <div className="bg-black h-full" style={{ width: `${audit.progress}%` }} />
                      </div>
                      <span className="text-xs font-medium tabular-nums w-8">{audit.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                      <MoreVertical size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
