'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Pill, Save, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingService, patientService, Patient, medicineService, Medicine } from '@/lib/services';
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

export default function NewMedicineBillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get('patient');

  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInDetails, setWalkInDetails] = useState({ name: '', phone: '' });

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
        const medicinesRes = await medicineService.getAll({ includeStock: true, limit: 100 });
        setMedicines(medicinesRes.data?.medicines || []);

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

  const selectMedicine = (index: number, medicineId: string) => {
    const medicine = medicines.find(m => m._id === medicineId);
    if (medicine) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map((item, i) => 
          i === index ? { ...item, description: medicine.name, rate: 0 } : item
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
    
    if (!isWalkIn && !selectedPatient) {
      toast.error('Please select a patient or use walk-in');
      return;
    }
    if (isWalkIn && !walkInDetails.name.trim()) {
      toast.error('Please enter walk-in customer name');
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].description) {
      toast.error('Please add at least one item');
      return;
    }

    setSaving(true);
    try {
      const payload: {
        patientId?: string;
        patientName?: string;
        patientPhone?: string;
        items: { description: string; quantity: number; rate: number }[];
        discountType?: 'percentage' | 'fixed';
        discountValue?: number;
        paymentMode: string;
        remarks?: string;
      } = {
        items: formData.items.filter(item => item.description),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        paymentMode: formData.paymentMode,
        remarks: formData.remarks,
      };

      if (isWalkIn) {
        payload.patientName = walkInDetails.name;
        payload.patientPhone = walkInDetails.phone;
      } else if (selectedPatient) {
        payload.patientId = selectedPatient._id;
      }

      await billingService.medicine.create(payload);
      toast.success('Bill created successfully');
      router.push('/dashboard/billing');
    } catch (err: unknown) {
      const error = err as { error?: string };
      toast.error(error.error || 'Failed to create bill');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/billing"
          className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <Pill className="w-7 h-7 text-green-600" />
            New Medicine Bill
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Create a new pharmacy/medicine bill</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-800">Customer</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isWalkIn}
                onChange={(e) => {
                  setIsWalkIn(e.target.checked);
                  if (e.target.checked) setSelectedPatient(null);
                }}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-secondary-600">Walk-in Customer</span>
            </label>
          </div>

          {isWalkIn ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
                <input
                  type="text"
                  value={walkInDetails.name}
                  onChange={(e) => setWalkInDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Customer name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={walkInDetails.phone}
                  onChange={(e) => setWalkInDetails(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          ) : selectedPatient ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div>
                <p className="font-semibold text-secondary-800">{selectedPatient.name}</p>
                <p className="text-sm text-secondary-500">ID: {selectedPatient.patientId} • {selectedPatient.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-300" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    searchPatients(e.target.value);
                  }}
                  placeholder="Search patient by name or phone..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {searchingPatients && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-green-600" />
                )}
              </div>
              {patients.length > 0 && (
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-48 overflow-y-auto">
                  {patients.map(patient => (
                    <button
                      key={patient._id}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setPatients([]);
                        setPatientSearch('');
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-secondary-800">{patient.name}</p>
                      <p className="text-sm text-secondary-400">{patient.patientId} • {patient.phone}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-800">Medicines</h2>
            <button type="button" onClick={addItem} className="text-sm text-green-600 hover:text-green-700 font-medium">
              + Add Item
            </button>
          </div>
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <select
                    value=""
                    onChange={(e) => selectMedicine(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">Select medicine or type custom</option>
                    {medicines.map(med => (
                      <option key={med._id} value={med._id}>{med.name} ({med.currentStock || 0} in stock)</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Medicine name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Qty"
                />
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  min="0"
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Rate"
                />
                {formData.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Discount & Payment */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-1.5">Discount Type</label>
              <Select
                value={formData.discountType}
                onChange={(value) => setFormData(prev => ({ ...prev, discountType: value as 'percentage' | 'fixed' }))}
                options={DISCOUNT_TYPE_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-1.5">Discount Value</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5">Payment Mode</label>
            <Select
              value={formData.paymentMode}
              onChange={(value) => setFormData(prev => ({ ...prev, paymentMode: value as 'cash' | 'card' | 'upi' }))}
              options={PAYMENT_MODE_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              placeholder="Optional remarks"
            />
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-500">Subtotal</span>
              <span className="font-medium">₹{calculateSubtotal()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-500">Discount</span>
              <span className="font-medium text-red-600">-₹{calculateDiscount()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span className="text-green-600">₹{calculateTotal()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/dashboard/billing"
            className="flex-1 px-4 py-2.5 border border-gray-200 text-secondary-600 rounded-xl hover:bg-gray-50 transition-all font-sans font-semibold text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md shadow-green-500/20 font-sans font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Create Bill
          </button>
        </div>
      </form>
    </div>
  );
}
