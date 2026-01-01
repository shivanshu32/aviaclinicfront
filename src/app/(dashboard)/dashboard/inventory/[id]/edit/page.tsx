'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Pill, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { medicineService, Medicine } from '@/lib/services';
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

export default function EditMedicinePage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'tablet',
    manufacturer: '',
    unit: 'tablets',
    reorderLevel: 10,
    isActive: true,
  });

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const response = await medicineService.getById(medicineId);
        const med = response.data.medicine as Medicine;
        setFormData({
          name: med.name || '',
          genericName: med.genericName || '',
          category: med.category || 'tablet',
          manufacturer: med.manufacturer || '',
          unit: med.unit || 'tablets',
          reorderLevel: med.reorderLevel || 10,
          isActive: med.isActive !== false,
        });
      } catch (err) {
        console.error('Failed to fetch medicine:', err);
        toast.error('Failed to load medicine');
        router.push('/dashboard/inventory');
      } finally {
        setLoading(false);
      }
    };

    if (medicineId) {
      fetchMedicine();
    }
  }, [medicineId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              name === 'reorderLevel' ? parseInt(value) || 0 : value,
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
      await medicineService.update(medicineId, formData);
      toast.success('Medicine updated successfully');
      router.push(`/dashboard/inventory/${medicineId}`);
    } catch (err: unknown) {
      const error = err as { error?: string };
      toast.error(error.error || 'Failed to update medicine');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/inventory/${medicineId}`}
          className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <Pill className="w-7 h-7 text-primary-600" />
            Edit Medicine
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Update medicine details</p>
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
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Category
            </label>
            <Select
              name="category"
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              options={CATEGORIES}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Unit
            </label>
            <Select
              name="unit"
              value={formData.unit}
              onChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
              options={UNITS}
            />
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
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-semibold text-secondary-700 font-sans">Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Link
            href={`/dashboard/inventory/${medicineId}`}
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
