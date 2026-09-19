'use client';

import React, { useState, useEffect } from 'react';
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
import { cn, formatCurrency, formatNumber, initials, variancePercent } from '@/lib/utils';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    admin: 'InvTrack Operations'
  };

  const roleColors = {
    marketing: 'text-[#2B7CE9]',
    client: 'text-[#12855A]',
    auditor: 'text-[#E0762B]',
    admin: 'text-[#6D4BC6]'
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

  const handleSignOut = () => {
    toast.success('Signed out securely');
    onRoleChange('marketing');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#163E77] text-[#CBD9EC]">
      <div className="p-4 border-b border-white/10 mb-4">
        <div className="flex items-center gap-3 px-2">
          <Logo className="brightness-0 invert scale-90 origin-left" />
          {openSidebar && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#8FB4E8] tracking-widest uppercase">
                {roleLabels[currentRole as keyof typeof roleLabels]}
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {currentMenu.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setOpenMobile(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 h-10 text-[14px] font-medium rounded-md transition-all text-left group",
                isActive 
                  ? "bg-white/10 text-white shadow-sm border-l-2 border-[#2B7CE9]" 
                  : "hover:bg-white/5 hover:text-white text-[#CBD9EC]/70"
              )}
            >
              <div className="flex items-center justify-center w-5">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              {openSidebar && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        {openSidebar && (
          <div className="bg-black/20 rounded-md p-3 mb-2">
            <p className="text-[12px] font-semibold text-white">{userNames[currentRole as keyof typeof userNames]}</p>
            <p className="text-[10px] truncate text-white/50 uppercase tracking-tight">{userCompanies[currentRole as keyof typeof userCompanies]}</p>
          </div>
        )}
        <button
          onClick={() => setOpenSidebar(!openSidebar)}
          className="w-full flex items-center gap-3 px-3 py-2 text-[14px] font-medium text-white/40 hover:text-white transition-colors"
        >
          <ChevronsRight size={18} className={cn("transition-transform", openSidebar && "rotate-180")} />
          {openSidebar && <span>Collapse Sidebar</span>}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-[14px] font-medium text-white/40 hover:text-white transition-colors"
        >
          <LogOut size={18} strokeWidth={1.75} />
          {openSidebar && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-body">
      {/* Demo Ribbon */}
      <div className="bg-slate-900 text-white text-[11px] px-4 py-1.5 flex items-center justify-between shrink-0 font-sans z-50">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-wider text-[#2B7CE9]">DEMO MODE:</span>
          <span className="text-slate-400">Select a workspace to preview:</span>
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
          <aside 
            className={cn(
              "hidden lg:flex flex-col border-r border-[#E3EAF2] bg-[#163E77] transition-all duration-300 ease-in-out z-40",
              openSidebar ? "w-[256px]" : "w-[64px]"
            )}
          >
            <SidebarContent />
          </aside>
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {currentRole === 'marketing' ? (
            <header className="h-16 sticky top-0 bg-white border-b border-[#E3EAF2] z-40 px-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-10">
                <Logo />
                <nav className="hidden lg:flex items-center gap-6">
                  {['Home', 'About', 'Services', 'How it works', 'Industries', 'Contact'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => onTabChange(t.toLowerCase().replace(/ /g, '_'))} 
                      className={cn("text-[14px] font-medium transition-colors", activeTab === t.toLowerCase().replace(/ /g, '_') ? "text-[#2B7CE9]" : "text-[#5A6B80] hover:text-[#16202E]")}
                    >
                      {t}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => onRoleChange('client')} className="text-[14px] font-medium text-[#5A6B80]">Log in</Button>
                <Button onClick={() => onTabChange('request_audit')} className="bg-[#2B7CE9] text-white hover:bg-[#1D6FE0] rounded-md text-[14px] font-medium">Request an audit</Button>
              </div>
            </header>
          ) : (
            <header className="h-16 sticky top-0 bg-white border-b border-[#E3EAF2] z-30 px-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10">
                      <Menu size={20} strokeWidth={1.75} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[256px] border-none bg-[#163E77]">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
                <div>
                  <h4 className="text-[14px] font-semibold text-[#16202E]">Welcome, {userNames[currentRole as keyof typeof userNames]}</h4>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", roleColors[currentRole as keyof typeof roleColors])}>
                    {userCompanies[currentRole as keyof typeof userCompanies]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-[#8494A8] hover:text-[#16202E] relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-[#8494A8] hover:text-[#16202E]">
                    <Settings size={20} />
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-[#EEF5FF] p-0 focus-visible:ring-offset-2 overflow-hidden border border-[#D9E9FF]">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-[12px] font-bold text-[#2B7CE9]">
                          {initials(userNames[currentRole as keyof typeof userNames])}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white rounded-md shadow-lg border border-[#E3EAF2]">
                    <DropdownMenuLabel className="font-headline text-[13px] text-[#16202E]">Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-[14px] text-[#5A6B80]">Settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-[14px] text-[#5A6B80]">Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-[14px] text-rose-600 font-medium">Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
          )}

          <main className="flex-1 overflow-y-auto bg-[#F7F9FC]">
            <div className="max-w-[1320px] mx-auto p-6 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// --- UTILITY COMPONENTS ---
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

// --- MAIN APP COMPONENT ---
export default function InvTrackMainApp() {
  const [role, setRole] = useState<'marketing' | 'client' | 'auditor' | 'admin'>('marketing');
  const [tab, setTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveCountLines, setLiveCountLines] = useState(countLinesForAud002);
  const [activeRequests, setActiveRequests] = useState(auditRequests);

  // Marketing Lead Form
  const { register: regLead, handleSubmit: handleLeadSubmit, formState: { errors: leadErrors }, reset: resetLead } = useForm({
    resolver: zodResolver(LeadFormSchema),
    defaultValues: { warehousesCount: 1 }
  });

  const onLeadSubmit = (data: any) => {
    toast.success("Request sent. We will reply within one working day.");
    resetLead();
    setTab('home');
  };

  // Client Audit Form
  const { register: regAudit, handleSubmit: handleAuditSubmit, formState: { errors: auditErrors }, reset: resetAudit } = useForm({
    resolver: zodResolver(CreateAuditSchema)
  });

  const onAuditRequest = (data: any) => {
    toast.success(`Audit request created: REQ-00${activeRequests.length + 1}`);
    setActiveRequests(prev => [
      { 
        id: `REQ-00${prev.length + 1}`, 
        clientName: 'ABC Enterprises', 
        warehouseName: warehouses.find(w => w.id === data.warehouseId)?.name || '',
        city: warehouses.find(w => w.id === data.warehouseId)?.city || '',
        type: data.type as any,
        preferredDate: data.preferredDate,
        status: 'pending',
        notes: data.notes
      },
      ...prev
    ]);
    resetAudit();
    setTab('my_audits');
  };

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
    <PortalShell 
      currentRole={role} 
      onRoleChange={(r) => {
        setRole(r);
        setTab(r === 'marketing' ? 'home' : 'dashboard');
      }} 
      activeTab={tab} 
      onTabChange={(t) => setTab(t)}
    >
      <AnimatePresence mode="wait">
        {role === 'marketing' && (
          <motion.div key="marketing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16 pb-16">
            {tab === 'home' && (
              <div className="space-y-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 items-center">
                  <div className="space-y-8 text-left">
                    <div className="space-y-2">
                      <span className="text-[#2B7CE9] text-[13px] font-bold tracking-widest uppercase block">From stock to clarity</span>
                      <h1 className="text-[48px] md:text-[56px] font-headline font-bold text-[#16202E] leading-[1.1] tracking-tight">
                        Accurate inventory audits for a stronger tomorrow
                      </h1>
                    </div>
                    <p className="text-[#5A6B80] text-lg leading-relaxed max-w-[540px]">
                      InvTrack replaces chaotic spreadsheets with physical verify cycles. Freeze quantities, track variances live, and produce reconciled reports instantly.
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                      <Button onClick={() => setTab('request_audit')} className="bg-[#2B7CE9] text-white hover:bg-[#1D6FE0] px-8 h-12 rounded-lg font-semibold shadow-sm">
                        Request an audit
                      </Button>
                      <Button variant="outline" onClick={() => setTab('how_it_works')} className="border-[#E3EAF2] h-12 px-8 rounded-lg font-semibold bg-white">
                        See how it works
                      </Button>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 pointer-events-none hidden lg:block z-20">
                      <FloatingDataDecoration />
                    </div>
                    <div className="grid grid-cols-2 gap-5 relative z-10 w-full max-w-[520px]">
                      {[
                        { val: '99.2%', label: 'Average accuracy' },
                        { val: '6 hrs', label: 'Turnaround' },
                        { val: '1,842', label: 'Daily SKU count' },
                        { val: '4 Roles', label: 'One platform' }
                      ].map((item, i) => (
                        <div key={i} className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-card text-left transition-transform hover:-translate-y-1">
                          <div className="text-4xl font-headline font-bold text-[#16202E] mb-2 tabular-nums">{item.val}</div>
                          <div className="text-[13px] text-[#5A6B80] leading-normal font-medium">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8 text-left pt-8">
                  <h2 className="text-2xl font-headline font-bold text-[#16202E]">Operational Workspaces</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm hover:border-[#12855A]/30 transition-all cursor-pointer group" onClick={() => { setRole('client'); setTab('dashboard'); }}>
                      <div className="w-10 h-10 rounded-lg bg-[#E8F6EF] text-[#12855A] flex items-center justify-center mb-4"><WarehouseIcon size={20} /></div>
                      <h3 className="font-headline font-bold text-[#16202E] mb-2 text-[15px]">Client Desk</h3>
                      <p className="text-xs text-[#5A6B80] leading-relaxed mb-4">Track site accuracy, verify missing quantities, and approve books.</p>
                      <div className="text-xs font-bold text-[#12855A] group-hover:underline">Open client platform</div>
                    </div>
                    <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm hover:border-[#E0762B]/30 transition-all cursor-pointer group" onClick={() => { setRole('auditor'); setTab('dashboard'); }}>
                      <div className="w-10 h-10 rounded-lg bg-[#FDF0E3] text-[#E0762B] flex items-center justify-center mb-4"><UserCheck size={20} /></div>
                      <h3 className="font-headline font-bold text-[#16202E] mb-2 text-[15px]">Auditor Tablet</h3>
                      <p className="text-xs text-[#5A6B80] leading-relaxed mb-4">Optimized for floor work. High-density grids and camera verification.</p>
                      <div className="text-xs font-bold text-[#E0762B] group-hover:underline">Open auditor tablet</div>
                    </div>
                    <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm hover:border-[#6D4BC6]/30 transition-all cursor-pointer group" onClick={() => { setRole('admin'); setTab('dashboard'); }}>
                      <div className="w-10 h-10 rounded-lg bg-[#F0EBFB] text-[#6D4BC6] flex items-center justify-center mb-4"><Sliders size={20} /></div>
                      <h3 className="font-headline font-bold text-[#16202E] mb-2 text-[15px]">Admin Control</h3>
                      <p className="text-xs text-[#5A6B80] leading-relaxed mb-4">Approve scheduled audits, deploy auditors, and analyze data charts.</p>
                      <div className="text-xs font-bold text-[#6D4BC6] group-hover:underline">Open admin panel</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'how_it_works' && (
              <div className="space-y-16 py-12">
                <div className="max-w-[800px] mx-auto text-center space-y-4">
                  <h2 className="text-4xl font-headline font-bold text-[#16202E]">The 5-Stage Audit Lifecycle</h2>
                  <p className="text-[#5A6B80] text-lg">Replacing chaotic spreadsheets with a single secure ledger of truth.</p>
                </div>
                <HowItWorks features={[
                  { title: "Request the Audit", description: "Clients initiate a count sequence by selecting a warehouse site and audit type.", colorTheme: "blue" },
                  { title: "Admin Approval", description: "InvTrack operators verify details, freeze system quantities, and assign a field agent.", colorTheme: "purple" },
                  { title: "On-Site Counting", description: "Auditors use tablet-optimized count sheets to verify physical stock against book records.", colorTheme: "orange" },
                  { title: "Reconciliation", description: "Every variance is automatically flagged and routed to management for immediate review.", colorTheme: "blue" },
                  { title: "Final Sign-off", description: "A secure report is generated and signed off, updating the master inventory record.", colorTheme: "blue" }
                ]} />
              </div>
            )}

            {tab === 'request_audit' && (
              <div className="max-w-[640px] mx-auto py-12">
                <div className="space-y-4 mb-10">
                  <h2 className="text-3xl font-headline font-bold text-[#16202E]">Initiate your first count</h2>
                  <p className="text-[#5A6B80]">Fill in your warehouse details and our operations team will contact you within 24 hours.</p>
                </div>
                <Card className="border-[#E3EAF2] bg-white p-8 shadow-premium">
                  <form onSubmit={handleLeadSubmit(onLeadSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A6B80]">Company Name</label>
                        <Input placeholder="e.g. ABC Enterprises" {...regLead('company')} />
                        {leadErrors.company && <p className="text-[10px] text-red-500">{leadErrors.company.message as string}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A6B80]">Your Name</label>
                        <Input placeholder="e.g. Ravi Teja" {...regLead('name')} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A6B80]">Work Email</label>
                        <Input type="email" placeholder="ravi.teja@abcent.in" {...regLead('email')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A6B80]">Phone Number</label>
                        <Input placeholder="+91 98765 43210" {...regLead('phone')} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A6B80]">City</label>
                        <Input placeholder="Hyderabad" {...regLead('city')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A6B80]">Warehouses to count</label>
                        <Input type="number" {...regLead('warehousesCount', { valueAsNumber: true })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#5A6B80]">Additional Notes</label>
                      <Textarea placeholder="Stock value, SKU count, or deadline details..." {...regLead('notes')} />
                    </div>
                    <Button type="submit" className="w-full bg-[#2B7CE9] h-12 font-bold uppercase tracking-widest rounded-lg">Send Request</Button>
                  </form>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {role === 'client' && (
          <motion.div key="client" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 text-left">
            {tab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-[30px] font-headline font-bold text-[#16202E]">Dashboard</h2>
                    <p className="text-[14px] text-[#5A6B80]">Where every warehouse stands and what needs a decision.</p>
                  </div>
                  <Button onClick={() => setTab('create_audit')} className="bg-[#2B7CE9] text-white">Request Audit</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Warehouses', val: '03', icon: WarehouseIcon },
                    { label: 'Total Audits', val: '05', icon: ClipboardList },
                    { label: 'In Progress', val: '02', icon: Activity },
                    { label: 'Completed', val: '03', icon: FileText }
                  ].map((s, i) => (
                    <Card key={i} className="border-[#E3EAF2] p-5 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm text-[#5A6B80] font-medium">{s.label}</p>
                          <h3 className="font-headline text-3xl font-bold tabular-nums">{s.val}</h3>
                        </div>
                        <div className="w-10 h-10 bg-[#E8F6EF] text-[#12855A] rounded-lg flex items-center justify-center"><s.icon size={20} /></div>
                      </div>
                    </Card>
                  ))}
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5A6B80]">Recent Audits</span>
                    <Button variant="ghost" size="sm" className="text-[#2B7CE9] font-bold" onClick={() => setTab('my_audits')}>View all</Button>
                  </div>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {audits.filter(a => a.clientId === 'cl_abc').slice(0, 3).map(a => (
                        <TableRow key={a.id}>
                          <TableCell className="font-bold">{a.reference}</TableCell>
                          <TableCell>{warehouses.find(w => w.id === a.warehouseId)?.name}</TableCell>
                          <TableCell className="capitalize">{a.type}</TableCell>
                          <TableCell><AuditStatusBadge status={a.status} /></TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => setTab(`audit_detail_${a.id}`)}>View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
            {/* Additional Client screens: warehouses, inventory, create_audit, my_audits, discrepancies, reports... */}
          </motion.div>
        )}

        {role === 'auditor' && (
          <motion.div key="auditor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 text-left">
            {(tab === 'dashboard' || tab === 'my_audits') && (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Field Operations</h2>
                    <p className="text-sm text-[#5A6B80]">Your active and upcoming physical verify assignments.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Scheduled', val: '02', icon: Clock, color: 'text-[#E0762B]', bg: 'bg-[#FDF0E3]' },
                    { label: 'In Progress', val: '01', icon: Activity, color: 'text-[#E0762B]', bg: 'bg-[#FDF0E3]' },
                    { label: 'Completed', val: '12', icon: CheckIcon, color: 'text-[#12855A]', bg: 'bg-[#E8F6EF]' }
                  ].map((s, i) => (
                    <Card key={i} className="border-[#E3EAF2] p-6 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#5A6B80] uppercase tracking-wider">{s.label}</p>
                        <h3 className={cn("text-3xl font-headline font-bold mt-1 tabular-nums", s.color)}>{s.val}</h3>
                      </div>
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg, s.color)}><s.icon size={20} /></div>
                    </Card>
                  ))}
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b font-bold text-xs uppercase tracking-wider text-[#5A6B80]">Assigned Audit Ledger</div>
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead>Audit Code</TableHead>
                        <TableHead>Client & Site</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audits.filter(a => a.auditorId === 'aud_naveen').map(a => (
                        <TableRow key={a.id} className="h-16">
                          <TableCell className="font-mono text-xs font-bold">{a.reference}</TableCell>
                          <TableCell>
                            <div className="font-bold text-sm">{clients.find(c => c.id === a.clientId)?.name}</div>
                            <div className="text-xs text-[#5A6B80]">{warehouses.find(w => w.id === a.warehouseId)?.name}</div>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{a.scheduledDate}</TableCell>
                          <TableCell><AuditStatusBadge status={a.status} /></TableCell>
                          <TableCell className="text-right">
                            {a.status === 'in_progress' ? (
                              <Button size="sm" onClick={() => setTab('count_sheet')} className="bg-[#E0762B] text-white hover:bg-[#c66220] h-9 px-4 font-bold">Continue</Button>
                            ) : a.status === 'approved' ? (
                              <Button size="sm" onClick={() => setTab('count_sheet')} className="bg-[#E0762B] text-white hover:bg-[#c66220] h-9 px-4 font-bold">Start Count</Button>
                            ) : (
                              <Button variant="outline" size="sm" className="h-9 px-4 font-bold border-slate-200" onClick={() => setTab(`auditor_view_${a.id}`)}>View Log</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {tab === 'today' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Current Shift</h2>
                    <p className="text-sm text-[#5A6B80]">Field assignments active for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { ref: 'AUD-002', client: 'XYZ Retail', site: 'Bhiwandi Hub, Mumbai', lines: '820 lines expected', date: '22 Sep 2025', status: 'in_progress', action: 'Continue' },
                    { ref: 'AUD-004', client: 'ABC Enterprises', site: 'Medchal DC, Hyderabad', lines: '640 lines expected', date: '24 Sep 2025', status: 'approved', action: 'Start audit' }
                  ].map((a, i) => (
                    <Card key={i} className="p-6 border-[#E3EAF2] hover:border-[#E0762B]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-headline font-bold text-[#16202E]">{a.ref}</h3>
                          <AuditStatusBadge status={a.status} />
                        </div>
                        <p className="text-sm font-semibold text-[#5A6B80]">{a.client} &middot; {a.site}</p>
                        <p className="text-xs text-[#8494A8]">{a.lines} &middot; Scheduled {a.date}</p>
                      </div>
                      <Button className="bg-[#E0762B] text-white hover:bg-[#c66220] h-12 px-8 font-bold uppercase tracking-wider text-xs" onClick={() => setTab('count_sheet')}>
                        {a.action}
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {tab === 'count_sheet' && (
              <div className="space-y-6">
                <div className="sticky top-0 bg-[#F7F9FC] z-30 pb-4 pt-1">
                  <Card className="border-[#E3EAF2] bg-white shadow-premium p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-headline font-bold text-xl text-[#16202E]">AUD-002 &middot; XYZ Retail (MUM-01)</h2>
                        <p className="text-xs text-[#5A6B80]">Tablet sheet view: Variances beyond 2% trigger high-visibility alerts.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#5A6B80] uppercase tracking-wide block">Lines Counted</span>
                        <span className="text-2xl font-bold font-mono text-[#16202E] tabular-nums">{countedLinesCount} / {liveCountLines.length}</span>
                      </div>
                    </div>
                    <Progress value={(countedLinesCount / liveCountLines.length) * 100} className="h-3 bg-slate-100 rounded-full" />
                  </Card>
                </div>

                <Card className="border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[120px] text-[11px] uppercase font-bold">SKU ID</TableHead>
                        <TableHead className="text-[11px] uppercase font-bold">Description / Zone</TableHead>
                        <TableHead className="text-right w-[110px] text-[11px] uppercase font-bold">System Book</TableHead>
                        <TableHead className="text-center w-[160px] text-[11px] uppercase font-bold">Physical Count</TableHead>
                        <TableHead className="text-right w-[100px] text-[11px] uppercase font-bold">Live Var.</TableHead>
                        <TableHead className="text-right w-[120px] text-[11px] uppercase font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {liveCountLines.map((line) => (
                        <TableRow key={line.sku} className={cn(
                          "h-16 transition-colors",
                          line.isFlagged ? "bg-[#FEF2F2] hover:bg-[#FEE2E2]" : "hover:bg-slate-50/60"
                        )}>
                          <TableCell className="font-mono text-xs font-bold">{line.sku}</TableCell>
                          <TableCell>
                            <div className="font-semibold text-sm">{line.itemName}</div>
                            <div className="mt-0.5"><Badge variant="outline" className="text-[9px] uppercase font-bold bg-white text-[#5A6B80]">{line.zone}</Badge></div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-sm tabular-nums">{line.systemQty}</TableCell>
                          <TableCell className="p-2">
                            <Input 
                              type="number"
                              inputMode="numeric"
                              placeholder="0"
                              value={line.countedQty ?? ''}
                              onChange={(e) => handleUpdateCount(line.sku, e.target.value)}
                              className="h-11 font-bold text-center text-lg bg-white border-2 border-slate-300 rounded-md focus:border-[#E0762B] focus:ring-0 text-[#16202E] tabular-nums"
                            />
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-mono font-bold text-base tabular-nums",
                            line.isFlagged ? "text-[#C0362C]" : line.variance !== null ? "text-[#12855A]" : "text-[#8494A8]"
                          )}>
                            {line.variance !== null ? (line.variance > 0 ? `+${line.variance}` : line.variance) : "-"}
                          </TableCell>
                          <TableCell className="text-right p-2">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => toast.success(`Camera active for SKU ${line.sku}`)} className="h-10 w-10 text-slate-400 hover:text-[#E0762B]"><Camera size={18} /></Button>
                              <Button onClick={() => toast.success(`Saved SKU ${line.sku}`)} className="bg-[#E0762B] text-white hover:bg-[#c66220] h-10 px-3 font-bold uppercase text-[10px]">Save</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>

                <div className="flex justify-between items-center pt-8 border-t border-[#E3EAF2]">
                  <Button variant="outline" className="border-slate-300 font-bold" onClick={() => setTab('dashboard')}>Cancel Shift</Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#16202E] text-white hover:bg-slate-800 px-8 h-12 font-bold uppercase text-xs tracking-widest">Finish and Submit Count</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Confirm Audit Completion</DialogTitle>
                        <DialogDescription>
                          You have counted {countedLinesCount} of {liveCountLines.length} lines. {liveCountLines.filter(l => l.isFlagged).length} variances were flagged.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => toast.info("Submission cancelled")}>Go Back</Button>
                        <Button className="bg-[#12855A] text-white" onClick={() => { toast.success("Audit submitted for reconciliation"); setTab('dashboard'); }}>Confirm Submission</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}

            {tab === 'discrepancies' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Flagged Variances</h2>
                    <p className="text-sm text-[#5A6B80]">Discrepancies identified during your physical verify shifts.</p>
                  </div>
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Item & SKU</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Severity</TableHead>
                        <TableHead className="text-right">Variance</TableHead>
                        <TableHead>Raised Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discrepancies.map(d => (
                        <TableRow key={d.id} className="h-16">
                          <TableCell>
                            <div className="font-bold text-sm">{d.itemName}</div>
                            <div className="text-[10px] text-[#8494A8] font-mono font-bold">{d.sku}</div>
                          </TableCell>
                          <TableCell className="text-xs font-semibold">ABC Enterprises</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] bg-slate-50 capitalize">{d.type}</Badge></TableCell>
                          <TableCell className="text-center"><SeverityBadge severity={d.severity} /></TableCell>
                          <TableCell className="text-right font-bold tabular-nums text-red-600">{d.variance}</TableCell>
                          <TableCell className="text-xs text-[#5A6B80]">{d.raisedDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {tab === 'completed' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Completed Logs</h2>
                    <p className="text-sm text-[#5A6B80]">History of counts finalized and submitted to clients.</p>
                  </div>
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Completed Date</TableHead>
                        <TableHead className="text-right">Verified Accuracy</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audits.filter(a => a.status === 'completed').map(a => (
                        <TableRow key={a.id} className="h-16">
                          <TableCell className="font-bold">{a.reference}</TableCell>
                          <TableCell>
                            <div className="font-bold text-sm">{warehouses.find(w => w.id === a.warehouseId)?.name}</div>
                            <div className="text-xs text-[#5A6B80]">{warehouses.find(w => w.id === a.warehouseId)?.city}</div>
                          </TableCell>
                          <TableCell className="capitalize">{a.type}</TableCell>
                          <TableCell className="text-xs text-[#5A6B80]">20 Sep 2025</TableCell>
                          <TableCell className="text-right font-bold tabular-nums text-[#12855A]">{a.accuracy}%</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="h-8 font-bold border-slate-200">View Report</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {role === 'admin' && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 text-left">
            {tab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Operations Control</h2>
                    <p className="text-sm text-[#5A6B80]">Manage requests, auditors, and system-wide inventory accuracy.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Clients', val: '12', icon: Users, tone: 'admin' },
                    { label: 'Sites Onboarded', val: '08', icon: Building2, tone: 'admin' },
                    { label: 'Field Agents', val: '15', icon: UserCheck, tone: 'admin' },
                    { label: 'Total Audits', val: '28', icon: ClipboardList, tone: 'admin' }
                  ].map((s, i) => (
                    <Card key={i} className="border-[#E3EAF2] p-5 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm text-[#5A6B80] font-medium">{s.label}</p>
                          <h3 className="font-headline text-3xl font-bold tabular-nums text-[#16202E]">{s.val}</h3>
                        </div>
                        <div className="w-10 h-10 bg-[#F0EBFB] text-[#6D4BC6] rounded-lg flex items-center justify-center"><s.icon size={20} /></div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 space-y-6">
                    <Card className="border-[#E3EAF2] overflow-hidden shadow-sm">
                      <div className="p-4 bg-slate-50 border-b font-bold text-xs uppercase tracking-wider text-[#5A6B80]">Audit Request Queue</div>
                      <Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow>
                            <TableHead>Account</TableHead>
                            <TableHead>Site</TableHead>
                            <TableHead>Target Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeRequests.map(req => (
                            <TableRow key={req.id} className="h-14">
                              <TableCell className="font-bold text-sm">{req.clientName}</TableCell>
                              <TableCell className="text-xs">
                                <span className="font-medium">{req.warehouseName}</span>
                                <span className="text-[#8494A8] ml-1">({req.city})</span>
                              </TableCell>
                              <TableCell className="text-xs font-mono">{req.preferredDate}</TableCell>
                              <TableCell>
                                <Badge className={cn(
                                  "rounded-full font-medium border-none text-[10px] px-2 py-0.5 uppercase",
                                  req.status === 'approved' ? "bg-[#E8F6EF] text-[#12855A]" : "bg-[#FFF8E6] text-[#B5730F]"
                                )}>{req.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {req.status === 'pending' && (
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold border-slate-200" onClick={() => { toast.error("Request declined"); setActiveRequests(prev => prev.filter(r => r.id !== req.id)); }}>Decline</Button>
                                    <Button size="sm" className="bg-[#2B7CE9] text-white hover:bg-[#1656B4] h-8 text-[10px] font-bold uppercase" onClick={() => { toast.success("Audit scheduled successfully"); setActiveRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r)); }}>Approve</Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                  <div className="space-y-6">
                    <Card className="border-[#E3EAF2] p-6 shadow-sm bg-white">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#5A6B80] mb-4">System Accuracy Trend</h3>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={accuracyTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF2" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <YAxis hide domain={[94, 100]} />
                            <Area type="monotone" dataKey="accuracy" stroke="#2B7CE9" fill="#EEF5FF" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs text-[#5A6B80]">Last check: Today, 10:45 AM</span>
                        <span className="text-sm font-bold text-[#12855A]">99.2% Global</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {tab === 'clients' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Client Accounts</h2>
                    <p className="text-sm text-[#5A6B80]">Organizations using InvTrack for physical inventory management.</p>
                  </div>
                  <Button className="bg-[#2B7CE9] text-white"><Plus size={16} className="mr-2" /> Add Client</Button>
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b">
                    <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8494A8]" size={16} /><Input placeholder="Search accounts..." className="pl-9 h-10 bg-white" /></div>
                  </div>
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Primary Contact</TableHead>
                        <TableHead className="text-right">Sites</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map(c => (
                        <TableRow key={c.id} className="h-16">
                          <TableCell className="font-bold text-sm">{c.name}</TableCell>
                          <TableCell className="text-xs font-medium text-[#5A6B80]">{c.industry}</TableCell>
                          <TableCell className="text-xs">{c.city}</TableCell>
                          <TableCell>
                            <div className="font-bold text-xs">{c.contactName}</div>
                            <div className="text-[10px] text-[#8494A8]">{c.contactEmail}</div>
                          </TableCell>
                          <TableCell className="text-right font-bold tabular-nums">{c.warehouseCount}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "rounded-full text-[10px] px-2 py-0.5 uppercase",
                              c.status === 'active' ? "bg-[#E8F6EF] text-[#12855A]" : "bg-[#FFF8E6] text-[#B5730F]"
                            )}>{c.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs text-[#5A6B80]">{c.onboardedDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {tab === 'warehouses' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Global Site Register</h2>
                    <p className="text-sm text-[#5A6B80]">Master list of every facility registered in the system.</p>
                  </div>
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Facility & Address</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="text-right">SKUs</TableHead>
                        <TableHead>Zones</TableHead>
                        <TableHead>Last Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {warehouses.map(w => (
                        <TableRow key={w.id} className="h-16">
                          <TableCell>
                            <div className="font-bold text-sm">{w.name}</div>
                            <div className="text-[10px] text-[#8494A8]">{w.address}</div>
                          </TableCell>
                          <TableCell className="text-xs font-semibold">{clients.find(c => c.id === w.clientId)?.name}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] font-mono bg-white">{w.code}</Badge></TableCell>
                          <TableCell className="text-right font-bold tabular-nums">{formatNumber(w.skuCount)}</TableCell>
                          <TableCell className="text-xs">{w.zones} Zones</TableCell>
                          <TableCell className="text-xs">
                            {w.lastAuditedDate ? (
                              <span className="text-[#12855A] font-medium">{w.lastAuditedDate}</span>
                            ) : (
                              <span className="text-[#E0762B] font-bold italic">Never counted</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {tab === 'auditors' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Field Agents</h2>
                    <p className="text-sm text-[#5A6B80]">Certified physical auditors assigned to inventory counts.</p>
                  </div>
                  <Button className="bg-[#2B7CE9] text-white"><UserPlus size={16} className="mr-2" /> Invite Agent</Button>
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditors.map(a => (
                        <TableRow key={a.id} className="h-16">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px] font-bold text-[#6D4BC6] bg-[#F0EBFB]">{initials(a.name)}</AvatarFallback></Avatar>
                              <div>
                                <div className="font-bold text-sm">{a.name}</div>
                                <div className="text-[10px] text-[#8494A8]">{a.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{a.phone}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "rounded-full text-[10px] px-2 py-0.5 uppercase",
                              a.status === 'active' ? "bg-[#E8F6EF] text-[#12855A]" : "bg-[#EEF5FF] text-[#2B7CE9]"
                            )}>{a.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-[#5A6B80]">{a.joinedDate}</TableCell>
                          <TableCell className="text-xs text-[#5A6B80]">{a.lastActiveDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-slate-200">Assign Audit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {tab === 'requests' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Audit Requests</h2>
                    <p className="text-sm text-[#5A6B80]">Historical and active requests from client portals.</p>
                  </div>
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Preferred Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeRequests.map(r => (
                        <TableRow key={r.id} className="h-16">
                          <TableCell className="font-mono text-xs font-bold">{r.id}</TableCell>
                          <TableCell className="font-bold text-sm">{r.clientName}</TableCell>
                          <TableCell className="text-xs">{r.warehouseName} &middot; {r.city}</TableCell>
                          <TableCell className="capitalize text-xs">{r.type}</TableCell>
                          <TableCell className="text-xs font-mono">{r.preferredDate}</TableCell>
                          <TableCell><Badge className={cn(
                            "rounded-full text-[10px] px-2 py-0.5 uppercase",
                            r.status === 'approved' ? "bg-[#E8F6EF] text-[#12855A]" : "bg-[#FFF8E6] text-[#B5730F]"
                          )}>{r.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            {r.status === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold border-slate-200">Decline</Button>
                                <Button size="sm" className="bg-[#2B7CE9] text-white hover:bg-[#1656B4] h-8 text-[10px] font-bold uppercase">Approve</Button>
                              </div>
                            ) : <span className="text-[10px] font-bold text-[#8494A8] uppercase">Processed</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {tab === 'inventory' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Master Ledger</h2>
                    <p className="text-sm text-[#5A6B80]">Global inventory records across all client facilities.</p>
                  </div>
                  <Button variant="outline" className="border-slate-200 h-10 px-4"><Download size={16} className="mr-2" /> Export Global CSV</Button>
                </div>
                <Card className="border-[#E3EAF2] overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b flex items-center gap-4">
                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8494A8]" size={16} /><Input placeholder="Search by SKU, Client, or Product..." className="pl-9 h-10 bg-white" /></div>
                  </div>
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>SKU ID</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Book Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems.map(item => (
                        <TableRow key={item.sku} className="h-16">
                          <TableCell className="font-mono text-[11px] font-bold">{item.sku}</TableCell>
                          <TableCell className="text-xs font-semibold">ABC Enterprises</TableCell>
                          <TableCell className="font-medium text-sm">{item.name}</TableCell>
                          <TableCell className="text-xs">{warehouses.find(w => w.id === item.warehouseId)?.name}</TableCell>
                          <TableCell className="text-right font-bold tabular-nums text-sm">{item.systemQty} <span className="text-[10px] text-[#8494A8] font-normal">{item.unit}</span></TableCell>
                          <TableCell className="text-right font-bold tabular-nums text-sm">{formatCurrency(item.systemQty * item.unitValue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {tab === 'settings' && (
              <div className="max-w-[640px] space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-headline font-bold text-[#16202E]">System Setup</h2>
                  <p className="text-sm text-[#5A6B80]">Global configuration for audit triggers and escalations.</p>
                </div>
                <div className="space-y-6">
                  <Card className="border-[#E3EAF2] p-6 shadow-sm">
                    <div className="space-y-1 mb-6">
                      <h3 className="text-base font-bold text-[#16202E]">Variance Tolerance Parameter</h3>
                      <p className="text-xs text-[#5A6B80]">Discrepancies beyond this percentage are flagged as critical during floor verify shifts.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-32">
                        <Input type="number" defaultValue={2} className="pr-8 h-12 font-bold text-lg" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                      </div>
                      <Button className="bg-[#2B7CE9] h-12 px-8 font-bold uppercase text-xs tracking-widest">Save Parameter</Button>
                    </div>
                  </Card>

                  <Card className="border-[#E3EAF2] overflow-hidden shadow-sm">
                    <CardHeader className="bg-slate-50 border-b">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider">Escalation Routing</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#5A6B80]">Central Operations Inbox</label>
                        <Input defaultValue="ops@invtrack.app" className="h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#5A6B80]">SMS Alert Recipients (CSV)</label>
                        <Input defaultValue="+919444098765, +919845012345" className="h-11" />
                      </div>
                      <Button variant="outline" className="w-full h-11 font-bold border-slate-200">Send Test Routing Notification</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PortalShell>
  );
}

const UserPlus = ({ size, className }: { size: number, className?: string }) => <Users size={size} className={className} />;
