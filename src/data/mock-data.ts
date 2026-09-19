import { Client, Warehouse, InventoryItem, Auditor, Audit, Discrepancy, CountLine, AuditRequest } from '../types/models';

export const VARIANCE_TOLERANCE_PERCENT = 2;

export const clients: Client[] = [
  {
    id: 'cl_abc',
    name: 'ABC Enterprises',
    industry: 'FMCG Distribution',
    city: 'Hyderabad',
    contactName: 'Ravi Teja',
    contactEmail: 'ravi.teja@abcent.in',
    warehouseCount: 3,
    status: 'active',
    onboardedDate: '15 Jan 2024',
  },
  {
    id: 'cl_xyz',
    name: 'XYZ Retail',
    industry: 'Retail Chain',
    city: 'Mumbai',
    contactName: 'Anita Shah',
    contactEmail: 'ashah@xyzretail.com',
    warehouseCount: 1,
    status: 'active',
    onboardedDate: '20 Feb 2024',
  },
  {
    id: 'cl_lmn',
    name: 'LMN Stores',
    industry: 'Grocery',
    city: 'Chennai',
    contactName: 'Karthik R',
    contactEmail: 'karthik.r@lmnstores.in',
    warehouseCount: 1,
    status: 'active',
    onboardedDate: '05 Mar 2024',
  },
  {
    id: 'cl_pqr',
    name: 'PQR Pharma',
    industry: 'Pharma',
    city: 'Bangalore',
    contactName: 'Sneha Iyer',
    contactEmail: 'siyer@pqrpharma.co.in',
    warehouseCount: 1,
    status: 'onboarding',
    onboardedDate: '10 Apr 2024',
  },
];

export const warehouses: Warehouse[] = [
  {
    id: 'w_hyd_01',
    clientId: 'cl_abc',
    name: 'Hyderabad Central DC',
    address: 'Plot 42, Gachibowli Industrial Area, Hyderabad 500032',
    code: 'HYD-01',
    city: 'Hyderabad',
    zones: 4,
    skuCount: 1842,
    managerName: 'Suresh Babu',
    lastAuditedDate: '20 Sep 2025',
  },
  {
    id: 'w_hyd_02',
    clientId: 'cl_abc',
    name: 'Medchal Overflow',
    address: 'Survey 108, Medchal Highway, Hyderabad 501401',
    code: 'HYD-02',
    city: 'Hyderabad',
    zones: 3,
    skuCount: 640,
    managerName: 'Fatima Sheikh',
    lastAuditedDate: '12 Aug 2025',
  },
  {
    id: 'w_vjw_01',
    clientId: 'cl_abc',
    name: 'Vijayawada Depot',
    address: 'APIIC Industrial Park, Auto Nagar, Vijayawada 520007',
    code: 'VJW-01',
    city: 'Vijayawada',
    zones: 2,
    skuCount: 912,
    managerName: 'Koteswara Rao',
    lastAuditedDate: null,
  },
  {
    id: 'w_mum_01',
    clientId: 'cl_xyz',
    name: 'Bhiwandi Hub',
    address: 'Thane-Nashik Highway, Bhiwandi, Mumbai 421302',
    code: 'MUM-01',
    city: 'Mumbai',
    zones: 6,
    skuCount: 3120,
    managerName: 'Priya Menon',
    lastAuditedDate: '15 Jun 2025',
  },
  {
    id: 'w_che_01',
    clientId: 'cl_lmn',
    name: 'Chennai Store DC',
    address: 'Grand Southern Trunk Road, Tambaram, Chennai 600045',
    code: 'CHE-01',
    city: 'Chennai',
    zones: 4,
    skuCount: 1180,
    managerName: 'Karthik R',
    lastAuditedDate: '18 Jul 2025',
  },
];

