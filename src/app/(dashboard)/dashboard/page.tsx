'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, CalendarDays, CalendarX, CheckCircle2, ChevronLeft, ChevronRight, IndianRupee, Clock3, Eye, FilePlus2, Loader2, Package, PackagePlus, Pill, Play, Plus, UserCheck, UserPlus, Users, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService, dashboardService } from '@/lib/services';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

interface DashboardStats { totalPatients: number; todayAppointments: number; todayRevenue: number; lowStockItems: number; }
interface Appointment {
  _id: string; appointmentId: string; tokenNo: number; status: string; type: string;
  patient?: { _id: string; name: string; phone: string; patientId: string };
  doctor?: { _id: string; name: string };
  billing?: { hasBill: boolean; paymentStatus?: string };
}

const tabs = [
  { key: 'all', label: 'All' }, { key: 'scheduled', label: 'Scheduled' },
  { key: 'checked-in', label: 'Checked in' }, { key: 'in-progress', label: 'In consultation' },
  { key: 'completed', label: 'Completed' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ totalPatients: 0, todayAppointments: 0, todayRevenue: 0, lowStockItems: 0 });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, appointmentsRes] = await Promise.all([dashboardService.getStats(), dashboardService.getAppointments()]);
        setStats(statsRes.data); setAppointments(appointmentsRes.data.appointments || []);
      } catch (error) { console.error('Failed to fetch dashboard data:', error); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      try { const response = await dashboardService.getAppointments(selectedDate); setAppointments(response.data.appointments || []); }
      catch (error) { console.error('Failed to fetch appointments:', error); }
    };
    loadAppointments();
  }, [selectedDate]);

  const updateStatus = async (appointmentId: string, status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled', hasBill = false) => {
    if (status === 'completed' && !hasBill) { toast.error('Please generate bill before marking appointment as completed'); return; }
    setUpdatingId(appointmentId);
    try {
      await appointmentService.update(appointmentId, { status });
      setAppointments(items => items.map(item => item._id === appointmentId ? { ...item, status } : item));
      toast.success(status === 'cancelled' ? 'Appointment cancelled' : 'Appointment updated');
    } catch { toast.error('Failed to update appointment'); }
    finally { setUpdatingId(null); }
  };

  const shiftDate = (days: number) => { const date = new Date(selectedDate); date.setDate(date.getDate() + days); setSelectedDate(date.toISOString().split('T')[0]); };
  const currency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const initials = (name?: string) => name ? name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2) : '—';
  const displayDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const filtered = activeTab === 'all' ? appointments : appointments.filter(item => item.status === activeTab);
  const count = (status: string) => appointments.filter(item => item.status === status).length;
  const pendingBills = appointments.filter(item => item.billing?.hasBill && item.billing.paymentStatus !== 'paid').length;

  const nextAction = (status: string) => {
    if (status === 'scheduled') return { status: 'checked-in' as const, label: 'Check in', icon: UserCheck };
    if (status === 'checked-in') return { status: 'in-progress' as const, label: 'Start visit', icon: Play };
    if (status === 'in-progress') return { status: 'completed' as const, label: 'Complete', icon: CheckCircle2 };
    return null;
  };

  const kpis = [
    { label: 'Total patients', value: stats.totalPatients.toLocaleString(), note: 'Registered records', icon: Users, accent: 'dashboard-card-teal' },
    { label: "Today's appointments", value: stats.todayAppointments.toLocaleString(), note: `${count('checked-in')} checked in`, icon: CalendarDays, accent: 'dashboard-card-blue' },
    { label: "Today's revenue", value: currency(stats.todayRevenue), note: `${pendingBills} pending payment${pendingBills === 1 ? '' : 's'}`, icon: IndianRupee, accent: 'dashboard-card-violet' },
    { label: 'Low stock items', value: stats.lowStockItems.toLocaleString(), note: stats.lowStockItems ? 'Requires attention' : 'Stock levels healthy', icon: Package, alert: stats.lowStockItems > 0, accent: 'dashboard-card-amber' },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-secondary-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Hospital command center</p>
          <h1 className="text-2xl font-bold tracking-tight text-secondary-900 sm:text-[28px]">Good day, here’s your overview</h1>
          <p className="mt-1 text-sm text-secondary-500">Monitor today’s patient flow, collections, and operational priorities.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/patients/add" className="btn-secondary border border-secondary-200 bg-white"><UserPlus className="h-4 w-4" /> New patient</Link>
          <Link href="/dashboard/appointments/book" className="btn-primary"><Plus className="h-4 w-4" /> Book appointment</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Today’s key metrics">
        {kpis.map(({ label, value, note, icon: Icon, alert, accent }) => (
          <article key={label} className={`dashboard-kpi-card ${accent} group rounded-xl border bg-white p-5`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0"><p className="text-sm font-medium text-secondary-500">{label}</p><p className="mt-2 truncate text-2xl font-bold tracking-tight text-secondary-900">{loading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-secondary-100" /> : value}</p></div>
              <span className="dashboard-kpi-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"><Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" /></span>
            </div>
            <p className={`mt-3 text-xs ${alert ? 'font-medium text-amber-700' : 'text-secondary-400'}`}>{note}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="border-b border-secondary-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700"><Clock3 className="h-4 w-4" /></span><h2 className="text-base font-bold text-secondary-900">Appointment queue</h2></div><p className="mt-1 pl-10 text-xs text-secondary-500">{displayDate} · {appointments.length} appointment{appointments.length === 1 ? '' : 's'}</p></div>
              <div className="flex items-center rounded-lg border border-secondary-200 bg-secondary-50 p-1">
                <button onClick={() => shiftDate(-1)} className="icon-button h-8 w-8" aria-label="Previous day"><ChevronLeft className="h-4 w-4" /></button>
                <input type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} aria-label="Appointment date" className="h-8 w-[136px] border-0 bg-transparent px-2 text-xs font-semibold text-secondary-700 focus:ring-0" />
                <button onClick={() => shiftDate(1)} className="icon-button h-8 w-8" aria-label="Next day"><ChevronRight className="h-4 w-4" /></button>
                <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} className="h-8 rounded-md bg-white px-3 text-xs font-semibold text-primary-700 shadow-sm">Today</button>
              </div>
            </div>
            <div className="mt-4 flex gap-1 overflow-x-auto" role="tablist" aria-label="Appointment status">
              {tabs.map(tab => { const total = tab.key === 'all' ? appointments.length : count(tab.key); const selected = activeTab === tab.key; return <button key={tab.key} onClick={() => setActiveTab(tab.key)} role="tab" aria-selected={selected} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${selected ? 'bg-primary-700 text-white' : 'text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800'}`}>{tab.label}<span className={`rounded px-1.5 py-0.5 text-[10px] ${selected ? 'bg-white/15 text-white' : 'bg-secondary-100 text-secondary-500'}`}>{total}</span></button>; })}
            </div>
          </div>

          <div className="min-h-[340px]">
            {loading ? <div className="space-y-3 p-5">{[1,2,3,4].map(item => <div key={item} className="h-[68px] animate-pulse rounded-lg bg-secondary-50" />)}</div>
            : filtered.length === 0 ? <EmptyState icon={CalendarX} title="No appointments found" description="There are no appointments in this status for the selected date." action={<Link href="/dashboard/appointments/book" className="btn-primary"><Plus className="h-4 w-4" /> Book appointment</Link>} />
            : <div className="divide-y divide-secondary-100">{filtered.map(appointment => {
                const action = nextAction(appointment.status); const updating = updatingId === appointment._id;
                return <article key={appointment._id} className="group flex flex-col gap-3 px-4 py-4 hover:bg-primary-50/30 sm:flex-row sm:items-center sm:px-5">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">{initials(appointment.patient?.name)}</span>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-secondary-900">{appointment.patient?.name || 'Unknown patient'}</p><p className="mt-0.5 truncate text-xs text-secondary-500">Token #{appointment.tokenNo || '—'} · {appointment.doctor?.name || 'Doctor not assigned'}</p></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pl-[52px] sm:pl-0"><StatusBadge status={appointment.status} /><StatusBadge status={appointment.billing?.hasBill ? appointment.billing.paymentStatus || 'pending' : 'No bill'} /></div>
                  <div className="flex items-center justify-end gap-1 pl-[52px] sm:pl-0">
                    {action && <button onClick={() => updateStatus(appointment._id, action.status, appointment.billing?.hasBill)} disabled={updating} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 disabled:opacity-50" title={action.label}>{updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <action.icon className="h-3.5 w-3.5" />}{action.label}</button>}
                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && <button onClick={() => updateStatus(appointment._id, 'cancelled')} disabled={updating} className="icon-button h-8 w-8 text-red-500 hover:bg-red-50" aria-label="Cancel appointment" title="Cancel appointment"><XCircle className="h-4 w-4" /></button>}
                    <Link href={`/dashboard/appointments/${appointment._id}`} className="icon-button h-8 w-8" aria-label={`View ${appointment.patient?.name || 'appointment'}`} title="View details"><Eye className="h-4 w-4" /></Link>
                  </div>
                </article>;
              })}</div>}
          </div>
          <div className="border-t border-secondary-200 px-5 py-3"><Link href="/dashboard/appointments" className="text-xs font-semibold text-primary-700 hover:text-primary-800">View appointment schedule →</Link></div>
        </section>

        <aside className="space-y-5">
          <section className="dashboard-side-card rounded-xl border border-secondary-200 bg-white p-5">
            <h2 className="text-sm font-bold text-secondary-900">Quick actions</h2><p className="mt-1 text-xs text-secondary-500">Common hospital workflows</p>
            <div className="mt-4 space-y-1">
              {[{ href: '/dashboard/patients/add', label: 'Register patient', note: 'Create a patient record', icon: UserPlus, color: 'quick-teal' }, { href: '/dashboard/appointments/book', label: 'Book appointment', note: 'Schedule a consultation', icon: Calendar, color: 'quick-blue' }, { href: '/dashboard/billing/opd/new', label: 'Create OPD bill', note: 'Record consultation charges', icon: FilePlus2, color: 'quick-violet' }, { href: '/dashboard/billing/medicine/new', label: 'Medicine bill', note: 'Dispense and bill medicines', icon: Pill, color: 'quick-rose' }, { href: '/dashboard/inventory/add', label: 'Add medicine', note: 'Update pharmacy catalogue', icon: PackagePlus, color: 'quick-amber' }].map(item => <Link key={item.href} href={item.href} className={`dashboard-quick-action ${item.color} group flex items-center gap-3 rounded-lg p-2.5`}><span className="quick-action-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"><item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-secondary-800">{item.label}</span><span className="block truncate text-xs text-secondary-400">{item.note}</span></span><ChevronRight className="h-4 w-4 text-secondary-300 transition-transform group-hover:translate-x-0.5" /></Link>)}
            </div>
          </section>

          <section className="dashboard-side-card rounded-xl border border-secondary-200 bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-secondary-900">Today’s progress</h2><span className="text-xs text-secondary-400">Live</span></div>
            <div className="mt-4 space-y-4">{[
              { label: 'Checked in', value: count('checked-in'), total: appointments.length },
              { label: 'In consultation', value: count('in-progress'), total: appointments.length },
              { label: 'Completed', value: count('completed'), total: appointments.length },
            ].map(item => { const percent = item.total ? Math.round((item.value / item.total) * 100) : 0; return <div key={item.label}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium text-secondary-600">{item.label}</span><span className="font-semibold text-secondary-800">{item.value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-primary-100"><div className="h-full rounded-full bg-primary-600" style={{ width: `${percent}%` }} /></div></div>; })}</div>
          </section>

          {stats.lowStockItems > 0 && <Link href="/dashboard/inventory" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700"><Package className="h-4 w-4" /></span><span><span className="block text-sm font-bold text-amber-900">Pharmacy attention</span><span className="mt-0.5 block text-xs leading-5 text-amber-700">{stats.lowStockItems} item{stats.lowStockItems === 1 ? '' : 's'} running low. Review inventory.</span></span></Link>}
        </aside>
      </div>
    </div>
  );
}
