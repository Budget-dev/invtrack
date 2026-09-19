
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
  BarChart3, Calendar as CalendarIcon, FileBarChart, UserCog, ListChecks
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

// Define Logo locally to ensure it is always available
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

// Zod validation schemas
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

// Shared Layout Component for Portals
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
          <span className="text-slate-400">Select a workspace to preview the experience:</span>
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

// Utility components for badges
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

// Main App Component
export default function InvTrackMainApp() {
  const [role, setRole] = useState<'marketing' | 'client' | 'auditor' | 'admin'>('marketing');
  const [tab, setTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveCountLines, setLiveCountLines] = useState(countLinesForAud002);
  const [activeRequests, setActiveRequests] = useState(auditRequests);

  // Client Audit Form
  const { register: regAudit, handleSubmit: handleAuditSubmit, formState: { errors: auditErrors }, reset: resetAudit } = useForm({
    resolver: zodResolver(CreateAuditSchema)
  });

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
          <motion.div 
            key="marketing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-16 pb-16"
          >
            {tab === 'home' && (
              <div className="space-y-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 items-center min-h-[500px]">
                  <div className="space-y-8 text-left">
                    <div className="space-y-2">
                      <span className="text-[#2B7CE9] text-[13px] font-bold tracking-widest uppercase block">From stock to clarity</span>
                      <h1 className="text-[48px] md:text-[56px] font-headline font-bold text-[#16202E] leading-[1.1] tracking-tight">
                        Accurate inventory audits for a stronger tomorrow
                      </h1>
                    </div>
                    <p className="text-[#5A6B80] text-lg leading-relaxed max-w-[540px]">
                      InvTrack replaces chaotic spreadsheets with high density physical verify cycles. Freeze quantities, track variances live, and produce reconciled reports instantly.
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

                  <div className="relative h-full flex items-center justify-center">
                    <div className="absolute inset-0 pointer-events-none hidden lg:block z-20">
                      <FloatingDataDecoration />
                    </div>
                    <div className="grid grid-cols-2 gap-5 relative z-10 w-full max-w-[520px]">
                      {[
                        { val: '99.2%', label: 'Average stock accuracy after first full count' },
                        { val: '6 hrs', label: 'Typical turnaround from start to signed report' },
                        { val: '1,842', label: 'SKUs counted in a single day at one location' },
                        { val: '4 Roles', label: 'Operational personas inside one cohesive platform' }
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
                  <h2 className="text-2xl font-headline font-bold text-[#16202E]">Three workspaces, one record of the truth</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm hover:border-[#12855A]/30 transition-all cursor-pointer group" onClick={() => { setRole('client'); setTab('dashboard'); }}>
                      <div className="w-10 h-10 rounded-lg bg-[#E8F6EF] text-[#12855A] flex items-center justify-center mb-4">
                        <WarehouseIcon size={20} />
                      </div>
                      <h3 className="font-headline font-bold text-[#16202E] mb-2 text-[15px]">Client Workspace</h3>
                      <p className="text-xs text-[#5A6B80] leading-relaxed mb-4">Track active location accuracy, verify missing quantities, and approve discrepancy books.</p>
                      <div className="text-xs font-bold text-[#12855A] group-hover:underline flex items-center gap-1">
                        Open client platform
                      </div>
                    </div>
                    <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm hover:border-[#E0762B]/30 transition-all cursor-pointer group" onClick={() => { setRole('auditor'); setTab('dashboard'); }}>
                      <div className="w-10 h-10 rounded-lg bg-[#FDF0E3] text-[#E0762B] flex items-center justify-center mb-4">
                        <UserCheck size={20} />
                      </div>
                      <h3 className="font-headline font-bold text-[#16202E] mb-2 text-[15px]">Auditor Tablet View</h3>
                      <p className="text-xs text-[#5A6B80] leading-relaxed mb-4">Optimized for physical auditing. High-density lines input grids and camera verification tools.</p>
                      <div className="text-xs font-bold text-[#E0762B] group-hover:underline flex items-center gap-1">
                        Open auditor tablet
                      </div>
                    </div>
                    <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm hover:border-[#6D4BC6]/30 transition-all cursor-pointer group" onClick={() => { setRole('admin'); setTab('dashboard'); }}>
                      <div className="w-10 h-10 rounded-lg bg-[#F0EBFB] text-[#6D4BC6] flex items-center justify-center mb-4">
                        <Sliders size={20} />
                      </div>
                      <h3 className="font-headline font-bold text-[#16202E] mb-2 text-[15px]">Admin Control Center</h3>
                      <p className="text-xs text-[#5A6B80] leading-relaxed mb-4">Approve scheduled audit sequences, deploy field auditors, and analyze client data charts.</p>
                      <div className="text-xs font-bold text-[#6D4BC6] group-hover:underline flex items-center gap-1">
                        Open admin panel
                      </div>
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
                  {
                    title: "Request the Audit",
                    description: "Clients initiate a count sequence by selecting a warehouse and audit type from their portal.",
                    colorTheme: "blue"
                  },
                  {
                    title: "Admin Approval",
                    description: "InvTrack operators verify details, freeze system quantities, and assign a qualified field auditor.",
                    colorTheme: "purple"
                  },
                  {
                    title: "On-Site Counting",
                    description: "Auditors use tablet-optimized count sheets to verify physical stock against book quantities.",
                    colorTheme: "orange"
                  },
                  {
                    title: "Reconciliation",
                    description: "Every variance is automatically flagged and routed to management for immediate review and approval.",
                    colorTheme: "blue"
                  },
                  {
                    title: "Final Sign-off",
                    description: "A secure, verified report is generated and signed off, updating the master inventory record.",
                    colorTheme: "blue"
                  }
                ]} />
              </div>
            )}
          </motion.div>
        )}

        {role === 'client' && (
          <motion.div 
            key="client" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8 text-left"
          >
            {tab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-[30px] font-headline font-bold text-[#16202E] tracking-tight">Dashboard</h2>
                    <p className="text-[14px] text-[#5A6B80]">Where every warehouse stands and what needs a decision from you.</p>
                  </div>
                  <Button onClick={() => setTab('create_audit')} className="bg-[#2B7CE9] text-white hover:bg-[#1656B4]">Request Audit</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Warehouses', val: '03', icon: WarehouseIcon, tone: 'client' },
                    { label: 'Total Audits', val: '05', icon: ClipboardList, tone: 'client' },
                    { label: 'In Progress', val: '02', icon: Activity, tone: 'client' },
                    { label: 'Completed', val: '03', icon: FileText, tone: 'client' }
                  ].map((stat, i) => (
                    <Card key={i} className="border-[#E3EAF2] bg-white rounded-[10px] shadow-sm overflow-hidden">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[14px] text-[#5A6B80] font-medium">{stat.label}</p>
                          <h3 className="font-headline text-[30px] font-semibold tracking-tight text-[#16202E] tabular-nums">{stat.val}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#E8F6EF] text-[#12855A] flex items-center justify-center">
                          <stat.icon size={20} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
                      <span className="font-bold text-xs uppercase text-[#5A6B80] tracking-wider">Recent Audits Ledger</span>
                      <Button variant="ghost" size="sm" onClick={() => setTab('my_audits')} className="h-7 text-xs text-[#2B7CE9] font-bold">View all</Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-transparent hover:bg-transparent">
                          <TableHead className="text-[12px] uppercase tracking-wider font-bold">Reference</TableHead>
                          <TableHead className="text-[12px] uppercase tracking-wider font-bold">Warehouse</TableHead>
                          <TableHead className="text-[12px] uppercase tracking-wider font-bold">Type</TableHead>
                          <TableHead className="text-[12px] uppercase tracking-wider font-bold">Scheduled</TableHead>
                          <TableHead className="text-[12px] uppercase tracking-wider font-bold">Status</TableHead>
                          <TableHead className="text-[12px] uppercase tracking-wider font-bold text-right">Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {audits.filter(a => a.clientId === 'cl_abc').slice(0, 4).map(aud => (
                          <TableRow key={aud.id} className="h-[52px] group">
                            <TableCell className="font-semibold text-sm">{aud.reference}</TableCell>
                            <TableCell className="text-xs">
                              <div className="font-bold text-[#16202E]">{warehouses.find(w => w.id === aud.warehouseId)?.name}</div>
                              <div className="text-[#8494A8]">{warehouses.find(w => w.id === aud.warehouseId)?.city}</div>
                            </TableCell>
                            <TableCell className="text-xs capitalize">{aud.type}</TableCell>
                            <TableCell className="text-xs tabular-nums text-[#5A6B80]">{aud.scheduledDate}</TableCell>
                            <TableCell><AuditStatusBadge status={aud.status} /></TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[10px] font-bold text-[#16202E]">{aud.countedLines} / {aud.totalLines}</span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full", aud.status === 'completed' ? "bg-[#12855A]" : "bg-[#2B7CE9]")} 
                                    style={{ width: `${(aud.countedLines/aud.totalLines)*100}%` }} 
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>

                  <div className="space-y-6">
                    <Card className="border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                      <div className="p-4 bg-slate-50 border-b font-bold text-xs uppercase text-[#5A6B80] tracking-wider">Unresolved Discrepancies</div>
                      <div className="p-0">
                        {discrepancies.filter(d => d.status !== 'resolved').slice(0, 3).map((d, i) => (
                          <div key={i} className="p-4 border-b last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => setTab('discrepancies')}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-bold text-[#16202E]">{d.itemName}</span>
                              <SeverityBadge severity={d.severity} />
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-[#8494A8] font-mono">{d.sku}</span>
                              <span className="text-[#C0362C] font-bold">{d.variance > 0 ? `+${d.variance}` : d.variance} units</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="border-none bg-[#E8F6EF] p-5 shadow-sm">
                      <h4 className="text-[15px] font-headline font-bold text-[#12855A] mb-2">Next scheduled count</h4>
                      <p className="text-[13px] text-[#12855A]/80 leading-relaxed mb-4">
                        Vijayawada Depot has never been audited. We recommend an opening count before the annual close on 28 Sep.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setTab('create_audit')} className="w-full bg-white border-[#12855A]/20 text-[#12855A] hover:bg-[#E8F6EF]">Schedule Now</Button>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {tab === 'warehouses' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                  <div>
                    <h2 className="text-[30px] font-headline font-bold text-[#16202E]">Warehouses</h2>
                    <p className="text-[14px] text-[#5A6B80]">Physical sites associated with ABC Enterprises.</p>
                  </div>
                  <Button className="bg-[#2B7CE9] text-white"><Plus size={16} className="mr-2" /> Add Warehouse</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {warehouses.filter(w => w.clientId === 'cl_abc').map(w => (
                    <Card key={w.id} className="border-[#E3EAF2] bg-white rounded-[10px] shadow-sm overflow-hidden hover:border-[#2B7CE9]/30 transition-all">
                      <CardHeader className="p-5 border-b bg-slate-50/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-[16px] font-bold">{w.name}</CardTitle>
                            <CardDescription className="text-xs text-[#8494A8] mt-1">{w.address}</CardDescription>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-mono bg-white">{w.code}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-[#8494A8] uppercase tracking-wider">SKUs on file</p>
                            <p className="text-sm font-bold tabular-nums">{formatNumber(w.skuCount)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[#8494A8] uppercase tracking-wider">Storage Zones</p>
                            <p className="text-sm font-bold">{w.zones}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[#8494A8] uppercase tracking-wider">Manager</p>
                            <p className="text-sm font-bold">{w.managerName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[#8494A8] uppercase tracking-wider">Last audited</p>
                            <p className={cn("text-sm font-bold", !w.lastAuditedDate && "text-[#E0762B]")}>
                              {w.lastAuditedDate || "Never counted"}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full text-xs h-9 border-slate-200">Manage Inventory</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {tab === 'inventory' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                  <div>
                    <h2 className="text-[30px] font-headline font-bold text-[#16202E]">Inventory Ledger</h2>
                    <p className="text-[14px] text-[#5A6B80]">Master list of SKUs and book quantities across all sites.</p>
                  </div>
                  <Button variant="outline" className="border-slate-200 h-10 px-4"><Download size={16} className="mr-2" /> Export CSV</Button>
                </div>

                <Card className="border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b flex items-center gap-4">
                    <div className="relative max-w-sm w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8494A8]" size={16} />
                      <Input 
                        placeholder="Search SKU, item or category..." 
                        className="pl-9 h-10 bg-white border-[#E3EAF2]" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-[#5A6B80]"><Filter size={14} className="mr-2" /> Filters</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-transparent hover:bg-transparent">
                        <TableHead className="text-[12px] uppercase font-bold">SKU ID</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Item Name</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Category</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Warehouse</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Zone</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold text-right">System Qty</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold text-right">Stock Value</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold text-right">Last Sync</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems
                        .filter(item => 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(item => (
                        <TableRow key={item.sku} className="h-[52px]">
                          <TableCell className="font-mono text-[11px] font-bold">{item.sku}</TableCell>
                          <TableCell className="font-medium text-sm">{item.name}</TableCell>
                          <TableCell className="text-xs text-[#5A6B80]">{item.category}</TableCell>
                          <TableCell className="text-xs">{warehouses.find(w => w.id === item.warehouseId)?.name}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] font-medium text-[#5A6B80]">{item.zone}</Badge></TableCell>
                          <TableCell className="text-right font-bold tabular-nums text-sm">{item.systemQty} <span className="text-[10px] text-[#8494A8] font-normal uppercase">{item.unit}</span></TableCell>
                          <TableCell className="text-right font-bold tabular-nums text-sm">{formatCurrency(item.systemQty * item.unitValue)}</TableCell>
                          <TableCell className="text-right text-[11px] text-[#8494A8] font-mono">{item.syncedDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {tab === 'create_audit' && (
              <div className="max-w-[640px] mx-auto py-8">
                <div className="mb-8">
                  <h2 className="text-[30px] font-headline font-bold text-[#16202E]">Initiate audit</h2>
                  <p className="text-[14px] text-[#5A6B80]">Select a site and sequence type to request a physical verify.</p>
                </div>
                <Card className="border-[#E3EAF2] bg-white shadow-premium p-8">
                  <form onSubmit={handleAuditSubmit(onAuditRequest)} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6B80]">Warehouse site</label>
                      <select {...regAudit('warehouseId')} className="w-full h-11 px-3 rounded-lg border border-[#E3EAF2] bg-white text-sm focus:ring-2 focus:ring-[#2B7CE9]/20 outline-none transition-all">
                        <option value="">Select a warehouse</option>
                        {warehouses.filter(w => w.clientId === 'cl_abc').map(w => (
                          <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                        ))}
                      </select>
                      {auditErrors.warehouseId && <p className="text-xs text-[#C0362C]">{auditErrors.warehouseId.message as string}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6B80]">Audit type</label>
                      <select {...regAudit('type')} className="w-full h-11 px-3 rounded-lg border border-[#E3EAF2] bg-white text-sm focus:ring-2 focus:ring-[#2B7CE9]/20 outline-none transition-all">
                        <option value="">Select sequence type</option>
                        <option value="full">Full physical count</option>
                        <option value="cycle">Cycle counting</option>
                        <option value="spot">Spot check</option>
                        <option value="annual">Annual statutory count</option>
                      </select>
                      <p className="text-[11px] text-[#8494A8] mt-1 italic">Full = Every SKU in the warehouse. Cycle = A rolling subset, no shutdown needed.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6B80]">Preferred scheduled date</label>
                      <Input type="date" {...regAudit('preferredDate')} className="h-11 rounded-lg" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6B80]">Notes for the auditor</label>
                      <Textarea placeholder="Access timings, zones to prioritise, contacts on site" {...regAudit('notes')} className="min-h-[100px] rounded-lg" />
                    </div>

                    <Button type="submit" className="w-full bg-[#2B7CE9] text-white hover:bg-[#1656B4] h-12 text-sm font-bold uppercase tracking-widest rounded-lg shadow-sm">
                      Request Audit
                    </Button>
                  </form>
                </Card>
              </div>
            )}

            {tab === 'my_audits' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                  <div>
                    <h2 className="text-[30px] font-headline font-bold text-[#16202E]">Audit Lifecycle</h2>
                    <p className="text-[14px] text-[#5A6B80]">Track progress of active and historical count sequences.</p>
                  </div>
                  <Button onClick={() => setTab('create_audit')} className="bg-[#2B7CE9] text-white hover:bg-[#1656B4]">Request New Count</Button>
                </div>

                <Tabs defaultValue="all" className="space-y-6">
                  <TabsList className="bg-slate-100/50 p-1 rounded-lg border border-[#E3EAF2]">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-6">All Counts</TabsTrigger>
                    <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-6">In Progress</TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-6">Completed</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="m-0">
                    <Card className="border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-transparent hover:bg-transparent">
                            <TableHead className="text-[12px] uppercase font-bold">Ref</TableHead>
                            <TableHead className="text-[12px] uppercase font-bold">Warehouse</TableHead>
                            <TableHead className="text-[12px] uppercase font-bold">Type</TableHead>
                            <TableHead className="text-[12px] uppercase font-bold">Scheduled</TableHead>
                            <TableHead className="text-[12px] uppercase font-bold">Status</TableHead>
                            <TableHead className="text-[12px] uppercase font-bold text-right">Accuracy</TableHead>
                            <TableHead className="text-[12px] uppercase font-bold text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {audits.filter(a => a.clientId === 'cl_abc').map(aud => (
                            <TableRow key={aud.id} className="h-[56px]">
                              <TableCell className="font-bold text-sm">{aud.reference}</TableCell>
                              <TableCell className="text-sm font-semibold">{warehouses.find(w => w.id === aud.warehouseId)?.name}</TableCell>
                              <TableCell className="text-xs capitalize">{aud.type}</TableCell>
                              <TableCell className="text-xs text-[#5A6B80] font-mono">{aud.scheduledDate}</TableCell>
                              <TableCell><AuditStatusBadge status={aud.status} /></TableCell>
                              <TableCell className="text-right font-bold tabular-nums">
                                {aud.accuracy ? (
                                  <span className={cn(aud.accuracy >= 98 ? "text-[#12855A]" : "text-[#B5730F]")}>{aud.accuracy}%</span>
                                ) : "--"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => setTab(`audit_detail_${aud.id}`)} className="h-8 text-xs font-bold border-slate-200">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {tab === 'discrepancies' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                  <div>
                    <h2 className="text-[30px] font-headline font-bold text-[#16202E]">Discrepancies</h2>
                    <p className="text-[14px] text-[#5A6B80]">Lines flagged for reconciliation across all active audits.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-200 h-10 px-4"><Filter size={16} className="mr-2" /> Filter Severity</Button>
                    <Button className="bg-[#16202E] text-white hover:bg-slate-800">Resolve Batch</Button>
                  </div>
                </div>

                <Card className="border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-transparent hover:bg-transparent">
                        <TableHead className="text-[12px] uppercase font-bold">Item Description</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Audit</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Type</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold text-center">Severity</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold text-right">Variance</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold text-right">Value Impact</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discrepancies.map(d => (
                        <TableRow key={d.id} className="h-[64px]">
                          <TableCell>
                            <div className="font-bold text-sm">{d.itemName}</div>
                            <div className="text-[10px] text-[#8494A8] font-mono uppercase tracking-wider">{d.sku}</div>
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-[#2B7CE9]">{d.auditId}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] font-medium capitalize bg-slate-50">{d.type}</Badge></TableCell>
                          <TableCell className="text-center"><SeverityBadge severity={d.severity} /></TableCell>
                          <TableCell className="text-right">
                            <span className={cn("font-bold text-sm tabular-nums", d.variance < 0 ? "text-[#C0362C]" : "text-[#12855A]")}>
                              {d.variance > 0 ? `+${d.variance}` : d.variance} units
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-bold tabular-nums text-sm">{formatCurrency(d.valueImpact)}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={cn(
                              "rounded-full text-[10px] px-2 py-0.5",
                              d.status === 'resolved' ? "bg-[#E8F6EF] text-[#12855A]" : 
                              d.status === 'under_review' ? "bg-[#FFF8E6] text-[#B5730F]" : "bg-[#FDF2F2] text-[#C0362C]"
                            )}>
                              {d.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {tab === 'reports' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                  <div>
                    <h2 className="text-[30px] font-headline font-bold text-[#16202E]">Reports & Trends</h2>
                    <p className="text-[14px] text-[#5A6B80]">Operational analytics and accuracy performance monitoring.</p>
                  </div>
                  <Button variant="outline" className="border-slate-200 h-10 px-4"><FileBarChart size={16} className="mr-2" /> Export Performance PDF</Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card className="border-[#E3EAF2] bg-white rounded-[10px] shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                      <CardTitle className="text-lg font-headline font-bold">Stock accuracy</CardTitle>
                      <CardDescription className="text-xs mt-1">Share of counted lines within the 2% tolerance threshold</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={accuracyTrend}>
                            <defs>
                              <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2B7CE9" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2B7CE9" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF2" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8494A8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8494A8' }} domain={[94, 100]} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: '1px solid #E3EAF2', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                              itemStyle={{ color: '#2B7CE9', fontWeight: 'bold' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="accuracy" 
                              stroke="#1D6FE0" 
                              strokeWidth={2.5} 
                              fillOpacity={1} 
                              fill="url(#accuracyGradient)" 
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[#E3EAF2] bg-white rounded-[10px] shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                      <CardTitle className="text-lg font-headline font-bold">Variance by category</CardTitle>
                      <CardDescription className="text-xs mt-1">Net shortage vs. overage units grouped by product sector</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={varianceByCategory}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF2" />
                            <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8494A8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8494A8' }} />
                            <Tooltip 
                              cursor={{ fill: '#F7F9FC' }}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #E3EAF2', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                            />
                            <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '20px' }} />
                            <Bar dataKey="shortage" name="Shortage" fill="#C0362C" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="overage" name="Overage" fill="#12855A" radius={[4, 4, 0, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Audit Detail View (Deep Link) */}
            {tab.startsWith('audit_detail_') && (
              <div className="space-y-8">
                {(() => {
                  const audId = tab.replace('audit_detail_', '');
                  const aud = audits.find(a => a.id === audId);
                  const wh = warehouses.find(w => w.id === aud?.warehouseId);
                  if (!aud) return <div>Audit not found</div>;
                  return (
                    <>
                      <div className="flex justify-between items-end border-b border-[#E3EAF2] pb-6">
                        <div>
                          <Button variant="ghost" size="sm" onClick={() => setTab('my_audits')} className="mb-2 -ml-2 text-[#2B7CE9] h-7 hover:bg-[#EEF5FF] font-bold">
                            <ChevronDown size={16} className="mr-1 rotate-90" /> Back to My Audits
                          </Button>
                          <h2 className="text-[30px] font-headline font-bold text-[#16202E] tracking-tight">{aud.reference} &middot; {wh?.name}</h2>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[14px] text-[#5A6B80]">{aud.type} count scheduled for {aud.scheduledDate}</p>
                            <AuditStatusBadge status={aud.status} />
                          </div>
                        </div>
                        <Button variant="outline" className="border-slate-200 h-10 px-4"><Download size={16} className="mr-2" /> Download Report</Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-[#E3EAF2] bg-white p-5 shadow-sm">
                          <p className="text-[10px] font-bold text-[#8494A8] uppercase tracking-widest mb-1">Auditor Assigned</p>
                          <p className="text-sm font-bold text-[#16202E]">Naveen Kumar</p>
                        </Card>
                        <Card className="border-[#E3EAF2] bg-white p-5 shadow-sm">
                          <p className="text-[10px] font-bold text-[#8494A8] uppercase tracking-widest mb-1">Lines Counted</p>
                          <p className="text-sm font-bold text-[#16202E] tabular-nums">{aud.countedLines} / {aud.totalLines}</p>
                        </Card>
                        <Card className="border-[#E3EAF2] bg-white p-5 shadow-sm">
                          <p className="text-[10px] font-bold text-[#8494A8] uppercase tracking-widest mb-1">Total Discrepancies</p>
                          <p className="text-sm font-bold text-[#16202E] tabular-nums">14 found</p>
                        </Card>
                        <Card className="border-[#E3EAF2] bg-white p-5 shadow-sm">
                          <p className="text-[10px] font-bold text-[#8494A8] uppercase tracking-widest mb-1">Verified Accuracy</p>
                          <p className="text-sm font-bold text-[#12855A] tabular-nums">{aud.accuracy || 'Pending'}%</p>
                        </Card>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-headline font-bold text-[#16202E]">Audit Findings</h3>
                        <Card className="border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-transparent hover:bg-transparent">
                                <TableHead className="text-[12px] uppercase font-bold">SKU ID</TableHead>
                                <TableHead className="text-[12px] uppercase font-bold">Item Name</TableHead>
                                <TableHead className="text-[12px] uppercase font-bold">Type</TableHead>
                                <TableHead className="text-[12px] uppercase font-bold text-center">Severity</TableHead>
                                <TableHead className="text-[12px] uppercase font-bold text-right">Variance</TableHead>
                                <TableHead className="text-[12px] uppercase font-bold text-right">Value Impact</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {discrepancies.filter(d => d.auditId === aud.id).map(d => (
                                <TableRow key={d.id} className="h-[56px]">
                                  <TableCell className="font-mono text-[11px] font-bold">{d.sku}</TableCell>
                                  <TableCell className="font-medium text-sm">{d.itemName}</TableCell>
                                  <TableCell><Badge variant="outline" className="text-[10px] bg-slate-50">{d.type}</Badge></TableCell>
                                  <TableCell className="text-center"><SeverityBadge severity={d.severity} /></TableCell>
                                  <TableCell className="text-right font-bold tabular-nums text-sm">{d.variance}</TableCell>
                                  <TableCell className="text-right font-bold tabular-nums text-sm">{formatCurrency(d.valueImpact)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Card>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </motion.div>
        )}

        {role === 'auditor' && (
          <motion.div key="auditor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 text-left">
            {(tab === 'dashboard' || tab === 'my_audits') && (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Auditor Portal</h2>
                    <p className="text-sm text-[#5A6B80]">Physical inventory checks assigned to your profile.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-[#E3EAF2] bg-white p-6 shadow-sm flex items-center justify-between border-l-4 border-l-[#E0762B]">
                    <div>
                      <p className="text-xs font-bold text-[#5A6B80] uppercase tracking-wider">Scheduled</p>
                      <h3 className="text-3xl font-headline font-bold text-[#E0762B] mt-1 tabular-nums">02</h3>
                    </div>
                    <div className="w-10 h-10 bg-[#FDF0E3] text-[#E0762B] rounded-lg flex items-center justify-center"><Clock size={20} /></div>
                  </Card>
                  <Card className="border-[#E3EAF2] bg-white p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#5A6B80] uppercase tracking-wider">In Progress</p>
                      <h3 className="text-3xl font-headline font-bold text-[#E0762B] mt-1 tabular-nums">01</h3>
                    </div>
                    <div className="w-10 h-10 bg-[#FDF0E3] text-[#E0762B] rounded-lg flex items-center justify-center"><Activity size={20} /></div>
                  </Card>
                  <Card className="border-[#E3EAF2] bg-white p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#5A6B80] uppercase tracking-wider">Completed</p>
                      <h3 className="text-3xl font-headline font-bold text-[#12855A] mt-1 tabular-nums">12</h3>
                    </div>
                    <div className="w-10 h-10 bg-[#E8F6EF] text-[#12855A] rounded-lg flex items-center justify-center"><CheckCircle2 size={20} /></div>
                  </Card>
                </div>

                <Card className="border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="bg-transparent hover:bg-transparent">
                        <TableHead className="text-[12px] uppercase font-bold">Audit Code</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Client & Site</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Scheduled Date</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Status</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audits.filter(a => a.auditorId === 'aud_naveen').map(aud => (
                        <TableRow key={aud.id} className="h-14">
                          <TableCell className="font-mono text-xs font-bold">{aud.reference}</TableCell>
                          <TableCell>
                            <div className="font-bold text-sm">{clients.find(c => c.id === aud.clientId)?.name}</div>
                            <div className="text-xs text-[#5A6B80]">{warehouses.find(w => w.id === aud.warehouseId)?.name}</div>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{aud.scheduledDate}</TableCell>
                          <TableCell><AuditStatusBadge status={aud.status} /></TableCell>
                          <TableCell className="text-right">
                            {aud.status === 'in_progress' ? (
                              <Button size="sm" onClick={() => setTab('count_sheet')} className="bg-[#E0762B] text-white hover:bg-[#c66220] h-9 px-4 font-bold">Continue</Button>
                            ) : aud.status === 'approved' ? (
                              <Button size="sm" onClick={() => setTab('count_sheet')} className="bg-[#E0762B] text-white hover:bg-[#c66220] h-9 px-4 font-bold">Start</Button>
                            ) : (
                              <Button variant="outline" size="sm" className="h-9 px-4 font-bold border-slate-200">View</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
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
                        <span className="text-xs font-bold text-[#5A6B80] uppercase tracking-wide block">Counted Progress</span>
                        <span className="text-2xl font-bold font-mono text-[#16202E] tabular-nums">{countedLinesCount} / {liveCountLines.length}</span>
                      </div>
                    </div>
                    <Progress value={(countedLinesCount / liveCountLines.length) * 100} className="h-3 bg-slate-100 rounded-full" />
                  </Card>
                </div>

                <Card className="border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="bg-transparent hover:bg-transparent">
                        <TableHead className="w-[110px] text-[12px] uppercase font-bold">SKU ID</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Description / Zone</TableHead>
                        <TableHead className="text-right w-[110px] text-[12px] uppercase font-bold">System Book</TableHead>
                        <TableHead className="text-center w-[160px] text-[12px] uppercase font-bold">Physical Count</TableHead>
                        <TableHead className="text-right w-[100px] text-[12px] uppercase font-bold">Live Var.</TableHead>
                        <TableHead className="text-right w-[110px] text-[12px] uppercase font-bold">Action</TableHead>
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
                          <TableCell className="text-right font-mono font-bold text-sm tabular-nums">
                            {line.systemQty}
                          </TableCell>
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
                              <Button variant="ghost" size="icon" onClick={() => toast.success(`Camera active for SKU ${line.sku}`)} className="h-10 w-10 text-slate-400 hover:text-[#E0762B]">
                                <Camera size={18} />
                              </Button>
                              <Button onClick={() => toast.success(`Saved SKU ${line.sku}`)} className="bg-[#E0762B] text-white hover:bg-[#c66220] h-10 px-3 font-bold uppercase text-[10px]">
                                Save
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>

                <div className="flex justify-between items-center pt-4 border-t border-[#E3EAF2]">
                  <Button variant="outline" className="border-slate-300" onClick={() => setTab('dashboard')}>
                    Cancel Shift
                  </Button>
                  <Button className="bg-[#16202E] text-white hover:bg-slate-800 px-8 h-12 font-bold uppercase text-xs tracking-widest" onClick={() => { toast.success("Audit submitted for reconciliation"); setTab('dashboard'); }}>
                    Finish and Submit Count
                  </Button>
                </div>
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
                    <p className="text-sm text-[#5A6B80]">Requests waiting on approval and live floor activity.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Clients', val: '12', icon: Users, tone: 'admin' },
                    { label: 'Onboarded Sites', val: '08', icon: Building2, tone: 'admin' },
                    { label: 'Field Auditors', val: '15', icon: UserCheck, tone: 'admin' },
                    { label: 'Total Audits', val: '28', icon: ClipboardList, tone: 'admin' }
                  ].map((stat, i) => (
                    <Card key={i} className="border-[#E3EAF2] bg-white rounded-[10px] shadow-sm overflow-hidden">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[14px] text-[#5A6B80] font-medium">{stat.label}</p>
                          <h3 className="font-headline text-[30px] font-semibold tracking-tight text-[#16202E] tabular-nums">{stat.val}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#F0EBFB] text-[#6D4BC6] flex items-center justify-center">
                          <stat.icon size={20} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b font-bold text-xs uppercase text-[#5A6B80] tracking-wider">Audit Request Queue</div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-transparent hover:bg-transparent">
                        <TableHead className="text-[12px] uppercase font-bold">Client Account</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Warehouse Site</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Type</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Target Date</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold">Status</TableHead>
                        <TableHead className="text-[12px] uppercase font-bold text-right">Triggers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeRequests.map(req => (
                        <TableRow key={req.id} className="h-14">
                          <TableCell className="font-bold text-sm">{req.clientName}</TableCell>
                          <TableCell className="text-xs font-medium">{req.warehouseName} &middot; <span className="text-[#8494A8]">{req.city}</span></TableCell>
                          <TableCell className="text-xs capitalize">{req.type}</TableCell>
                          <TableCell className="text-xs font-mono tabular-nums">{req.preferredDate}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "rounded-full font-medium border-none text-[10px] px-2 py-0.5 uppercase",
                              req.status === 'approved' ? "bg-[#E8F6EF] text-[#12855A]" : "bg-[#FFF8E6] text-[#B5730F]"
                            )}>
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {req.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => {
                                  toast.error("Request declined");
                                  setActiveRequests(prev => prev.filter(r => r.id !== req.id));
                                }} className="h-8 text-xs font-bold border-slate-200">Decline</Button>
                                <Button size="sm" onClick={() => {
                                  toast.success("Audit scheduled successfully");
                                  setActiveRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
                                }} className="bg-[#2B7CE9] text-white hover:bg-[#1656B4] h-8 text-xs font-bold uppercase">Approve</Button>
                              </div>
                            )}
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
      </AnimatePresence>
    </PortalShell>
  );
}
