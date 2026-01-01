'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCog, 
  Plus, 
  Loader2,
  Phone,
  Mail,
  Edit,
  IndianRupee,
} from 'lucide-react';
import { doctorService, Doctor } from '@/lib/services';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await doctorService.getAll();
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <UserCog className="w-7 h-7 text-primary-600" />
            Doctors
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Manage your clinic doctors</p>
        </div>
        <Link
          href="/dashboard/doctors/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Doctor
        </Link>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12">
          <UserCog className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No doctors found</p>
          <Link
            href="/dashboard/doctors/add"
            className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700"
          >
            <Plus className="w-4 h-4" />
            Add your first doctor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Link key={doctor._id} href={`/dashboard/doctors/${doctor._id}`} className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6 hover:shadow-md transition-all block">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary-600 font-sans">
                      {getInitials(doctor.name)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-secondary-800">{doctor.name}</h3>
                    <p className="text-sm text-secondary-400 font-sans">{doctor.specialization || 'General'}</p>
                  </div>
                </div>
                <span
                  onClick={(e) => { e.preventDefault(); }}
                  className="p-2 text-secondary-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit className="w-4 h-4" />
                </span>
              </div>

              {doctor.qualification && (
                <p className="text-sm text-secondary-500 mb-3 font-sans">{doctor.qualification}</p>
              )}

              <div className="space-y-2 text-sm">
                {doctor.phone && (
                  <p className="flex items-center gap-2 text-secondary-600 font-sans">
                    <Phone className="w-4 h-4 text-secondary-300" />
                    {doctor.phone}
                  </p>
                )}
                {doctor.email && (
                  <p className="flex items-center gap-2 text-secondary-600 font-sans">
                    <Mail className="w-4 h-4 text-secondary-300" />
                    {doctor.email}
                  </p>
                )}
                {doctor.consultationFee !== undefined && doctor.consultationFee > 0 && (
                  <p className="flex items-center gap-2 text-secondary-600 font-sans">
                    <IndianRupee className="w-4 h-4 text-secondary-300" />
                    {doctor.consultationFee} consultation fee
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-xl font-sans ${
                  doctor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {doctor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
