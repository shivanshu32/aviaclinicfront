import type { ReactNode } from 'react';

const tones: Record<string, string> = {
  completed: 'status-success', active: 'status-success', paid: 'status-success', confirmed: 'status-success',
  scheduled: 'status-neutral', pending: 'status-warning', 'checked-in': 'status-warning', waiting: 'status-warning',
  'in-progress': 'status-info', partial: 'status-info',
  cancelled: 'status-danger', inactive: 'status-danger', expired: 'status-danger', 'out-of-stock': 'status-danger',
};

export default function StatusBadge({ status, children }: { status: string; children?: ReactNode }) {
  const key = status.toLowerCase();
  return <span className={`status-badge ${tones[key] || 'status-neutral'}`}>{children || status.replace(/-/g, ' ')}</span>;
}
