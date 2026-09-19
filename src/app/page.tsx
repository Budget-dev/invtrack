
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Warehouse as WarehouseIcon, Boxes, ShieldAlert, FileText, 
  CheckCircle, Plus, ClipboardList, Info, Search,
  MapPin, CheckCircle2, Users, UserCheck, Building2, TrendingUp, Sliders,
  ArrowRight, ShieldCheck, PieChart, Activity, Zap, Camera, Clock, 
  AlertTriangle, Filter, RotateCcw, Save, LogOut, ChevronDown, 
  ChevronsRight, Bell, Settings, HelpCircle, User, Download, TrendingDown,
  Menu, FilePlus, FileCheck2, PlaySquare, MoreVertical, LayoutDashboard,
  BarChart3, Calendar as CalendarIcon, FileBarChart, UserCog, ListChecks,
  FileWarning, ActivitySquare, PlusSquare, Trash2, CheckCircle2 as CheckIcon
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { cn, formatCurrency, formatNumber, initials } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from "@/components/ui/progress";
import HowItWorks from "@/components/ui/how-it-works";
import { FloatingDataDecoration } from "@/components/ui/chart-tooltip";

import { 
  clients, warehouses, inventoryItems, audits, 
  countLinesForAud002, discrepancies, auditRequests, auditors, 
  accuracyTrend, varianceByCategory, VARIANCE_TOLERANCE_PERCENT 
} from '@/data/mock-data';

// --- LOGO COMPONENT ---
export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#55A3FB" />
        <path d="M3 7V17L12 22V12L3 7Z" fill="#1D6FE0" />
        <path d="M12 12V22L21 17V7L12 12Z" fill="#154892" />
      </svg>
      <span className="font-headline text-xl font-bold tracking-tight">
        <span className="text-[#163E77]">Inv</span>
        <span className="text-[#2B7CE9]">Track</span>
      </span>
    </div>
  );
}

// --- FORM SCHEMAS ---
const LeadFormSchema = zod.object({
  company: zod.string().min(2, { message: 'Company name is required' }),
  name: zod.string().min(2, { message: 'Contact name is required' }),
  email: zod.string().email({ message: 'Invalid email address' }),
  phone: zod.string().min(10, { message: 'Phone must be at least 10 digits' }),
  city: zod.string().min(2, { message: 'City is required' }),
  warehousesCount: zod.number().min(1, { message: 'Must be at least 1 warehouse' }),
  notes: zod.string().optional()
});

const CreateAuditSchema = zod.object({
  warehouseId: zod.string().min(1, "Warehouse is required"),
  type: zod.string().min(1, "Audit type is required"),
  preferredDate: zod.string().min(1, "Date is required"),
  notes: zod.string().optional()
});

// --- UI HELPERS ---
function AuditStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-[#E8F6EF] text-[#12855A]',
    in_progress: 'bg-[#EEF5FF] text-[#2B7CE9]',
    approved: 'bg-[#EEF5FF] text-[#1D6FE0]',
    pending: 'bg-[#FFF8E6] text-[#B5730F]',
    cancelled: 'bg-slate-100 text-slate-500'
  };
  return (
    <Badge className={cn("rounded-full font-medium border-none px-2.5 py-0.5 text-[10px] uppercase", colors[status] || 'bg-slate-100')}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-[#FDF2F2] text-[#C0362C]',
    high: 'bg-[#FFF8E6] text-[#B5730F]',
    medium: 'bg-[#EEF5FF] text-[#2B7CE9]',
    low: 'bg-slate-100 text-slate-500'
  };
  return (
    <Badge className={cn("rounded-full font-bold border-none px-2.5 py-0.5 text-[10px] uppercase", colors[severity] || 'bg-slate-100')}>
      {severity}
    </Badge>
  );
}

