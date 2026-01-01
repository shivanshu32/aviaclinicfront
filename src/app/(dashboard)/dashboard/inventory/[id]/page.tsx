'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Loader2, 
  Pill, 
  Edit, 
  Package,
  AlertTriangle,
  Calendar,
  Plus,
  IndianRupee,
} from 'lucide-react';
import { medicineService, Medicine, StockBatch } from '@/lib/services';

export default function MedicineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params.id as string;

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true);
        const response = await medicineService.getById(medicineId);
        setMedicine(response.data.medicine);
        setBatches(response.data.batches || []);
      } catch (err) {
        console.error('Failed to fetch medicine:', err);
        setError('Failed to load medicine details');
      } finally {
        setLoading(false);
      }
    };

    if (medicineId) {
      fetchMedicine();
    }
  }, [medicineId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-secondary-600 mb-4">{error || 'Medicine not found'}</p>
        <button
          onClick={() => router.back()}
          className="text-primary-600 hover:text-primary-700"
        >
          Go back
        </button>
      </div>
    );
  }

  const totalStock = batches.reduce((sum, b) => sum + (b.currentQty || 0), 0);
  const isLowStock = totalStock <= medicine.reorderLevel;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
              <Pill className="w-7 h-7 text-primary-600" />
              {medicine.name}
            </h1>
            <p className="text-secondary-400 mt-1 font-sans">ID: {medicine.medicineId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/inventory/${medicine._id}/stock`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-secondary-700 rounded-xl hover:bg-gray-50 transition-all font-sans font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </Link>
          <Link
            href={`/dashboard/inventory/${medicine._id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Medicine Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-secondary-800 mb-4">Medicine Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-secondary-400 font-sans">Generic Name</p>
              <p className="text-secondary-700 font-sans font-medium">{medicine.genericName || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-400 font-sans">Category</p>
              <p className="text-secondary-700 font-sans font-medium capitalize">{medicine.category}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-400 font-sans">Manufacturer</p>
              <p className="text-secondary-700 font-sans font-medium">{medicine.manufacturer || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-400 font-sans">Unit</p>
              <p className="text-secondary-700 font-sans font-medium">{medicine.unit}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-400 font-sans">Reorder Level</p>
              <p className="text-secondary-700 font-sans font-medium">{medicine.reorderLevel}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-400 font-sans">Status</p>
              <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                medicine.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {medicine.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-secondary-800 mb-4">Stock Summary</h2>
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
              isLowStock ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <Package className={`w-10 h-10 ${isLowStock ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <p className={`text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-secondary-800'}`}>
              {totalStock}
            </p>
            <p className="text-secondary-400 font-sans text-sm">{medicine.unit} in stock</p>
            {isLowStock && (
              <div className="mt-3 flex items-center justify-center gap-1 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Low Stock Alert
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Batches */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-800">Stock Batches</h2>
          <Link
            href={`/dashboard/inventory/${medicine._id}/stock`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            + Add Batch
          </Link>
        </div>
        {batches.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-secondary-400 font-sans">No stock batches found</p>
            <Link
              href={`/dashboard/inventory/${medicine._id}/stock`}
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-sans font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add first batch
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase">Batch No</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-secondary-400 uppercase">Qty</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-secondary-400 uppercase hidden md:table-cell">Purchase</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-secondary-400 uppercase hidden md:table-cell">Selling</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase">Expiry</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => {
                  const isExpired = new Date(batch.expiryDate) < new Date();
                  const isExpiringSoon = !isExpired && new Date(batch.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                  return (
                    <tr key={batch._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-secondary-800">{batch.batchNo}</td>
                      <td className="px-6 py-4 text-right font-semibold text-secondary-800">{batch.currentQty}</td>
                      <td className="px-6 py-4 text-right hidden md:table-cell">
                        <span className="flex items-center justify-end gap-1 text-secondary-600">
                          <IndianRupee className="w-3 h-3" />{batch.purchasePrice}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right hidden md:table-cell">
                        <span className="flex items-center justify-end gap-1 text-secondary-600">
                          <IndianRupee className="w-3 h-3" />{batch.sellingPrice}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-secondary-600'}`}>
                          <Calendar className="w-4 h-4" />
                          {new Date(batch.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          isExpired ? 'bg-red-100 text-red-700' :
                          isExpiringSoon ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
