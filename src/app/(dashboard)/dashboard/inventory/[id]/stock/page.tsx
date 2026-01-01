'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Package, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { medicineService, Medicine } from '@/lib/services';

export default function AddStockPage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params.id as string;

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    batchNo: '',
    quantity: '',
    purchasePrice: '',
    sellingPrice: '',
    expiryDate: '',
  });

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const response = await medicineService.getById(medicineId);
        setMedicine(response.data.medicine);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.batchNo.trim()) {
      toast.error('Batch number is required');
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      toast.error('Valid quantity is required');
      return;
    }
    if (!formData.expiryDate) {
      toast.error('Expiry date is required');
      return;
    }

    setSaving(true);
    try {
      await medicineService.addStock({
        medicineId,
        batchNo: formData.batchNo,
        quantity: parseInt(formData.quantity),
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : undefined,
        expiryDate: formData.expiryDate,
      });
      toast.success('Stock added successfully');
      router.push(`/dashboard/inventory/${medicineId}`);
    } catch (err: unknown) {
      const error = err as { error?: string };
      toast.error(error.error || 'Failed to add stock');
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
            <Package className="w-7 h-7 text-primary-600" />
            Add Stock
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Add stock batch for {medicine?.name}</p>
        </div>
      </div>

      {/* Medicine Info */}
      {medicine && (
        <div className="bg-primary-50 rounded-xl p-4">
          <p className="text-sm text-primary-600 font-sans">Medicine</p>
          <p className="font-semibold text-secondary-800">{medicine.name}</p>
          <p className="text-sm text-secondary-500">{medicine.genericName} • {medicine.category}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Batch Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
              placeholder="e.g., BATCH001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
              placeholder="Enter quantity"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Purchase Price (₹)
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
              placeholder="Cost price per unit"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Selling Price (₹)
            </label>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
              placeholder="Selling price per unit"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
              required
            />
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
            Add Stock
          </button>
        </div>
      </form>
    </div>
  );
}
