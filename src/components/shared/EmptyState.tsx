import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-[#E3EAF2] rounded-[10px] p-8 text-center bg-white my-4">
      <div className="w-12 h-12 rounded-full bg-[#EEF5FF] text-[#2B7CE9] flex items-center justify-center mx-auto mb-4">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <h3 className="font-headline text-[16px] font-semibold text-[#16202E] mb-1">{title}</h3>
      <p className="text-[14px] text-[#5A6B80] max-w-[50ch] mx-auto mb-5">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}