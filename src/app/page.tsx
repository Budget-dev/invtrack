
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PortalShell } from '@/components/layout/PortalShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { AuditStatusBadge, SeverityBadge, ResolutionBadge } from '@/components/shared/badges';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  clients, warehouses, inventoryItems, audits, 
  countLinesForAud002, discrepancies, auditRequests, auditors, 
  accuracyTrend, varianceByCategory, VARIANCE_TOLERANCE_PERCENT 
} from '@/data/mock-data';
import { 
  Warehouse as WarehouseIcon, Boxes, ShieldAlert, FileText, 
  Camera, CheckCircle, Plus, ClipboardList, Info, 
  MapPin, CheckCircle2, Users, UserCheck, Building2, TrendingUp, Sliders,
  ArrowRight, ShieldCheck, PieChart, Activity, Zap, Pin
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar, Legend } from 'recharts';
import { cn } from '@/lib/utils';

// Zod schemas
const LeadFormSchema = zod.object({
  company: zod.string().min(2, { message: 'Company name required' }),
  name: zod.string().min(2, { message: 'Contact name required' }),
  email: zod.string().email({ message: 'Invalid email address' }),
  phone: zod.string().min(10, { message: 'Phone must be at least 10 numbers' }),
  city: zod.string().min(2, { message: 'City required' }),
  warehousesCount: zod.number().min(1, { message: 'Must be at least 1 warehouse' }),
  notes: zod.string().optional()
});

const AuditRequestSchema = zod.object({
  warehouseId: zod.string().min(1, { message: 'Please select a warehouse' }),
  type: zod.enum(['full', 'cycle', 'spot', 'annual']),
  preferredDate: zod.string().min(1, { message: 'Preferred date required' }),
  notes: zod.string().optional()
});