// --- SHARED PORTAL SHELL ---
function PortalShell({ 
  currentRole, 
  onRoleChange, 
  activeTab, 
  onTabChange, 
  children 
}: { 
  currentRole: 'marketing' | 'client' | 'auditor' | 'admin';
  onRoleChange: (role: 'marketing' | 'client' | 'auditor' | 'admin') => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}) {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [openMobile, setOpenMobile] = useState(false);

  const roleLabels = {
    marketing: 'Public Website',
    client: 'Client Portal',
    auditor: 'Auditor Portal',
    admin: 'InvTrack Admin'
  };

  const userNames = {
    marketing: 'Guest Visitor',
    client: 'Ravi Teja',
    auditor: 'Naveen Kumar',
    admin: 'Priya Menon'
  };

  const userCompanies = {
    marketing: 'Prospective Client',
    client: 'ABC Enterprises',
    auditor: 'Field Operations',
    admin: 'InvTrack India Team'
  };

  const menuItems = {
    client: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'warehouses', name: 'Warehouses', icon: WarehouseIcon },
      { id: 'inventory', name: 'Inventory Ledger', icon: Boxes },
      { id: 'create_audit', name: 'Request Count', icon: FilePlus },
      { id: 'my_audits', name: 'My Audits', icon: ClipboardList },
      { id: 'discrepancies', name: 'Discrepancies', icon: ShieldAlert },
      { id: 'reports', name: 'Reports & Trends', icon: BarChart3 },
    ],
    auditor: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'my_audits', name: 'My Audits', icon: ClipboardList },
      { id: 'today', name: 'Today\'s Audits', icon: PlaySquare },
      { id: 'count_sheet', name: 'Count Sheet', icon: Boxes },
      { id: 'discrepancies', name: 'Discrepancies', icon: ShieldAlert },
      { id: 'completed', name: 'Completed Logs', icon: FileCheck2 }
    ],
    admin: [
      { id: 'dashboard', name: 'Operations', icon: LayoutDashboard },
      { id: 'clients', name: 'Clients', icon: Users },
      { id: 'warehouses', name: 'Warehouses', icon: Building2 },
      { id: 'auditors', name: 'Auditors', icon: UserCheck },
      { id: 'requests', name: 'Requests', icon: FilePlus },
      { id: 'inventory', name: 'Master Inventory', icon: Boxes },
      { id: 'settings', name: 'System Setup', icon: Sliders }
    ],
    marketing: []
  };

  const currentMenu = menuItems[currentRole as keyof typeof menuItems] || [];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-body">
      <div className="bg-slate-900 text-white text-[11px] px-4 py-1.5 flex items-center justify-between shrink-0 font-sans z-50">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-wider text-[#2B7CE9]">DEMO MODE:</span>
          <span className="text-slate-400">Select a workspace:</span>
        </div>
        <div className="flex gap-1">
          {['marketing', 'client', 'auditor', 'admin'].map((r) => (
            <button 
              key={r}
              onClick={() => { onRoleChange(r as any); onTabChange(r === 'marketing' ? 'home' : 'dashboard'); }} 
              className={cn(
                "px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors",
                currentRole === r ? "bg-[#2B7CE9] text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {currentRole !== 'marketing' && (
          <aside className={cn("hidden lg:flex flex-col border-r border-[#E3EAF2] bg-[#163E77] transition-all duration-300", openSidebar ? "w-[256px]" : "w-[64px]")}>
            <div className="flex flex-col h-full text-[#CBD9EC]">
              <div className="p-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3 px-2">
                  <Logo className="brightness-0 invert scale-90 origin-left" />
                  {openSidebar && <span className="text-[10px] font-bold text-[#8FB4E8] tracking-widest uppercase">{roleLabels[currentRole]}</span>}
                </div>
              </div>
              <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {currentMenu.map((item) => (
                  <button key={item.id} onClick={() => onTabChange(item.id)} className={cn("w-full flex items-center gap-3 px-3 h-10 text-[14px] font-medium rounded-md transition-all text-left group", activeTab === item.id ? "bg-white/10 text-white border-l-2 border-[#2B7CE9]" : "hover:bg-white/5 hover:text-white text-[#CBD9EC]/70")}>
                    <div className="flex items-center justify-center w-5"><item.icon size={18} strokeWidth={1.75} /></div>
                    {openSidebar && <span>{item.name}</span>}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-white/10 space-y-2 text-xs font-medium">
                {openSidebar && (
                  <div className="bg-black/20 rounded-md p-3 mb-2">
                    <p className="text-white">{userNames[currentRole]}</p>
                    <p className="text-white/50 uppercase tracking-tight">{userCompanies[currentRole]}</p>
                  </div>
                )}
                <button onClick={() => setOpenSidebar(!openSidebar)} className="w-full flex items-center gap-3 px-3 py-2 text-white/40 hover:text-white"><ChevronsRight size={18} className={cn(openSidebar && "rotate-180")} />{openSidebar && <span>Collapse</span>}</button>
                <button onClick={() => onRoleChange('marketing')} className="w-full flex items-center gap-3 px-3 py-2 text-white/40 hover:text-white"><LogOut size={18} />{openSidebar && <span>Sign Out</span>}</button>
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="h-16 sticky top-0 bg-white border-b border-[#E3EAF2] z-40 px-6 flex items-center justify-between shadow-sm">
            {currentRole === 'marketing' ? (
              <>
                <div className="flex items-center gap-10">
                  <Logo />
                  <nav className="hidden lg:flex items-center gap-6">
                    {['Home', 'How it works', 'Industries', 'Contact'].map((t) => (
                      <button key={t} onClick={() => onTabChange(t.toLowerCase().replace(/ /g, '_'))} className={cn("text-[14px] font-medium transition-colors", activeTab === t.toLowerCase().replace(/ /g, '_') ? "text-[#2B7CE9]" : "text-[#5A6B80] hover:text-[#16202E]")}>{t}</button>
                    ))}
                  </nav>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => onRoleChange('client')} className="text-[14px]">Log in</Button>
                  <Button onClick={() => onTabChange('request_audit')} className="bg-[#2B7CE9] text-white">Request an audit</Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h4 className="text-[14px] font-semibold text-[#16202E]">Welcome, {userNames[currentRole]}</h4>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-widest">{userCompanies[currentRole]}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="relative"><Bell size={20} /><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" /></Button>
                  <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px] font-bold text-[#2B7CE9]">{initials(userNames[currentRole])}</AvatarFallback></Avatar>
                </div>
              </>
            )}
          </header>

          <main className="flex-1 overflow-y-auto bg-[#F7F9FC]">
            <div className="max-w-[1320px] mx-auto p-6 md:p-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function InvTrackMainApp() {
  const [role, setRole] = useState<'marketing' | 'client' | 'auditor' | 'admin'>('marketing');
  const [tab, setTab] = useState<string>('home');
  const [liveCountLines, setLiveCountLines] = useState(countLinesForAud002);
  const [activeRequests, setActiveRequests] = useState(auditRequests);

  const { register: regLead, handleSubmit: handleLeadSubmit, formState: { errors: leadErrors }, reset: resetLead } = useForm({
    resolver: zodResolver(LeadFormSchema),
    defaultValues: { warehousesCount: 1 }
  });

  const { register: regAudit, handleSubmit: handleAuditSubmit, formState: { errors: auditErrors }, reset: resetAudit } = useForm({
    resolver: zodResolver(CreateAuditSchema)
  });

  const handleUpdateCount = (sku: string, val: string) => {
    const countNum = val === '' ? null : parseInt(val, 10);
    setLiveCountLines(prev => prev.map(line => {
      if (line.sku === sku) {
        const expected = line.systemQty;
        const variance = countNum !== null ? countNum - expected : null;
        const percent = variance !== null ? Math.abs((variance / expected) * 100) : 0;
        const isFlagged = percent > VARIANCE_TOLERANCE_PERCENT;
        return { ...line, countedQty: countNum, variance, isFlagged };
      }
      return line;
    }));
  };

  const countedLinesCount = liveCountLines.filter(l => l.countedQty !== null).length;

  return (
    <PortalShell currentRole={role} onRoleChange={setRole} activeTab={tab} onTabChange={setTab}>
      <AnimatePresence mode="wait">
        {role === 'marketing' && (
          <motion.div key="marketing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-0">
            {tab === 'home' && (
              <div className="space-y-0">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 pb-24 items-center relative border-b border-[#E3EAF2]">
                  <div className="space-y-8">
                    <span className="text-[#2B7CE9] text-[13px] font-bold tracking-widest uppercase block">From stock to clarity</span>
                    <h1 className="text-[48px] md:text-[56px] font-headline font-bold text-[#16202E] leading-tight tracking-tight">Accurate inventory audits for a stronger tomorrow</h1>
                    <p className="text-[#5A6B80] text-lg max-w-[540px]">InvTrack replaces chaotic spreadsheets with physical verify cycles. Freeze quantities, track variances live, and produce reconciled reports instantly.</p>
                    <div className="flex items-center gap-4">
                      <Button onClick={() => setTab('request_audit')} className="bg-[#2B7CE9] text-white px-8 h-12 font-semibold">Request an audit</Button>
                      <Button variant="outline" onClick={() => setTab('how_it_works')} className="h-12 px-8 font-semibold bg-white">See how it works</Button>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 hidden lg:block z-20"><FloatingDataDecoration /></div>
                    <div className="grid grid-cols-2 gap-5 relative z-10 w-full max-w-[520px]">
                      {[
                        { val: '99.2%', label: 'Average accuracy' },
                        { val: '6 hrs', label: 'Turnaround' },
                        { val: '1,842', label: 'Daily SKU count' },
                        { val: '4 Roles', label: 'One platform' }
                      ].map((item, i) => (
                        <Card key={i} className="bg-white border border-[#E3EAF2] p-6 shadow-card transition-transform hover:-translate-y-1">
                          <div className="text-4xl font-headline font-bold text-[#16202E] mb-2 tabular-nums">{item.val}</div>
                          <div className="text-[13px] text-[#5A6B80] font-medium">{item.label}</div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                {/* High Fidelity How It Works Component */}
                <HowItWorks features={[
                  { title: "Request Audit", description: "Clients initiate a count sequence by selecting a warehouse site and audit type.", colorTheme: "orange" },
                  { title: "Verify & Approve", description: "Admin verifies details, freezes system quantities, and assigns a field agent.", colorTheme: "blue" },
                  { title: "Physical Count", description: "Auditors use tablet-optimized count sheets to verify physical stock on the floor.", colorTheme: "purple" },
                  { title: "Live Reconciliation", description: "Every variance is automatically flagged and routed to management for review.", colorTheme: "orange" },
                  { title: "Final Sign-off", description: "A secure report is generated, signed off, and master records are updated.", colorTheme: "blue" }
                ]} />
              </div>
            )}
            {tab === 'how_it_works' && (
              <div className="py-12">
                 <HowItWorks features={[
                  { title: "Request Audit", description: "Clients initiate a count sequence by selecting a warehouse site and audit type.", colorTheme: "orange" },
                  { title: "Verify & Approve", description: "Admin verifies details, freezes system quantities, and assigns a field agent.", colorTheme: "blue" },
                  { title: "Physical Count", description: "Auditors use tablet-optimized count sheets to verify physical stock on the floor.", colorTheme: "purple" },
                  { title: "Live Reconciliation", description: "Every variance is automatically flagged and routed to management for review.", colorTheme: "orange" },
                  { title: "Final Sign-off", description: "A secure report is generated, signed off, and master records are updated.", colorTheme: "blue" }
                ]} />
              </div>
            )}
            {tab === 'request_audit' && (
              <div className="max-w-[640px] mx-auto py-12">
                <Card className="border-[#E3EAF2] bg-white p-8 shadow-premium">
                  <h2 className="text-3xl font-headline font-bold mb-6">Initiate your first count</h2>
                  <form onSubmit={handleLeadSubmit(() => { toast.success("Request sent!"); setTab('home'); })} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Company Name" {...regLead('company')} />
                      <Input placeholder="Your Name" {...regLead('name')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="email" placeholder="Work Email" {...regLead('email')} />
                      <Input placeholder="Phone Number" {...regLead('phone')} />
                    </div>
                    <Textarea placeholder="Additional Notes..." {...regLead('notes')} />
                    <Button type="submit" className="w-full bg-[#2B7CE9] h-12 font-bold uppercase tracking-widest">Send Request</Button>
                  </form>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {role === 'client' && (
          <motion.div key="client" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            {tab === 'dashboard' && (
              <div className="space-y-8 text-left">
                <header>
                  <h2 className="text-3xl font-headline font-bold">Client Dashboard</h2>
                  <p className="text-[#5A6B80]">Operational status across your registered warehouse sites.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Sites', val: '03', icon: WarehouseIcon, color: 'text-[#12855A]', bg: 'bg-[#E8F6EF]' },
                    { label: 'Total Audits', val: '08', icon: ClipboardList, color: 'text-[#12855A]', bg: 'bg-[#E8F6EF]' },
                    { label: 'Pending Decisions', val: '12', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Avg Accuracy', val: '98.8%', icon: TrendingUp, color: 'text-[#12855A]', bg: 'bg-[#E8F6EF]' }
                  ].map((s, i) => (
                    <Card key={i} className="p-6 flex items-center justify-between border-[#E3EAF2]">
                      <div><p className="text-xs font-bold text-[#5A6B80] uppercase tracking-wider">{s.label}</p><h3 className="text-3xl font-bold mt-1">{s.val}</h3></div>
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg, s.color)}><s.icon size={20} /></div>
                    </Card>
                  ))}
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b font-bold text-xs uppercase text-[#5A6B80]">Recent Audit Status</div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Audit ID</TableHead><TableHead>Site</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {audits.filter(a => a.clientId === 'cl_abc').map(a => (
                        <TableRow key={a.id}><TableCell className="font-bold text-xs">{a.reference}</TableCell><TableCell className="text-sm font-medium">{warehouses.find(w => w.id === a.warehouseId)?.name}</TableCell><TableCell><AuditStatusBadge status={a.status} /></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => setTab('my_audits')}>Manage</Button></TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
            {tab === 'warehouses' && (
              <div className="space-y-6 text-left">
                <header><h2 className="text-3xl font-headline font-bold">Your Warehouses</h2><p className="text-[#5A6B80]">Facility master list and management.</p></header>
                <Card className="border-[#E3EAF2] overflow-hidden">
                  <Table>
                    <TableHeader><TableRow><TableHead>Site Name</TableHead><TableHead>Code</TableHead><TableHead>City</TableHead><TableHead className="text-right">SKUs</TableHead><TableHead>Last Audit</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {warehouses.filter(w => w.clientId === 'cl_abc').map(w => (
                        <TableRow key={w.id}><TableCell className="font-bold">{w.name}</TableCell><TableCell className="text-xs font-mono">{w.code}</TableCell><TableCell className="text-sm">{w.city}</TableCell><TableCell className="text-right tabular-nums">{formatNumber(w.skuCount)}</TableCell><TableCell className="text-xs">{w.lastAuditedDate || 'Pending'}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
            {tab === 'inventory' && (
              <div className="space-y-6 text-left">
                <header><h2 className="text-3xl font-headline font-bold">Inventory Ledger</h2><p className="text-[#5A6B80]">Master records across all facilities.</p></header>
                <Card className="border-[#E3EAF2] overflow-hidden">
                  <Table>
                    <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Item Name</TableHead><TableHead>Category</TableHead><TableHead className="text-right">System Qty</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {inventoryItems.map(item => (
                        <TableRow key={item.sku}><TableCell className="font-mono text-xs font-bold">{item.sku}</TableCell><TableCell className="font-medium">{item.name}</TableCell><TableCell className="text-xs uppercase text-[#5A6B80]">{item.category}</TableCell><TableCell className="text-right font-bold">{item.systemQty} {item.unit}</TableCell><TableCell className="text-right font-bold">{formatCurrency(item.systemQty * item.unitValue)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
            {tab === 'create_audit' && (
              <div className="max-w-[640px] text-left">
                <header className="mb-8"><h2 className="text-3xl font-headline font-bold">Request New Count</h2><p className="text-[#5A6B80]">Schedule a full or cycle audit for a specific warehouse.</p></header>
                <Card className="p-8 border-[#E3EAF2]">
                  <form onSubmit={handleAuditSubmit(() => toast.success("Request created!"))} className="space-y-6">
                    <div className="space-y-2"><label className="text-xs font-bold uppercase text-[#5A6B80]">Target Warehouse</label><select className="w-full h-10 border rounded-md px-3 bg-white" {...regAudit('warehouseId')}>{warehouses.filter(w => w.clientId === 'cl_abc').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                    <div className="space-y-2"><label className="text-xs font-bold uppercase text-[#5A6B80]">Audit Type</label><select className="w-full h-10 border rounded-md px-3 bg-white" {...regAudit('type')}><option value="full">Full Wall-to-Wall</option><option value="cycle">Cycle Count</option><option value="spot">Spot Check</option></select></div>
                    <div className="space-y-2"><label className="text-xs font-bold uppercase text-[#5A6B80]">Preferred Date</label><Input type="date" {...regAudit('preferredDate')} /></div>
                    <Button type="submit" className="w-full bg-[#2B7CE9] h-12 text-white font-bold uppercase tracking-widest">Submit Request</Button>
                  </form>
                </Card>
              </div>
            )}
            {tab === 'my_audits' && (
              <div className="space-y-6 text-left">
                <header><h2 className="text-3xl font-headline font-bold">Audit History</h2><p className="text-[#5A6B80]">Manage and review all audit sequences.</p></header>
                <Card className="border-[#E3EAF2] overflow-hidden">
                  <Table>
                    <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Warehouse</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Accuracy</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {audits.filter(a => a.clientId === 'cl_abc').map(a => (
                        <TableRow key={a.id}><TableCell className="font-bold text-xs">{a.reference}</TableCell><TableCell className="text-sm">{warehouses.find(w => w.id === a.warehouseId)?.name}</TableCell><TableCell><AuditStatusBadge status={a.status} /></TableCell><TableCell className="text-right font-bold">{a.accuracy ? `${a.accuracy}%` : '-'}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" className="h-8 font-bold">View Report</Button></TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
            {tab === 'discrepancies' && (
              <div className="space-y-6 text-left">
                <header><h2 className="text-3xl font-headline font-bold">Variance Ledger</h2><p className="text-[#5A6B80]">Discrepancies flagged across all recent verify shifts.</p></header>
                <Card className="border-[#E3EAF2] overflow-hidden">
                  <Table>
                    <TableHeader><TableRow><TableHead>Item & SKU</TableHead><TableHead>Type</TableHead><TableHead>Severity</TableHead><TableHead className="text-right">Impact</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {discrepancies.map(d => (
                        <TableRow key={d.id}><TableCell><div><div className="font-bold text-sm">{d.itemName}</div><div className="text-[10px] text-[#5A6B80] font-mono">{d.sku}</div></div></TableCell><TableCell className="capitalize text-xs">{d.type}</TableCell><TableCell><SeverityBadge severity={d.severity} /></TableCell><TableCell className="text-right font-bold text-red-600">{formatCurrency(d.valueImpact)}</TableCell><TableCell className="text-xs">{d.raisedDate}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
            {tab === 'reports' && (
              <div className="space-y-8 text-left">
                <header><h2 className="text-3xl font-headline font-bold">Reports & Trends</h2><p className="text-[#5A6B80]">Visual stock accuracy and variance analysis.</p></header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6 border-[#E3EAF2]"><h3 className="text-sm font-bold uppercase tracking-widest text-[#5A6B80] mb-6">Stock Accuracy Trend</h3><div className="h-[300px] w-full"><ResponsiveContainer><LineChart data={accuracyTrend}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis domain={[95, 100]} /><Tooltip /><Line type="monotone" dataKey="accuracy" stroke="#2B7CE9" strokeWidth={3} dot={{ fill: "#2B7CE9" }} /></LineChart></ResponsiveContainer></div></Card>
                  <Card className="p-6 border-[#E3EAF2]"><h3 className="text-sm font-bold uppercase tracking-widest text-[#5A6B80] mb-6">Variance by Category</h3><div className="h-[300px] w-full"><ResponsiveContainer><BarChart data={varianceByCategory}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="category" /><YAxis /><Tooltip /><Legend /><Bar dataKey="shortage" fill="#C0362C" radius={[4, 4, 0, 0]} /><Bar dataKey="overage" fill="#12855A" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {role === 'auditor' && (
          <motion.div key="auditor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 text-left">
            {tab === 'dashboard' && (
              <div className="space-y-6">
                <header><h2 className="text-3xl font-headline font-bold">Auditor Dashboard</h2><p className="text-[#5A6B80]">Active and upcoming floor verify assignments.</p></header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Today', val: '01', icon: Activity, tone: 'auditor' },
                    { label: 'Upcoming', val: '02', icon: Clock, tone: 'auditor' },
                    { label: 'Completed', val: '14', icon: CheckIcon, tone: 'auditor' }
                  ].map((s, i) => (
                    <Card key={i} className="p-6 border-[#E3EAF2] flex justify-between items-center"><div><p className="text-xs font-bold uppercase text-[#5A6B80]">{s.label}</p><h3 className="text-3xl font-bold mt-1 text-[#E0762B]">{s.val}</h3></div><div className="w-10 h-10 bg-[#FDF0E3] text-[#E0762B] rounded-lg flex items-center justify-center"><s.icon size={20} /></div></Card>
                  ))}
                </div>
              </div>
            )}
            {tab === 'count_sheet' && (
              <div className="space-y-6">
                <Card className="p-6 border-[#E3EAF2] bg-white sticky top-0 z-30 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center"><div><h2 className="text-xl font-bold">AUD-002 &middot; XYZ Retail (MUM-01)</h2><p className="text-xs text-[#5A6B80]">High-density verify view. Variances beyond {VARIANCE_TOLERANCE_PERCENT}% are flagged.</p></div><div className="text-right"><span className="text-xs font-bold text-[#5A6B80] uppercase block">Counted</span><span className="text-2xl font-bold tabular-nums">{countedLinesCount} / {liveCountLines.length}</span></div></div>
                  <Progress value={(countedLinesCount / liveCountLines.length) * 100} className="h-2" />
                </Card>
                <Card className="border-[#E3EAF2] overflow-hidden bg-white">
                  <Table>
                    <TableHeader className="bg-slate-50"><TableRow><TableHead>SKU ID</TableHead><TableHead>Description</TableHead><TableHead className="text-right">System Book</TableHead><TableHead className="text-center w-[160px]">Physical Count</TableHead><TableHead className="text-right">Variance</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {liveCountLines.map((line) => (
                        <TableRow key={line.sku} className={cn("h-16", line.isFlagged ? "bg-red-50 hover:bg-red-100" : "hover:bg-slate-50")}>
                          <TableCell className="font-mono text-xs font-bold">{line.sku}</TableCell>
                          <TableCell><div className="font-semibold text-sm">{line.itemName}</div><Badge variant="outline" className="text-[9px] uppercase font-bold text-[#5A6B80]">{line.zone}</Badge></TableCell>
                          <TableCell className="text-right font-bold text-sm">{line.systemQty}</TableCell>
                          <TableCell className="p-2"><Input type="number" placeholder="0" value={line.countedQty ?? ''} onChange={(e) => handleUpdateCount(line.sku, e.target.value)} className="h-10 text-center font-bold text-lg focus:border-[#E0762B] focus:ring-0" /></TableCell>
                          <TableCell className={cn("text-right font-bold text-base", line.isFlagged ? "text-red-600" : line.variance !== null ? "text-green-600" : "text-slate-300")}>{line.variance !== null ? (line.variance > 0 ? `+${line.variance}` : line.variance) : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
                <div className="flex justify-end pt-8"><Button className="bg-[#16202E] text-white px-8 h-12 font-bold uppercase text-xs" onClick={() => { toast.success("Count submitted!"); setTab('dashboard'); }}>Finish Shift</Button></div>
              </div>
            )}
            {/* Auditor sub-pages fallback logic */}
            {['my_audits', 'today', 'discrepancies', 'completed'].includes(tab) && (
              <div className="text-left py-20 text-[#5A6B80]"><h3 className="text-xl font-bold mb-2">Auditor Workspace Segment: {tab.replace('_', ' ')}</h3><p>Assignment view details are synchronized with master floor records.</p></div>
            )}
          </motion.div>
        )}

        {role === 'admin' && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 text-left">
            {tab === 'dashboard' && (
              <div className="space-y-8">
                <header><h2 className="text-3xl font-headline font-bold">Admin Control Hub</h2><p className="text-[#5A6B80]">Global operational overview and request management.</p></header>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Clients', val: '12', icon: Users, color: 'text-[#6D4BC6]', bg: 'bg-[#F0EBFB]' },
                    { label: 'Pending Requests', val: '03', icon: FilePlus, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Live Audits', val: '04', icon: Activity, color: 'text-[#6D4BC6]', bg: 'bg-[#F0EBFB]' },
                    { label: 'Global Accuracy', val: '99.2%', icon: CheckIcon, color: 'text-green-600', bg: 'bg-green-50' }
                  ].map((s, i) => (
                    <Card key={i} className="p-6 border-[#E3EAF2] flex justify-between items-center"><div><p className="text-xs font-bold uppercase text-[#5A6B80]">{s.label}</p><h3 className="text-3xl font-bold mt-1">{s.val}</h3></div><div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg, s.color)}><s.icon size={20} /></div></Card>
                  ))}
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b font-bold text-xs text-[#5A6B80] uppercase">Audit Request Queue</div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Account</TableHead><TableHead>Site</TableHead><TableHead>Target Date</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {activeRequests.map(req => (
                        <TableRow key={req.id}><TableCell className="font-bold">{req.clientName}</TableCell><TableCell className="text-sm">{req.warehouseName}</TableCell><TableCell className="text-xs font-mono">{req.preferredDate}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" className="h-8 text-[10px] font-bold">Decline</Button><Button size="sm" className="bg-[#2B7CE9] text-white h-8 text-[10px] font-bold uppercase">Approve</Button></div></TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
            {/* Admin sub-pages fallback logic */}
            {['clients', 'warehouses', 'auditors', 'requests', 'inventory', 'settings'].includes(tab) && (
              <div className="text-left py-20 text-[#5A6B80]"><h3 className="text-xl font-bold mb-2">Global Operations Control: {tab.replace('_', ' ')}</h3><p>Master record management for {tab} is established for regional oversight.</p></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PortalShell>
  );
}
