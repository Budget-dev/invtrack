
"use client";

import { CSSProperties, ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * High-fidelity Tooltip component for data visualization highlights.
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
} & ComponentProps<"div">) {
  const tooltipLabel = hideLabel ? null : (
    <div className="font-headline font-semibold text-[10px] uppercase tracking-wider text-[#5A6B80] mb-1.5">{label}</div>
  );

  if (!payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "grid min-w-[9rem] items-start gap-1 rounded-xl border border-[#E3EAF2] bg-white p-3 text-xs shadow-premium transition-all duration-300 hover:-translate-y-1",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
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
                    <span className="text-[#5A6B80] font-medium text-[12px]">{item.name}</span>
                  </div>
                  <span className="font-code font-bold text-[#16202E] tabular-nums text-[12px]">
                    {item.value.toLocaleString()}
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
      {/* Live Variance Tooltip */}
      <div className="absolute top-[0%] left-[-10%] z-20">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 193 40"
            width="80"
            height="20"
            fill="none"
            className="absolute -bottom-6 -right-12 z-10 text-[#2B7CE9] opacity-30 transform rotate-[160deg]"
          >
            <path
              fill="currentColor"
              d="M173.928 21.13C115.811 44.938 58.751 45.773 0 26.141c4.227-4.386 7.82-2.715 10.567-1.88 21.133 5.64 42.9 6.266 64.457 7.101 31.066 1.253 60.441-5.848 89.183-17.335 1.268-.418 2.325-1.253 4.861-2.924-14.582-2.924-29.165 2.089-41.845-3.76.212-.835.212-1.879.423-2.714 9.51-.627 19.231-1.253 28.742-2.089 9.51-.835 18.808-1.88 28.318-2.506 6.974-.418 9.933 2.924 7.397 9.19-3.17 8.145-7.608 15.664-11.623 23.391-.423.836-1.057 1.88-1.902 2.298-2.325.835-4.65 1.044-7.186 1.67-.422-2.088-1.479-4.386-1.268-6.265.423-2.506 1.902-4.595 3.804-9.19Z"
            />
          </svg>
          <TooltipDemo
            label="Live Variance"
            payload={[
              { name: "Shortage", value: -15, fill: "#C0362C" },
              { name: "Value Impact", value: "₹12,750", fill: "#16202E" },
            ]}
            indicator="dot"
            className="w-[10rem]"
          />
        </div>
      </div>

      {/* Accuracy Tooltip */}
      <div className="absolute bottom-[-10%] right-[0%] z-20">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="50"
            fill="none"
            viewBox="0 0 122 148"
            className="absolute -top-12 -left-6 z-10 -scale-x-100 rotate-[45deg] text-[#12855A] opacity-30"
          >
            <path
              fill="currentColor"
              d="M0 2.65c6.15-4.024 12.299-2.753 17.812-.847a115.56 115.56 0 0 1 21.84 10.59C70.4 32.727 88.849 61.744 96.483 97.54c1.908 9.108 2.544 18.639 3.817 29.017 8.481-4.871 12.934-14.402 21.416-19.909 1.061 4.236-1.06 6.989-2.756 9.319-6.998 9.531-14.207 19.062-21.63 28.382-3.604 4.448-6.36 4.871-10.177 1.059-8.058-7.837-12.935-17.368-14.42-28.382 0-.424.636-1.059 1.485-2.118 9.118 2.33 6.997 13.979 14.843 18.215 3.393-14.614.848-28.593-2.969-42.149-4.029-14.19-9.33-27.746-17.812-39.82-8.27-11.86-18.66-21.392-30.11-30.287C26.93 11.758 14.207 6.039 0 2.65Z"
            />
          </svg>
          <TooltipDemo
            label="HYD-01 Status"
            payload={[
              { name: "Accuracy", value: "99.2%", fill: "#12855A" },
              { name: "Lines", value: 1842, fill: "#2B7CE9" },
            ]}
            indicator="line"
            className="w-[10rem]"
          />
        </div>
      </div>
    </div>
  );
}