export const inventoryItems: InventoryItem[] = [
  {
    sku: 'FMC-1001',
    name: 'Sunflower oil 1L pouch',
    category: 'Staples',
    warehouseId: 'w_hyd_01',
    zone: 'Zone A',
    systemQty: 420,
    unit: 'cases',
    unitValue: 165,
    syncedDate: '20 Sep 2025'
  },
  {
    sku: 'FMC-1108',
    name: 'Toor dal 5kg bag',
    category: 'Staples',
    warehouseId: 'w_hyd_01',
    zone: 'Zone B',
    systemQty: 120,
    unit: 'bags',
    unitValue: 850,
    syncedDate: '20 Sep 2025'
  },
  {
    sku: 'FMC-1330',
    name: 'Detergent powder 2kg',
    category: 'Home care',
    warehouseId: 'w_hyd_01',
    zone: 'Zone C',
    systemQty: 250,
    unit: 'boxes',
    unitValue: 450,
    syncedDate: '20 Sep 2025'
  },
  {
    sku: 'FMC-1402',
    name: 'Biscuit family pack',
    category: 'Snacks',
    warehouseId: 'w_hyd_01',
    zone: 'Zone A',
    systemQty: 850,
    unit: 'packs',
    unitValue: 80,
    syncedDate: '20 Sep 2025'
  },
  {
    sku: 'FMC-2091',
    name: 'Frozen peas 1kg',
    category: 'Frozen',
    warehouseId: 'w_hyd_01',
    zone: 'Cold chain',
    systemQty: 180,
    unit: 'packets',
    unitValue: 120,
    syncedDate: '20 Sep 2025'
  },
  {
    sku: 'FMC-2231',
    name: 'Hand wash refill 750ml',
    category: 'Home care',
    warehouseId: 'w_hyd_01',
    zone: 'Zone C',
    systemQty: 400,
    unit: 'pouches',
    unitValue: 145,
    syncedDate: '20 Sep 2025'
  },
  {
    sku: 'FMC-3112',
    name: 'Tea powder 500g',
    category: 'Beverages',
    warehouseId: 'w_hyd_01',
    zone: 'Zone B',
    systemQty: 620,
    unit: 'packs',
    unitValue: 210,
    syncedDate: '20 Sep 2025'
  },
  {
    sku: 'FMC-4500',
    name: 'Basmati rice 10kg',
    category: 'Staples',
    warehouseId: 'w_hyd_01',
    zone: 'Zone A',
    systemQty: 150,
    unit: 'bags',
    unitValue: 1450,
    syncedDate: '20 Sep 2025'
  }
];

export const audits: Audit[] = [
  {
    id: 'AUD-001',
    reference: 'AUD-001',
    clientId: 'cl_abc',
    warehouseId: 'w_hyd_01',
    type: 'full',
    status: 'completed',
    requestedDate: '01 Sep 2025',
    scheduledDate: '20 Sep 2025',
    auditorId: 'aud_naveen',
    completionPercentage: 100,
    totalLines: 1842,
    countedLines: 1842,
    accuracy: 99.2
  },
  {
    id: 'AUD-002',
    reference: 'AUD-002',
    clientId: 'cl_xyz',
    warehouseId: 'w_mum_01',
    type: 'cycle',
    status: 'in_progress',
    requestedDate: '15 Sep 2025',
    scheduledDate: '22 Sep 2025',
    auditorId: 'aud_naveen',
    completionPercentage: 62,
    totalLines: 820,
    countedLines: 512
  },
  {
    id: 'AUD-003',
    reference: 'AUD-003',
    clientId: 'cl_lmn',
    warehouseId: 'w_che_01',
    type: 'spot',
    status: 'pending',
    requestedDate: '18 Sep 2025',
    scheduledDate: '25 Sep 2025',
    completionPercentage: 0,
    totalLines: 1180,
    countedLines: 0
  },
  {
    id: 'AUD-004',
    reference: 'AUD-004',
    clientId: 'cl_abc',
    warehouseId: 'w_hyd_02',
    type: 'cycle',
    status: 'approved',
    requestedDate: '10 Sep 2025',
    scheduledDate: '24 Sep 2025',
    auditorId: 'aud_naveen',
    completionPercentage: 0,
    totalLines: 640,
    countedLines: 0
  },
  {
    id: 'AUD-005',
    reference: 'AUD-005',
    clientId: 'cl_abc',
    warehouseId: 'w_vjw_01',
    type: 'annual',
    status: 'pending',
    requestedDate: '19 Sep 2025',
    scheduledDate: '28 Sep 2025',
    completionPercentage: 0,
    totalLines: 912,
    countedLines: 0
  }
];

export const countLinesForAud002: CountLine[] = [
  {
    sku: 'FMC-1001',
    itemName: 'Sunflower oil 1L pouch',
    zone: 'Zone A',
    systemQty: 420,
    countedQty: 420,
    variance: 0,
    isFlagged: false
  },
  {
    sku: 'FMC-1402',
    name: 'Biscuit family pack',
    itemName: 'Biscuit family pack',
    zone: 'Zone A',
    systemQty: 850,
    countedQty: 848,
    variance: -2,
    isFlagged: false
  },
  {
    sku: 'FMC-1108',
    name: 'Toor dal 5kg bag',
    itemName: 'Toor dal 5kg bag',
    zone: 'Zone B',
    systemQty: 120,
    countedQty: 105,
    variance: -15,
    isFlagged: true
  },
  {
    sku: 'FMC-1330',
    itemName: 'Detergent powder 2kg',
    zone: 'Zone C',
    systemQty: 250,
    countedQty: null,
    variance: null,
    isFlagged: false
  },
  {
    sku: 'FMC-4500',
    itemName: 'Basmati rice 10kg',
    zone: 'Zone A',
    systemQty: 150,
    countedQty: null,
    variance: null,
    isFlagged: false
  }
];

