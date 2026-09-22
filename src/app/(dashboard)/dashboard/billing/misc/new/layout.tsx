import { MiscBillDraftProvider } from '@/components/billing/MiscBillDraft';

export default function MiscBillLayout({ children }: { children: React.ReactNode }) {
  return <MiscBillDraftProvider>{children}</MiscBillDraftProvider>;
}
