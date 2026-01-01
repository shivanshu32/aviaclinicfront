'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, FlaskConical, Save, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingService, patientService, Patient, serviceItemService, ServiceItem } from '@/lib/services';
import Select from '@/components/ui/Select';

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'percentage', label: 'Percentage' },
];

const PAYMENT_MODE_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
];

export default function NewMiscBillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get('patient');

  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    items: [{ description: '', quantity: 1, rate: 0 }],
    discountType: 'fixed' as 'percentage' | 'fixed',
    discountValue: 0,
    paymentMode: 'cash' as 'cash' | 'card' | 'upi',
    remarks: '',
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const servicesRes = await serviceItemService.getAll();
        setServices(servicesRes.data?.services || []);

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
    if (!query.trim()) {
      setPatients([]);
      return;
    }
    setSearchingPatients(true);
    try {
      const response = await patientService.getAll({ search: query, limit: 10 });
      setPatients(response.data.patients || []);
    } catch (err) {
      console.error('Failed to search patients:', err);
    } finally {
      setSearchingPatients(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const selectService = (index: number, serviceId: string) => {
    const service = services.find(s => s._id === serviceId);
    if (service) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map((item, i) => 
          i === index ? { ...item, description: service.name, rate: service.rate } : item
        ),
      }));
    }
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
    if (formData.items.length === 0 || !formData.items[0].description) {
      toast.error('Please add at least one item');
      return;
    }

    setSaving(true);
    try {
      await billingService.misc.create({
        patientId: selectedPatient._id,
        items: formData.items.filter(item => item.description),
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

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500";

  if (initialLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>;
  }

  return (
    <div className="h-full flex flex-col -m-4 sm:-m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <Link href="/dashboard/billing" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <FlaskConical className="w-5 h-5 text-purple-600" />
        <h1 className="text-lg font-semibold text-gray-900">New Lab/Misc Bill</h1>
        <div className="ml-auto bg-purple-50 px-3 py-1 rounded-lg">
          <span className="text-sm font-semibold text-purple-700">₹{calculateTotal()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 p-4 bg-white space-y-4 overflow-y-auto">
          {/* Patient */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Patient *</label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedPatient.name}</p>
                  <p className="text-xs text-gray-500">{selectedPatient.patientId} • {selectedPatient.phone}</p>
                </div>
                <button type="button" onClick={() => setSelectedPatient(null)} className="p-1 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={patientSearch} onChange={(e) => { setPatientSearch(e.target.value); searchPatients(e.target.value); }} placeholder="Search patient..." className={`${inputClass} pl-9`} />
                {searchingPatients && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
                {patients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                    {patients.map(p => (
                      <button key={p._id} type="button" onClick={() => { setSelectedPatient(p); setPatients([]); setPatientSearch(''); }} className="w-full p-2 text-left hover:bg-gray-50">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">Lab Tests / Services</label>
              <button type="button" onClick={addItem} className="text-xs text-purple-600 font-medium">+ Add</button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <select value="" onChange={(e) => selectService(idx, e.target.value)} className={`${inputClass} mb-1`}>
                      <option value="">Select service</option>
                      {services.filter(s => s.category === 'laboratory' || s.category === 'radiology').map(s => <option key={s._id} value={s._id}>{s.name} - ₹{s.rate}</option>)}
                    </select>
                    <input type="text" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="Description" className={inputClass} />
                  </div>
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} min="1" className="w-14 px-2 py-2 text-sm border border-gray-200 rounded-lg" />
                  <input type="number" value={item.rate} onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)} min="0" className="w-20 px-2 py-2 text-sm border border-gray-200 rounded-lg" />
                  {formData.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="p-1 text-red-500"><X className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* Discount & Payment */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Discount</label>
              <Select value={formData.discountType} onChange={(v) => setFormData(p => ({ ...p, discountType: v as 'percentage' | 'fixed' }))} options={DISCOUNT_TYPE_OPTIONS} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
              <input type="number" value={formData.discountValue} onChange={(e) => setFormData(p => ({ ...p, discountValue: parseFloat(e.target.value) || 0 }))} min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment</label>
              <Select value={formData.paymentMode} onChange={(v) => setFormData(p => ({ ...p, paymentMode: v as 'cash' | 'card' | 'upi' }))} options={PAYMENT_MODE_OPTIONS} />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{calculateSubtotal()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-red-600">-₹{calculateDiscount()}</span></div>
            <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2"><span>Total</span><span className="text-purple-600">₹{calculateTotal()}</span></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50">
          <Link href="/dashboard/billing" className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Bill
          </button>
        </div>
      </form>
    </div>
  );
}
