
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Download, TrendingDown, TrendingUp } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const data = [
  { item: "SSD 1TB", variance: -12, type: "shortage" },
  { item: "Chair X4", variance: 4, type: "overage" },
  { item: "KB Mech", variance: -8, type: "shortage" },
  { item: "Steel Rack", variance: 0, type: "exact" },
  { item: "USB Hub", variance: -22, type: "shortage" },
];

export default function DiscrepanciesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline tracking-tight">Discrepancy Report</h2>
          <p className="text-muted-foreground">A dedicated view for warehouse managers to monitor inventory accuracy.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-black rounded-sm h-10 px-6">
            <Download size={18} className="mr-2" />
            Export CSV
          </Button>
          <Button className="bg-black text-white hover:bg-black/90 rounded-sm h-10 px-6">
            <FileText size={18} className="mr-2" />
            Generate PDF Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm border-l-4 border-l-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              Critical Shortages
              <TrendingDown size={14} className="text-black" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">$42,901</div>
            <p className="text-xs text-muted-foreground mt-1">Net value loss from 14 items</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm border-l-4 border-l-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              Unaccounted Overage
              <TrendingUp size={14} className="text-black" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">$12,450</div>
            <p className="text-xs text-muted-foreground mt-1">Inventory surplus from 8 items</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-black text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60 uppercase tracking-widest flex items-center justify-between">
              Shrinkage Factor
              <AlertCircle size={14} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">1.24%</div>
            <p className="text-xs text-white/60 mt-1">Against total inventory value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Physical Variance Audit</CardTitle>
            <CardDescription>Individual line item discrepancies flagged for reconciliation</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">
                <tr>
                  <th className="px-6 py-4">Item Identifier</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Qty Variance</th>
                  <th className="px-6 py-4 text-right">Value Impact</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 font-bold">{row.item}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-semibold">{row.type === 'shortage' ? 'Electronics' : 'Hardware'}</td>
                    <td className={`px-6 py-4 text-center font-bold tabular-nums ${row.variance < 0 ? 'text-black' : row.variance > 0 ? 'text-muted-foreground' : ''}`}>
                      {row.variance > 0 ? `+${row.variance}` : row.variance === 0 ? "0" : row.variance}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-medium">
                      ${Math.abs(row.variance * 125).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className={row.variance === 0 ? "border-muted text-muted" : "border-black text-black"}>
                        {row.variance === 0 ? "Cleared" : "Review"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Reconciliation Progress</CardTitle>
            <CardDescription>Items cleared by management</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <div className="relative w-48 h-48 mb-6">
               {/* Simplified representation of a radial chart using pure CSS/Tailwind */}
               <div className="absolute inset-0 rounded-full border-[12px] border-secondary" />
               <div className="absolute inset-0 rounded-full border-[12px] border-black border-l-transparent border-t-transparent border-r-transparent transform rotate-45" />
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl font-bold font-headline">68%</span>
                 <span className="text-[10px] uppercase font-bold text-muted-foreground">Resolved</span>
               </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase text-muted-foreground">Adjustments Pending</span>
                <span className="font-bold tabular-nums">42 Items</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-black h-full w-[68%]" />
              </div>
              <Button className="w-full mt-4 bg-secondary text-black hover:bg-black hover:text-white rounded-sm transition-all border border-black/10 font-bold uppercase text-[10px] tracking-widest">
                Reconcile Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
