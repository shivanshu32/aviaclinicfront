'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, CalendarCheck2, CalendarClock, CalendarDays, CalendarX, CheckCircle2, ChevronLeft, ChevronRight, Download, Eye, Loader2, Play, Plus, Printer, Search, Stethoscope, UserCheck, X, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService, Appointment } from '@/lib/services';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

const statuses = [
  { value: 'all', label: 'All' }, { value: 'scheduled', label: 'Scheduled' },
  { value: 'checked-in', label: 'Checked in' }, { value: 'in-progress', label: 'In consultation' },
  { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [doctor, setDoctor] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true); setError(false);
    try { const response = await appointmentService.getAll({ date: selectedDate }); setAppointments(response.data.appointments || []); }
    catch (fetchError) { console.error('Failed to fetch appointments:', fetchError); setError(true); }
    finally { setLoading(false); }
  }, [selectedDate]);
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleStatusUpdate = async (appointmentId: string, newStatus: Appointment['status'], hasBill = false) => {
    if (newStatus === 'completed' && !hasBill) { toast.error('Please generate bill before marking appointment as completed'); return; }
    setUpdatingId(appointmentId);
    try { await appointmentService.update(appointmentId, { status: newStatus }); setAppointments(items => items.map(item => item._id === appointmentId ? { ...item, status: newStatus } : item)); toast.success(newStatus === 'cancelled' ? 'Appointment cancelled' : 'Appointment updated'); }
    catch { toast.error('Failed to update appointment'); }
    finally { setUpdatingId(null); }
  };

  const doctors = useMemo(() => Array.from(new Map(appointments.filter(item => item.doctor).map(item => [item.doctor?._id, item.doctor])).values()), [appointments]);
  const filtered = useMemo(() => appointments.filter(item => {
    const query = search.toLowerCase();
    const matchesSearch = !query || item.patient?.name?.toLowerCase().includes(query) || item.patient?.phone?.includes(query) || item.appointmentId?.toLowerCase().includes(query);
    return matchesSearch && (status === 'all' || item.status === status) && (doctor === 'all' || item.doctor?._id === doctor);
  }), [appointments, doctor, search, status]);
  const count = (value: string) => appointments.filter(item => item.status === value).length;
  const initials = (name?: string) => name ? name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2) : '—';
  const shiftDate = (days: number) => { const date = new Date(`${selectedDate}T00:00:00`); date.setDate(date.getDate() + days); setSelectedDate(date.toISOString().split('T')[0]); };
  const clearFilters = () => { setSearch(''); setStatus('all'); setDoctor('all'); };
  const hasFilters = Boolean(search) || status !== 'all' || doctor !== 'all';
  const displayDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const nextAction = (current: string) => current === 'scheduled' ? { status: 'checked-in' as const, label: 'Check in', icon: UserCheck } : current === 'checked-in' ? { status: 'in-progress' as const, label: 'Start visit', icon: Play } : current === 'in-progress' ? { status: 'completed' as const, label: 'Complete', icon: CheckCircle2 } : null;
  const exportAppointments = () => {
    const rows = [['Appointment ID', 'Token', 'Patient', 'Phone', 'Doctor', 'Type', 'Status', 'Payment'], ...filtered.map(item => [item.appointmentId, String(item.tokenNo), item.patient?.name || '', item.patient?.phone || '', item.doctor?.name || '', item.type, item.status, item.billing?.paymentStatus || (item.billing?.hasBill ? 'pending' : 'no bill')])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `appointments-${selectedDate}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };

  const summaries = [
    { label: 'Total appointments', value: appointments.length, icon: CalendarDays, color: 'patients-stat-green' },
    { label: 'Waiting / checked in', value: count('checked-in'), icon: CalendarClock, color: 'patients-stat-amber' },
    { label: 'In consultation', value: count('in-progress'), icon: Stethoscope, color: 'patients-stat-violet' },
    { label: 'Completed', value: count('completed'), icon: CalendarCheck2, color: 'patients-stat-blue' },
  ];

  return <div className="space-y-6">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Patient schedule</p><h1 className="text-2xl font-bold tracking-tight text-secondary-900">Appointments</h1><p className="mt-1 text-sm text-secondary-500">Coordinate patient visits and move every appointment smoothly through the clinic.</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={exportAppointments} className="btn-secondary border border-secondary-200 bg-white"><Download className="h-4 w-4" /> Export</button><Link href="/dashboard/appointments/book" className="btn-primary"><Plus className="h-4 w-4" /> Book appointment</Link></div>
    </section>

    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">{summaries.map(item => <article key={item.label} className={`patients-stat-card ${item.color}`}><span className="patients-stat-icon"><item.icon className="h-5 w-5" /></span><div><p className="text-xl font-bold text-secondary-900">{item.value}</p><p className="text-xs font-medium text-secondary-500">{item.label}</p></div></article>)}</section>

    <section className="appointment-date-panel overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-700 text-white"><Calendar className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-wider text-primary-700">{isToday ? 'Today’s schedule' : 'Selected date'}</p><h2 className="text-base font-bold text-secondary-900">{displayDate}</h2></div></div>
        <div className="flex items-center rounded-xl border border-secondary-200 bg-secondary-50 p-1"><button onClick={() => shiftDate(-1)} className="icon-button h-9 w-9" aria-label="Previous day"><ChevronLeft className="h-4 w-4" /></button><input type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} className="h-9 w-[140px] border-0 bg-transparent px-2 text-xs font-semibold text-secondary-700 focus:ring-0" aria-label="Appointment date" /><button onClick={() => shiftDate(1)} className="icon-button h-9 w-9" aria-label="Next day"><ChevronRight className="h-4 w-4" /></button><button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} className="h-9 rounded-lg bg-white px-3 text-xs font-bold text-primary-700 shadow-sm">Today</button></div>
      </div>
    </section>

    <section className="rounded-xl border border-secondary-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center"><label className="relative min-w-0 flex-1"><span className="sr-only">Search appointments</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" /><input value={search} onChange={event => setSearch(event.target.value)} className="input pl-9" placeholder="Search patient, phone or appointment ID" /></label><select value={doctor} onChange={event => setDoctor(event.target.value)} className="input lg:w-52" aria-label="Doctor"><option value="all">All doctors</option>{doctors.map(item => item && <option key={item._id} value={item._id}>{item.name}</option>)}</select>{hasFilters && <button onClick={clearFilters} className="btn-secondary"><X className="h-4 w-4" /> Clear</button>}</div>
      <div className="mt-4 flex gap-1 overflow-x-auto" role="tablist">{statuses.map(item => { const active = status === item.value; const total = item.value === 'all' ? appointments.length : count(item.value); return <button key={item.value} onClick={() => setStatus(item.value)} role="tab" aria-selected={active} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${active ? 'bg-primary-700 text-white shadow-sm' : 'text-secondary-500 hover:bg-secondary-100'}`}>{item.label}<span className={`rounded px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20' : 'bg-secondary-100'}`}>{total}</span></button>; })}</div>
    </section>

    <section className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-sm">
      {loading ? <div className="space-y-3 p-5">{[1,2,3,4,5].map(item => <div key={item} className="h-20 animate-pulse rounded-xl bg-secondary-50" />)}</div>
      : error ? <EmptyState icon={CalendarX} title="Unable to load appointments" description="Check your connection and try loading the schedule again." action={<button onClick={fetchAppointments} className="btn-primary">Try again</button>} />
      : filtered.length === 0 ? <EmptyState icon={CalendarX} title={hasFilters ? 'No matching appointments' : 'No appointments for this date'} description={hasFilters ? 'Try changing or clearing the current filters.' : 'The schedule is clear. Book an appointment when a patient needs a visit.'} action={hasFilters ? <button onClick={clearFilters} className="btn-secondary">Clear filters</button> : <Link href="/dashboard/appointments/book" className="btn-primary"><Plus className="h-4 w-4" /> Book appointment</Link>} />
      : <div className="divide-y divide-secondary-100">{filtered.map(appointment => {
        const action = nextAction(appointment.status); const updating = updatingId === appointment._id;
        return <article key={appointment._id} className="appointment-row group flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3"><span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-bold text-primary-800">{initials(appointment.patient?.name)}<span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-700 px-1 text-[9px] font-bold text-white ring-2 ring-white">{appointment.tokenNo || '—'}</span></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Link href={`/dashboard/appointments/${appointment._id}`} className="truncate font-bold text-secondary-900 hover:text-primary-700">{appointment.patient?.name || 'Unknown patient'}</Link><span className="rounded bg-secondary-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary-500">{appointment.type}</span></div><p className="mt-1 truncate text-xs text-secondary-500">{appointment.appointmentId} · {appointment.patient?.phone || 'No phone'}</p></div></div>
          <div className="flex min-w-[190px] items-center gap-2 rounded-lg bg-secondary-50 px-3 py-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary-700"><Stethoscope className="h-4 w-4" /></span><div className="min-w-0"><p className="text-[10px] font-semibold uppercase text-secondary-400">Doctor</p><p className="truncate text-xs font-semibold text-secondary-700">{appointment.doctor?.name || 'Not assigned'}</p></div></div>
          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={appointment.status} /><StatusBadge status={appointment.billing?.hasBill ? appointment.billing.paymentStatus || 'pending' : 'No bill'} /></div>
          <div className="flex flex-wrap items-center gap-1 xl:justify-end"><Link href={`/dashboard/letterhead?appointment=${appointment._id}`} className="icon-button h-9 w-9" title="Print on letterhead" aria-label="Print appointment"><Printer className="h-4 w-4" /></Link>{action && <button onClick={() => handleStatusUpdate(appointment._id, action.status, appointment.billing?.hasBill)} disabled={updating} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-50 px-3 text-xs font-bold text-primary-700 hover:bg-primary-100 disabled:opacity-50">{updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <action.icon className="h-3.5 w-3.5" />}{action.label}</button>}{appointment.status !== 'completed' && appointment.status !== 'cancelled' && <button onClick={() => { if (confirm('Are you sure you want to cancel this appointment?')) handleStatusUpdate(appointment._id, 'cancelled'); }} disabled={updating} className="icon-button h-9 w-9 text-red-500 hover:bg-red-50" title="Cancel appointment" aria-label="Cancel appointment"><XCircle className="h-4 w-4" /></button>}<Link href={`/dashboard/appointments/${appointment._id}`} className="icon-button h-9 w-9" title="View details" aria-label="View appointment"><Eye className="h-4 w-4" /></Link></div>
        </article>;
      })}</div>}
    </section>
  </div>;
}
