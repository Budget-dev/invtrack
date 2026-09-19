
"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, Save, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const initialItems = [
  { sku: "SKU-49201", name: "Solid State Drive 1TB", category: "Electronics", expected: 120, counted: 0 },
  { sku: "SKU-88210", name: "Ergonomic Office Chair", category: "Furniture", expected: 45, counted: 0 },
  { sku: "SKU-10293", name: "Mechanical Keyboard RGB", category: "Electronics", expected: 85, counted: 0 },
  { sku: "SKU-77291", name: "Industrial Steel Racking", category: "Hardware", expected: 12, counted: 0 },
  { sku: "SKU-33201", name: "USB-C Hub Multiport", category: "Electronics", expected: 250, counted: 0 },
  { sku: "SKU-55612", name: "Filing Cabinet 3-Drawer", category: "Furniture", expected: 30, counted: 0 },
];

export default function CountSheetPage() {
  const [items, setItems] = useState(initialItems);

  const handleCountChange = (sku: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setItems(items.map(item => 
      item.sku === sku ? { ...item, counted: numValue } : item
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline tracking-tight">Field Auditor Count Sheet</h2>
          <p className="text-muted-foreground">High-density count interface for tablet-first field operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-sm border-black">
            <RotateCcw size={18} className="mr-2" />
            Reset Sheet
          </Button>
          <Button className="bg-black text-white hover:bg-black/90 rounded-sm">
            <Save size={18} className="mr-2" />
            Submit Final Count
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-secondary overflow-hidden">
        <div className="p-4 border-b bg-secondary/20 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search by SKU, Product Name, or Location..." 
              className="pl-10 border-none bg-white focus-visible:ring-1 focus-visible:ring-black rounded-sm"
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold px-4 border-l h-10 border-black/10">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground uppercase">Items Left:</span>
              <span className="tabular-nums">{items.filter(i => i.counted === 0).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground uppercase">Variances:</span>
              <span className="tabular-nums">{items.filter(i => i.counted !== 0 && i.counted !== i.expected).length}</span>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-white hover:bg-white border-b-2">
              <TableHead className="w-[120px]">SKU / ID</TableHead>
              <TableHead>Product Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center w-[120px]">Expected</TableHead>
              <TableHead className="text-center w-[150px]">Physical Count</TableHead>
              <TableHead className="text-center w-[120px]">Variance</TableHead>
              <TableHead className="w-[100px]">Flag</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const variance = item.counted === 0 ? 0 : item.counted - item.expected;
              const hasVariance = variance !== 0 && item.counted !== 0;
              
              return (
                <TableRow key={item.sku} className="hover:bg-secondary/10 transition-colors">
                  <TableCell className="font-code font-bold text-xs">{item.sku}</TableCell>
                  <TableCell className="font-medium text-sm">{item.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{item.category}</TableCell>
                  <TableCell className="text-center font-medium tabular-nums bg-secondary/30">{item.expected}</TableCell>
                  <TableCell className="p-1">
                    <Input 
                      type="number"
                      className="text-center font-bold tabular-nums h-12 border-2 border-black/10 focus:border-black rounded-sm text-lg"
                      value={item.counted || ""}
                      onChange={(e) => handleCountChange(item.sku, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className={cn(
                    "text-center font-bold tabular-nums text-lg",
                    hasVariance ? "bg-black text-white" : ""
                  )}>
                    {hasVariance ? (variance > 0 ? `+${variance}` : variance) : "-"}
                  </TableCell>
                  <TableCell>
                    {hasVariance && (
                      <Badge variant="outline" className="border-black text-black gap-1 rounded-sm bg-white">
                        <AlertTriangle size={12} />
                        Review
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
