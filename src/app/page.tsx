'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { toast } from 'sonner';
import { PortalShell } from '@/components/layout/PortalShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { AuditStatusBadge, SeverityBadge, ResolutionBadge } from '@/components/shared/badges';
import { formatCurrency, formatNumber, variancePercent } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  clients, warehouses, inventoryItems, audits, 
  countLinesForAud002, discrepancies, auditRequests, auditors, 
  accuracyTrend, varianceByCategory, VARIANCE_TOLERANCE_PERCENT 
} from '@/data/mock-data';
import { 
  Warehouse as WarehouseIcon, Boxes, ShieldAlert, FileText, 
  Camera, CheckCircle, Plus, ClipboardList, Info, 
  MapPin, CheckCircle2, Users, UserCheck, Building2, TrendingUp, Sliders 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar, Legend } from 'recharts';

// Zod schemas for forms
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
  
  // Local mutable simulation state
  const [liveCountLines, setLiveCountLines] = useState(countLinesForAud002);
  const [liveRequests, setLiveRequests] = useState(auditRequests);
  const [liveDiscrepancies, setLiveDiscrepancies] = useState(discrepancies);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Hooks
  const { register: regLead, handleSubmit: submitLead, reset: resetLead, formState: { errors: leadErrors } } = useForm({
    resolver: zodResolver(LeadFormSchema),
    defaultValues: { company: '', name: '', email: '', phone: '', city: '', warehousesCount: 1, notes: '' }
  });

  const { register: regAudit, handleSubmit: submitAudit, reset: resetAudit, formState: { errors: auditErrors } } = useForm({
    resolver: zodResolver(AuditRequestSchema),
    defaultValues: { warehouseId: 'w_hyd_01', type: 'full', preferredDate: '2025-10-15', notes: '' }
  });

  // Action execution methods
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
    toast.success(`Requested audit created with reference temporary entry`);
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
        return {
          ...line,
          countedQty: countNum,
          variance,
          isFlagged
        };
      }
      return line;
    }));
  };

  const handleApproveRequest = (id: string) => {
    setLiveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
    toast.success('Approved successfully');
  };

  const handleDeclineRequest = (id: string) => {
    setLiveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'declined' as const } : r));
    toast.error('Audit count request declined');
  };

  const countedLinesCount = liveCountLines.filter(l => l.countedQty !== null).length;

  return (
    <PortalShell 
      currentRole={role} 
      onRoleChange={(r) => setRole(r)} 
      activeTab={tab} 
      onTabChange={(t) => setTab(t)}
    >
      {/* 1. MARKETING ENVIRONMENT */}
      {role === 'marketing' && (
        <div className="space-y-16">
          {tab === 'home' && (
            <>
              {/* Hero Band left-aligned */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-6">
                <div className="space-y-6">
                  <p className="text-[#2B7CE9] text-[14px] font-bold tracking-tight uppercase">From stock to clarity</p>
                  <h1 className="font-headline text-[44px] font-bold tracking-tight text-[#16202E] leading-tight">
                    Accurate inventory audits for a stronger tomorrow
                  </h1>
                  <p className="text-[16px] text-[#5A6B80] leading-relaxed max-w-[64ch]">
                    InvTrack runs physical stock audits end to end with zero spreadsheets. Freeze quantities, track real-time physical variances on tablets, and produce certified logs that your finance team will sign off on instantly.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => setTab('request_audit')} className="bg-[#2B7CE9] text-white hover:bg-[#1D6FE0] px-6 h-12 rounded-md font-medium text-[15px]">
                      Request an audit
                    </Button>
                    <Button onClick={() => setTab('how_it_works')} variant="outline" className="border-[#E3EAF2] text-[#16202E] px-6 h-12 rounded-md font-medium text-[15px]">
                      See how it works
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { val: '99.2%', lbl: 'Average stock accuracy achieved after the first full audit cycle' },
                    { val: '6 hrs', lbl: 'Typical operational turnaround from count start to signed reconciliation report' },
                    { val: '1,842', lbl: 'SKUs completely verified and logged in a single day at one central DC' },
                    { val: '4 roles', lbl: 'Connected users operating on one master ledger for supreme visibility' }
                  ].map((tile, i) => (
                    <div key={i} className="bg-white p-5 rounded-[10px] border border-[#E3EAF2] shadow-sm">
                      <h4 className="font-headline text-[28px] font-bold text-[#2B7CE9]">{tile.val}</h4>
                      <p className="text-[13px] text-[#5A6B80] mt-1 leading-normal">{tile.lbl}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Three Workspaces Section */}
              <div className="space-y-6">
                <div className="text-left">
                  <h2 className="font-headline text-[24px] font-bold text-[#16202E]">Three workspaces, one record of the truth</h2>
                  <p className="text-[#5A6B80] text-[14px] mt-1">Explore live simulations of the role workflows by selecting an identity below.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[10px] border-l-4 border-l-[#12855A] border border-[#E3EAF2] space-y-4">
                    <div className="w-9 h-9 rounded bg-[#E8F6EF] text-[#12855A] flex items-center justify-center font-bold">C</div>
                    <h3 className="font-headline text-[18px] font-semibold text-[#16202E]">Client Portal</h3>
                    <p className="text-[14px] text-[#5A6B80]">For warehouse operations managers. Track active audit states, view historical discrepancy catalogs, and trigger new cycle or statutory requests.</p>
                    <button onClick={() => { setRole('client'); setTab('dashboard'); }} className="text-[#12855A] text-[13px] font-bold uppercase tracking-tight block hover:underline">
                      Enter client space
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-[10px] border-l-4 border-l-[#E0762B] border border-[#E3EAF2] space-y-4">
                    <div className="w-9 h-9 rounded bg-[#FDF0E3] text-[#E0762B] flex items-center justify-center font-bold">A</div>
                    <h3 className="font-headline text-[18px] font-semibold text-[#16202E]">Auditor Tablet View</h3>
                    <p className="text-[14px] text-[#5A6B80]">For field agents on the warehouse floor. Large numerical touch controls designed for rapid single-handed entries, direct variance alerts, and offline sync logs.</p>
                    <button onClick={() => { setRole('auditor'); setTab('my_audits'); }} className="text-[#E0762B] text-[13px] font-bold uppercase tracking-tight block hover:underline">
                      Launch field sheet
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-[10px] border-l-4 border-l-[#6D4BC6] border border-[#E3EAF2] space-y-4">
                    <div className="w-9 h-9 rounded bg-[#F0EBFB] text-[#6D4BC6] flex items-center justify-center font-bold">M</div>
                    <h3 className="font-headline text-[18px] font-semibold text-[#16202E]">Admin Operations</h3>
                    <p className="text-[14px] text-[#5A6B80]">For InvTrack internal fulfillment teams. Approve incoming requests, assign field auditors to depots, monitor absolute value leakage, and manage master clients data.</p>
                    <button onClick={() => { setRole('admin'); setTab('dashboard'); }} className="text-[#6D4BC6] text-[13px] font-bold uppercase tracking-tight block hover:underline">
                      Open control desk
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Pillars Band */}
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { title: 'Track', text: 'Monitor live physical counting sequences across multiple regional sites simultaneously.', color: 'bg-[#EEF5FF] text-[#2B7CE9]' },
                  { title: 'Verify', text: 'Ensure absolute accuracy on high-value line items with systematic location isolation.', color: 'bg-[#E8F6EF] text-[#12855A]' },
                  { title: 'Reconcile', text: 'Instantly calculate monetary variance impact values based on fixed cost structures.', color: 'bg-[#FDF0E3] text-[#E0762B]' },
                  { title: 'Grow', text: 'Minimize pilferage, standardize regulatory statutory reporting records, and scale.', color: 'bg-[#F0EBFB] text-[#6D4BC6]' }
                ].map((p, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-headline text-[16px] font-bold ${p.color}`}>
                      {p.title[0]}
                    </div>
                    <h4 className="font-headline text-[16px] font-semibold text-[#16202E]">{p.title}</h4>
                    <p className="text-[13px] text-[#5A6B80] leading-relaxed">{p.text}</p>
                  </div>
                ))}
              </div>

              {/* Pilot Count CTA block */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white p-8 rounded-[10px] border border-[#E3EAF2]">
                <div className="space-y-4">
                  <h3 className="font-headline text-[22px] font-bold text-[#16202E]">Counts your finance team will sign off on</h3>
                  <p className="text-[14px] text-[#5A6B80]">We mitigate discrepancies before they affect quarterly reporting cycles.</p>
                  <ul className="space-y-2 text-[14px] text-[#16202E] font-medium">
                    <li className="flex items-center gap-2 text-[#12855A]"><CheckCircle size={16} /> Strict 2% automated variance tolerance flagging</li>
                    <li className="flex items-center gap-2 text-[#12855A]"><CheckCircle size={16} /> Instant segregation of expired or damaged supply items</li>
                    <li className="flex items-center gap-2 text-[#12855A]"><CheckCircle size={16} /> Fully localized data fixtures formatted for Indian audits</li>
                  </ul>
                </div>
                <div className="bg-[#163E77] text-white p-6 rounded-lg space-y-4">
                  <p className="text-[15px] leading-relaxed font-headline text-slate-100">
                    Book a pilot count on one warehouse. If the generated report does not pay for itself through revealed leakage, walk away with no obligations.
                  </p>
                  <Button onClick={() => setTab('request_audit')} className="bg-[#2B7CE9] hover:bg-[#1D6FE0] text-white font-medium w-full">
                    Schedule sample count
                  </Button>
                </div>
              </div>
            </>
          )}

          {tab === 'about' && (
            <div className="max-w-[680px] mx-auto space-y-6 py-6 text-left">
              <h1 className="font-headline text-[32px] font-bold text-[#16202E]">Born on the warehouse floor</h1>
              <p className="text-[15px] text-[#5A6B80] leading-relaxed">
                InvTrack was conceived during a complex 1,800-SKU physical counting sequence inside a high-density FMCG distribution node outside Hyderabad. Reconciling active system numbers against multi-zone physical counts across three scattered spreadsheets and a chaotic WhatsApp group triggered substantial data leakage.
              </p>
              <p className="text-[15px] text-[#5A6B80] leading-relaxed">
                The counting itself was rarely the primary problem. The systemic failure lived in the post-count processing loop: mapping variances to actual unit values, routing human notes to regional controllers, and isolating damaged batches securely.
              </p>
              <p className="text-[15px] text-[#5A6B80] leading-relaxed">
                Today, InvTrack bridges the operational void between field personnel handling rugged hardware and boardroom operations managers requiring verified, unalterable inventory precision across South India.
              </p>
            </div>
          )}

          {tab === 'services' && (
            <div className="space-y-8 py-6">
              <PageHeader title="Our verification solutions" description="Tailored verification models engineered for high-throughput supply chains." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Full physical count', text: 'Complete warehouse operational shutdown counting. Every single location, rack, shelf, and cold sector is frozen and fully logged.' },
                  { name: 'Cycle counting', text: 'Continuous rolling verification subsets executed daily. Keep your distribution hub fully running without incurring downtime penalties.' },
                  { name: 'Spot checks', text: 'Unannounced, hyper-targeted counts focused on high-pilferage categories or premium electronic zones.' },
                  { name: 'Annual statutory count', text: 'Comprehensive end-of-year verification structured precisely for external chartered accountants and statutory book filings.' },
                  { name: 'Discrepancy investigation', text: 'Deep structural reconciliation tracing lost pallets back to dispatch slips and gate entry logs.' },
                  { name: 'Accuracy programme', text: 'Continuous advisory integration that elevates stock precision parameters from 94% up to a certified 99% line index.' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-[10px] border border-[#E3EAF2] space-y-2">
                    <h3 className="font-headline text-[16px] font-bold text-[#16202E]">{s.name}</h3>
                    <p className="text-[14px] text-[#5A6B80] leading-normal">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'how_it_works' && (
            <div className="max-w-[720px] mx-auto space-y-8 py-6 text-left">
              <PageHeader title="The five-stage audit lifecycle" description="How InvTrack moves inventory from physical location back to absolute data certainty." />
              <div className="space-y-6 relative border-l-2 border-l-[#2B7CE9] pl-6 ml-4">
                {[
                  { step: '1', title: 'Request the audit', text: 'The client logs into their portal, defines the scope by specifying target warehouses, select a verification methodology, and requests parameters.' },
                  { step: '2', title: 'Admin approves and assigns', text: 'The internal operational team validates warehouse availability, freezes the system inventory ledger parameters, and dispatches a verified agent.' },
                  { step: '3', title: 'Auditor counts on site', text: 'The agent utilizes a touch-optimized tablet format directly on the concrete warehouse floor to input physical item quantities.' },
                  { step: '4', title: 'Discrepancies are reconciled', text: 'Variances exceeding the strict 2% parameters automatically route to a centralized reconciliation matrix for financial review.' },
                  { step: '5', title: 'Report is signed off', text: 'Operations managers execute a master review, verify monetary write-off impacts, and export clean files for audit logging.' }
                ].map((item, i) => (
                  <div key={i} className="relative space-y-1">
                    <div className="absolute -left-[37px] top-0 w-6 h-6 rounded-full bg-[#2B7CE9] text-white flex items-center justify-center text-[12px] font-bold">
                      {item.step}
                    </div>
                    <h3 className="font-headline text-[16px] font-semibold text-[#16202E]">{item.title}</h3>
                    <p className="text-[14px] text-[#5A6B80]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'industries' && (
            <div className="space-y-8 py-6">
              <PageHeader title="Sectors we protect" description="Operational verification models configured for industry-specific compliance rules." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'FMCG distribution', desc: 'Manage high-volume retail logistics with systematic batch tracking and absolute carton level matching.' },
                  { title: 'Retail chains', desc: 'Sync multi-location shelf records back to unified distributor distribution centers without manual calculation loss.' },
                  { title: 'Pharma', desc: 'Maintain pristine verification compliance logs with integrated expiry alerts and strict temperature-controlled batch tracking.' },
                  { title: 'Cold chain', desc: 'Minimize bay door opening durations with hyper-fast zone counting optimized for sub-zero environments.' },
                  { title: 'Manufacturing', desc: 'Audit inbound raw materials against physical assembly line intakes to prevent production halting spikes.' },
                  { title: 'Third-party logistics', desc: 'Furnish independent, unalterable inventory verification slips to settle storage billing disputes instantly.' }
                ].map((ind, i) => (
                  <div key={i} className="bg-white p-5 rounded-[10px] border border-[#E3EAF2] space-y-2">
                    <h4 className="font-headline text-[15px] font-bold text-[#16202E]">{ind.title}</h4>
                    <p className="text-[13px] text-[#5A6B80] leading-normal">{ind.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-6">
              <div className="space-y-6 text-left">
                <h2 className="font-headline text-[26px] font-bold text-[#16202E]">Connect with an inventory specialist</h2>
                <p className="text-[14px] text-[#5A6B80]">
                  Our logistics engineering team responds to operational pilot requests within one business day.
                </p>
                <div className="space-y-4 pt-4 text-[14px] text-[#5A6B80]">
                  <p className="flex items-center gap-3"><FileText className="text-[#2B7CE9]" size={18} /> hello@invtrack.app</p>
                  <p className="flex items-center gap-3"><MapPin className="text-[#2B7CE9]" size={18} /> Gachibowli Tech Zone, Hyderabad, India</p>
                  <p className="flex items-center gap-3"><CheckCircle className="text-[#2B7CE9]" size={18} /> +91 90000 00000</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[10px] border border-[#E3EAF2]">
                <h4 className="font-headline text-[16px] font-bold text-[#16202E] mb-4">Request a consultation</h4>
                <form onSubmit={submitLead(handleLeadSubmit)} className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[12px]">Company Name</Label>
                      <Input {...regLead('company')} placeholder="e.g. ABC Enterprises" className="h-10 text-[14px]" />
                      {leadErrors.company && <p className="text-[#C0362C] text-[11px] font-medium">{leadErrors.company.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[12px]">Your Name</Label>
                      <Input {...regLead('name')} placeholder="e.g. Ravi Teja" className="h-10 text-[14px]" />
                      {leadErrors.name && <p className="text-[#C0362C] text-[11px] font-medium">{leadErrors.name.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[12px]">Email</Label>
                      <Input {...regLead('email')} type="email" placeholder="ravi@company.in" className="h-10 text-[14px]" />
                      {leadErrors.email && <p className="text-[#C0362C] text-[11px] font-medium">{leadErrors.email.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[12px]">Phone Number</Label>
                      <Input {...regLead('phone')} placeholder="9000012345" className="h-10 text-[14px]" />
                      {leadErrors.phone && <p className="text-[#C0362C] text-[11px] font-medium">{leadErrors.phone.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[12px]">City Location</Label>
                      <Input {...regLead('city')} placeholder="Hyderabad" className="h-10 text-[14px]" />
                      {leadErrors.city && <p className="text-[#C0362C] text-[11px] font-medium">{leadErrors.city.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[12px]">Warehouses Count</Label>
                      <Input type="number" {...regLead('warehousesCount', { valueAsNumber: true })} className="h-10 text-[14px]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[12px]">What should we know?</Label>
                    <Textarea {...regLead('notes')} placeholder="Stock value, SKU count, when the count is due" className="text-[14px] min-h-[80px]" />
                  </div>
                  <Button type="submit" className="w-full bg-[#2B7CE9] hover:bg-[#1D6FE0] text-white font-medium h-11">
                    Send request
                  </Button>
                </form>
              </div>
            </div>
          )}

          {tab === 'request_audit' && (
            <div className="max-w-[640px] mx-auto space-y-6 py-6 text-left">
              <div className="text-center pb-2">
                <h1 className="font-headline text-[28px] font-bold text-[#16202E]">Book a warehouse validation</h1>
                <p className="text-[14px] text-[#5A6B80] mt-1">Get an extensive stock verification report in under 48 hours.</p>
              </div>
              <div className="bg-white p-6 rounded-[10px] border border-[#E3EAF2]">
                <form onSubmit={submitLead(handleLeadSubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[12px]">Company Entity Name</Label>
                    <Input {...regLead('company')} placeholder="ABC Enterprises Ltd" className="h-10" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[12px]">Primary Contact Name</Label>
                      <Input {...regLead('name')} placeholder="Ravi Teja" className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[12px]">Contact Email</Label>
                      <Input {...regLead('email')} placeholder="ravi@abcent.in" className="h-10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[12px]">Mobile Phone</Label>
                      <Input {...regLead('phone')} placeholder="9845012345" className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[12px]">Primary City Node</Label>
                      <Input {...regLead('city')} placeholder="Hyderabad" className="h-10" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[12px]">Total Site Warehouses to Count</Label>
                    <Input type="number" {...regLead('warehousesCount', { valueAsNumber: true })} className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[12px]">Operational scope details</Label>
                    <Textarea {...regLead('notes')} placeholder="Provide estimated SKU counts, storage configuration, or target count dates" className="min-h-[90px]" />
                  </div>
                  <Button type="submit" className="w-full bg-[#2B7CE9] hover:bg-[#1D6FE0] text-white font-medium h-11">
                    Send validation request
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CLIENT ENVIRONMENT */}
      {role === 'client' && (
        <div className="space-y-8">
          {tab === 'dashboard' && (
            <>
              <PageHeader 
                title="Dashboard" 
                description="Where every warehouse stands, and what needs a decision from you."
                actions={<Button onClick={() => setTab('create_audit')} className="bg-[#2B7CE9] text-white hover:bg-[#1D6FE0] rounded-md text-[14px]"><Plus size={16} className="mr-2" /> Request count</Button>}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Warehouses" value={3} icon={WarehouseIcon} tone="client" />
                <StatCard label="Total audits" value={5} icon={ClipboardList} tone="client" />
                <StatCard label="In progress" value={2} icon={Boxes} tone="client" />
                <StatCard label="Completed records" value={3} icon={CheckCircle2} tone="client" />
              </div>

              {/* Recent audits table */}
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-[#E3EAF2] bg-slate-50/50">
                  <h3 className="font-headline text-[15px] font-bold text-[#16202E]">Recent audits sequence</h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#F7F9FC]">
                      <TableRow>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold">Reference</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold">Warehouse</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold">Type</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold">Scheduled date</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold">Status</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold text-right">Counted lines</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audits.filter(a => a.clientId === 'cl_abc').map((audit) => (
                        <TableRow key={audit.id} className="hover:bg-[#E7EEF6]/60 h-11">
                          <TableCell className="font-semibold text-[#16202E]">{audit.reference}</TableCell>
                          <TableCell>
                            <div className="font-medium text-[#16202E]">
                              {warehouses.find(w => w.id === audit.warehouseId)?.name || audit.warehouseId}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize text-[13px] text-[#5A6B80]">{audit.type}</TableCell>
                          <TableCell className="text-[13px] text-[#5A6B80]">{audit.scheduledDate}</TableCell>
                          <TableCell><AuditStatusBadge status={audit.status} /></TableCell>
                          <TableCell className="text-right font-mono text-[13px] tabular-nums text-[#16202E]">
                            {audit.countedLines} / {audit.totalLines}
                          </TableCell>
                          <TableCell>
                            <Button onClick={() => setTab('discrepancies')} variant="outline" size="sm" className="h-8 text-[12px] border-[#E3EAF2]">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Action notice green card */}
              <div className="bg-[#E8F6EF] text-[#12855A] rounded-[10px] p-5 flex items-start gap-4">
                <Info size={20} className="shrink-0 mt-0.5 text-[#12855A]" />
                <div>
                  <h4 className="font-headline text-[15px] font-bold text-[#12855A]">Next scheduled count program</h4>
                  <p className="text-[14px] mt-1 text-[#12855A]/90 max-w-[80ch]">
                    Vijayawada Depot (VJW-01) has never been physical audited. We strongly recommend requesting an opening cycle count before the upcoming annual close sequence to stabilize database ledgers.
                  </p>
                </div>
              </div>
            </>
          )}

          {tab === 'warehouses' && (
            <>
              <PageHeader title="Warehouses" description="Registered operational facilities linked to your distributor account." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {warehouses.filter(w => w.clientId === 'cl_abc').map((w) => (
                  <div key={w.id} className="bg-white border border-[#E3EAF2] rounded-[10px] p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-headline text-[16px] font-bold text-[#16202E]">{w.name}</h3>
                        <p className="text-[13px] text-[#5A6B80] mt-1">{w.address}</p>
                      </div>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-mono rounded font-bold">
                        {w.code}
                      </span>
                    </div>
                    <div className="border-t border-[#E3EAF2] pt-3 space-y-2 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-[#5A6B80]">SKUs on file:</span>
                        <span className="font-bold tabular-nums">{formatNumber(w.skuCount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A6B80]">Physical zones count:</span>
                        <span className="font-bold tabular-nums">{w.zones}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A6B80]">Station Manager:</span>
                        <span className="font-medium text-[#16202E]">{w.managerName}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[#5A6B80]">Last verified audit:</span>
                        {w.lastAuditedDate ? (
                          <span className="font-semibold text-[#12855A]">{w.lastAuditedDate}</span>
                        ) : (
                          <span className="font-semibold text-[#E0762B] bg-[#FDF0E3] px-2 py-0.5 rounded text-[11px]">Never counted</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'inventory' && (
            <>
              <PageHeader 
                title="Inventory Ledger" 
                description="Frozen system quantities fetched directly from ERP sync nodes."
                actions={<Button variant="outline" className="border-[#E3EAF2] text-[14px]">Import CSV</Button>}
              />
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] p-4 space-y-4 shadow-sm">
                <div className="max-w-sm">
                  <Input 
                    placeholder="Search by SKU, product item or category..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 text-[14px]"
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#F7F9FC]">
                      <TableRow>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold">SKU</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold">Item description</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold">Category</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold">Zone</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold text-right">System quantity</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold text-right">Unit cost</TableHead>
                        <TableHead className="text-[12px] text-[#5A6B80] font-semibold text-right">Total valuation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems
                        .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((item) => (
                          <TableRow key={item.sku} className="hover:bg-[#E7EEF6]/30 h-11">
                            <TableCell className="font-mono text-[12px] font-bold text-slate-700">{item.sku}</TableCell>
                            <TableCell className="font-medium text-[#16202E]">{item.name}</TableCell>
                            <TableCell className="text-[13px] text-[#5A6B80]">{item.category}</TableCell>
                            <TableCell><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">{item.zone}</span></TableCell>
                            <TableCell className="text-right font-mono tabular-nums text-[#16202E]">{item.systemQty} {item.unit}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums text-[#16202E]">{formatCurrency(item.unitValue)}</TableCell>
                            <TableCell className="text-right font-mono font-semibold tabular-nums text-[#16202E]">{formatCurrency(item.systemQty * item.unitValue)}</TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

          {tab === 'create_audit' && (
            <div className="max-w-[640px] mx-auto space-y-6 text-left">
              <PageHeader title="Request count" description="Initiate a targeted physical inventory verify cycle." />
              <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-6 shadow-sm">
                <form onSubmit={submitAudit(handleAuditRequestSubmit)} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Select Target Warehouse Node</Label>
                    <select {...regAudit('warehouseId')} className="w-full h-10 px-3 rounded-md border border-[#E3EAF2] bg-white text-[14px]">
                      {warehouses.filter(w => w.clientId === 'cl_abc').map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Verification Audit Methodology</Label>
                    <select {...regAudit('type')} className="w-full h-10 px-3 rounded-md border border-[#E3EAF2] bg-white text-[14px]">
                      <option value="full">Full count — Every physical SKU location frozen</option>
                      <option value="cycle">Cycle count — Rolling subset matrix, no depot shutdown</option>
                      <option value="spot">Spot check — Target premium or cold chain zones</option>
                      <option value="annual">Annual statutory — Year-end compliance filing record</option>
                    </select>
                    <p className="text-[12px] text-[#5A6B80] bg-slate-50 p-2 rounded">
                      Methodologies dictate baseline quantity freezing metrics deployed during agent dispatching.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Preferred Count Schedule Date</Label>
                    <Input type="date" {...regAudit('preferredDate')} className="h-10 text-[14px]" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Operational instructions for the assigned Auditor</Label>
                    <Textarea {...regAudit('notes')} placeholder="Specify yard access codes, prioritised bays, or site manager shift parameters." className="text-[14px]" />
                  </div>

                  <Button type="submit" className="w-full bg-[#2B7CE9] hover:bg-[#1D6FE0] text-white h-11 font-medium rounded-md">
                    Request audit allocation
                  </Button>
                </form>
              </div>
            </div>
          )}

          {tab === 'my_audits' && (
            <>
              <PageHeader title="My audits program" description="Review ongoing, pending allocation, and historical signed logs." />
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] p-4 shadow-sm">
                <Table>
                  <TableHeader className="bg-[#F7F9FC]">
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Warehouse Site</TableHead>
                      <TableHead>Methodology</TableHead>
                      <TableHead>Scheduled execution</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Accuracy index</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audits.filter(a => a.clientId === 'cl_abc').map(audit => (
                      <TableRow key={audit.id} className="h-11">
                        <TableCell className="font-semibold text-[#16202E]">{audit.reference}</TableCell>
                        <TableCell className="font-medium text-[#16202E]">
                          {warehouses.find(w => w.id === audit.warehouseId)?.name || audit.warehouseId}
                        </TableCell>
                        <TableCell className="uppercase text-[12px] font-medium text-slate-600">{audit.type}</TableCell>
                        <TableCell className="text-[13px] text-[#5A6B80]">{audit.scheduledDate}</TableCell>
                        <TableCell><AuditStatusBadge status={audit.status} /></TableCell>
                        <TableCell className="text-right font-mono font-bold tabular-nums">
                          {audit.accuracy ? `${audit.accuracy}%` : <span className="text-[#8494A8] font-normal font-sans">Pending</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === 'discrepancies' && (
            <>
              <PageHeader title="Tracked discrepancies catalog" description="Line items failing baseline tolerance bounds, flagged for management resolution." />
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-[#F7F9FC]">
                    <TableRow>
                      <TableHead>Item details</TableHead>
                      <TableHead>Audit ref</TableHead>
                      <TableHead>Discrepancy type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead className="text-right">Unit variance</TableHead>
                      <TableHead className="text-right">Financial leak impact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Raised date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveDiscrepancies.map((d) => (
                      <TableRow key={d.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="font-semibold text-[#16202E]">{d.itemName}</div>
                          <div className="font-mono text-[11px] text-slate-50b text-[#5A6B80]">{d.sku}</div>
                        </TableCell>
                        <TableCell className="font-mono text-[13px] font-medium">{d.auditId}</TableCell>
                        <TableCell className="capitalize text-[13px] font-medium text-slate-700">{d.type}</TableCell>
                        <TableCell><SeverityBadge severity={d.severity} /></TableCell>
                        <TableCell className={`text-right font-mono font-bold tabular-nums ${d.variance < 0 ? 'text-[#C0362C]' : 'text-[#12855A]'}`}>
                          {d.variance > 0 ? `+${d.variance}` : d.variance}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-[#16202E] tabular-nums">
                          {formatCurrency(d.valueImpact)}
                        </TableCell>
                        <TableCell><ResolutionBadge status={d.status} /></TableCell>
                        <TableCell className="text-[13px] text-[#5A6B80] whitespace-nowrap">{d.raisedDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === 'reports' && (
            <>
              <PageHeader title="Reports & analytics metrics" description="Statistical variance trends computed over continuous inventory cycles." />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-[10px] border border-[#E3EAF2] shadow-sm">
                  <h3 className="font-headline text-[15px] font-bold text-[#16202E] mb-1">Stock accuracy history</h3>
                  <p className="text-[12px] text-[#5A6B80] mb-4">Percentage of counted inventory lines resting within strict 2% compliance parameters.</p>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={accuracyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF2" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis domain={[94, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="accuracy" stroke="#1D6FE0" strokeWidth={2} fill="#EEF5FF" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[10px] border border-[#E3EAF2] shadow-sm">
                  <h3 className="font-headline text-[15px] font-bold text-[#16202E] mb-1">Variance volume by category</h3>
                  <p className="text-[12px] text-[#5A6B80] mb-4">Shortages vs Unaccounted surpluses counted across product sectors.</p>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={varianceByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF2" />
                        <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="shortage" name="Shortage (units)" fill="#C0362C" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="overage" name="Overage (units)" fill="#12855A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'profile' && (
            <div className="max-w-[640px] mx-auto space-y-6 text-left">
              <PageHeader title="Profile details" description="Manage primary user credentials and linked enterprise parameters." />
              <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-5 shadow-sm space-y-4">
                <h3 className="font-headline text-[16px] font-bold text-[#16202E] border-b pb-2">Your client operator details</h3>
                <div className="grid grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <span className="text-[#5A6B80] block text-[12px]">Full Operator Name</span>
                    <span className="font-semibold text-[#16202E]">Ravi Teja</span>
                  </div>
                  <div>
                    <span className="text-[#5A6B80] block text-[12px]">Designated Email</span>
                    <span className="font-semibold text-[#16202E]">ravi.teja@abcent.in</span>
                  </div>
                  <div>
                    <span className="text-[#5A6B80] block text-[12px]">Registered Mobile</span>
                    <span className="font-semibold text-[#16202E] font-mono">+91 98450 12345</span>
                  </div>
                  <div>
                    <span className="text-[#5A6B80] block text-[12px]">Base Command City</span>
                    <span className="font-semibold text-[#16202E]">Hyderabad, Telangana</span>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-5 shadow-sm space-y-4">
                <h3 className="font-headline text-[16px] font-bold text-[#16202E] border-b pb-2">Organisation linkage</h3>
                <div className="grid grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <span className="text-[#5A6B80] block text-[12px]">Company Legal Structure</span>
                    <span className="font-semibold text-[#16202E]">ABC Enterprises Private Ltd</span>
                  </div>
                  <div>
                    <span className="text-[#5A6B80] block text-[12px]">Primary Logistics Sector</span>
                    <span className="font-semibold text-[#16202E]">FMCG Distribution Networks</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button onClick={() => toast.success('Changes successfully recorded')} className="bg-[#2B7CE9] text-white hover:bg-[#1D6FE0]">
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. AUDITOR ENVIRONMENT */}
      {role === 'auditor' && (
        <div className="space-y-6">
          {tab === 'my_audits' && (
            <>
              <PageHeader title="My assigned counts" description="Field allocations dispatched to your agent profile." />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Assigned Scheduled" value={2} icon={ClipboardList} tone="auditor" />
                <StatCard label="Active In execution" value={1} icon={Boxes} tone="auditor" />
                <StatCard label="Completed records" value={1} icon={CheckCircle2} tone="auditor" />
              </div>
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] p-4 shadow-sm">
                <Table>
                  <TableHeader className="bg-[#F7F9FC]">
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Client & Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Scheduled date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[140px] text-right">Floor Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="h-12">
                      <TableCell className="font-bold">AUD-002</TableCell>
                      <TableCell>
                        <div className="font-semibold">XYZ Retail</div>
                        <div className="text-[12px] text-[#5A6B80]">Bhiwandi Hub (MUM-01)</div>
                      </TableCell>
                      <TableCell className="uppercase text-[12px] font-semibold text-slate-600">Cycle</TableCell>
                      <TableCell className="text-[13px]">22 Sep 2025</TableCell>
                      <TableCell><AuditStatusBadge status="in_progress" /></TableCell>
                      <TableCell className="text-right">
                        <Button onClick={() => setTab('start_confirm')} className="bg-[#E0762B] text-white hover:bg-[#c9621d] h-9 text-[13px] font-medium rounded">
                          Continue counting
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="h-12 opacity-85">
                      <TableCell className="font-bold">AUD-004</TableCell>
                      <TableCell>
                        <div className="font-semibold">ABC Enterprises</div>
                        <div className="text-[12px] text-[#5A6B80]">Medchal Overflow (HYD-02)</div>
                      </TableCell>
                      <TableCell className="uppercase text-[12px] font-semibold text-slate-600">Cycle</TableCell>
                      <TableCell className="text-[13px]">24 Sep 2025</TableCell>
                      <TableCell><AuditStatusBadge status="approved" /></TableCell>
                      <TableCell className="text-right">
                        <Button onClick={() => setTab('today')} variant="outline" className="border-[#E0762B] text-[#E0762B] h-9 text-[13px]">
                          Initialize
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === 'today' && (
            <div className="space-y-6">
              <PageHeader title="Today's floor layout schedule" description={`Active allocations for ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`} />
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-[10px] border border-[#E3EAF2] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-headline text-[18px] font-bold text-[#16202E]">AUD-002</span>
                      <AuditStatusBadge status="in_progress" />
                    </div>
                    <p className="text-[14px] font-semibold text-slate-800 mt-1">XYZ Retail &middot; Bhiwandi Hub</p>
                    <p className="text-[12px] text-[#5A6B80] mt-0.5">820 lines expected &middot; Scheduled for immediate sequence continuation</p>
                  </div>
                  <Button onClick={() => setTab('start_confirm')} className="bg-[#E0762B] text-white hover:bg-[#c9621d] px-5 h-11 text-[14px] font-medium rounded-md self-stretch md:self-auto">
                    Continue execution
                  </Button>
                </div>

                <div className="bg-white p-5 rounded-[10px] border border-[#E3EAF2] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm opacity-90">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-headline text-[18px] font-bold text-[#16202E]">AUD-004</span>
                      <AuditStatusBadge status="approved" />
                    </div>
                    <p className="text-[14px] font-semibold text-slate-800 mt-1">ABC Enterprises &middot; Medchal Overflow</p>
                    <p className="text-[12px] text-[#5A6B80] mt-0.5">640 lines expected &middot; Yard check verification parameter freeze</p>
                  </div>
                  <Button onClick={() => { toast.success('Quantities frozen. Execution sheet initialized.'); setTab('start_confirm'); }} className="bg-slate-900 text-white hover:bg-slate-800 px-5 h-11 text-[14px] font-medium rounded-md self-stretch md:self-auto">
                    Start counting
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'start_confirm' && (
            <div className="space-y-6">
              {/* Sticky Progress layout card at top */}
              <div className="bg-white border border-[#E3EAF2] p-5 rounded-[10px] shadow-sm space-y-3 sticky top-16 z-10">
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-[#5A6B80] font-semibold">Active Count Progress (AUD-002 Bhiwandi)</span>
                  <span className="font-mono font-bold tabular-nums text-[16px]">{countedLinesCount} of 5 rows entered</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#E0762B] h-full transition-all" style={{ width: `${(countedLinesCount / 5) * 100}%` }}></div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <p className="text-[12px] text-[#8494A8]">Bhiwandi Hub, Mumbai &middot; Lines outside 2% variance flag instantly in deep red rows.</p>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 h-8 text-[12px]">
                        Finish and submit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white rounded-md max-w-md border">
                      <DialogHeader>
                        <DialogTitle className="font-headline text-[18px]">Submit physical count log?</DialogTitle>
                        <DialogDescription className="text-[14px] text-[#5A6B80] pt-2">
                          This action transmits {countedLinesCount} entered line parameters directly to operations admin desk. Absolute variances breaching the 2% parameter index will invoke formal discrepancies.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" size="sm">Cancel</Button>
                        <Button onClick={() => { toast.success('Audit sheets securely logged. Discrepancy matrices populated.'); setTab('completed'); }} size="sm" className="bg-[#E0762B] text-white">
                          Confirm transmission
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* The high-density concrete-floor ready table workspace */}
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-[#F7F9FC]">
                    <TableRow>
                      <TableHead className="w-[110px]">SKU</TableHead>
                      <TableHead>Item description</TableHead>
                      <TableHead className="w-[90px]">Zone</TableHead>
                      <TableHead className="text-right w-[100px]">System qty</TableHead>
                      <TableHead className="w-[140px] text-center">Physical count</TableHead>
                      <TableHead className="text-right w-[100px]">Live variance</TableHead>
                      <TableHead className="w-[90px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveCountLines.map((line) => {
                      return (
                        <TableRow key={line.sku} className={cn("h-14 transition-colors", line.isFlagged ? "bg-red-50/80 hover:bg-red-50" : "hover:bg-slate-50/50")}>
                          <TableCell className="font-mono text-[12px] font-bold text-slate-700">{line.sku}</TableCell>
                          <TableCell>
                            <div className="font-medium text-[#16202E] text-[14px]">{line.itemName}</div>
                          </TableCell>
                          <TableCell>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium font-sans">
                              {line.zone}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-[14px] font-medium text-slate-600 tabular-nums">
                            {line.systemQty}
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            <Input 
                              type="number"
                              inputMode="numeric"
                              placeholder="0"
                              value={line.countedQty ?? ''}
                              onChange={(e) => handleUpdateCount(line.sku, e.target.value)}
                              className="w-24 mx-auto text-center font-mono font-bold text-[16px] h-10 border-2 border-slate-300 focus-visible:ring-[#E0762B]"
                            />
                          </TableCell>
                          <TableCell className={cn("text-right font-mono font-bold text-[15px] tabular-nums", line.variance === null ? "text-[#8494A8] font-normal" : line.variance < 0 ? "text-[#C0362C]" : "text-[#12855A]")}>
                            {line.variance === null ? '-' : line.variance > 0 ? `+${line.variance}` : line.variance}
                            {line.isFlagged && <span className="block text-[10px] text-[#C0362C] font-sans font-bold uppercase tracking-tight">&gt;2% threshold</span>}
                          </TableCell>
                          <TableCell className="text-right p-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => toast.success('Camera scope simulation engaged')} className="h-9 w-9 text-slate-500 hover:text-slate-800" aria-label="Capture item photo">
                                <Camera size={16} />
                              </Button>
                              <Button onClick={() => toast.success(`SKU ${line.sku} saved locally`)} size="sm" className="bg-[#E0762B] text-white hover:bg-[#c9621d] h-8 text-[12px] font-medium px-2.5">
                                Save
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {tab === 'discrepancies' && (
            <>
              <PageHeader title="Logged client variances" description="Recorded line deviations uploaded back to master operations workspace." />
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-[#F7F9FC]">
                    <TableRow>
                      <TableHead>Client account</TableHead>
                      <TableHead>SKU / Item description</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Notes record</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveDiscrepancies.slice(0, 3).map((d, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-semibold">ABC Enterprises</TableCell>
                        <TableCell>
                          <div className="font-medium text-[#16202E]">{d.itemName}</div>
                          <div className="font-mono text-[11px] text-slate-500">{d.sku}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-[#C0362C] tabular-nums">{d.variance}</TableCell>
                        <TableCell><SeverityBadge severity={d.severity} /></TableCell>
                        <TableCell className="text-[13px] text-[#5A6B80] max-w-[32ch] truncate">{d.auditorNotes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === 'completed' && (
            <div className="space-y-4">
              <PageHeader title="Completed verification logs" description="Signed count logs stored on device ledger." />
              <div className="bg-white p-5 rounded-[10px] border border-[#E3EAF2] shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-headline text-[15px] font-bold">AUD-001 &middot; ABC Enterprises</h4>
                  <p className="text-[12px] text-[#5A6B80] mt-0.5">Hyderabad Central DC &middot; 1,842 of 1,842 line rows successfully counted</p>
                </div>
                <div className="text-right">
                  <span className="text-[12px] text-[#5A6B80] block font-medium">Final accuracy</span>
                  <span className="font-headline text-[20px] font-bold text-[#12855A]">99.2%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ADMIN ENVIRONMENT */}
      {role === 'admin' && (
        <div className="space-y-8">
          {tab === 'dashboard' && (
            <>
              <PageHeader title="Operations control desk" description="Requests waiting on approval, counts running right now, and how accuracy is trending." />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Clients accounts" value={12} icon={Users} tone="admin" />
                <StatCard label="Warehouses onboarded" value={8} icon={Building2} tone="admin" />
                <StatCard label="Field agents active" value={15} icon={UserCheck} tone="admin" />
                <StatCard label="Total audits handled" value={28} icon={ClipboardList} tone="admin" />
              </div>

              {/* Incoming requests queue block */}
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-[#E3EAF2] bg-slate-50/50">
                  <h3 className="font-headline text-[15px] font-bold text-[#16202E]">Recent audit requests loop</h3>
                </div>
                <Table>
                  <TableHeader className="bg-[#F7F9FC]">
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Warehouse node</TableHead>
                      <TableHead>Methodology</TableHead>
                      <TableHead>Preferred schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[180px] text-right">Operations actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveRequests.map((req) => (
                      <TableRow key={req.id} className="h-12">
                        <TableCell className="font-semibold text-[#16202E]">{req.clientName}</TableCell>
                        <TableCell>
                          <div className="font-medium">{req.warehouseName}</div>
                          <div className="text-[11px] text-[#5A6B80]">{req.city}</div>
                        </TableCell>
                        <TableCell className="uppercase text-[12px] font-semibold text-slate-600">{req.type}</TableCell>
                        <TableCell className="text-[13px] text-[#5A6B80]">{req.preferredDate}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[12px] font-medium inline-block",
                            req.status === 'pending' ? "bg-[#FFF8E6] text-[#B5730F]" : req.status === 'approved' ? "bg-[#E8F6EF] text-[#12855A]" : "bg-slate-100 text-slate-500"
                          )}>
                            {req.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right p-2">
                          {req.status === 'pending' ? (
                            <div className="flex gap-1.5 justify-end">
                              <Button onClick={() => handleDeclineRequest(req.id)} size="sm" variant="outline" className="h-8 text-[12px] text-[#C0362C] border-red-200 hover:bg-red-50">
                                Decline
                              </Button>
                              <Button onClick={() => handleApproveRequest(req.id)} size="sm" className="h-8 text-[12px] bg-slate-900 text-white">
                                Approve
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[12px] text-[#8494A8] font-medium pr-2">Processed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === 'clients' && (
            <>
              <PageHeader title="Client ledger" description="Registered enterprise partnerships active within the validation environment." />
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-[#F7F9FC]">
                    <TableRow>
                      <TableHead>Client account</TableHead>
                      <TableHead>Logistics sector</TableHead>
                      <TableHead>Base region</TableHead>
                      <TableHead>Primary contact point</TableHead>
                      <TableHead className="text-right">Sites count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Onboarded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((c) => (
                      <TableRow key={c.id} className="h-12">
                        <TableCell className="font-bold text-[#16202E]">{c.name}</TableCell>
                        <TableCell className="text-[13px] text-[#5A6B80]">{c.industry}</TableCell>
                        <TableCell className="text-[13px] text-[#5A6B80]">{c.city}</TableCell>
                        <TableCell>
                          <div className="font-medium text-[#16202E]">{c.contactName}</div>
                          <div className="text-[11px] font-mono text-[#8494A8]">{c.contactEmail}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold tabular-nums text-[#16202E]">{c.warehouseCount}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase",
                            c.status === 'active' ? "bg-[#E8F6EF] text-[#12855A]" : "bg-[#FFF8E6] text-[#B5730F]"
                          )}>
                            {c.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] text-[#5A6B80]">{c.onboardedDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === 'warehouses' && (
            <>
              <PageHeader title="Global monitored warehouses" description="Master manifest tracking every distribution location across all registered brand nodes." />
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-[#F7F9FC]">
                    <TableRow>
                      <TableHead>Location description</TableHead>
                      <TableHead>Client partner</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>City Node</TableHead>
                      <TableHead className="text-right">SKUs indexed</TableHead>
                      <TableHead>Last audit stamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.map((w) => (
                      <TableRow key={w.id} className="h-12">
                        <TableCell className="p-3">
                          <div className="font-semibold text-[#16202E]">{w.name}</div>
                          <div className="text-[11px] text-[#5A6B80] truncate max-w-[36ch]">{w.address}</div>
                        </TableCell>
                        <TableCell className="font-medium text-[#16202E]">
                          {clients.find(c => c.id === w.clientId)?.name || 'InvTrack Enterprise'}
                        </TableCell>
                        <TableCell><span className="font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded">{w.code}</span></TableCell>
                        <TableCell className="text-[13px] text-[#5A6B80]">{w.city}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-semibold">{formatNumber(w.skuCount)}</TableCell>
                        <TableCell>
                          {w.lastAuditedDate ? (
                            <span className="text-[#12855A] font-semibold text-[13px]">{w.lastAuditedDate}</span>
                          ) : (
                            <span className="text-[#E0762B] text-[11px] font-bold bg-[#FDF0E3] px-2 py-0.5 rounded">Never counted</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === 'auditors' && (
            <>
              <PageHeader title="Field agents roster" description="Dispatched verification specialists certified for floor execution." />
              <div className="bg-white rounded-[10px] border border-[#E3EAF2] overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-[#F7F9FC]">
                    <TableRow>
                      <TableHead>Agent identity</TableHead>
                      <TableHead>Contact phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined track</TableHead>
                      <TableHead>Last active record</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditors.map((aud) => (
                      <TableRow key={aud.id} className="h-12">
                        <TableCell>
                          <div className="font-bold text-[#16202E]">{aud.name}</div>
                          <div className="text-[11px] font-mono text-[#5A6B80]">{aud.email}</div>
                        </TableCell>
                        <TableCell className="font-mono text-[13px] text-slate-700">{aud.phone}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase",
                            aud.status === 'active' ? "bg-[#E8F6EF] text-[#12855A]" : "bg-slate-100 text-slate-600"
                          )}>
                            {aud.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] text-[#5A6B80]">{aud.joinedDate}</TableCell>
                        <TableCell className="text-[13px] text-slate-800 font-medium">{aud.lastActiveDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === 'settings' && (
            <div className="max-w-[640px] mx-auto space-y-6 text-left">
              <PageHeader title="System parameters" description="Configure core thresholds for automated compliance reporting." />
              <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-5 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-headline text-[15px] font-bold">Count variance tolerance bound</h3>
                  <p className="text-[13px] text-[#5A6B80]">Deviations exceeding this fixed percentage automatically invoke formal monetary discrepancy logs on agent tablets.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Input type="number" defaultValue={2} className="w-24 text-center font-mono font-bold" />
                  <span className="text-[14px] font-semibold text-slate-700">% Maximum Allowed Parameter</span>
                </div>
                <div className="border-t pt-3">
                  <Button onClick={() => toast.success('Tolerance configurations locked')} className="bg-[#2B7CE9] text-white">
                    Lock configuration
                  </Button>
                </div>
              </div>

              <div className="bg-white border border-[#E3EAF2] rounded-[10px] p-5 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-headline text-[15px] font-bold">Operations incident inbox</h3>
                  <p className="text-[13px] text-[#5A6B80]">Critical high-value leakage records replicate immediately to this destination.</p>
                </div>
                <Input defaultValue="ops@invtrack.app" className="max-w-md h-10 font-mono" />
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => toast.success('Test alert generated')} variant="outline" size="sm">
                    Send test notification
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PortalShell>
  );
}