export const discrepancies: Discrepancy[] = [
  {
    id: 'D-001',
    auditId: 'AUD-001',
    sku: 'FMC-1108',
    itemName: 'Toor dal 5kg bag',
    type: 'shortage',
    severity: 'high',
    variance: -15,
    valueImpact: 12750,
    status: 'open',
    raisedDate: '20 Sep 2025',
    auditorNotes: 'Pallet 14 short by one layer. No damage seen, dispatch slip missing.'
  },
  {
    id: 'D-002',
    auditId: 'AUD-001',
    sku: 'FMC-1330',
    itemName: 'Detergent powder 2kg',
    type: 'damaged',
    severity: 'medium',
    variance: -4,
    valueImpact: 1800,
    status: 'under_review',
    raisedDate: '20 Sep 2025',
    auditorNotes: 'Water ingress noticed on lower carton layout. Units discarded.'
  },
  {
    id: 'D-003',
    auditId: 'AUD-001',
    sku: 'FMC-2091',
    itemName: 'Frozen peas 1kg',
    type: 'expired',
    severity: 'critical',
    variance: -22,
    valueImpact: 2640,
    status: 'open',
    raisedDate: '20 Sep 2025',
    auditorNotes: 'Batch code EXP-0825 exceeded date parameter. Isolated in cold block.'
  },
  {
    id: 'D-004',
    auditId: 'AUD-001',
    sku: 'FMC-1001',
    itemName: 'Sunflower oil 1L pouch',
    type: 'overage',
    severity: 'low',
    variance: 6,
    valueImpact: 990,
    status: 'resolved',
    raisedDate: '20 Sep 2025',
    auditorNotes: 'Unrecorded returns stack found mislabeled behind primary rack setup.'
  }
];

export const auditRequests: AuditRequest[] = [
  {
    id: 'REQ-001',
    clientName: 'ABC Enterprises',
    warehouseName: 'Vijayawada Depot',
    city: 'Vijayawada',
    type: 'annual',
    preferredDate: '28 Sep 2025',
    status: 'pending',
    notes: 'Year-end stock reconciliation before accounts final audit'
  },
  {
    id: 'REQ-002',
    clientName: 'PQR Pharma',
    warehouseName: 'Bangalore Core DC',
    city: 'Bangalore',
    type: 'full',
    preferredDate: '05 Oct 2025',
    status: 'pending',
    notes: 'Initial opening audit after onboarding sequence'
  },
  {
    id: 'REQ-003',
    clientName: 'XYZ Retail',
    warehouseName: 'Bhiwandi Hub',
    city: 'Mumbai',
    type: 'cycle',
    preferredDate: '22 Sep 2025',
    status: 'approved'
  }
];

export const auditors: Auditor[] = [
  {
    id: 'aud_naveen',
    name: 'Naveen Kumar',
    email: 'nkumar@invtrack.app',
    phone: '+91 94440 98765',
    status: 'active',
    joinedDate: '01 Oct 2023',
    lastActiveDate: '20 Sep 2025 18:30'
  },
  {
    id: 'aud_fatima',
    name: 'Fatima Sheikh',
    email: 'fsheikh@invtrack.app',
    phone: '+91 98450 12345',
    status: 'active',
    joinedDate: '15 Nov 2023',
    lastActiveDate: '19 Sep 2025 14:15'
  },
  {
    id: 'aud_joseph',
    name: 'Joseph Mathew',
    email: 'jmathew@invtrack.app',
    phone: '+91 98860 54321',
    status: 'active',
    joinedDate: '20 Jan 2024',
    lastActiveDate: '20 Sep 2025 11:00'
  },
  {
    id: 'aud_divya',
    name: 'Divya Rao',
    email: 'drao@invtrack.app',
    phone: '+91 91122 33445',
    status: 'invited',
    joinedDate: '18 Sep 2025',
    lastActiveDate: 'Invitation pending'
  }
];

export const accuracyTrend = [
  { month: 'Apr', accuracy: 96.4 },
  { month: 'May', accuracy: 97.1 },
  { month: 'Jun', accuracy: 96.8 },
  { month: 'Jul', accuracy: 98.2 },
  { month: 'Aug', accuracy: 98.6 },
  { month: 'Sep', accuracy: 99.2 },
];

export const varianceByCategory = [
  { category: 'Staples', shortage: 12, overage: 4 },
  { category: 'Snacks', shortage: 6, overage: 9 },
  { category: 'Home care', shortage: 15, overage: 2 },
  { category: 'Frozen', shortage: 22, overage: 1 },
  { category: 'Beverages', shortage: 5, overage: 3 },
];
