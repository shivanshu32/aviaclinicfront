'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Plus, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
  CheckCircle,
  XCircle,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService, Appointment } from '@/lib/services';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await appointmentService.getAll({ date: selectedDate });
        setAppointments(response.data.appointments);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [selectedDate]);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string, hasBill = false) => {
    if (newStatus === 'completed' && !hasBill) {
      toast.error('Please generate bill before marking appointment as completed');
      return;
    }

    setUpdatingId(appointmentId);
    try {
      await appointmentService.update(appointmentId, { status: newStatus as Appointment['status'] });
      setAppointments(prev => prev.map(apt => 
        apt._id === appointmentId ? { ...apt, status: newStatus as Appointment['status'] } : apt
      ));
      toast.success(`Appointment ${newStatus === 'cancelled' ? 'cancelled' : 'updated'} successfully`);
    } catch {
      toast.error('Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'checked-in': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'scheduled': return { action: 'checked-in', label: 'Check-in', icon: UserCheck, color: 'text-yellow-600 hover:bg-yellow-50' };
      case 'checked-in': return { action: 'in-progress', label: 'Start', icon: Play, color: 'text-blue-600 hover:bg-blue-50' };
      case 'in-progress': return { action: 'completed', label: 'Complete', icon: CheckCircle, color: 'text-green-600 hover:bg-green-50' };
      default: return null;
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary-600" />
            Appointments
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Manage patient appointments</p>
        </div>
        <Link
          href="/dashboard/appointments/book"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold"
        >
          <Plus className="w-5 h-5" />
          Book Appointment
        </Link>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5 text-secondary-500" />
          </button>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
            />
            <span className="text-lg font-heading font-semibold text-secondary-800 hidden md:block">
              {formatDisplayDate(selectedDate)}
            </span>
          </div>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ChevronRight className="w-5 h-5 text-secondary-500" />
          </button>
        </div>
        <div className="flex justify-center mt-3">
          <button 
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-4 py-1.5 text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all font-sans"
          >
            Today
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments for this date</p>
            <Link
              href="/dashboard/appointments/book"
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4" />
              Book an appointment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((apt) => {
              const nextAction = getNextAction(apt.status);
              const isUpdating = updatingId === apt._id;
              return (
                <div key={apt._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Patient Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-medium text-primary-600">
                          {getInitials(apt.patient?.name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{apt.patient?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">
                          Token #{apt.tokenNo} • {apt.doctor?.name || 'No doctor'} • {apt.type}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        {apt.billing?.hasBill ? (
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            apt.billing.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {apt.billing.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                            No Bill
                          </span>
                        )}
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(apt.status)}`}>
                          {apt.status?.replace('-', ' ')}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {nextAction && apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusUpdate(apt._id, nextAction.action, apt.billing?.hasBill)}
                            disabled={isUpdating}
                            className={`p-2 rounded-lg transition-colors ${nextAction.color} ${isUpdating ? 'opacity-50' : ''}`}
                            title={nextAction.label}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <nextAction.icon className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                            disabled={isUpdating}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/dashboard/appointments/${apt._id}`}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
