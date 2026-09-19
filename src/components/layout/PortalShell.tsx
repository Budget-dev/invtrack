'use client';

import React, { useState } from 'react';
import { Logo } from '@/components/shared/Logo';
import { cn, initials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Warehouse, Boxes, FilePlus, ClipboardList, 
  ShieldAlert, BarChart3, UserCheck, PlaySquare, FileCheck2, 
  Users, Building2, Sliders, Menu, LogOut, ChevronDown, ChevronsRight,
  Bell, Settings, HelpCircle, User
} from 'lucide-react';

interface PortalShellProps {
  currentRole: 'marketing' | 'client' | 'auditor' | 'admin';
  onRoleChange: (role: 'marketing' | 'client' | 'auditor' | 'admin') => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export function PortalShell({ currentRole, onRoleChange, activeTab, onTabChange, children }: PortalShellProps) {
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
      { id: 'warehouses', name: 'Warehouses', icon: Warehouse },
      { id: 'inventory', name: 'Inventory Ledger', icon: Boxes },
      { id: 'create_audit', name: 'Request Count', icon: FilePlus },
      { id: 'my_audits', name: 'My Audits', icon: ClipboardList },
      { id: 'discrepancies', name: 'Discrepancies', icon: ShieldAlert },
      { id: 'reports', name: 'Reports & Trends', icon: BarChart3 },
    ],
    auditor: [
      { id: 'my_audits', name: 'My Audits', icon: ClipboardList },
      { id: 'today', name: 'Today\'s Audits', icon: PlaySquare },
      { id: 'start_confirm', name: 'Count Sheet', icon: Boxes },
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

  const currentMenu = menuItems[currentRole];

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
                {roleLabels[currentRole]}
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
            <p className="text-[12px] font-semibold text-white">{userNames[currentRole]}</p>
            <p className="text-[10px] truncate text-white/50 uppercase tracking-tight">{userCompanies[currentRole]}</p>
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
                  <h4 className="text-[14px] font-semibold text-[#16202E]">Welcome, {userNames[currentRole]}</h4>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", roleColors[currentRole])}>
                    {userCompanies[currentRole]}
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
                          {initials(userNames[currentRole])}
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
