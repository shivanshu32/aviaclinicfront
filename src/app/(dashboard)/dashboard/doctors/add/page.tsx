'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorService } from '@/lib/services';

export default function AddDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    phone: '',
    email: '',
    consultationFee: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Name is required'); return; }

    setLoading(true);
    try {
      await doctorService.create({
        name: formData.name,
        specialization: formData.specialization || undefined,
        qualification: formData.qualification || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        consultationFee: formData.consultationFee ? parseInt(formData.consultationFee) : undefined,
      });
      toast.success('Doctor added successfully');
      router.push('/dashboard/doctors');
    } catch (err: unknown) {
      toast.error((err as { error?: string }).error || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="h-full flex flex-col -m-4 sm:-m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <Link href="/dashboard/doctors" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <Stethoscope className="w-5 h-5 text-primary-600" />
        <h1 className="text-lg font-semibold text-gray-900">Add New Doctor</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 p-4 bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Dr. John Doe" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Specialization</label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className={inputClass} placeholder="General Physician" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Qualification</label>
              <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className={inputClass} placeholder="MBBS, MD" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fee (₹)</label>
              <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} min="0" className={inputClass} placeholder="500" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={10} className={inputClass} placeholder="10-digit phone" />
            </div>
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="doctor@clinic.com" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50">
          <Link href="/dashboard/doctors" className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Doctor
          </button>
        </div>
      </form>
    </div>
  );
}
