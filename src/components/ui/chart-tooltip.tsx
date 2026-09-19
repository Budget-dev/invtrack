"use client";

import { CSSProperties, ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * High-fidelity Tooltip component for data visualization highlights.
 * Used for decorative "live-data" feel on marketing pages.
 */
export function TooltipDemo({
  indicator = "dot",
  label,
  payload,
  hideLabel,
  hideIndicator,
  className,
}: {
  label: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  payload: {
    name: string;
    value: number | string;
    fill: string;
  }[];
  nameKey?: string;
  labelKey?: string;
} & ComponentProps<"div">) {
  const tooltipLabel = hideLabel ? null : (
    <div className="font-headline font-semibold text-[11px] uppercase tracking-wider text-[#5A6B80] mb-1">{label}</div>
  );

  if (!payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "grid min-w-[9rem] items-start gap-1.5 rounded-lg border border-[#E3EAF2] bg-white p-3 text-xs shadow-card transition-all duration-300 hover:-translate-y-1",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-2">
        {payload.map((item, index) => {
          const indicatorColor = item.fill;

          return (
            <div
              key={index}
              className={cn(
                "flex w-full items-stretch gap-2",
                indicator === "dot" && "items-center",
              )}
            >
              <>
                {!hideIndicator && (
                  <div
                    className={cn("shrink-0 rounded-sm", {
                      "h-2 w-2": indicator === "dot",
                      "w-1": indicator === "line",
                      "w-0 border-[1.5px] border-dashed bg-transparent":
                        indicator === "dashed",
                      "my-0.5": nestLabel && indicator === "dashed",
                    })}
                    style={
                      {
                        backgroundColor:
                          indicator === "dashed"
                            ? "transparent"
                            : indicatorColor,
                        borderColor: indicatorColor,
                      } as CSSProperties
                    }
                  />
                )}
                <div
                  className={cn(
                    "flex flex-1 justify-between leading-none items-center",
                    nestLabel ? "items-end" : "items-center",
                  )}
                >
                  <div className="grid gap-1">
                    {nestLabel ? tooltipLabel : null}
                    <span className="text-[#5A6B80] font-medium text-[13px]">{item.name}</span>
                  </div>
                  <span className="font-code font-bold text-[#16202E] tabular-nums text-[13px]">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </span>
                </div>
              </>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FloatingDataDecoration({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* Shortage Tooltip */}
      <div className="absolute top-[10%] left-[10%] z-20">
        <TooltipDemo
          label="Live Variance"
          payload={[
            { name: "Shortage", value: -15, fill: "#C0362C" },
            { name: "Value Impact", value: "₹12,750", fill: "#16202E" },
          ]}
          indicator="dot"
        />
      </div>

      {/* Accuracy Tooltip */}
      <div className="absolute bottom-[20%] right-[15%] z-20">
        <TooltipDemo
          label="HYD-01 Status"
          payload={[
            { name: "Accuracy", value: "99.2%", fill: "#12855A" },
            { name: "Lines", value: 1842, fill: "#2B7CE9" },
          ]}
          indicator="line"
        />
      </div>

      {/* Audit Progress Tooltip */}
      <div className="absolute top-[40%] right-[5%] z-20">
        <TooltipDemo
          label="Current Count"
          payload={[
            { name: "AUD-002", value: "62%", fill: "#E0762B" },
          ]}
          indicator="dashed"
        />
      </div>

      {/* Decorative SVG Line */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-10" viewBox="0 0 400 400">
        <path d="M50 50 Q 200 150 350 350" stroke="#2B7CE9" strokeWidth="2" fill="none" strokeDasharray="5 5" />
        <path d="M350 50 Q 150 200 50 350" stroke="#12855A" strokeWidth="2" fill="none" strokeDasharray="5 5" />
      </svg>
    </div>
  );
}
