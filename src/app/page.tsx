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
  BarChart3
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { cn, formatCurrency, formatNumber, initials, variancePercent } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

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
    <Badge className={cn("rounded-full font-medium border-none px-2 py-0.5 text-[10px] uppercase", colors[status] || 'bg-slate-100')}>
      {status.replace('_', ' ')}
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

  // Lead Form
  const { register: regLead, handleSubmit: handleLeadSubmit, formState: { errors: leadErrors }, reset: resetLead } = useForm({
    resolver: zodResolver(LeadFormSchema),
    defaultValues: { warehousesCount: 1 }
  });

  const onLeadSubmit = (data: any) => {
    toast.success("Request sent. We will reply within one working day.");
    resetLead();
    setTab('home');
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
            className="space-y-16 pb-16"
          >
            {tab === 'home' && (
              <div className="space-y-24">
                {/* Hero Section - Matching Screenshot */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 items-center min-h-[600px]">
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
                    {/* High-Fidelity Data Overlay with SVG Pointers */}
                    <div className="absolute inset-0 pointer-events-none hidden lg:block z-20">
                      <FloatingDataDecoration />
                    </div>

                    {/* 2x2 Grid of Stat Cards */}
                    <div className="grid grid-cols-2 gap-5 relative z-10 w-full max-w-[520px]">
                      <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-card text-left transition-transform hover:-translate-y-1">
                        <div className="text-4xl font-headline font-bold text-[#16202E] mb-2 tabular-nums">99.2%</div>
                        <div className="text-[13px] text-[#5A6B80] leading-normal font-medium">Average stock accuracy after first full count</div>
                      </div>
                      <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-card text-left transition-transform hover:-translate-y-1">
                        <div className="text-4xl font-headline font-bold text-[#16202E] mb-2 tabular-nums">6 hrs</div>
                        <div className="text-[13px] text-[#5A6B80] leading-normal font-medium">Typical turnaround from start to signed report</div>
                      </div>
                      <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-card text-left transition-transform hover:-translate-y-1">
                        <div className="text-4xl font-headline font-bold text-[#16202E] mb-2 tabular-nums">1,842</div>
                        <div className="text-[13px] text-[#5A6B80] leading-normal font-medium">SKUs counted in a single day at one location</div>
                      </div>
                      <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-card text-left transition-transform hover:-translate-y-1">
                        <div className="text-4xl font-headline font-bold text-[#16202E] mb-2 tabular-nums">4 Roles</div>
                        <div className="text-[13px] text-[#5A6B80] leading-normal font-medium">Operational personas inside one cohesive platform</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portals Selector */}
                <div className="space-y-8 text-left pt-8">
                  <h2 className="text-2xl font-headline font-bold text-[#16202E]">Three workspaces, one record of the truth</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm hover:border-[#12855A]/30 transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-[#E8F6EF] text-[#12855A] flex items-center justify-center mb-4">
                        <WarehouseIcon size={20} />
                      </div>
                      <h3 className="font-headline font-bold text-[#16202E] mb-2 text-[15px]">Client Workspace</h3>
                      <p className="text-xs text-[#5A6B80] leading-relaxed mb-4">Track active location accuracy, verify missing quantities, and approve discrepancy books.</p>
                      <button onClick={() => { setRole('client'); setTab('dashboard'); }} className="text-xs font-bold text-[#12855A] group-hover:underline flex items-center gap-1">
                        Open client platform
                      </button>
                    </div>
                    <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm hover:border-[#E0762B]/30 transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-[#FDF0E3] text-[#E0762B] flex items-center justify-center mb-4">
                        <UserCheck size={20} />
                      </div>
                      <h3 className="font-headline font-bold text-[#16202E] mb-2 text-[15px]">Auditor Tablet View</h3>
                      <p className="text-xs text-[#5A6B80] leading-relaxed mb-4">Optimized for physical auditing. High-density lines input grids and camera verification tools.</p>
                      <button onClick={() => { setRole('auditor'); setTab('dashboard'); }} className="text-xs font-bold text-[#E0762B] group-hover:underline flex items-center gap-1">
                        Open auditor tablet
                      </button>
                    </div>
                    <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm hover:border-[#6D4BC6]/30 transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-[#F0EBFB] text-[#6D4BC6] flex items-center justify-center mb-4">
                        <Sliders size={20} />
                      </div>
                      <h3 className="font-headline font-bold text-[#16202E] mb-2 text-[15px]">Admin Control Center</h3>
                      <p className="text-xs text-[#5A6B80] leading-relaxed mb-4">Approve scheduled audit sequences, deploy field auditors, and analyze client data charts.</p>
                      <button onClick={() => { setRole('admin'); setTab('dashboard'); }} className="text-xs font-bold text-[#6D4BC6] group-hover:underline flex items-center gap-1">
                        Open admin panel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="py-16 border-y border-[#E3EAF2] bg-white -mx-6 md:-mx-8">
                  <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between gap-12 text-center md:text-left">
                    <div className="flex-1 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#EEF5FF] text-[#2B7CE9] flex items-center justify-center mx-auto md:mx-0 mb-4 font-bold text-lg">1</div>
                      <h4 className="font-headline font-bold text-[#16202E] text-[17px]">Track</h4>
                      <p className="text-sm text-[#5A6B80]">Monitor your inventory with real-time sync across all warehouses.</p>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#E8F6EF] text-[#12855A] flex items-center justify-center mx-auto md:mx-0 mb-4 font-bold text-lg">2</div>
                      <h4 className="font-headline font-bold text-[#16202E] text-[17px]">Verify</h4>
                      <p className="text-sm text-[#5A6B80]">Ensure accurate counts with high-density field auditor workflows.</p>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#FDF0E3] text-[#E0762B] flex items-center justify-center mx-auto md:mx-0 mb-4 font-bold text-lg">3</div>
                      <h4 className="font-headline font-bold text-[#16202E] text-[17px]">Reconcile</h4>
                      <p className="text-sm text-[#5A6B80]">Identify discrepancies instantly with smart variance tracking.</p>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#F0EBFB] text-[#6D4BC6] flex items-center justify-center mx-auto md:mx-0 mb-4 font-bold text-lg">4</div>
                      <h4 className="font-headline font-bold text-[#16202E] text-[17px]">Grow</h4>
                      <p className="text-sm text-[#5A6B80]">Build a stronger business with data that finance teams trust.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'about' && (
              <div className="max-w-[680px] mx-auto text-left space-y-8 py-12">
                <h2 className="text-4xl font-headline font-bold text-[#16202E]">Our origin story</h2>
                <div className="space-y-6 text-[#5A6B80] leading-relaxed">
                  <p>
                    InvTrack was forged directly on a complex 1,800-SKU FMCG distribution center warehouse floor in Hyderabad. During a quarterly close operation, we witnessed firsthand the friction of managing physical counts using paper clipboards, three un-synced Excel documents, and chaotic WhatsApp groups.
                  </p>
                  <p>
                    The actual physical counting was manageable; the true breakdown lay in what happened afterward. Tracing shortages and routing approvals took days of manual friction.
                  </p>
                  <p>
                    We built InvTrack to replace this administrative breakdown with a single secure ledger. Today, our application powers operations across retail chains and medical logistics networks throughout India.
                  </p>
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

            {tab === 'request_audit' && (
              <div className="max-w-[640px] mx-auto text-left space-y-8 py-12">
                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-headline font-bold text-[#16202E]">Initiate site sequence</h2>
                  <p className="text-[#5A6B80] text-base">Our operational crew will verify details and assign field staff within 24 hours.</p>
                </div>
                <Card className="border-[#E3EAF2] p-8 shadow-premium bg-white">
                  <form onSubmit={handleLeadSubmit(onLeadSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6B80]">Company</label>
                        <Input placeholder="ABC Enterprises" {...regLead('company')} className="h-11 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6B80]">Contact Name</label>
                        <Input placeholder="Ravi Teja" {...regLead('name')} className="h-11 rounded-lg" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6B80]">Email</label>
                        <Input type="email" placeholder="ravi.teja@abcent.in" {...regLead('email')} className="h-11 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6B80]">Phone</label>
                        <Input placeholder="9848012345" {...regLead('phone')} className="h-11 rounded-lg" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6B80]">What should we know?</label>
                      <Textarea placeholder="Stock value, SKU count, when count is due" {...regLead('notes')} className="min-h-[120px] rounded-lg" />
                    </div>
                    <Button type="submit" className="w-full bg-[#2B7CE9] text-white hover:bg-[#1656B4] h-12 text-sm font-bold uppercase tracking-widest rounded-lg">
                      Send request
                    </Button>
                  </form>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {role === 'client' && (
          <motion.div key="client" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
            {tab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Dashboard</h2>
                    <p className="text-sm text-[#5A6B80]">Where every warehouse stands and what needs a decision.</p>
                  </div>
                  <Button onClick={() => setTab('create_audit')} className="bg-[#2B7CE9] text-white hover:bg-[#1656B4]">Request Audit</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 border border-[#E3EAF2] rounded-[10px] shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">Warehouses</div>
                      <div className="text-2xl font-bold font-mono tabular-nums">03</div>
                    </div>
                    <div className="w-10 h-10 bg-[#E8F6EF] text-[#12855A] rounded-lg flex items-center justify-center"><WarehouseIcon size={20} /></div>
                  </div>
                  <div className="bg-white p-5 border border-[#E3EAF2] rounded-[10px] shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">Total Audits</div>
                      <div className="text-2xl font-bold font-mono tabular-nums">05</div>
                    </div>
                    <div className="w-10 h-10 bg-[#E8F6EF] text-[#12855A] rounded-lg flex items-center justify-center"><ClipboardList size={20} /></div>
                  </div>
                  <div className="bg-white p-5 border border-[#E3EAF2] rounded-[10px] shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">In Progress</div>
                      <div className="text-2xl font-bold font-mono tabular-nums">02</div>
                    </div>
                    <div className="w-10 h-10 bg-[#E8F6EF] text-[#12855A] rounded-lg flex items-center justify-center"><Activity size={20} /></div>
                  </div>
                  <div className="bg-white p-5 border border-[#E3EAF2] rounded-[10px] shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">Completed</div>
                      <div className="text-2xl font-bold font-mono tabular-nums">03</div>
                    </div>
                    <div className="w-10 h-10 bg-[#E8F6EF] text-[#12855A] rounded-lg flex items-center justify-center"><FileText size={20} /></div>
                  </div>
                </div>

                <Card className="border-[#E3EAF2] bg-white overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b font-bold text-xs uppercase text-[#5A6B80] tracking-wider">Recent Audits Ledger</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audits.filter(a => a.clientId === 'cl_abc').map(aud => (
                        <TableRow key={aud.id}>
                          <TableCell className="font-semibold">{aud.reference}</TableCell>
                          <TableCell className="text-xs">
                            <div className="font-bold">{warehouses.find(w => w.id === aud.warehouseId)?.name}</div>
                            <div className="text-[#8494A8]">{warehouses.find(w => w.id === aud.warehouseId)?.city}</div>
                          </TableCell>
                          <TableCell className="text-xs capitalize">{aud.type}</TableCell>
                          <TableCell className="text-xs tabular-nums">{aud.scheduledDate}</TableCell>
                          <TableCell><AuditStatusBadge status={aud.status} /></TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => setTab(`audit_detail_${aud.id}`)} className="h-8 text-xs">View</Button>
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

        {role === 'auditor' && (
          <motion.div key="auditor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
            {(tab === 'dashboard' || tab === 'my_audits') && (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Auditor Portal</h2>
                    <p className="text-sm text-[#5A6B80]">Physical inventory checks assigned to your profile.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">Scheduled</div>
                      <div className="text-3xl font-headline font-bold text-[#E0762B] mt-1 tabular-nums">02</div>
                    </div>
                    <div className="w-10 h-10 bg-[#FDF0E3] text-[#E0762B] rounded-lg flex items-center justify-center"><Clock size={20} /></div>
                  </div>
                  <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm flex items-center justify-between border-l-4 border-l-[#E0762B]">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">In Progress</div>
                      <div className="text-3xl font-headline font-bold text-[#E0762B] mt-1 tabular-nums">01</div>
                    </div>
                    <div className="w-10 h-10 bg-[#FDF0E3] text-[#E0762B] rounded-lg flex items-center justify-center"><Activity size={20} /></div>
                  </div>
                  <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">Completed</div>
                      <div className="text-3xl font-headline font-bold text-[#12855A] mt-1 tabular-nums">12</div>
                    </div>
                    <div className="w-10 h-10 bg-[#E8F6EF] text-[#12855A] rounded-lg flex items-center justify-center"><CheckCircle2 size={20} /></div>
                  </div>
                </div>

                <Card className="border-[#E3EAF2] bg-white overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Audit Code</TableHead>
                        <TableHead>Client & Site</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audits.filter(a => a.auditorId === 'aud_naveen').map(aud => (
                        <TableRow key={aud.id}>
                          <TableCell className="font-mono text-xs font-bold">{aud.reference}</TableCell>
                          <TableCell>
                            <div className="font-bold text-sm">{clients.find(c => c.id === aud.clientId)?.name}</div>
                            <div className="text-xs text-[#5A6B80]">{warehouses.find(w => w.id === aud.warehouseId)?.name}</div>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{aud.scheduledDate}</TableCell>
                          <TableCell><AuditStatusBadge status={aud.status} /></TableCell>
                          <TableCell className="text-right">
                            {aud.status === 'in_progress' ? (
                              <Button size="sm" onClick={() => setTab('count_sheet')} className="bg-[#E0762B] text-white hover:bg-[#c66220] h-9 px-4">Continue</Button>
                            ) : aud.status === 'approved' ? (
                              <Button size="sm" onClick={() => setTab('count_sheet')} className="bg-[#E0762B] text-white hover:bg-[#c66220] h-9 px-4">Start</Button>
                            ) : (
                              <Button variant="outline" size="sm" className="h-9 px-4">View</Button>
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
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E0762B] transition-all duration-300" style={{ width: `${(countedLinesCount / liveCountLines.length) * 100}%` }} />
                    </div>
                  </Card>
                </div>

                <Card className="border-[#E3EAF2] bg-white overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[110px]">SKU ID</TableHead>
                        <TableHead>Description / Zone</TableHead>
                        <TableHead className="text-right w-[110px]">System Book</TableHead>
                        <TableHead className="text-center w-[160px]">Physical Count</TableHead>
                        <TableHead className="text-right w-[100px]">Live Var.</TableHead>
                        <TableHead className="text-right w-[110px]">Action</TableHead>
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
                            {line.variance !== null ? (line.variance > 0 ? `+${variancePercent(line.systemQty, line.countedQty)}%` : `${variancePercent(line.systemQty, line.countedQty)}%`) : "-"}
                          </TableCell>
                          <TableCell className="text-right p-2 flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => toast.success(`Camera active for SKU ${line.sku}`)} className="h-10 w-10 text-slate-400 hover:text-[#E0762B]">
                              <Camera size={18} />
                            </Button>
                            <Button onClick={() => toast.success(`Saved SKU ${line.sku}`)} className="bg-[#E0762B] text-white hover:bg-[#c66220] h-10 px-3 font-bold uppercase text-[10px]">
                              Save
                            </Button>
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
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
            {tab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-[#16202E]">Operations Control</h2>
                    <p className="text-sm text-[#5A6B80]">Requests waiting on approval and live floor activity.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 border border-[#E3EAF2] rounded-[10px] shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">Clients</div>
                      <div className="text-2xl font-bold font-mono tabular-nums">12</div>
                    </div>
                    <div className="w-10 h-10 bg-[#F0EBFB] text-[#6D4BC6] rounded-lg flex items-center justify-center"><Users size={20} /></div>
                  </div>
                  <div className="bg-white p-5 border border-[#E3EAF2] rounded-[10px] shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">Onboarded Sites</div>
                      <div className="text-2xl font-bold font-mono tabular-nums">08</div>
                    </div>
                    <div className="w-10 h-10 bg-[#F0EBFB] text-[#6D4BC6] rounded-lg flex items-center justify-center"><Building2 size={20} /></div>
                  </div>
                  <div className="bg-white p-5 border border-[#E3EAF2] rounded-[10px] shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">Field Auditors</div>
                      <div className="text-2xl font-bold font-mono tabular-nums">15</div>
                    </div>
                    <div className="w-10 h-10 bg-[#F0EBFB] text-[#6D4BC6] rounded-lg flex items-center justify-center"><UserCheck size={20} /></div>
                  </div>
                  <div className="bg-white p-5 border border-[#E3EAF2] rounded-[10px] shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#5A6B80]">Total Audits</div>
                      <div className="text-2xl font-bold font-mono tabular-nums">28</div>
                    </div>
                    <div className="w-10 h-10 bg-[#F0EBFB] text-[#6D4BC6] rounded-lg flex items-center justify-center"><ClipboardList size={20} /></div>
                  </div>
                </div>

                <Card className="border-[#E3EAF2] bg-white overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b font-bold text-xs uppercase text-[#5A6B80] tracking-wider">Audit Request Queue</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Account</TableHead>
                        <TableHead>Warehouse Site</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Target Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Triggers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeRequests.map(req => (
                        <TableRow key={req.id}>
                          <TableCell className="font-bold text-sm">{req.clientName}</TableCell>
                          <TableCell className="text-xs font-medium">{req.warehouseName} &middot; <span className="text-[#8494A8]">{req.city}</span></TableCell>
                          <TableCell className="text-xs capitalize">{req.type}</TableCell>
                          <TableCell className="text-xs font-mono tabular-nums">{req.preferredDate}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "rounded-full font-medium border-none text-[10px] uppercase",
                              req.status === 'approved' ? "bg-[#E8F6EF] text-[#12855A]" : "bg-[#FFF8E6] text-[#B5730F]"
                            )}>
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {req.status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => {
                                  toast.error("Request declined");
                                  setActiveRequests(prev => prev.filter(r => r.id !== req.id));
                                }} className="h-8 text-xs">Decline</Button>
                                <Button size="sm" onClick={() => {
                                  toast.success("Audit scheduled successfully");
                                  setActiveRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
                                }} className="bg-[#2B7CE9] text-white hover:bg-[#1656B4] h-8 text-xs font-bold uppercase">Approve</Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {tab === 'settings' && (
              <div className="max-w-[640px] mx-auto space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-headline font-bold text-[#16202E]">Operations Configuration</h2>
                  <p className="text-sm text-[#5A6B80]">Governing checking thresholds and automated workflow routing.</p>
                </div>

                <Card className="border-[#E3EAF2] p-4 bg-white shadow-sm">
                  <CardHeader className="p-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#16202E]">Global Count Variance Tolerance</CardTitle>
                    <CardDescription className="text-xs pt-1">Variance beyond this percentage threshold is flagged instantly on auditor tablet inputs.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 space-y-4">
                    <div className="flex items-center gap-3">
                      <Input type="number" defaultValue={2} className="h-10 max-w-[128px] text-center font-bold text-sm border-[#E3EAF2]" />
                      <span className="text-xs font-bold text-[#5A6B80]">% Allowed Balance Tolerance</span>
                    </div>
                    <Separator className="my-2" />
                    <Button onClick={() => toast.success("Tolerance parameters updated")} className="bg-[#2B7CE9] text-white hover:bg-[#1656B4]">
                      Save Parameters
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-[#E3EAF2] p-4 bg-white shadow-sm">
                  <CardHeader className="p-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#16202E]">Operational Escalations Routing Inbox</CardTitle>
                    <CardDescription className="text-xs pt-1">Who is notified immediately when a critical severity discrepancy ledger breaches tolerance parameters during active floor verify shifts.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 space-y-4">
                    <div>
                      <span className="text-xs text-[#5A6B80] block mb-1">Operations Inbox Email:</span>
                      <Input defaultValue="ops@invtrack.app" className="h-10 border-[#E3EAF2]" />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button variant="outline" onClick={() => toast.success("Test notification transmitted")} className="border-slate-300 text-xs font-semibold">
                        Send Test Notification
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PortalShell>
  );
}
