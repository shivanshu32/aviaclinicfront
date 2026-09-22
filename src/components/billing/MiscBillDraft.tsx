'use client';

import { createContext, useContext, useState, type Dispatch, type SetStateAction, type ReactNode } from 'react';
import type { Patient } from '@/lib/services';

interface MiscBillForm {
  items: { serviceId?: string; description: string; quantity: number; rate: number }[];
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  paymentMode: 'cash' | 'card' | 'upi';
  remarks: string;
}

const DraftContext = createContext<{
  formData: MiscBillForm;
  setFormData: Dispatch<SetStateAction<MiscBillForm>>;
  selectedPatient: Patient | null;
  setSelectedPatient: Dispatch<SetStateAction<Patient | null>>;
} | null>(null);

export function MiscBillDraftProvider({ children }: { children: ReactNode }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<MiscBillForm>({
    items: [{ description: '', quantity: 1, rate: 0 }],
    discountType: 'fixed', discountValue: 0, paymentMode: 'cash', remarks: '',
  });
  return <DraftContext.Provider value={{ formData, setFormData, selectedPatient, setSelectedPatient }}>{children}</DraftContext.Provider>;
}

export function useMiscBillDraft() {
  const draft = useContext(DraftContext);
  if (!draft) throw new Error('Misc bill draft provider is required');
  return draft;
}
