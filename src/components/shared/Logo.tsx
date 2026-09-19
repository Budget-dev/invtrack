import React from 'react';

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
