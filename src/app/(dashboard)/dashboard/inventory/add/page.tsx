'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Pill, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { medicineService } from '@/lib/services';
import Select from '@/components/ui/Select';

const CATEGORIES = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'injection', label: 'Injection' },
  { value: 'cream', label: 'Cream' },
  { value: 'ointment', label: 'Ointment' },
  { value: 'drops', label: 'Drops' },
  { value: 'powder', label: 'Powder' },
  { value: 'inhaler', label: 'Inhaler' },
  { value: 'other', label: 'Other' },
];

const UNITS = [
  { value: 'tablets', label: 'Tablets' },
  { value: 'capsules', label: 'Capsules' },
  { value: 'ml', label: 'ML' },
  { value: 'mg', label: 'MG' },
  { value: 'gm', label: 'GM' },
  { value: 'strips', label: 'Strips' },
  { value: 'bottles', label: 'Bottles' },
  { value: 'vials', label: 'Vials' },
  { value: 'tubes', label: 'Tubes' },
  { value: 'pcs', label: 'Pcs' },
];

export default function AddMedicinePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'tablet',
    manufacturer: '',
    unit: 'tablets',
    reorderLevel: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reorderLevel' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Medicine name is required');
      return;
    }

    setSaving(true);
    try {
      await medicineService.create(formData);
      toast.success('Medicine added successfully');
      router.push('/dashboard/inventory');
    } catch (err: unknown) {
      const error = err as { error?: string };
      toast.error(error.error || 'Failed to add medicine');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="h-full flex flex-col -m-4 sm:-m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <Link href="/dashboard/inventory" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <Pill className="w-5 h-5 text-primary-600" />
        <h1 className="text-lg font-semibold text-gray-900">Add Medicine</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Medicine Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g., Paracetamol 500mg" required />
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Generic Name</label>
              <input type="text" name="genericName" value={formData.genericName} onChange={handleChange} className={inputClass} placeholder="e.g., Acetaminophen" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <Select value={formData.category} onChange={(v) => setFormData(p => ({ ...p, category: v }))} options={CATEGORIES} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
              <Select value={formData.unit} onChange={(v) => setFormData(p => ({ ...p, unit: v }))} options={UNITS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reorder Level</label>
              <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} min="0" className={inputClass} />
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Manufacturer</label>
              <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} className={inputClass} placeholder="e.g., Sun Pharma" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Link href="/dashboard/inventory" className="px-4 py-2.5 font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2.5 font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Add Medicine
          </button>
        </div>
      </form>
    </div>
  );
}
