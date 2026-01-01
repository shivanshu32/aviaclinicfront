'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  User,
  Stethoscope,
  Clock,
  FileText,
  Receipt,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService, Appointment } from '@/lib/services';

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await appointmentService.getById(appointmentId);
        setAppointment(response.data.appointment);
      } catch (err) {
        console.error('Failed to fetch appointment:', err);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!appointment) return;
    
    if (newStatus === 'completed' && !appointment.billing?.hasBill) {
      toast.error('Please generate bill before marking appointment as completed');
      return;
    }

    setUpdatingStatus(true);
    try {
      await appointmentService.update(appointmentId, { status: newStatus as Appointment['status'] });
      setAppointment(prev => prev ? { ...prev, status: newStatus as Appointment['status'] } : null);
      toast.success(`Appointment ${newStatus === 'cancelled' ? 'cancelled' : 'updated'} successfully`);
    } catch {
      toast.error('Failed to update appointment');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-secondary-600 mb-4">{error || 'Appointment not found'}</p>
        <button
          onClick={() => router.back()}
          className="text-primary-600 hover:text-primary-700"
        >
          Go back
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'checked-in': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getNextAction = () => {
    switch (appointment.status) {
      case 'scheduled': return { action: 'checked-in', label: 'Check-in Patient', icon: UserCheck, color: 'bg-yellow-600 hover:bg-yellow-700' };
      case 'checked-in': return { action: 'in-progress', label: 'Start Consultation', icon: Play, color: 'bg-blue-600 hover:bg-blue-700' };
      case 'in-progress': return { action: 'completed', label: 'Complete', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' };
      default: return null;
    }
  };

  const nextAction = getNextAction();

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
              <Calendar className="w-7 h-7 text-primary-600" />
              Appointment Details
            </h1>
            <p className="text-secondary-400 mt-1 font-sans">Token #{appointment.tokenNo} • {appointment.appointmentId}</p>
          </div>
        </div>
        <span className={`px-4 py-2 text-sm font-semibold rounded-full capitalize ${getStatusColor(appointment.status)}`}>
          {appointment.status?.replace('-', ' ')}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Patient Info */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Patient Information
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600">
                  {appointment.patient?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xl font-semibold text-secondary-800">{appointment.patient?.name || 'Unknown'}</p>
                <p className="text-secondary-500">ID: {appointment.patient?.patientId}</p>
                <p className="text-secondary-500">{appointment.patient?.phone}</p>
              </div>
              <Link
                href={`/dashboard/patients/${appointment.patientId}`}
                className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all font-medium"
              >
                View Profile
              </Link>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Appointment Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Date</p>
                <p className="font-semibold text-secondary-800">
                  {new Date(appointment.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Type</p>
                <p className="font-semibold text-secondary-800 capitalize">{appointment.type}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Doctor</p>
                <p className="font-semibold text-secondary-800 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary-500" />
                  {appointment.doctor?.name || 'Not assigned'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Token</p>
                <p className="font-semibold text-secondary-800 text-2xl">#{appointment.tokenNo}</p>
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-secondary-700">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Billing Info */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary-500" />
              Billing
            </h2>
            {appointment.billing?.hasBill ? (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="font-semibold text-secondary-800">Bill Generated</p>
                  <p className="text-sm text-secondary-500">
                    Status: <span className={appointment.billing.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}>
                      {appointment.billing.paymentStatus}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/dashboard/billing/opd/${appointment.billing.billId}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium"
                >
                  View Bill
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-secondary-800">No Bill Generated</p>
                  <p className="text-sm text-secondary-500">
                    {appointment.status === 'scheduled' ? 'Check-in patient first to generate bill' : 'Create a bill for this appointment'}
                  </p>
                </div>
                {appointment.status !== 'scheduled' && (
                  <Link
                    href={`/dashboard/billing/opd/new?patient=${appointment.patientId}&appointment=${appointment._id}&doctor=${appointment.doctorId}`}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-medium"
                  >
                    Create Bill
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Actions</h2>
            <div className="space-y-3">
              {nextAction && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusUpdate(nextAction.action)}
                  disabled={updatingStatus}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl transition-all font-medium ${nextAction.color} disabled:opacity-50`}
                >
                  {updatingStatus ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <nextAction.icon className="w-5 h-5" />
                  )}
                  {nextAction.label}
                </button>
              )}

              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updatingStatus}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all font-medium disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel Appointment
                </button>
              )}

              {!appointment.billing?.hasBill && appointment.status !== 'scheduled' && (
                <Link
                  href={`/dashboard/billing/opd/new?patient=${appointment.patientId}&appointment=${appointment._id}&doctor=${appointment.doctorId}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-secondary-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  <Receipt className="w-5 h-5" />
                  Generate Bill
                </Link>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-800">Created</p>
                  <p className="text-sm text-secondary-400">
                    {new Date(appointment.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {appointment.updatedAt !== appointment.createdAt && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-800">Last Updated</p>
                    <p className="text-sm text-secondary-400">
                      {new Date(appointment.updatedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
