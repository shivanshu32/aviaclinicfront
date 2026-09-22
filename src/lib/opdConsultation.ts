import type { Doctor } from './services/doctorService';

export interface OPDBillItem {
  description: string;
  quantity: number;
  rate: number;
  isConsultation?: boolean;
}

export function applyDoctorConsultation(items: OPDBillItem[], doctor?: Doctor): OPDBillItem[] {
  const otherItems = items.filter(item => !item.isConsultation);
  if (!doctor) return otherItems.length ? otherItems : [{ description: '', quantity: 1, rate: 0 }];
  const consultation = {
    description: 'Consultation Charges', quantity: 1,
    rate: doctor.consultationFee ?? 0, isConsultation: true,
  };
  const existing = items.findIndex(item => item.isConsultation);
  if (existing !== -1) {
    return items.map((item, index) => index === existing ? { ...consultation, quantity: item.quantity } : item);
  }
  const blank = otherItems.findIndex(item => !item.description && item.rate === 0);
  if (blank !== -1) return otherItems.map((item, index) => index === blank ? consultation : item);
  return [consultation, ...otherItems];
}
