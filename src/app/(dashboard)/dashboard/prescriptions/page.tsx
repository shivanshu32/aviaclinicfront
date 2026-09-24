'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ClipboardPlus, Loader2, Plus, Receipt, Search, ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorService, medicineService, patientService, prescriptionService, type Doctor, type Medicine, type MedicineSuggestion, type Patient, type PrescriptionMedicineInput } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';

type SelectedMedicine = PrescriptionMedicineInput & { name: string; genericName?: string };
type SavedPrescription = { id: string; patientId: string; patientName: string; doctorId: string; diagnosis: string };

export default function PrescriptionsPage() {
  const { can } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [diagnoses, setDiagnoses] = useState<{ _id: string; diagnosis: string }[]>([]);
  const [suggestions, setSuggestions] = useState<MedicineSuggestion[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineResults, setMedicineResults] = useState<Medicine[]>([]);
  const [selected, setSelected] = useState<SelectedMedicine[]>([]);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState<'idle' | 'found' | 'not-found' | 'error'>('idle');
  const suggestionRequest = useRef(0);
  const [saving, setSaving] = useState(false);
  const [savedPrescription, setSavedPrescription] = useState<SavedPrescription | null>(null);

  const loadSuggestions = useCallback(async (value: string) => {
    const request = ++suggestionRequest.current;
    setLoadingSuggestions(true);
    try {
      const response = await prescriptionService.getSuggestions(value);
      if (request !== suggestionRequest.current) return;
      const next = response.data.suggestions || [];
      setSuggestions(next);
      setSuggestionStatus(response.data.matchedDiagnosis ? 'found' : 'not-found');
    } catch {
      if (request === suggestionRequest.current) { setSuggestions([]); setSuggestionStatus('error'); }
    } finally { if (request === suggestionRequest.current) setLoadingSuggestions(false); }
  }, []);

  useEffect(() => { void Promise.all([doctorService.getAll({ isActive: true }), patientService.getAll({ limit: 30 }), prescriptionService.getDiagnoses()]).then(([d, p, dx]) => { setDoctors(d.data.doctors || []); setPatients(p.data.patients || []); setDiagnoses(dx.data.diagnoses || []); }); }, []);

  useEffect(() => {
    const value = diagnosis.trim();
    if (value.length < 2) { ++suggestionRequest.current; setSuggestions([]); setSuggestionStatus('idle'); setLoadingSuggestions(false); return; }
    const timer = window.setTimeout(() => { void loadSuggestions(value); }, 350);
    return () => window.clearTimeout(timer);
  }, [diagnosis, loadSuggestions]);

  const searchPatients = async (value: string) => {
    setPatientSearch(value);
    const response = await patientService.getAll({ search: value || undefined, limit: 20 });
    setPatients(response.data.patients || []);
  };

  const searchMedicines = async (value: string) => {
    setMedicineSearch(value);
    if (value.trim().length < 2) { setMedicineResults([]); return; }
    const response = await medicineService.getAll({ search: value, limit: 12 });
    setMedicineResults(response.data.medicines || []);
  };

  const addSuggestion = (suggestion: MedicineSuggestion) => addMedicine(suggestion.medicine, 'suggestion', suggestion);
  const addMedicine = (medicine: Pick<Medicine, '_id' | 'name' | 'genericName'>, source: 'suggestion' | 'manual', defaults?: Partial<MedicineSuggestion>) => {
    if (selected.some(item => item.medicineId === medicine._id)) return toast.error('Medicine is already in the prescription');
    setSelected(items => [...items, { medicineId: medicine._id, name: medicine.name, genericName: medicine.genericName, dosage: defaults?.dosage || '', frequency: defaults?.frequency || '', duration: defaults?.duration || '', instructions: defaults?.instructions || '', source }]);
    setMedicineSearch(''); setMedicineResults([]);
  };
  const updateSelected = (index: number, field: keyof PrescriptionMedicineInput, value: string) => setSelected(items => items.map((item, i) => i === index ? { ...item, [field]: value } : item));

  const save = async () => {
    if (!patientId || !doctorId || diagnosis.trim().length < 2 || !selected.length) return toast.error('Select a patient, doctor, diagnosis, and at least one medicine');
    setSaving(true);
    try {
      const response = await prescriptionService.create({ patientId, doctorId, diagnosis, symptoms: symptoms.split(',').map(value => value.trim()).filter(Boolean), notes, medicines: selected.map(item => ({ medicineId: item.medicineId, dosage: item.dosage, frequency: item.frequency, duration: item.duration, instructions: item.instructions, source: item.source })) });
      const prescription = response.data.prescription;
      setSavedPrescription({ id: prescription._id, patientId, patientName: prescription.patientName, doctorId, diagnosis: prescription.diagnosis });
      toast.success('Prescription saved');
      setDiagnosis(''); setSuggestions([]); setSelected([]); setSymptoms(''); setNotes('');
    } catch (error: unknown) { toast.error((error as { error?: string }).error || 'Unable to save prescription'); }
    finally { setSaving(false); }
  };

  const input = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-100';
  return <div className="mx-auto max-w-6xl space-y-5">
    <div className="flex items-center gap-3"><ClipboardPlus className="h-6 w-6 text-primary-600" /><div><h1 className="text-xl font-semibold">Write Prescription</h1><p className="text-sm text-gray-500">Suggestions are optional. The doctor must add each medicine explicitly.</p></div></div>
    {savedPrescription && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" /><div className="flex-1"><h2 className="font-semibold text-emerald-900">Prescription saved successfully</h2><p className="mt-1 text-sm text-emerald-800">{savedPrescription.patientName} · {savedPrescription.diagnosis}</p><p className="mt-1 text-xs text-emerald-700">Prescription ID: {savedPrescription.id}. A bill has not been created yet.</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/dashboard/billing/opd/new?patient=${savedPrescription.patientId}&doctor=${savedPrescription.doctorId}`} className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white"><Receipt className="h-4 w-4" />Create OPD bill</Link><Link href={`/dashboard/billing/medicine/new?patient=${savedPrescription.patientId}`} className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800"><ShoppingCart className="h-4 w-4" />Create medicine bill</Link><button type="button" onClick={() => setSavedPrescription(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-emerald-800">Write another prescription</button></div></div></div></div>}
    <div className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2">
      <label className="text-sm font-medium">Patient *<input value={patientSearch} onChange={e => void searchPatients(e.target.value)} placeholder="Search patient" className={`${input} mt-1`} /><select value={patientId} onChange={e => setPatientId(e.target.value)} className={`${input} mt-2`}><option value="">Select patient</option>{patients.map(p => <option key={p._id} value={p._id}>{p.name} · {p.phone}</option>)}</select></label>
      <label className="text-sm font-medium">Doctor *<select value={doctorId} onChange={e => setDoctorId(e.target.value)} className={`${input} mt-1`}><option value="">Select doctor</option>{doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select></label>
      <label className="text-sm font-medium md:col-span-2">Diagnosis / condition *<input list="diagnosis-list" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Enter or select a diagnosis" className={`${input} mt-1`} /><datalist id="diagnosis-list">{diagnoses.map(item => <option key={item._id} value={item.diagnosis} />)}</datalist></label>
      <label className="text-sm font-medium">Symptoms <input value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Comma-separated symptoms" className={`${input} mt-1`} /></label>
      <label className="text-sm font-medium">Clinical notes <input value={notes} onChange={e => setNotes(e.target.value)} className={`${input} mt-1`} /></label>
    </div>

    <section className="rounded-2xl border bg-white p-5"><div className="mb-3 flex items-center justify-between"><div><h2 className="font-semibold">Common medicine suggestions</h2><p className="text-xs text-gray-500">Nothing is added until you click Add.</p></div>{loadingSuggestions && <Loader2 className="h-5 w-5 animate-spin" />}</div>
      {suggestionStatus === 'idle' && <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">Start typing a diagnosis to see configured suggestions.</p>}
      {suggestionStatus === 'not-found' && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><p>No medicine suggestions are configured for “{diagnosis.trim()}”.</p>{can('settings', 'manage') && <Link href="/dashboard/settings/medicine-suggestions" className="mt-1 inline-block font-medium underline">Configure this diagnosis in Medicine Suggestions</Link>}</div>}
      {suggestionStatus === 'found' && !suggestions.length && <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">This diagnosis is configured, but it has no active medicines.</p>}
      {suggestionStatus === 'error' && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Suggestions could not be loaded. Check that the backend is running and try again.</div>}
      <div className="grid gap-2 md:grid-cols-2">{suggestions.map(item => <div key={item.medicineId} className="flex items-center justify-between rounded-xl border p-3"><div><p className="font-medium">{item.medicine.name}{item.isCommon && <span className="ml-2 rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Common</span>}</p><p className="text-xs text-gray-500">{[item.dosage, item.frequency, item.duration].filter(Boolean).join(' · ') || 'Doctor to configure dosage'}</p></div><button type="button" onClick={() => addSuggestion(item)} className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700"><Plus className="h-4 w-4" />Add</button></div>)}</div>
    </section>

    <section className="rounded-2xl border bg-white p-5"><h2 className="font-semibold">Manual medicine search</h2><div className="relative mt-3"><Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input value={medicineSearch} onChange={e => void searchMedicines(e.target.value)} placeholder="Type at least 2 characters" className={`${input} pl-10`} />{medicineResults.length > 0 && <div className="absolute z-20 mt-1 w-full rounded-xl border bg-white shadow-lg">{medicineResults.map(medicine => <button type="button" key={medicine._id} onClick={() => addMedicine(medicine, 'manual')} className="block w-full px-4 py-3 text-left hover:bg-gray-50"><span className="font-medium">{medicine.name}</span><span className="ml-2 text-sm text-gray-500">{medicine.genericName}</span></button>)}</div>}</div></section>

    <section className="rounded-2xl border bg-white p-5"><h2 className="font-semibold">Prescription medicines ({selected.length})</h2><div className="mt-3 space-y-3">{selected.map((item, index) => <div key={item.medicineId} className="rounded-xl border p-4"><div className="mb-3 flex justify-between"><div><p className="font-medium">{item.name}</p><p className="text-xs text-gray-500">Added from {item.source === 'suggestion' ? 'diagnosis suggestions' : 'manual search'}</p></div><button type="button" onClick={() => setSelected(items => items.filter((_, i) => i !== index))} aria-label={`Remove ${item.name}`}><Trash2 className="h-5 w-5 text-red-500" /></button></div><div className="grid gap-2 md:grid-cols-4"><input value={item.dosage} onChange={e => updateSelected(index, 'dosage', e.target.value)} placeholder="Dosage" className={input} /><input value={item.frequency} onChange={e => updateSelected(index, 'frequency', e.target.value)} placeholder="Frequency" className={input} /><input value={item.duration} onChange={e => updateSelected(index, 'duration', e.target.value)} placeholder="Duration" className={input} /><input value={item.instructions} onChange={e => updateSelected(index, 'instructions', e.target.value)} placeholder="Instructions" className={input} /></div></div>)}</div></section>
    <div className="flex justify-end"><button type="button" disabled={saving} onClick={() => void save()} className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-medium text-white disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save Prescription</button></div>
  </div>;
}
