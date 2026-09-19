export type AuditStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';

export type DiscrepancySeverity = 'low' | 'medium' | 'high' | 'critical';

export type DiscrepancyType = 'shortage' | 'overage' | 'damaged' | 'misplaced' | 'expired';

export type ResolutionStatus = 'open' | 'under_review' | 'resolved';

export type AuditType = 'full' | 'cycle' | 'spot' | 'annual';

export interface SessionUser {
  name: string;
  role: 'client' | 'auditor' | 'admin';
  company: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  city: string;
  contactName: string;
  contactEmail: string;
  warehouseCount: number;
  status: 'active' | 'onboarding' | 'paused';
  onboardedDate: string;
}

export interface Warehouse {
  id: string;
  clientId: string;
  name: string;
  address: string;
  code: string;
  city: string;
  zones: number;
  skuCount: number;
  managerName: string;
  lastAuditedDate: string | null;
}

export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  warehouseId: string;
  zone: string;
  systemQty: number;
  unit: string;
  unitValue: number;
  syncedDate: string;
}

export interface Auditor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'invited' | 'suspended';
  joinedDate: string;
  lastActiveDate: string;
}

export interface Audit {
  id: string;
  reference: string;
  clientId: string;
  warehouseId: string;
  type: AuditType;
  status: AuditStatus;
  requestedDate: string;
  scheduledDate: string;
  auditorId?: string;
  completionPercentage: number;
  totalLines: number;
  countedLines: number;
  accuracy?: number;
}

export interface Discrepancy {
  id: string;
  auditId: string;
  sku: string;
  itemName: string;
  type: DiscrepancyType;
  severity: DiscrepancySeverity;
  variance: number;
  valueImpact: number;
  status: ResolutionStatus;
  raisedDate: string;
  auditorNotes?: string;
}

export interface CountLine {
  sku: string;
  itemName: string;
  zone: string;
  systemQty: number;
  countedQty: number | null;
  variance: number | null;
  isFlagged: boolean;
}

export interface AuditRequest {
  id: string;
  clientName: string;
  warehouseName: string;
  city: string;
  type: AuditType;
  preferredDate: string;
  status: 'pending' | 'approved' | 'declined';
  notes?: string;
}

export interface Lead {
  company: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  warehousesCount: number;
  notes?: string;
}
