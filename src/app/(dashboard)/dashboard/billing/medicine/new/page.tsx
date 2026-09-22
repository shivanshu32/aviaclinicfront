'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Pill, Save, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingService, patientService, Patient, medicineService, Medicine, StockBatch } from '@/lib/services';
import Select from '@/components/ui/Select';
import { availableBatches, batchStockError } from '@/lib/medicineBatches';

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'percentage', label: 'Percentage' },
];

const PAYMENT_MODE_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
];

const MISSING_PRICE = 'Price not configured for this medicine. Please update the medicine price in Pharmacy.';
interface MedicineBillRow {
  rowId: number;
  medicineId: string;
  description: string;
  quantity: number;
  rate: number | null;
  loadingPrice: boolean;
  priceError: string;
  selectionId: number;
  batchId: string;
  batchNo: string;
  expiryDate: string;
  availableStock: number;
  batches: StockBatch[];
  hasBatchRecords: boolean;
}
const emptyItem = (rowId: number): MedicineBillRow => ({
  rowId, medicineId: '', description: '', quantity: 1, rate: null,
  loadingPrice: false, priceError: '', selectionId: 0,
  batchId: '', batchNo: '', expiryDate: '', availableStock: 0, batches: [], hasBatchRecords: false,
});

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
  const nextId = useRef(0);
  const [batchRowId, setBatchRowId] = useState<number | null>(null);
  const [chosenBatchId, setChosenBatchId] = useState('');

  const [formData, setFormData] = useState({
    items: [emptyItem(0)],
    discountType: 'fixed' as 'percentage' | 'fixed',
    discountValue: 0,
    paymentMode: 'cash' as 'cash' | 'card' | 'upi',
    remarks: '',
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const allMedicines: Medicine[] = [];
        let page = 1;
        let pages = 1;
        do {
          const response = await medicineService.getAll({ includeStock: true, limit: 100, page });
          allMedicines.push(...(response.data?.medicines || []));
          pages = response.data?.pagination?.pages || 1;
          page += 1;
        } while (page <= pages);
        setMedicines(allMedicines);

        if (patientIdFromUrl) {
          const patientRes = await patientService.getById(patientIdFromUrl);
          setSelectedPatient(patientRes.data.patient);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        toast.error('Failed to load billing data. Please reload and try again.');
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
    const row = emptyItem(++nextId.current);
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, row],
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

  const selectMedicine = async (rowId: number, medicineId: string) => {
    const medicine = medicines.find(m => m._id === medicineId);
    const selectionId = ++nextId.current;
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.rowId === rowId ? {
        ...item, medicineId, description: medicine?.name || '', rate: null,
        batchId: '', batchNo: '', expiryDate: '', availableStock: 0, batches: [], hasBatchRecords: false,
        loadingPrice: !!medicine, priceError: '', selectionId,
      } : item),
    }));
    setChosenBatchId('');
    setBatchRowId(medicine ? rowId : null);
    if (!medicine) return;
    try {
      const response = await medicineService.getById(medicineId);
      const records = response.data?.batches;
      if (!Array.isArray(records)) throw new Error('Missing batch data');
      const batches = availableBatches(records);
      const savedPrice = response.data?.medicine?.sellingPrice;
      const directRate = typeof savedPrice === 'number' && Number.isFinite(savedPrice) && savedPrice > 0 ? savedPrice : null;
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item => item.rowId === rowId && item.selectionId === selectionId
          ? { ...item, batches, hasBatchRecords: records.length > 0, loadingPrice: false,
              ...(records.length === 0 ? { rate: directRate, priceError: directRate === null ? MISSING_PRICE : '' }
                : batches.length === 1 ? batchFields(batches[0]) : { priceError: batches.length ? 'Please select a medicine batch.' : 'No unexpired batches with available stock.' }) } : item),
      }));
    } catch {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item => item.rowId === rowId && item.selectionId === selectionId
          ? { ...item, loadingPrice: false, priceError: 'Unable to load the Pharmacy price. Please select the medicine again.' } : item),
      }));
    }
  };

  const batchFields = (batch: StockBatch) => {
    const rate = typeof batch.sellingPrice === 'number' && Number.isFinite(batch.sellingPrice) && batch.sellingPrice > 0 ? batch.sellingPrice : null;
    return { batchId: batch._id, batchNo: batch.batchNo, expiryDate: batch.expiryDate,
      availableStock: batch.currentQty, rate, priceError: rate === null ? MISSING_PRICE : '' };
  };
  const batchRow = formData.items.find(item => item.rowId === batchRowId);
  const showBatchModal = !!batchRow && !batchRow.loadingPrice && batchRow.hasBatchRecords && !batchRow.batchId;
  const stockError = formData.items.map(item => batchStockError(formData.items, item.batchId)).find(Boolean);
  const cancelBatch = () => {
    const selectionId = ++nextId.current;
    setFormData(prev => ({ ...prev, items: prev.items.map(item => item.rowId === batchRowId && item.loadingPrice
      ? { ...item, selectionId, loadingPrice: false, priceError: 'Please select a medicine batch.' } : item) }));
    setBatchRowId(null);
  };
  const confirmBatch = () => {
    const batch = batchRow?.batches.find(batch => batch._id === chosenBatchId);
    if (!batch) return;
    setFormData(prev => ({ ...prev, items: prev.items.map(item => item.rowId === batchRowId
      ? { ...item, ...batchFields(batch) } : item) }));
    setBatchRowId(null);
  };

  const hasUnpricedItems = formData.items.some(item => item.medicineId && (item.rate === null || item.loadingPrice || item.priceError));

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * (item.rate ?? 0)), 0);
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
    if (formData.items.length === 0 || formData.items.some(item => !item.medicineId)) {
      toast.error('Please select a medicine for every item');
      return;
    }
    if (stockError) { toast.error(stockError); return; }
    if (hasUnpricedItems) {
      toast.error(formData.items.find(item => item.priceError)?.priceError || 'Please wait for the Pharmacy price to load.');
      return;
    }
    if (formData.items.some(item => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      toast.error('Medicine quantity must be a positive whole number');
      return;
    }

    setSaving(true);
    try {
      const payload: {
        patientId?: string;
        patientName?: string;
        patientPhone?: string;
        items: { batchId: string; medicineId: string; description: string; quantity: number; rate: number }[];
        discountType?: 'percentage' | 'fixed';
        discountValue?: number;
        paymentMode: string;
        remarks?: string;
      } = {
        items: formData.items.map(item => ({ batchId: item.batchId, medicineId: item.medicineId, description: item.description, quantity: item.quantity, rate: item.rate! })),
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

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500";

  if (initialLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="h-full flex flex-col -m-4 sm:-m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <Link href="/dashboard/billing" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <Pill className="w-5 h-5 text-green-600" />
        <h1 className="text-lg font-semibold text-gray-900">New Medicine Bill</h1>
        <div className="ml-auto bg-green-50 px-4 py-1.5 rounded-xl">
          <span className="font-semibold text-green-700">{hasUnpricedItems ? 'Price unavailable' : `₹${calculateTotal()}`}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white space-y-5 overflow-y-auto">
          {/* Customer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Customer</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isWalkIn} onChange={(e) => { setIsWalkIn(e.target.checked); if (e.target.checked) setSelectedPatient(null); }} className="w-4 h-4 rounded border-gray-300 text-green-600" />
                <span>Walk-in Customer</span>
              </label>
            </div>
            {isWalkIn ? (
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={walkInDetails.name} onChange={(e) => setWalkInDetails(p => ({ ...p, name: e.target.value }))} placeholder="Customer name" className={inputClass} />
                <input type="tel" value={walkInDetails.phone} onChange={(e) => setWalkInDetails(p => ({ ...p, phone: e.target.value }))} placeholder="Phone (optional)" className={inputClass} />
              </div>
            ) : selectedPatient ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                  <p className="text-sm text-gray-500">{selectedPatient.patientId} • {selectedPatient.phone}</p>
                </div>
                <button type="button" onClick={() => setSelectedPatient(null)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={patientSearch} onChange={(e) => { setPatientSearch(e.target.value); searchPatients(e.target.value); }} placeholder="Search patient by name or phone..." className={`${inputClass} pl-11`} />
                {searchingPatients && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />}
                {patients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {patients.map(p => (
                      <button key={p._id} type="button" onClick={() => { setSelectedPatient(p); setPatients([]); setPatientSearch(''); }} className="w-full p-3 text-left hover:bg-gray-50">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-gray-500">{p.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Medicines</label>
              <button type="button" onClick={addItem} className="text-sm text-green-600 font-medium">+ Add Item</button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item, idx) => (
                <div key={item.rowId} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <select value={item.medicineId} onChange={(e) => selectMedicine(item.rowId, e.target.value)} className={`${inputClass} mb-2`}>
                      <option value="">Select medicine</option>
                      {medicines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.currentStock || 0})</option>)}
                    </select>
                    <input type="text" value={item.description} readOnly placeholder="Medicine name" className={inputClass} />
                    {item.batchId && <p className="mt-1 text-sm text-gray-500">Batch: {item.batchNo} · Expiry: {new Date(item.expiryDate).toLocaleDateString()} · Available: {item.availableStock}</p>}
                    {item.medicineId && item.hasBatchRecords && !item.loadingPrice && <button type="button" className="mt-1 text-sm text-green-600" onClick={() => selectMedicine(item.rowId, item.medicineId)}>Select Batch</button>}
                    {batchStockError(formData.items, item.batchId) && <p role="alert" className="mt-1 text-sm text-red-600">{batchStockError(formData.items, item.batchId)}</p>}
                    {item.priceError && <p role="alert" className="mt-1 text-sm text-red-600">{item.priceError}</p>}
                    {item.loadingPrice && <p className="mt-1 text-sm text-gray-500">Loading Pharmacy price…</p>}
                    {item.rate !== null && <p className="mt-1 text-sm text-gray-500">Line total: ₹{item.quantity * item.rate}</p>}
                  </div>
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} min="1" className="w-20 px-4 py-2.5 border border-gray-200 rounded-xl" placeholder="Qty" />
                  <input type="number" value={item.rate ?? ''} readOnly aria-label="Pharmacy price" className="w-24 px-4 py-2.5 border border-gray-200 rounded-xl" placeholder="Rate" />
                  {formData.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-5 h-5" /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* Discount & Payment */}
          <div className="grid grid-cols-3 gap-4">
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
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-2"><span className="text-gray-500">Subtotal</span><span className="font-medium">{hasUnpricedItems ? '—' : `₹${calculateSubtotal()}`}</span></div>
            <div className="flex justify-between mb-2"><span className="text-gray-500">Discount</span><span className="font-medium text-red-600">{hasUnpricedItems ? '—' : `-₹${calculateDiscount()}`}</span></div>
            <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-3 mt-2"><span>Total</span><span className="text-green-600">{hasUnpricedItems ? 'Price unavailable' : `₹${calculateTotal()}`}</span></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Link href="/dashboard/billing" className="px-4 py-2.5 font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={saving || hasUnpricedItems || !!stockError} className="flex items-center gap-2 px-4 py-2.5 font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Bill
          </button>
        </div>
      </form>
      {showBatchModal && batchRow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onKeyDown={e => {
          if (e.key === 'Escape') cancelBatch();
          if (e.key === 'Tab') {
            const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)'));
            const first = controls[0], last = controls[controls.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
          }
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="batch-title" className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 id="batch-title" className="text-xl font-semibold text-gray-900">Select Medicine Batch</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">{batchRow.description}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">Earliest expiry first</span>
              </div>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6 bg-gray-50/70">
              {batchRow.loadingPrice ? <p className="py-6 text-center text-gray-500">Loading batches…</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {batchRow.batches.map(batch => {
                    const nearExpiry = new Date(batch.expiryDate).getTime() - Date.now() <= 90 * 86400000;
                    const priced = Number.isFinite(batch.sellingPrice) && batch.sellingPrice > 0;
                    const selected = chosenBatchId === batch._id;
                    return (
                      <label key={batch._id} className={`relative rounded-2xl border p-5 transition-all focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 ${
                        !priced ? 'bg-gray-100 border-gray-200 opacity-70 cursor-not-allowed'
                          : selected ? 'bg-green-50 border-green-600 ring-1 ring-green-600 cursor-pointer shadow-sm'
                          : 'bg-white border-gray-200 hover:border-green-400 hover:shadow-sm cursor-pointer'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Batch number</p>
                            <p className="mt-1 text-base font-semibold text-gray-900 break-words">{batch.batchNo}</p>
                          </div>
                          <input type="radio" name="medicine-batch" aria-label={`Select batch ${batch.batchNo}`} checked={selected} disabled={!priced} onChange={() => setChosenBatchId(batch._id)} className="mt-1 h-5 w-5 shrink-0 accent-green-600" />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{batch.currentQty} units available</span>
                          {nearExpiry && <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800">Near expiry</span>}
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                          <div className="col-span-2"><dt className="text-gray-500">Expiry date</dt><dd className={`mt-0.5 font-medium ${nearExpiry ? 'text-orange-700' : 'text-gray-800'}`}>{new Date(batch.expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
                          <div><dt className="text-gray-500">Purchase price</dt><dd className="mt-0.5 font-medium text-gray-800">{batch.purchasePrice != null ? `₹${batch.purchasePrice}` : '—'}</dd></div>
                          <div><dt className="text-gray-500">MRP</dt><dd className="mt-0.5 font-medium text-gray-800">{batch.mrp != null ? `₹${batch.mrp}` : 'Not configured'}</dd></div>
                        </dl>
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-200/70 pt-4">
                          <span className="text-sm text-gray-600">Selling price</span>
                          <span className={priced ? 'text-xl font-semibold text-green-700' : 'text-sm font-medium text-red-600'}>{priced ? `₹${batch.sellingPrice}` : 'Price not configured'}</span>
                        </div>
                      </label>
                    );
                  })}
                  {!batchRow.batches.length && <p role="alert" className="col-span-full py-4 text-center text-red-600">{batchRow.priceError}</p>}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
              <button autoFocus type="button" onClick={cancelBatch} className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="button" disabled={!chosenBatchId || batchRow.loadingPrice} onClick={confirmBatch} className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Select Batch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
