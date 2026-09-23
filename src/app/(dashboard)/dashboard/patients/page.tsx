'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronLeft, ChevronRight, Download, Edit3, Eye, IndianRupee, Mail, Phone, Plus, Search, SlidersHorizontal, UserPlus, Users, X } from 'lucide-react';
import { appointmentService, billingService, patientService, Patient } from '@/lib/services';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

type Summary = { newThisMonth: number; appointmentsToday: number; pendingPayments: number };

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [gender, setGender] = useState('all');
  const [bloodGroup, setBloodGroup] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [summary, setSummary] = useState<Summary>({ newThisMonth: 0, appointmentsToday: 0, pendingPayments: 0 });

  useEffect(() => { const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350); return () => window.clearTimeout(timer); }, [searchInput]);

  const fetchPatients = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const response = await patientService.getAll({ search: search || undefined, page, limit, isActive: status === 'all' ? undefined : status === 'active' });
      setPatients(response.data.patients || []); setTotalPages(response.data.pagination.pages || 1); setTotal(response.data.pagination.total || 0);
    } catch (fetchError) { console.error('Failed to fetch patients:', fetchError); setError(true); }
    finally { setLoading(false); }
  }, [limit, page, search, status]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [allPatients, appointments, opd, misc, medicine] = await Promise.all([
          patientService.getAll({ page: 1, limit: 1000 }), appointmentService.getAll({ date: today, limit: 1000 }),
          billingService.opd.getAll({ limit: 1000 }), billingService.misc.getAll({ limit: 1000 }), billingService.medicine.getAll({ limit: 1000 }),
        ]);
        const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
        const newThisMonth = (allPatients.data.patients || []).filter(patient => new Date(patient.createdAt) >= monthStart).length;
        const bills = [...(opd.data?.bills || []), ...(misc.data?.bills || []), ...(medicine.data?.bills || [])];
        setSummary({ newThisMonth, appointmentsToday: appointments.data.appointments?.length || 0, pendingPayments: bills.filter((bill: { paymentStatus?: string }) => bill.paymentStatus !== 'paid').length });
      } catch (summaryError) { console.error('Failed to load patient summary:', summaryError); }
    };
    loadSummary();
  }, []);

  const visiblePatients = useMemo(() => patients.filter(patient => (gender === 'all' || patient.gender === gender) && (bloodGroup === 'all' || patient.bloodGroup === bloodGroup)), [patients, gender, bloodGroup]);
  const bloodGroups = useMemo(() => Array.from(new Set(patients.map(patient => patient.bloodGroup).filter(Boolean))) as string[], [patients]);
  const initials = (name: string) => name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  const activeFilters = Number(status !== 'all') + Number(gender !== 'all') + Number(bloodGroup !== 'all') + Number(Boolean(search));
  const clearFilters = () => { setSearchInput(''); setSearch(''); setStatus('all'); setGender('all'); setBloodGroup('all'); setPage(1); };
  const toggleAll = () => setSelected(selected.length === visiblePatients.length ? [] : visiblePatients.map(patient => patient._id));
  const toggleOne = (id: string) => setSelected(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]);
  const exportPatients = (items = visiblePatients) => {
    const rows = [['Patient ID', 'Name', 'Phone', 'Email', 'Age', 'Gender', 'Blood Group', 'Status'], ...items.map(patient => [patient.patientId, patient.name, patient.phone, patient.email || '', String(patient.age), patient.gender, patient.bloodGroup || '', patient.isActive ? 'Active' : 'Inactive'])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'patients.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  const cards = [
    { label: 'Total patients', value: total, icon: Users, color: 'patients-stat-green' },
    { label: 'New this month', value: summary.newThisMonth, icon: UserPlus, color: 'patients-stat-blue' },
    { label: 'Appointments today', value: summary.appointmentsToday, icon: CalendarDays, color: 'patients-stat-violet' },
    { label: 'Pending payments', value: summary.pendingPayments, icon: IndianRupee, color: 'patients-stat-amber' },
  ];

  return <div className="space-y-6">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Patient management</p><h1 className="text-2xl font-bold tracking-tight text-secondary-900">Patients</h1><p className="mt-1 text-sm text-secondary-500">Manage patient records, appointments, billing and medical history.</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={() => exportPatients()} className="btn-secondary border border-secondary-200 bg-white"><Download className="h-4 w-4" /> Export patients</button><Link href="/dashboard/patients/add" className="btn-primary"><Plus className="h-4 w-4" /> Add patient</Link></div>
    </section>

    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Patient summary">{cards.map(card => <article key={card.label} className={`patients-stat-card ${card.color}`}><span className="patients-stat-icon"><card.icon className="h-5 w-5" /></span><div><p className="text-xl font-bold text-secondary-900">{card.value.toLocaleString()}</p><p className="text-xs font-medium text-secondary-500">{card.label}</p></div></article>)}</section>

    <section className="rounded-xl border border-secondary-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_160px_150px_150px_auto]">
        <label className="relative"><span className="sr-only">Search patients</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" /><input value={searchInput} onChange={event => setSearchInput(event.target.value)} className="input pl-9" placeholder="Search name, ID, mobile or email" /></label>
        <select value={status} onChange={event => { setStatus(event.target.value as typeof status); setPage(1); }} className="input" aria-label="Patient status"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
        <select value={gender} onChange={event => setGender(event.target.value)} className="input" aria-label="Gender"><option value="all">All genders</option><option>Male</option><option>Female</option><option>Other</option></select>
        <select value={bloodGroup} onChange={event => setBloodGroup(event.target.value)} className="input" aria-label="Blood group"><option value="all">All blood groups</option>{bloodGroups.map(group => <option key={group}>{group}</option>)}</select>
        <button onClick={clearFilters} disabled={!activeFilters} className="btn-secondary whitespace-nowrap disabled:opacity-40"><X className="h-4 w-4" /> Clear</button>
      </div>
      {activeFilters > 0 && <div className="mt-3 flex items-center gap-2 text-xs text-secondary-500"><SlidersHorizontal className="h-3.5 w-3.5" /><span>{activeFilters} active filter{activeFilters > 1 ? 's' : ''}</span></div>}
    </section>

    {selected.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary-800 px-4 py-3 text-white"><p className="text-sm font-semibold">{selected.length} patient{selected.length > 1 ? 's' : ''} selected</p><div className="flex gap-2"><button onClick={() => exportPatients(visiblePatients.filter(patient => selected.includes(patient._id)))} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-primary-800"><Download className="mr-1.5 inline h-3.5 w-3.5" />Export selected</button><button onClick={() => setSelected([])} className="rounded-lg px-3 py-2 text-xs font-semibold hover:bg-white/10">Clear selection</button></div></div>}

    <section className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-sm">
      {loading ? <div className="space-y-3 p-5">{[1,2,3,4,5].map(item => <div key={item} className="h-16 animate-pulse rounded-lg bg-secondary-50" />)}</div>
      : error ? <EmptyState icon={Users} title="Unable to load patients" description="Check your connection and try loading the patient records again." action={<button onClick={fetchPatients} className="btn-primary">Try again</button>} />
      : visiblePatients.length === 0 ? <EmptyState icon={Users} title={activeFilters ? 'No matching patients' : 'No patients available'} description={activeFilters ? 'Try changing or clearing the current filters.' : 'Add the first patient to start building your clinic records.'} action={activeFilters ? <button onClick={clearFilters} className="btn-secondary">Clear filters</button> : <Link href="/dashboard/patients/add" className="btn-primary"><Plus className="h-4 w-4" /> Add first patient</Link>} />
      : <>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[920px]"><thead><tr><th className="w-12 px-4 py-3"><input type="checkbox" checked={selected.length === visiblePatients.length && visiblePatients.length > 0} onChange={toggleAll} aria-label="Select all patients" /></th><th className="px-4 py-3 text-left">Patient</th><th className="px-4 py-3 text-left">Patient ID</th><th className="px-4 py-3 text-left">Contact</th><th className="px-4 py-3 text-left">Age / Gender</th><th className="px-4 py-3 text-left">Blood group</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{visiblePatients.map(patient => <tr key={patient._id} className="border-t border-secondary-100"><td className="px-4 py-4"><input type="checkbox" checked={selected.includes(patient._id)} onChange={() => toggleOne(patient._id)} aria-label={`Select ${patient.name}`} /></td><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-xs font-bold text-primary-800">{initials(patient.name)}</span><div><Link href={`/dashboard/patients/${patient._id}`} className="font-semibold text-secondary-900 hover:text-primary-700">{patient.name}</Link><p className="mt-0.5 text-xs text-secondary-400">Registered {new Date(patient.createdAt).toLocaleDateString('en-IN')}</p></div></div></td><td className="px-4 py-4 font-medium text-secondary-600">{patient.patientId || '—'}</td><td className="px-4 py-4"><p className="flex items-center gap-1.5 text-secondary-700"><Phone className="h-3.5 w-3.5 text-secondary-400" />{patient.phone}</p>{patient.email && <p className="mt-1 flex max-w-[210px] items-center gap-1.5 truncate text-xs text-secondary-400"><Mail className="h-3.5 w-3.5" />{patient.email}</p>}</td><td className="px-4 py-4 text-secondary-600">{patient.age} / {patient.gender}</td><td className="px-4 py-4"><span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">{patient.bloodGroup || '—'}</span></td><td className="px-4 py-4"><StatusBadge status={patient.isActive ? 'active' : 'inactive'} /></td><td className="px-4 py-4"><div className="flex justify-end gap-1"><Link href={`/dashboard/patients/${patient._id}`} className="icon-button" aria-label={`View ${patient.name}`} title="View profile"><Eye className="h-4 w-4" /></Link><Link href={`/dashboard/patients/${patient._id}/edit`} className="icon-button" aria-label={`Edit ${patient.name}`} title="Edit patient"><Edit3 className="h-4 w-4" /></Link></div></td></tr>)}</tbody></table></div>
        <div className="divide-y divide-secondary-100 md:hidden">{visiblePatients.map(patient => <article key={patient._id} className="p-4"><div className="flex items-start gap-3"><input type="checkbox" checked={selected.includes(patient._id)} onChange={() => toggleOne(patient._id)} className="mt-3" aria-label={`Select ${patient.name}`} /><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-xs font-bold text-primary-800">{initials(patient.name)}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><Link href={`/dashboard/patients/${patient._id}`} className="font-semibold text-secondary-900">{patient.name}</Link><p className="text-xs text-secondary-400">{patient.patientId || 'Patient record'}</p></div><StatusBadge status={patient.isActive ? 'active' : 'inactive'} /></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-secondary-500"><span>{patient.age} yrs · {patient.gender}</span><span>{patient.bloodGroup || 'Blood group —'}</span><span className="col-span-2 flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{patient.phone}</span></div><div className="mt-3 flex gap-2"><Link href={`/dashboard/patients/${patient._id}`} className="btn-secondary min-h-9 flex-1 text-xs"><Eye className="h-3.5 w-3.5" /> View</Link><Link href={`/dashboard/patients/${patient._id}/edit`} className="btn-secondary min-h-9 flex-1 text-xs"><Edit3 className="h-3.5 w-3.5" /> Edit</Link></div></div></div></article>)}</div>
        <div className="flex flex-col gap-3 border-t border-secondary-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3 text-xs text-secondary-500"><span>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span><select value={limit} onChange={event => { setLimit(Number(event.target.value)); setPage(1); }} className="h-8 rounded-md border border-secondary-200 bg-white px-2" aria-label="Rows per page"><option value="10">10 rows</option><option value="20">20 rows</option><option value="50">50 rows</option></select></div><div className="flex items-center gap-2"><button onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page === 1} className="icon-button h-9 w-9 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-[84px] text-center text-xs font-semibold text-secondary-600">Page {page} of {totalPages}</span><button onClick={() => setPage(value => Math.min(totalPages, value + 1))} disabled={page === totalPages} className="icon-button h-9 w-9 disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></div>
      </>}
    </section>
  </div>;
}
