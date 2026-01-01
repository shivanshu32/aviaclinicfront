'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Loader2, 
  Stethoscope, 
  Edit,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { doctorService, Doctor, appointmentService, Appointment } from '@/lib/services';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [doctorRes, appointmentsRes] = await Promise.all([
          doctorService.getById(doctorId),
          appointmentService.getAll({ doctorId, date: new Date().toISOString().split('T')[0] }),
        ]);
        setDoctor(doctorRes.data.doctor);
        setAppointments(appointmentsRes.data.appointments || []);
      } catch (err) {
        console.error('Failed to fetch doctor:', err);
        setError('Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchData();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-secondary-600 mb-4">{error || 'Doctor not found'}</p>
        <button
          onClick={() => router.back()}
          className="text-primary-600 hover:text-primary-700"
        >
          Go back
        </button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const todayStats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(a => ['scheduled', 'checked-in', 'in-progress'].includes(a.status)).length,
  };

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
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <span className="text-xl font-bold text-primary-600">{getInitials(doctor.name)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-secondary-800">{doctor.name}</h1>
              <p className="text-secondary-400 font-sans">{doctor.specialization || 'General Physician'}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/appointments/book?doctor=${doctor._id}`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-secondary-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
          >
            <Calendar className="w-4 h-4" />
            Book Appointment
          </Link>
          <Link
            href={`/dashboard/doctors/${doctor._id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Today&apos;s Appointments</p>
              <p className="text-2xl font-heading font-bold text-secondary-800 mt-1">{todayStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Completed</p>
              <p className="text-2xl font-heading font-bold text-green-600 mt-1">{todayStats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-500/20">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Pending</p>
              <p className="text-2xl font-heading font-bold text-orange-600 mt-1">{todayStats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Doctor Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary-500" />
              Doctor Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Specialization</p>
                <p className="font-medium text-secondary-800">{doctor.specialization || 'General Physician'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Qualification</p>
                <p className="font-medium text-secondary-800 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary-500" />
                  {doctor.qualification || 'MBBS'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Phone</p>
                <p className="font-medium text-secondary-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-500" />
                  {doctor.phone || 'Not provided'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium text-secondary-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  {doctor.email || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Today&apos;s Queue
            </h2>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-secondary-400">No appointments for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <Link
                    key={apt._id}
                    href={`/dashboard/appointments/${apt._id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200 font-bold text-primary-600">
                        #{apt.tokenNo}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-800">{apt.patient?.name || 'Unknown'}</p>
                        <p className="text-sm text-secondary-400">{apt.type} • {apt.patient?.phone}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                      apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      apt.status === 'checked-in' ? 'bg-yellow-100 text-yellow-700' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {apt.status?.replace('-', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Account Status</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  doctor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {doctor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Consultation Fee</span>
                <span className="font-semibold text-secondary-800">₹{doctor.consultationFee || 500}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              Working Hours
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-500">Mon - Fri</span>
                <span className="text-secondary-800 font-medium">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Saturday</span>
                <span className="text-secondary-800 font-medium">9:00 AM - 2:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Sunday</span>
                <span className="text-secondary-400">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
