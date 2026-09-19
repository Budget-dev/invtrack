import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone: 'brand' | 'client' | 'auditor' | 'admin' | 'danger';
}

export function StatCard({ label, value, hint, icon: Icon, tone }: StatCardProps) {
  const badgeColors = {
    brand: 'bg-[#EEF5FF] text-[#2B7CE9]',
    client: 'bg-[#E8F6EF] text-[#12855A]',
    auditor: 'bg-[#FDF0E3] text-[#E0762B]',
    admin: 'bg-[#F0EBFB] text-[#6D4BC6]',
    danger: 'bg-[#FDF2F2] text-[#C0362C]'
  };

  return (
    <Card className="border-[#E3EAF2] bg-white rounded-[10px] shadow-sm overflow-hidden">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[14px] text-[#5A6B80] font-medium">{label}</p>
          <h3 className="font-headline text-[30px] font-semibold tracking-tight text-[#16202E] tabular-nums">
            {value}
          </h3>
          {hint && <p className="text-[12px] text-[#8494A8]">{hint}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${badgeColors[tone]}`}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
      </CardContent>
    </Card>
  );
}
