
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({
  number,
  title,
  description,
  colorTheme = "blue",
  className,
  rotate,
  colors: customColors,
}: CardProps) => {
  const defaultBgColors = {
    orange: "bg-[#FDF0E3]",
    blue: "bg-[#EEF5FF]",
    purple: "bg-[#F0EBFB]",
  };
  const defaultTextColors = {
    orange: "text-[#E0762B]",
    blue: "text-[#2B7CE9]",
    purple: "text-[#6D4BC6]",
  };
  const defaultBorderColors = {
    orange: "border-[#E0762B]/20",
    blue: "border-[#2B7CE9]/20",
    purple: "border-[#6D4BC6]/20",
  };

  const bgColor = customColors?.bg || defaultBgColors[colorTheme];
  const textColor = customColors?.text || defaultTextColors[colorTheme];
  const borderColor = customColors?.border || defaultBorderColors[colorTheme];

  return (
    <div
      className={cn(
        "relative w-full md:w-[300px] transition-transform duration-300 hover:z-30 hover:scale-105",
        rotate,
        className
      )}
    >
      <div className="bg-white p-2 rounded-[25px] shadow-premium border border-[#E3EAF2]">
        <Pin className={cn("w-8 h-8 z-20 mb-6 mx-auto", textColor)} />
        <div
          className={cn(
            "border rounded-[15px] p-[20px] h-full flex flex-col relative overflow-hidden",
            bgColor,
            borderColor
          )}
        >
          <span
            className={cn("text-4xl font-headline mb-5 opacity-40", textColor)}
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {number}
          </span>
          <h3 className="text-2xl font-headline font-bold text-[#16202E] leading-tight mb-2">
            {title}
          </h3>
          <p className="text-[#5A6B80] text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export interface Step {
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
}

export interface HowItWorksProps {
  features: Step[];
  className?: string;
}

const DEFAULT_CARD_POSITIONS = [
  { className: "md:absolute md:top-0 md:left-[10%]", rotate: "rotate-6" },
  { className: "md:absolute md:top-[120px] md:right-[10%]", rotate: "-rotate-6" },
  { className: "md:absolute md:top-[450px] md:left-[12%]", rotate: "rotate-4" },
  { className: "md:absolute md:top-[570px] md:right-[8%]", rotate: "-rotate-4" },
  { className: "md:absolute md:top-[850px] md:left-[10%]", rotate: "rotate-6" },
];

export default function HowItWorks({
  features,
  className,
}: HowItWorksProps) {
  const positions = DEFAULT_CARD_POSITIONS;
  const height = 1130;

  return (
    <div className={cn("relative py-24 bg-white overflow-hidden", className)}>
      {/* Background Grid Styling matches Hero */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
          backgroundSize: "100% 32px",
          marginTop: "4px",
        }}
      ></div>
      
      <div className="max-w-6xl mx-auto relative z-10 px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-[#2B7CE9] text-[13px] font-bold tracking-widest uppercase">The Ledger of Truth</span>
            <h2 className="text-4xl font-headline font-bold text-[#16202E]">5-Stage Audit Lifecycle</h2>
            <p className="text-[#5A6B80] text-lg">Replacing chaotic spreadsheets with a single secure record of physical verify cycles.</p>
        </div>

        <div
          className="relative w-full max-w-[1000px] mx-auto flex flex-col space-y-8 md:space-y-0 md:block"
          style={{ minHeight: `${height}px` }}
        >
          {features.length > 1 && (
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block z-0"
              viewBox={`0 0 1000 ${height}`}
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 290 150 C 500 150, 550 270, 710 270 C 850 270, 500 350, 290 450 C 290 600, 550 720, 750 720 C 950 720, 500 800, 290 850"
                stroke="#2B7CE9"
                strokeWidth="2"
                strokeDasharray="8 6"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -140 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="opacity-20"
              />
            </svg>
          )}

          {features.map((step, index) => {
            const position = positions[index % positions.length];
            return (
              <Card
                key={step.title}
                number={`0${index + 1}`}
                title={step.title}
                description={step.description}
                colorTheme={step.colorTheme}
                rotate={position.rotate}
                className={position.className}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
