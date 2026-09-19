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
  Users, Building2, Sliders, Menu, LogOut, Briefcase
} from 'lucide-react';

interface PortalShellProps {
  currentRole: 'marketing' | 'client' | 'auditor' | 'admin';
  onRoleChange: (role: 'marketing' | 'client' | 'auditor' | 'admin') => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export function PortalShell({ currentRole, onRoleChange, activeTab, onTabChange, children }: PortalShellProps) {
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
      { id: 'create_audit', name: 'Request count', icon: FilePlus },
      { id: 'my_audits', name: 'My audits', icon: ClipboardList },
      { id: 'discrepancies', name: 'Discrepancies', icon: ShieldAlert },
      { id: 'reports', name: 'Reports & trends', icon: BarChart3 },
      { id: 'profile', name: 'Profile details', icon: UserCheck }
    ],
    auditor: [
      { id: 'my_audits', name: 'My assigned counts', icon: ClipboardList },
      { id: 'today', name: 'Today\'s audits', icon: PlaySquare },
      { id: 'start_confirm', name: 'Count execution sheet', icon: Boxes },
      { id: 'discrepancies', name: 'Discrepancies logged', icon: ShieldAlert },
      { id: 'completed', name: 'Completed logs', icon: FileCheck2 }
    ],
    admin: [
      { id: 'dashboard', name: 'Operations control', icon: LayoutDashboard },
      { id: 'clients', name: 'Client ledger', icon: Users },
      { id: 'warehouses', name: 'Global warehouses', icon: Building2 },
      { id: 'auditors', name: 'Field agents roster', icon: UserCheck },
      { id: 'requests', name: 'Audit requests queue', icon: FilePlus },
      { id: 'inventory', name: 'Master items view', icon: Boxes },
      { id: 'settings', name: 'System parameters', icon: Sliders }
    ]
  };

  const currentMenu = currentRole !== 'marketing' ? menuItems[currentRole] : [];

  const handleSignOut = () => {
    toast.success('Signed out securely');
    onRoleChange('marketing');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#163E77] text-[#CBD9EC]">
      <div className="p-6 border-b border-white/10">
        <Logo />
        <p className="text-[12px] font-semibold text-[#8FB4E8] tracking-wider mt-1.5 uppercase">
          {roleLabels[currentRole]}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
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
                "w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium rounded-md transition-colors text-left",
                isActive 
                  ? "bg-white/10 text-white font-semibold" 
                  : "hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} strokeWidth={1.75} />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="bg-black/20 rounded-md p-3 text-[12px] text-white/70">
          <p className="font-semibold text-white">{userNames[currentRole]}</p>
          <p className="truncate text-white/50">{userCompanies[currentRole]}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-colors text-left"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      {/* Simulation control ribbon for rapid evaluation */}
      <div className="bg-slate-900 text-white text-[12px] px-4 py-2 flex items-center justify-between shrink-0 font-sans border-b border-black">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-wider text-amber-400">DEMO SWITCHER:</span>
          <span>Click tabs to swap between public view and the 3 live persona environments:</span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => { onRoleChange('marketing'); onTabChange('home'); }} 
            className={cn("px-2.5 py-0.5 rounded text-[11px] uppercase font-bold", currentRole === 'marketing' ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700")}
          >
            Public Site
          </button>
          <button 
            onClick={() => { onRoleChange('client'); onTabChange('dashboard'); }} 
            className={cn("px-2.5 py-0.5 rounded text-[11px] uppercase font-bold", currentRole === 'client' ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700")}
          >
            Client Portal
          </button>
          <button 
            onClick={() => { onRoleChange('auditor'); onTabChange('my_audits'); }} 
            className={cn("px-2.5 py-0.5 rounded text-[11px] uppercase font-bold", currentRole === 'auditor' ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700")}
          >
            Auditor Portal
          </button>
          <button 
            onClick={() => { onRoleChange('admin'); onTabChange('dashboard'); }} 
            className={cn("px-2.5 py-0.5 rounded text-[11px] uppercase font-bold", currentRole === 'admin' ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700")}
          >
            Admin Control
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Fixed Sidebar */}
        {currentRole !== 'marketing' && (
          <aside className="hidden lg:block w-[256px] fixed top-[41px] bottom-0 left-0 border-r border-[#E3EAF2] z-20 overflow-y-auto">
            <SidebarContent />
          </aside>
        )}

        <div className={cn("flex-1 flex flex-col min-w-0 overflow-y-auto", currentRole !== 'marketing' ? "lg:pl-[256px]" : "")}>
          {/* Topbar sticky component */}
          <header className="h-16 sticky top-0 bg-white border-b border-[#E3EAF2] z-30 px-6 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              {currentRole !== 'marketing' && (
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
              )}

              {currentRole === 'marketing' ? (
                <div className="flex items-center gap-8">
                  <Logo />
                  <nav className="hidden md:flex items-center gap-6">
                    <button onClick={() => onTabChange('home')} className={cn("text-[14px] font-medium", activeTab === 'home' ? "text-[#2B7CE9] font-semibold" : "text-[#5A6B80] hover:text-[#16202E]")}>Home</button>
                    <button onClick={() => onTabChange('about')} className={cn("text-[14px] font-medium", activeTab === 'about' ? "text-[#2B7CE9] font-semibold" : "text-[#5A6B80] hover:text-[#16202E]")}>About</button>
                    <button onClick={() => onTabChange('services')} className={cn("text-[14px] font-medium", activeTab === 'services' ? "text-[#2B7CE9] font-semibold" : "text-[#5A6B80] hover:text-[#16202E]")}>Services</button>
                    <button onClick={() => onTabChange('how_it_works')} className={cn("text-[14px] font-medium", activeTab === 'how_it_works' ? "text-[#2B7CE9] font-semibold" : "text-[#5A6B80] hover:text-[#16202E]")}>How it works</button>
                    <button onClick={() => onTabChange('industries')} className={cn("text-[14px] font-medium", activeTab === 'industries' ? "text-[#2B7CE9] font-semibold" : "text-[#5A6B80] hover:text-[#16202E]")}>Industries</button>
                    <button onClick={() => onTabChange('contact')} className={cn("text-[14px] font-medium", activeTab === 'contact' ? "text-[#2B7CE9] font-semibold" : "text-[#5A6B80] hover:text-[#16202E]")}>Contact</button>
                  </nav>
                </div>
              ) : (
                <div>
                  <h4 className="text-[14px] font-semibold text-[#16202E]">
                    Welcome, {userNames[currentRole]}
                  </h4>
                  <p className={cn("text-[12px] font-medium uppercase tracking-tight", roleColors[currentRole])}>
                    {userCompanies[currentRole]} &middot; {roleLabels[currentRole]}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentRole === 'marketing' ? (
                <>
                  <Button variant="ghost" onClick={() => { onRoleChange('client'); onTabChange('dashboard'); }} className="text-[14px] font-medium text-[#5A6B80] hover:text-[#16202E]">Log in</Button>
                  <Button onClick={() => onTabChange('request_audit')} className="bg-[#2B7CE9] text-white hover:bg-[#1D6FE0] rounded-md text-[14px] font-medium">Request an audit</Button>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-slate-100 border p-0 focus-visible:ring-offset-2">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-[13px] font-semibold bg-[#EEF5FF] text-[#2B7CE9]">
                          {initials(userNames[currentRole])}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white rounded-md shadow-lg border border-[#E3EAF2]">
                    <DropdownMenuLabel className="font-headline text-[13px] text-[#16202E]">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-[14px] text-[#5A6B80] focus:bg-slate-50 cursor-pointer" onClick={() => onTabChange('profile')}>Account settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-[14px] text-[#5A6B80] focus:bg-slate-50 cursor-pointer" onClick={() => { onRoleChange('admin'); onTabChange('settings'); }}>System setup</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-[14px] text-rose-600 focus:bg-rose-50 font-medium cursor-pointer">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          {/* Main workspace arena */}
          <main className="flex-1 p-6 md:p-8 max-w-[1320px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}