import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AuditStatus, DiscrepancySeverity, ResolutionStatus } from '@/types/models';

export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-[#E8F6EF] text-[#12855A] hover:bg-[#E8F6EF] font-medium rounded-full border-none">Completed</Badge>;
    case 'in_progress':
      return <Badge className="bg-[#EEF5FF] text-[#2B7CE9] hover:bg-[#EEF5FF] font-medium rounded-full border-none">In progress</Badge>;
    case 'approved':
      return <Badge className="bg-[#EEF5FF] text-[#1D6FE0] hover:bg-[#EEF5FF] font-medium rounded-full border-none">Approved</Badge>;
    case 'pending':
      return <Badge className="bg-[#FFF8E6] text-[#B5730F] hover:bg-[#FFF8E6] font-medium rounded-full border-none">Pending approval</Badge>;
    case 'cancelled':
      return <Badge className="bg-secondary text-secondary-foreground font-medium rounded-full">Cancelled</Badge>;
    default:
      return <Badge variant="outline" className="rounded-full">{status}</Badge>;
  }
}

export function SeverityBadge({ severity }: { severity: DiscrepancySeverity }) {
  switch (severity) {
    case 'critical':
      return <Badge className="bg-[#FDF2F2] text-[#C0362C] hover:bg-[#FDF2F2] font-semibold rounded-full border-none">Critical</Badge>;
    case 'high':
      return <Badge className="bg-[#FFF8E6] text-[#B5730F] hover:bg-[#FFF8E6] font-semibold rounded-full border-none">High</Badge>;
    case 'medium':
      return <Badge className="bg-[#EEF5FF] text-[#2B7CE9] hover:bg-[#EEF5FF] font-medium rounded-full border-none">Medium</Badge>;
    case 'low':
      return <Badge className="bg-secondary text-secondary-foreground font-medium rounded-full">Low</Badge>;
    default:
      return <Badge variant="outline" className="rounded-full">{severity}</Badge>;
  }
}

export function ResolutionBadge({ status }: { status: ResolutionStatus }) {
  switch (status) {
    case 'resolved':
      return <Badge className="bg-[#E8F6EF] text-[#12855A] hover:bg-[#E8F6EF] font-medium rounded-full border-none">Resolved</Badge>;
    case 'under_review':
      return <Badge className="bg-[#FFF8E6] text-[#B5730F] hover:bg-[#FFF8E6] font-medium rounded-full border-none">Under review</Badge>;
    case 'open':
      return <Badge className="bg-[#FDF2F2] text-[#C0362C] hover:bg-[#FDF2F2] font-semibold rounded-full border-none">Open</Badge>;
    default:
      return <Badge variant="outline" className="rounded-full">{status}</Badge>;
  }
}