export default function InvTrackMainApp() {
  const [role, setRole] = useState<'marketing' | 'client' | 'auditor' | 'admin'>('marketing');
  const [tab, setTab] = useState<string>('home');
  
  const [liveCountLines, setLiveCountLines] = useState(countLinesForAud002);
  const [liveRequests, setLiveRequests] = useState(auditRequests);
  const [liveDiscrepancies, setLiveDiscrepancies] = useState(discrepancies);
  const [searchQuery, setSearchQuery] = useState('');

  const { register: regLead, handleSubmit: submitLead, reset: resetLead, formState: { errors: leadErrors } } = useForm({
    resolver: zodResolver(LeadFormSchema),
    defaultValues: { company: '', name: '', email: '', phone: '', city: '', warehousesCount: 1, notes: '' }
  });

  const { register: regAudit, handleSubmit: submitAudit, reset: resetAudit, formState: { errors: auditErrors } } = useForm({
    resolver: zodResolver(AuditRequestSchema),
    defaultValues: { warehouseId: 'w_hyd_01', type: 'full', preferredDate: '2025-10-15', notes: '' }
  });

  const handleLeadSubmit = (data: any) => {
    toast.success('Request sent. We will reply within one working day.');
    resetLead();
    setTab('home');
  };

  const handleAuditRequestSubmit = (data: any) => {
    const selectedWh = warehouses.find(w => w.id === data.warehouseId);
    const newReq = {
      id: `REQ-00${liveRequests.length + 1}`,
      clientName: 'ABC Enterprises',
      warehouseName: selectedWh?.name || 'Selected Warehouse',
      city: selectedWh?.city || 'Hyderabad',
      type: data.type,
      preferredDate: data.preferredDate,
      status: 'pending' as const,
      notes: data.notes
    };
    setLiveRequests([newReq, ...liveRequests]);
    toast.success(`Requested audit created`);
    resetAudit();
    setTab('my_audits');
  };

  const handleUpdateCount = (sku: string, val: string) => {
    const countNum = val === '' ? null : parseInt(val, 10);
    setLiveCountLines(prev => prev.map(line => {
      if (line.sku === sku) {
        const variance = countNum !== null ? countNum - line.systemQty : null;
        const percent = variance !== null ? Math.abs((variance / line.systemQty) * 100) : 0;
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
      onRoleChange={(r) => setRole(r)} 
      activeTab={tab} 
      onTabChange={(t) => setTab(t)}
    >
      <AnimatePresence mode="wait">
        {role === 'marketing' && (
          <motion.div 
            key="marketing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-24 py-12"
          >
            {tab === 'home' && (
              <div className="flex flex-col items-center text-center max-w-[900px] mx-auto space-y-12">
                {/* Hero Badge */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#EEF5FF] text-[#2B7CE9] px-4 py-1.5 rounded-full text-sm font-medium border border-[#2B7CE9]/10 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#2B7CE9] animate-pulse" />
                  See how InvTrack works
                  <ArrowRight size={14} />
                </motion.div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl font-headline font-bold text-[#16202E] leading-tight">
                  Audit warehouse stock <br className="hidden md:block" /> with absolute certainty
                </h1>

                <p className="text-lg text-[#5A6B80] max-w-[700px] leading-relaxed">
                  InvTrack replaces chaotic spreadsheets with high-density physical verify cycles. Freeze quantities, track variances live, and produce reconciled reports instantly.
                </p>

                {/* Hero Actions */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button onClick={() => setTab('request_audit')} size="lg" className="bg-[#16202E] text-white hover:bg-[#16202E]/90 h-14 px-8 text-base rounded-md">
                    Start analyzing free
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                  <Button onClick={() => setTab('how_it_works')} variant="outline" size="lg" className="h-14 px-8 text-base border-[#E3EAF2] hover:bg-slate-50">
                    See a live analysis
                  </Button>
                </div>

                {/* Analysis Preview Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full bg-white rounded-2xl shadow-premium border border-slate-200/60 overflow-hidden text-left"
                >
                  <div className="p-1 flex items-center gap-1.5 bg-slate-50 border-b px-4 py-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#EEF5FF] flex items-center justify-center">
                          <WarehouseIcon size={20} className="text-[#2B7CE9]" />
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-lg">Hyderabad Central Distribution Hub</h3>
                          <div className="flex items-center gap-4 text-xs text-[#8494A8] mt-0.5">
                            <span className="flex items-center gap-1"><Activity size={12} /> Just now</span>
                            <span className="flex items-center gap-1 font-mono text-[10px]"><Zap size={12} /> ₹42,901 Value Impact</span>
                            <span className="flex items-center gap-1"><Users size={12} /> 1,842 SKUs</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#E8F6EF] text-[#12855A] border-none">Good Accuracy</Badge>
                        <Button size="sm" className="bg-[#16202E] text-white h-8 text-[11px] font-bold uppercase tracking-wider">View Full Analysis</Button>
                      </div>
                    </div>

                    {/* Progress Steps Visual */}
                    <div className="relative flex justify-between items-center px-4">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-100 -z-0" />
                      {[
                        { icon: ClipboardList, label: 'Requirements', sub: 'Analyzing scope' },
                        { icon: Building2, label: 'Client', sub: 'Checking history' },
                        { icon: ShieldAlert, label: 'Risk', sub: 'Assessing pilot' },
                        { icon: CheckCircle2, label: 'Match', sub: 'Comparing stock' },
                        { icon: PieChart, label: 'Pricing', sub: 'Estimating range' },
                        { icon: FileText, label: 'Proposal', sub: 'Generating draft' },
                      ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 relative bg-white px-2">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border", i < 4 ? "bg-[#EEF5FF] border-[#2B7CE9]/20 text-[#2B7CE9]" : "bg-white border-slate-200 text-slate-400")}>
                            <step.icon size={18} />
                          </div>
                          <div className="text-center">
                            <div className="text-[11px] font-bold text-[#16202E]">{step.label}</div>
                            <div className="text-[9px] text-[#8494A8]">{step.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary Footer */}
                    <div className="bg-slate-50 rounded-xl p-6 grid grid-cols-5 gap-6 border border-slate-200/40">
                      <div className="col-span-2 flex items-start gap-3 border-r pr-6">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center shrink-0">
                          <Activity size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-[12px] font-bold">AI Insight</div>
                          <p className="text-[11px] text-[#5A6B80] leading-relaxed mt-1">
                            High accuracy detected. No major shortages in Zone A. Recommended cycle count for Zone Cold.
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[20px] font-bold font-headline">99.2%</div>
                        <div className="text-[9px] font-bold text-[#8494A8] uppercase tracking-widest mt-1">Accuracy Score</div>
                      </div>
                      <div className="text-center border-l border-r">
                        <div className="text-[20px] font-bold font-headline text-[#12855A]">Low</div>
                        <div className="text-[9px] font-bold text-[#8494A8] uppercase tracking-widest mt-1">Risk Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[20px] font-bold font-headline text-[#12855A]">Verified</div>
                        <div className="text-[9px] font-bold text-[#8494A8] uppercase tracking-widest mt-1">Report Status</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* How it Works - Centered visual section */}
            {tab === 'home' && (
              <div className="space-y-32">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-headline font-bold text-[#16202E]">How InvTrack Works</h2>
                  <p className="text-[#5A6B80] max-w-[600px] mx-auto leading-relaxed">
                    From a physical warehouse floor to a clear decision — understand the opportunity, research the stock, and audit with confidence.
                  </p>
                </div>

                <div className="relative max-w-[1000px] mx-auto">
                  {/* Decorative Grid Lines */}
                  <div className="absolute inset-0 bg-grid opacity-20 -z-10" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16 items-start px-8">
                    {[
                      { id: '01', pin: 'bg-blue-600', title: 'Scope Analysis', desc: 'Define your warehouse nodes, zones, and count methodology.' },
                      { id: '02', pin: 'bg-green-600', title: 'Agent Dispatch', desc: 'Approved auditors receive the frozen system quantity ledgers.' },
                      { id: '03', pin: 'bg-orange-600', title: 'Floor Execution', desc: 'Field agents count stock using tablet-first optimized sheets.' },
                      { id: '04', pin: 'bg-purple-600', title: 'Discrepancy Loop', desc: 'Automatic variance detection flags leakage for manager review.' },
                      { id: '05', pin: 'bg-indigo-600', title: 'Final Reconciliation', desc: 'Monetary write-off impact is verified and logs are signed.' },
                    ].map((step, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        className={cn(
                          "bg-white p-8 rounded-2xl shadow-premium border border-slate-200/60 relative",
                          i % 2 === 1 ? "mt-24 md:mt-32" : ""
                        )}
                      >
                        <div className={cn("absolute -top-3 left-8 w-1 h-8 rounded-full", step.pin)} />
                        <Pin className={cn("absolute -top-6 left-[26px] size-5", step.pin.replace('bg-', 'text-'))} />
                        
                        <div className="text-4xl font-headline font-bold text-slate-200 mb-4">{step.id}</div>
                        <h3 className="text-xl font-headline font-bold text-[#16202E] mb-2">{step.title}</h3>
                        <p className="text-sm text-[#5A6B80] leading-relaxed">
                          {step.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Simple footer for marketing */}
            <footer className="border-t pt-24 pb-12 space-y-12 max-w-[1200px] mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
                <div className="col-span-2 space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#16202E] flex items-center justify-center">
                      <Zap size={16} className="text-white" />
                    </div>
                    <span className="font-headline font-bold text-xl">InvTrack</span>
                  </div>
                  <p className="text-sm text-[#5A6B80] max-w-[280px] leading-relaxed">
                    AI-powered opportunity intelligence for warehouse managers and logistics networks across India.
                  </p>
                </div>
                {['Product', 'Support', 'Legal', 'Account'].map((cat, i) => (
                  <div key={i} className="space-y-4">
                    <h4 className="text-[12px] font-bold text-[#16202E] uppercase tracking-widest">{cat}</h4>
                    <ul className="space-y-2">
                      {['Link One', 'Link Two', 'Link Three'].map((l, j) => (
                        <li key={j} className="text-sm text-[#5A6B80] hover:text-[#16202E] cursor-pointer">{l}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-[#8494A8]">© 2025 InvTrack. All rights reserved.</p>
                <div className="flex items-center gap-6 text-[10px] font-bold text-[#8494A8] uppercase tracking-widest">
                  <span>AI-powered</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>Secure</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>Built for logistics</span>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {/* Existing Role Content */}
        {role !== 'marketing' && (
          <motion.div 
            key={role}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* 2. CLIENT PORTAL */}
            {role === 'client' && (
              <div className="space-y-8">
                {tab === 'dashboard' && (
                  <>
                    <PageHeader 
                      title="Dashboard" 
                      description="Where every warehouse stands, and what needs a decision from you."
                      actions={<Button onClick={() => setTab('create_audit')} className="bg-[#16202E] text-white hover:bg-[#16202E]/90 rounded-md text-[14px] h-10 px-6 shadow-premium"><Plus size={16} className="mr-2" /> Request count</Button>}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard label="Warehouses" value={3} icon={WarehouseIcon} tone="client" />
                      <StatCard label="Total audits" value={5} icon={ClipboardList} tone="client" />
                      <StatCard label="In progress" value={2} icon={Boxes} tone="client" />
                      <StatCard label="Completed records" value={3} icon={CheckCircle2} tone="client" />
                    </div>

                    <div className="bg-white rounded-xl border shadow-premium overflow-hidden">
                      <div className="px-6 py-4 border-b bg-slate-50/50">
                        <h3 className="font-headline text-[15px] font-bold text-[#16202E]">Recent audits sequence</h3>
                      </div>
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="px-6">Reference</TableHead>
                            <TableHead>Warehouse</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right px-6">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {audits.filter(a => a.clientId === 'cl_abc').map((audit) => (
                            <TableRow key={audit.id} className="hover:bg-slate-50/50">
                              <TableCell className="px-6 font-semibold">{audit.reference}</TableCell>
                              <TableCell>{warehouses.find(w => w.id === audit.warehouseId)?.name}</TableCell>
                              <TableCell className="capitalize text-[13px]">{audit.type}</TableCell>
                              <TableCell><AuditStatusBadge status={audit.status} /></TableCell>
                              <TableCell className="text-right px-6">
                                <Button onClick={() => setTab('discrepancies')} variant="ghost" size="sm" className="h-8 text-[12px] font-bold">View Report</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
                {/* Other client tabs would go here... */}
              </div>
            )}

            {/* 3. AUDITOR PORTAL */}
            {role === 'auditor' && (
              <div className="space-y-6">
                {tab === 'my_audits' && (
                  <>
                    <PageHeader title="My assigned counts" description="Field allocations dispatched to your agent profile." />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <StatCard label="Assigned" value={2} icon={ClipboardList} tone="auditor" />
                      <StatCard label="Active" value={1} icon={Boxes} tone="auditor" />
                      <StatCard label="Completed" value={1} icon={CheckCircle2} tone="auditor" />
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white p-6 rounded-2xl border shadow-premium flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-headline font-bold">AUD-002 &middot; Bhiwandi Hub</h4>
                            <AuditStatusBadge status="in_progress" />
                          </div>
                          <p className="text-sm text-[#5A6B80]">820 lines expected &middot; XYZ Retail Mumbai</p>
                        </div>
                        <Button onClick={() => setTab('start_confirm')} className="bg-[#E0762B] text-white hover:bg-[#c9621d] h-12 px-8 font-bold">Continue counting</Button>
                      </div>
                    </div>
                  </>
                )}

                {tab === 'start_confirm' && (
                  <div className="max-w-[1000px] mx-auto space-y-8">
                    <div className="bg-white p-8 rounded-2xl border shadow-premium sticky top-20 z-10 space-y-4">
                      <div className="flex justify-between items-end">
                        <h2 className="text-3xl font-headline font-bold">Inventory Count Sheet</h2>
                        <div className="text-right">
                          <div className="text-[12px] font-bold text-[#8494A8] uppercase tracking-widest">Progress</div>
                          <div className="text-2xl font-headline font-bold tabular-nums">{countedLinesCount} / 5</div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-[#E0762B] h-full transition-all duration-500" style={{ width: `${(countedLinesCount / 5) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-xs text-[#5A6B80]">Lines outside 2% variance flag instantly in red.</p>
                        <Button onClick={() => setTab('completed')} className="bg-[#16202E] text-white h-10 px-6 font-bold">Finish Audit</Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-premium overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow className="h-14">
                            <TableHead className="px-6 w-[120px]">SKU</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right w-[120px]">System</TableHead>
                            <TableHead className="w-[180px] text-center">Physical Count</TableHead>
                            <TableHead className="text-right w-[120px] px-6">Variance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {liveCountLines.map((line) => (
                            <TableRow key={line.sku} className={cn("h-20", line.isFlagged ? "bg-red-50/50" : "")}>
                              <TableCell className="px-6 font-mono font-bold text-xs">{line.sku}</TableCell>
                              <TableCell>
                                <div className="font-bold text-[#16202E]">{line.itemName}</div>
                                <div className="text-[10px] uppercase font-bold text-[#8494A8] mt-1">{line.zone}</div>
                              </TableCell>
                              <TableCell className="text-right font-mono font-bold text-slate-500">{line.systemQty}</TableCell>
                              <TableCell className="text-center">
                                <Input 
                                  type="number"
                                  inputMode="numeric"
                                  className="w-32 mx-auto text-center h-12 text-xl font-headline font-bold border-2 focus:border-[#E0762B]"
                                  value={line.countedQty ?? ''}
                                  onChange={(e) => handleUpdateCount(line.sku, e.target.value)}
                                />
                              </TableCell>
                              <TableCell className={cn("px-6 text-right font-headline font-bold text-lg tabular-nums", line.isFlagged ? "text-[#C0362C]" : "text-slate-400")}>
                                {line.variance === null ? '-' : (line.variance > 0 ? `+${line.variance}` : line.variance)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. ADMIN PORTAL */}
            {role === 'admin' && (
              <div className="space-y-8">
                {tab === 'dashboard' && (
                  <>
                    <PageHeader title="Admin Operations" description="Monitor accuracy across global clients and auditors." />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard label="Clients" value={12} icon={Users} tone="admin" />
                      <StatCard label="Warehouses" value={8} icon={Building2} tone="admin" />
                      <StatCard label="Auditors" value={15} icon={UserCheck} tone="admin" />
                      <StatCard label="Total Audits" value={28} icon={ClipboardList} tone="admin" />
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PortalShell>
  );
}
