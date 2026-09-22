'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Receipt, Save, X, Search, ChevronDown, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingService, patientService, Patient, doctorService, Doctor } from '@/lib/services';
import Select from '@/components/ui/Select';
import { applyDoctorConsultation, OPDBillItem } from '@/lib/opdConsultation';

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'percentage', label: 'Percentage' },
];

const PAYMENT_MODE_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
];

export default function NewOPDBillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get('patient');

  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [showPatients, setShowPatients] = useState(false);
  const [patientSearchError, setPatientSearchError] = useState('');
  const patientRequest = useRef(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [chosenDoctorId, setChosenDoctorId] = useState('');
  const doctorButton = useRef<HTMLButtonElement>(null);
  const closeDoctorModal = () => {
    setShowDoctorModal(false);
    doctorButton.current?.focus();
  };

  const [formData, setFormData] = useState({
    doctorId: '',
    items: [{ description: '', quantity: 1, rate: 0 }] as OPDBillItem[],
    discountType: 'fixed' as 'percentage' | 'fixed',
    discountValue: 0,
    paymentMode: 'cash' as 'cash' | 'card' | 'upi',
    remarks: '',
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const doctorsRes = await doctorService.getAll({ isActive: true });
        setDoctors(doctorsRes.data.doctors || []);

        if (patientIdFromUrl) {
          const patientRes = await patientService.getById(patientIdFromUrl);
          setSelectedPatient(patientRes.data.patient);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, [patientIdFromUrl]);

  const searchPatients = async (query: string) => {
    const request = ++patientRequest.current;
    setShowPatients(true);
    setSearchingPatients(true);
    setPatientSearchError('');
    setPatients([]);
    try {
      const response = await patientService.getAll({ search: query.trim() || undefined, limit: 10 });
      if (request === patientRequest.current) setPatients(response.data.patients || []);
    } catch {
      if (request === patientRequest.current) {
        setPatientSearchError('Unable to load patients. Please try again.');
      }
    } finally {
      if (request === patientRequest.current) setSearchingPatients(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    ++patientRequest.current;
    setSelectedPatient(patient);
    setPatients([]);
    setPatientSearch('');
    setShowPatients(false);
    setSearchingPatients(false);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0 }],
    }));
  };

  const selectDoctor = (doctorId: string) => {
    const doctor = doctors.find(doctor => doctor._id === doctorId);
    setFormData(prev => ({
      ...prev,
      doctorId,
      items: applyDoctorConsultation(prev.items, doctor),
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((item, i) => i !== index || item.isConsultation),
    }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index && !item.isConsultation ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (formData.discountType === 'percentage') {
      return (subtotal * formData.discountValue) / 100;
    }
    return formData.discountValue;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    if (!formData.doctorId) {
      toast.error('Please select a doctor');
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].description) {
      toast.error('Please add at least one item');
      return;
    }

    setSaving(true);
    try {
      await billingService.opd.create({
        patientId: selectedPatient._id,
        doctorId: formData.doctorId,
        items: formData.items.filter(item => item.description).map(({ description, quantity, rate }) => ({ description, quantity, rate })),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        paymentMode: formData.paymentMode,
        remarks: formData.remarks,
      });
      toast.success('Bill created successfully');
      router.push('/dashboard/billing');
    } catch (err: unknown) {
      const error = err as { error?: string };
      toast.error(error.error || 'Failed to create bill');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  if (initialLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="min-h-full flex flex-col -mx-4 sm:-mx-6 md:h-full md:min-h-0">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b bg-white">
        <Link href="/dashboard/billing" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <Receipt className="w-5 h-5 text-primary-600" />
        <h1 className="text-lg font-semibold text-gray-900">New OPD Bill</h1>
        <div className="ml-auto bg-primary-50 px-4 py-1.5 rounded-xl">
          <span className="font-semibold text-primary-700">₹{calculateTotal()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 p-4 bg-white flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Patient *</label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                  <p className="text-sm text-gray-500">{selectedPatient.patientId} • {selectedPatient.phone}</p>
                </div>
                <button type="button" onClick={() => setSelectedPatient(null)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={patientSearch} onFocus={() => searchPatients(patientSearch)} onKeyDown={(e) => { if (e.key === 'Escape') { ++patientRequest.current; setShowPatients(false); setSearchingPatients(false); } }} onChange={(e) => { setPatientSearch(e.target.value); searchPatients(e.target.value); }} placeholder="Click to choose, or search by name, phone or patient ID..." className={`${inputClass} pl-11`} />
                {searchingPatients && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />}
                {showPatients && (
                  <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {searchingPatients && <p className="p-3 text-sm text-gray-500">Loading patients…</p>}
                    {patientSearchError && <div role="alert" className="p-3 text-sm text-red-600">{patientSearchError} <button type="button" onClick={() => searchPatients(patientSearch)} className="underline">Retry</button></div>}
                    {!searchingPatients && !patientSearchError && patients.length === 0 && <p className="p-3 text-sm text-gray-500">No patients found. Try another name, phone number or patient ID.</p>}
                    {patients.map(p => (
                      <button key={p._id} type="button" onClick={() => selectPatient(p)} className="w-full p-3 text-left hover:bg-gray-50">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-gray-500">{p.patientId} • {p.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Doctor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor *</label>
            <button ref={doctorButton} type="button" aria-haspopup="dialog" aria-expanded={showDoctorModal} onClick={() => { setChosenDoctorId(formData.doctorId); setShowDoctorModal(true); }} className={`${inputClass} flex items-center justify-between gap-3 text-left bg-white`}>
              <span>{doctors.find(doctor => doctor._id === formData.doctorId)?.name || 'Select doctor'}</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          </div>

          {/* Items */}
          <div className="flex-1 min-h-24 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Items</label>
              <button type="button" onClick={addItem} className="text-sm text-primary-600 font-medium">+ Add Item</button>
            </div>
            <div className="space-y-2 md:flex-1 md:min-h-0 md:overflow-y-auto">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="flex-1 min-w-0">
                    <input type="text" value={item.description} readOnly={!!item.isConsultation} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="Description" className={`${inputClass} read-only:bg-primary-50 read-only:text-primary-800`} />
                  </div>
                  <input type="number" value={item.quantity} readOnly={!!item.isConsultation} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} min="1" className="w-20 px-4 py-2.5 border border-gray-200 rounded-xl read-only:bg-primary-50 read-only:text-primary-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Qty" />
                  <input type="number" value={item.rate} readOnly={!!item.isConsultation} onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)} min="0" className="w-24 px-4 py-2.5 border border-gray-200 rounded-xl read-only:bg-primary-50 read-only:text-primary-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Rate" />
                  {!item.isConsultation && formData.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-5 h-5" /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* Discount & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type</label>
              <Select value={formData.discountType} onChange={(v) => setFormData(p => ({ ...p, discountType: v as 'percentage' | 'fixed' }))} options={DISCOUNT_TYPE_OPTIONS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Value</label>
              <input type="number" value={formData.discountValue} onChange={(e) => setFormData(p => ({ ...p, discountValue: parseFloat(e.target.value) || 0 }))} min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Mode</label>
              <Select value={formData.paymentMode} onChange={(v) => setFormData(p => ({ ...p, paymentMode: v as 'cash' | 'card' | 'upi' }))} options={PAYMENT_MODE_OPTIONS} />
            </div>
          </div>

          {/* Summary */}
          <div className="shrink-0 bg-gray-50 rounded-xl px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center justify-between gap-3"><span className="text-gray-500">Subtotal</span><span className="font-medium">₹{calculateSubtotal()}</span></div>
            <div className="flex items-center justify-between gap-3"><span className="text-gray-500">Discount</span><span className="font-medium text-red-600">-₹{calculateDiscount()}</span></div>
            <div className="flex items-center justify-between gap-3 font-semibold text-lg sm:border-l sm:border-gray-200 sm:pl-4"><span>Total</span><span className="text-primary-600">₹{calculateTotal()}</span></div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-3 px-4 py-2 border-t bg-gray-50">
          <Link href="/dashboard/billing" className="px-4 py-2.5 font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2.5 font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Bill
          </button>
        </div>
      </form>
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onKeyDown={event => {
          if (event.key === 'Escape') closeDoctorModal();
          if (event.key === 'Tab') {
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)'));
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="doctor-popup-title" className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 id="doctor-popup-title" className="text-xl font-semibold text-gray-900">Select Doctor</h2>
              <p className="mt-2 text-sm text-gray-500">Choose the doctor the patient consulted.</p>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6 bg-gray-50/70">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctors.map(doctor => (
                  <label key={doctor._id} className={`rounded-2xl border p-5 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 ${chosenDoctorId === doctor._id ? 'bg-primary-50 border-primary-600 ring-1 ring-primary-600 shadow-sm' : 'bg-white border-gray-200 hover:border-primary-400 hover:shadow-sm'}`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-primary-100 text-primary-600"><Stethoscope className="w-5 h-5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 break-words">{doctor.name}</p>
                        {doctor.specialization && <p className="mt-1 text-sm text-gray-500">{doctor.specialization}</p>}
                        {doctor.qualification && <p className="mt-1 text-xs text-gray-500">{doctor.qualification}</p>}
                      </div>
                      <input type="radio" name="opd-doctor" aria-label={`Select ${doctor.name}`} checked={chosenDoctorId === doctor._id} onChange={() => setChosenDoctorId(doctor._id)} className="mt-1 w-5 h-5 shrink-0 accent-green-600" />
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-200/70 flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-600">Consultation fee</span>
                      <span className="text-xl font-semibold text-primary-700">₹{doctor.consultationFee ?? 0}</span>
                    </div>
                  </label>
                ))}
                {!doctors.length && <p className="col-span-full py-4 text-center text-gray-500">No active doctors available. Add a doctor in Doctors to continue.</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
              <button autoFocus type="button" onClick={closeDoctorModal} className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="button" disabled={!doctors.some(doctor => doctor._id === chosenDoctorId)} onClick={() => { selectDoctor(chosenDoctorId); closeDoctorModal(); }} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">Select Doctor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
