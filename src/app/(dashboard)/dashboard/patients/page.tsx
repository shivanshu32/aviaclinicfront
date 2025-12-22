'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Loader2,
  Phone,
  Mail,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { patientService, Patient } from '@/lib/services';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPatients();
  }, [page, search]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await patientService.getAll({
        search: search || undefined,
        page,
        limit: 20,
      });
      setPatients(response.data.patients);
      setTotalPages(response.data.pagination.pages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
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
            <Users className="w-7 h-7 text-primary-600" />
            Patients
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Manage your patient records</p>
        </div>
        <Link
          href="/dashboard/patients/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Patient
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or patient ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700 placeholder:text-secondary-300"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gray-100 text-secondary-600 rounded-xl hover:bg-gray-200 transition-all font-sans font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No patients found</p>
            <Link
              href="/dashboard/patients/add"
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4" />
              Add your first patient
            </Link>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Patient</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden md:table-cell">Contact</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden lg:table-cell">Details</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary-600 font-sans">
                              {getInitials(patient.name)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-secondary-800 font-sans">{patient.name}</p>
                            <p className="text-sm text-secondary-400 font-sans">ID: {patient.patientId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="space-y-1">
                          <p className="text-sm text-secondary-600 flex items-center gap-1 font-sans">
                            <Phone className="w-3.5 h-3.5" />
                            {patient.phone}
                          </p>
                          {patient.email && (
                            <p className="text-sm text-secondary-400 flex items-center gap-1 font-sans">
                              <Mail className="w-3.5 h-3.5" />
                              {patient.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="space-y-1">
                          <p className="text-sm text-secondary-600 font-sans">
                            {patient.age} yrs, {patient.gender}
                          </p>
                          {patient.bloodGroup && (
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg font-sans">
                              {patient.bloodGroup}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/patients/${patient._id}`}
                            className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/patients/${patient._id}/edit`}
                            className="p-2 text-secondary-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-secondary-400 font-sans">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} patients
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-secondary-400 hover:bg-gray-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-secondary-600 font-sans font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-secondary-400 hover:bg-gray-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
