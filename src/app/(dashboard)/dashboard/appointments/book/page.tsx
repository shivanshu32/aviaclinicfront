'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Calendar, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService, patientService, doctorService, Patient, Doctor } from '@/lib/services';
import Select from '@/components/ui/Select';

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get('patient');
  
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [initialPatientLoading, setInitialPatientLoading] = useState(!!patientIdFromUrl);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'new' as 'new' | 'follow-up',
    notes: '',
  });

  useEffect(() => {
    fetchDoctors();
    if (patientIdFromUrl) fetchPatientById(patientIdFromUrl);
  }, [patientIdFromUrl]);
  
  const fetchPatientById = async (id: string) => {
    try {
      setInitialPatientLoading(true);
      const response = await patientService.getById(id);
      const patient = response.data.patient;
      setSelectedPatient(patient);
      setFormData(prev => ({ ...prev, patientId: patient._id }));
    } catch {
      toast.error('Failed to load patient');
    } finally {
      setInitialPatientLoading(false);
    }
  };

  useEffect(() => {
    const doSearch = async () => {
      setSearchingPatients(true);
      try {
        const response = await patientService.getAll({ search: patientSearch, limit: 10 });
        setPatients(response.data.patients);
      } catch { /* ignore */ } finally { setSearchingPatients(false); }
    };
    if (patientSearch.length >= 2) doSearch();
    else setPatients([]);
  }, [patientSearch]);

  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getAll({ isActive: true });
      setDoctors(response.data.doctors);
      if (response.data.doctors.length > 0) setFormData(prev => ({ ...prev, doctorId: response.data.doctors[0]._id }));
    } catch { /* ignore */ }
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId: patient._id }));
    setPatientSearch('');
    setPatients([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) { toast.error('Select a patient'); return; }
    if (!formData.doctorId) { toast.error('Select a doctor'); return; }

    setLoading(true);
    try {
      await appointmentService.create(formData);
      toast.success('Appointment booked');
      router.push('/dashboard/appointments');
    } catch (err: unknown) {
      toast.error((err as { error?: string }).error || 'Failed to book');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="h-full flex flex-col -m-4 sm:-m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <Link href="/dashboard/appointments" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <Calendar className="w-5 h-5 text-primary-600" />
        <h1 className="text-lg font-semibold text-gray-900">Book Appointment</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 p-4 bg-white space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Patient *</label>
            {initialPatientLoading ? (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : selectedPatient ? (
              <div className="flex items-center justify-between p-2 bg-primary-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-medium text-primary-600">
                    {selectedPatient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedPatient.name}</p>
                    <p className="text-xs text-gray-500">{selectedPatient.patientId} • {selectedPatient.phone}</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedPatient(null); setFormData(prev => ({ ...prev, patientId: '' })); }} className="text-xs text-primary-600 hover:text-primary-700">
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} placeholder="Search patient..." className={`${inputClass} pl-9`} />
                {searchingPatients && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
                {patients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {patients.map((patient) => (
                      <button key={patient._id} type="button" onClick={() => selectPatient(patient)} className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-left">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-medium text-primary-600">
                          {patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">{patient.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              <Link href="/dashboard/patients/add" className="text-primary-600 hover:text-primary-700">+ Add new patient</Link>
            </p>
          </div>

          {/* Doctor & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Doctor *</label>
              <Select
                value={formData.doctorId}
                onChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}
                options={[{ value: '', label: 'Select' }, ...doctors.map(d => ({ value: d._id, label: d.name }))]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} className={inputClass} />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" name="type" value="new" checked={formData.type === 'new'} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'new' | 'follow-up' }))} className="w-4 h-4 text-primary-600" />
                New Visit
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" name="type" value="follow-up" checked={formData.type === 'follow-up'} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'new' | 'follow-up' }))} className="w-4 h-4 text-primary-600" />
                Follow-up
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={2} className={inputClass} placeholder="Optional notes..." />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50">
          <Link href="/dashboard/appointments" className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Book
          </button>
        </div>
      </form>
    </div>
  );
}
