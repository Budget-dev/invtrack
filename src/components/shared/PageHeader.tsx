import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#E3EAF2] mb-6">
      <div>
        <h1 className="font-headline text-[30px] font-semibold text-[#16202E] tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[14px] text-[#5A6B80] mt-1 max-w-[72ch]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
