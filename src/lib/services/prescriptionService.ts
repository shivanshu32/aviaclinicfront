import api from '../api';
import type { Medicine } from './medicineService';

export interface MedicineSuggestion {
  medicineId: string;
  priority: number;
  isCommon: boolean;
  isActive: boolean;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  medicine: Pick<Medicine, '_id' | 'name' | 'genericName' | 'unit'>;
}

export interface DiagnosisMapping {
  _id: string;
  diagnosis: string;
  aliases: string[];
  isActive: boolean;
  medicines: Omit<MedicineSuggestion, 'medicine'>[];
  medicineDetails?: Medicine[];
}

export interface PrescriptionMedicineInput {
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  source: 'suggestion' | 'manual';
}

export const prescriptionService = {
  getDiagnoses: (search = '') => api.get(`/prescriptions/diagnoses?search=${encodeURIComponent(search)}`),
  getSuggestions: (diagnosis: string) => api.get(`/prescriptions/suggestions?diagnosis=${encodeURIComponent(diagnosis)}`),
  getMappings: () => api.get('/prescriptions/mappings'),
  createMapping: (data: Omit<DiagnosisMapping, '_id' | 'medicineDetails'>) => api.post('/prescriptions/mappings', data),
  updateMapping: (id: string, data: Omit<DiagnosisMapping, '_id' | 'medicineDetails'>) => api.put(`/prescriptions/mappings/${id}`, data),
  create: (data: { patientId: string; doctorId: string; appointmentId?: string; diagnosis: string; symptoms: string[]; notes: string; medicines: PrescriptionMedicineInput[] }) => api.post('/prescriptions', data),
};
