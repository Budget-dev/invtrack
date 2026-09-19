"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from "recharts";
import { ClipboardCheck, TrendingUp, AlertCircle, Package } from "lucide-react";

const accuracyData = [
  { month: "Jan", accuracy: 98.2 },
  { month: "Feb", accuracy: 97.8 },
  { month: "Mar", accuracy: 98.5 },
  { month: "Apr", accuracy: 99.1 },
  { month: "May", accuracy: 98.7 },
  { month: "Jun", accuracy: 99.4 },
];

const categoryDiscrepancyData = [
  { category: "Electronics", shortage: 12, overage: 4 },
  { category: "Apparel", shortage: 45, overage: 23 },
  { category: "Home Goods", shortage: 28, overage: 32 },
  { category: "Industrial", shortage: 15, overage: 8 },
  { category: "Cosmetics", shortage: 54, overage: 12 },
];

const stats = [
  { label: "Global Stock Accuracy", value: "98.7%", icon: ClipboardCheck, change: "+0.4%" },
  { label: "Active Audits", value: "14", icon: ClipboardCheck, change: "On Schedule" },
  { label: "High Variance Items", value: "128", icon: AlertCircle, change: "-12 from last week" },
  { label: "Total Sites Covered", value: "42", icon: Package, change: "All Live" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline tracking-tight">Operational Analytics</h2>
        <p className="text-muted-foreground">Real-time inventory accuracy and audit performance across global sites.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Stock Accuracy Trend</CardTitle>
            <CardDescription>Monthly variance performance aggregate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF2" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[95, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#000", border: "none", color: "#fff", borderRadius: "4px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#000" 
                    strokeWidth={2} 
                    dot={{ fill: "#000", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Variance by Category</CardTitle>
            <CardDescription>Shortages vs. Overages grouped by product sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDiscrepancyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EAF2" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    cursor={{fill: '#F7F9FC'}}
                    contentStyle={{ backgroundColor: "#000", border: "none", color: "#fff", borderRadius: "4px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Bar dataKey="shortage" fill="#000" name="Shortage" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="overage" fill="#A3A3A3" name="Overage" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
