'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Pill, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { medicineService } from '@/lib/services';

const CATEGORIES = [
  'tablet',
  'capsule',
  'syrup',
  'injection',
  'cream',
  'ointment',
  'drops',
  'powder',
  'inhaler',
  'other',
];

const UNITS = ['tablets', 'capsules', 'ml', 'mg', 'gm', 'strips', 'bottles', 'vials', 'tubes', 'pcs'];

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/inventory"
          className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <Pill className="w-7 h-7 text-primary-600" />
            Add Medicine
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Add a new medicine to inventory</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
              placeholder="e.g., Paracetamol 500mg"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Generic Name
            </label>
            <input
              type="text"
              name="genericName"
              value={formData.genericName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
              placeholder="e.g., Acetaminophen"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700 capitalize"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Unit
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
            >
              {UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Manufacturer
            </label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
              placeholder="e.g., Sun Pharma"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Reorder Level
            </label>
            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
            />
            <p className="text-xs text-secondary-400 mt-1">Alert when stock falls below this level</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/dashboard/inventory"
            className="flex-1 px-4 py-2.5 border border-gray-200 text-secondary-600 rounded-xl hover:bg-gray-50 transition-all font-sans font-semibold text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Add Medicine
          </button>
        </div>
      </form>
    </div>
  );
}
