'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BadgeIndianRupee, CalendarClock, Download, Edit3, Eye, Grid2X2, List, Mail, Phone, Plus, Search, Stethoscope, UserCheck, UserCog, Users, X } from 'lucide-react';
import { doctorService, Doctor } from '@/lib/services';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [specialization, setSpecialization] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => { const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350); return () => window.clearTimeout(timer); }, [searchInput]);

  const fetchDoctors = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const response = await doctorService.getAll({ search: search || undefined, isActive: status === 'all' ? undefined : status === 'active' });
      setDoctors(response.data.doctors || []);
    } catch (fetchError) { console.error('Failed to fetch doctors:', fetchError); setError(true); }
    finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const specializations = useMemo(() => Array.from(new Set(doctors.map(doctor => doctor.specialization).filter(Boolean))).sort() as string[], [doctors]);
  const visibleDoctors = useMemo(() => doctors.filter(doctor => specialization === 'all' || doctor.specialization === specialization), [doctors, specialization]);
  const activeDoctors = doctors.filter(doctor => doctor.isActive).length;
  const averageFee = doctors.length ? Math.round(doctors.reduce((total, doctor) => total + (doctor.consultationFee || 0), 0) / doctors.length) : 0;
  const scheduledToday = doctors.filter(doctor => doctor.schedule?.some(slot => slot.day.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())).length;
  const initials = (name: string) => name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  const clearFilters = () => { setSearchInput(''); setSearch(''); setStatus('all'); setSpecialization('all'); };
  const hasFilters = Boolean(search) || status !== 'all' || specialization !== 'all';
  const currency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  const exportDoctors = () => {
    const rows = [['Doctor ID', 'Name', 'Specialization', 'Qualification', 'Phone', 'Email', 'Consultation Fee', 'Status'], ...visibleDoctors.map(doctor => [doctor.doctorId, doctor.name, doctor.specialization || '', doctor.qualification || '', doctor.phone || '', doctor.email || '', String(doctor.consultationFee || 0), doctor.isActive ? 'Active' : 'Inactive'])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'doctors.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  const summaries = [
    { label: 'Total doctors', value: doctors.length, icon: Users, color: 'patients-stat-green' },
    { label: 'Active doctors', value: activeDoctors, icon: UserCheck, color: 'patients-stat-blue' },
    { label: 'Available today', value: scheduledToday, icon: CalendarClock, color: 'patients-stat-violet' },
    { label: 'Average fee', value: currency(averageFee), icon: BadgeIndianRupee, color: 'patients-stat-amber' },
  ];

  return <div className="space-y-6">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Clinical team</p><h1 className="text-2xl font-bold tracking-tight text-secondary-900">Doctors</h1><p className="mt-1 text-sm text-secondary-500">Manage doctor profiles, specializations, schedules and consultation fees.</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={exportDoctors} className="btn-secondary border border-secondary-200 bg-white"><Download className="h-4 w-4" /> Export doctors</button><Link href="/dashboard/doctors/add" className="btn-primary"><Plus className="h-4 w-4" /> Add doctor</Link></div>
    </section>

    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Doctor summary">{summaries.map(item => <article key={item.label} className={`patients-stat-card ${item.color}`}><span className="patients-stat-icon"><item.icon className="h-5 w-5" /></span><div><p className="text-xl font-bold text-secondary-900">{item.value}</p><p className="text-xs font-medium text-secondary-500">{item.label}</p></div></article>)}</section>

    <section className="rounded-xl border border-secondary-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1"><span className="sr-only">Search doctors</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" /><input value={searchInput} onChange={event => setSearchInput(event.target.value)} className="input pl-9" placeholder="Search doctor name, ID, phone or specialization" /></label>
        <select value={specialization} onChange={event => setSpecialization(event.target.value)} className="input lg:w-52" aria-label="Specialization"><option value="all">All specializations</option>{specializations.map(item => <option key={item}>{item}</option>)}</select>
        <select value={status} onChange={event => setStatus(event.target.value as typeof status)} className="input lg:w-40" aria-label="Doctor status"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
        {hasFilters && <button onClick={clearFilters} className="btn-secondary"><X className="h-4 w-4" /> Clear</button>}
        <div className="flex h-10 rounded-lg border border-secondary-200 bg-secondary-50 p-1" aria-label="View options"><button onClick={() => setView('grid')} className={`flex h-8 w-8 items-center justify-center rounded-md ${view === 'grid' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-400'}`} aria-label="Grid view"><Grid2X2 className="h-4 w-4" /></button><button onClick={() => setView('list')} className={`flex h-8 w-8 items-center justify-center rounded-md ${view === 'list' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-400'}`} aria-label="List view"><List className="h-4 w-4" /></button></div>
      </div>
    </section>

    {loading ? <section className={`grid gap-4 ${view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : ''}`}>{[1,2,3,4,5,6].map(item => <div key={item} className="h-64 animate-pulse rounded-xl border border-secondary-100 bg-white" />)}</section>
    : error ? <section className="rounded-xl border border-secondary-200 bg-white"><EmptyState icon={UserCog} title="Unable to load doctors" description="Check your connection and try loading the doctor directory again." action={<button onClick={fetchDoctors} className="btn-primary">Try again</button>} /></section>
    : visibleDoctors.length === 0 ? <section className="rounded-xl border border-secondary-200 bg-white"><EmptyState icon={UserCog} title={hasFilters ? 'No matching doctors' : 'No doctors available'} description={hasFilters ? 'Try changing or clearing your filters.' : 'Add your first doctor to build the clinic directory.'} action={hasFilters ? <button onClick={clearFilters} className="btn-secondary">Clear filters</button> : <Link href="/dashboard/doctors/add" className="btn-primary"><Plus className="h-4 w-4" /> Add first doctor</Link>} /></section>
    : view === 'grid' ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleDoctors.map(doctor => <DoctorCard key={doctor._id} doctor={doctor} initials={initials(doctor.name)} currency={currency} />)}</section>
    : <section className="overflow-hidden rounded-xl border border-secondary-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[820px]"><thead><tr><th className="px-5 py-3 text-left">Doctor</th><th className="px-5 py-3 text-left">Specialization</th><th className="px-5 py-3 text-left">Contact</th><th className="px-5 py-3 text-left">Schedule</th><th className="px-5 py-3 text-left">Fee</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{visibleDoctors.map(doctor => <tr key={doctor._id} className="border-t border-secondary-100"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-xs font-bold text-primary-800">{initials(doctor.name)}</span><div><Link href={`/dashboard/doctors/${doctor._id}`} className="font-semibold text-secondary-900 hover:text-primary-700">{doctor.name}</Link><p className="text-xs text-secondary-400">{doctor.doctorId}</p></div></div></td><td className="px-5 py-4"><p className="font-medium text-secondary-700">{doctor.specialization || 'General medicine'}</p><p className="text-xs text-secondary-400">{doctor.qualification || '—'}</p></td><td className="px-5 py-4 text-sm text-secondary-600">{doctor.phone || doctor.email || '—'}</td><td className="px-5 py-4 text-sm text-secondary-600">{doctor.schedule?.length || 0} day{doctor.schedule?.length === 1 ? '' : 's'} / week</td><td className="px-5 py-4 font-semibold text-secondary-800">{currency(doctor.consultationFee || 0)}</td><td className="px-5 py-4"><StatusBadge status={doctor.isActive ? 'active' : 'inactive'} /></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><Link href={`/dashboard/doctors/${doctor._id}`} className="icon-button" aria-label={`View ${doctor.name}`} title="View doctor"><Eye className="h-4 w-4" /></Link><Link href={`/dashboard/doctors/${doctor._id}/edit`} className="icon-button" aria-label={`Edit ${doctor.name}`} title="Edit doctor"><Edit3 className="h-4 w-4" /></Link></div></td></tr>)}</tbody></table></div></section>}
  </div>;
}

function DoctorCard({ doctor, initials, currency }: { doctor: Doctor; initials: string; currency: (value: number) => string }) {
  return <article className="doctor-directory-card group relative overflow-hidden rounded-xl border border-secondary-200 bg-white p-5">
    <div className="absolute inset-x-0 top-0 h-1 bg-primary-600" />
    <div className="flex items-start gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-bold text-primary-800 transition-transform duration-200 group-hover:scale-105">{initials}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><Link href={`/dashboard/doctors/${doctor._id}`} className="font-bold text-secondary-900 hover:text-primary-700">{doctor.name}</Link><p className="mt-0.5 text-sm font-medium text-primary-700">{doctor.specialization || 'General medicine'}</p></div><StatusBadge status={doctor.isActive ? 'active' : 'inactive'} /></div><p className="mt-1 text-xs text-secondary-400">{doctor.qualification || doctor.doctorId}</p></div></div>
    <div className="my-4 h-px bg-secondary-100" />
    <div className="space-y-2.5 text-sm text-secondary-600">{doctor.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-secondary-400" />{doctor.phone}</p>}{doctor.email && <p className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 shrink-0 text-secondary-400" />{doctor.email}</p>}<p className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-secondary-400" />{doctor.schedule?.length || 0} scheduled day{doctor.schedule?.length === 1 ? '' : 's'} per week</p></div>
    <div className="mt-5 flex items-center justify-between rounded-lg bg-secondary-50 px-3 py-2.5"><span className="text-xs font-medium text-secondary-500">Consultation fee</span><span className="text-sm font-bold text-secondary-900">{currency(doctor.consultationFee || 0)}</span></div>
    <div className="mt-4 flex gap-2"><Link href={`/dashboard/doctors/${doctor._id}`} className="btn-secondary min-h-9 flex-1 text-xs"><Eye className="h-3.5 w-3.5" /> View profile</Link><Link href={`/dashboard/doctors/${doctor._id}/edit`} className="icon-button h-9 w-9 border border-secondary-200" aria-label={`Edit ${doctor.name}`} title="Edit doctor"><Edit3 className="h-4 w-4" /></Link></div>
  </article>;
}
