'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Download, Eye, FileText, FlaskConical, IndianRupee, Plus, Printer, Receipt, Search, WalletCards, X } from 'lucide-react';
import { billingService, Bill } from '@/lib/services';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

const types = [
  { id: 'opd', label: 'OPD billing', description: 'Consultations and procedures', icon: FileText, color: 'billing-type-blue' },
  { id: 'misc', label: 'Lab & services', description: 'Tests and miscellaneous charges', icon: FlaskConical, color: 'billing-type-violet' },
  { id: 'medicine', label: 'Medicine billing', description: 'Pharmacy sales and dispensing', icon: Receipt, color: 'billing-type-green' },
];

export default function BillingPage() {
  const [activeType, setActiveType] = useState('opd'); const [search, setSearch] = useState(''); const [date, setDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all'); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]); const [total, setTotal] = useState(0);
  const fetchBills = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const params = { page: 1, limit: 100, ...(date ? { dateFrom: date, dateTo: date } : {}) };
      const response = activeType === 'opd' ? await billingService.opd.getAll(params) : activeType === 'misc' ? await billingService.misc.getAll(params) : await billingService.medicine.getAll(params);
      setBills(response.data?.bills || []); setTotal(response.data?.pagination?.total || response.data?.bills?.length || 0);
    } catch (fetchError) { console.error('Failed to fetch bills:', fetchError); setError(true); }
    finally { setLoading(false); }
  }, [activeType, date]);
  useEffect(() => { fetchBills(); }, [fetchBills]);

  const filtered = useMemo(() => bills.filter(bill => (!search || bill.billNo?.toLowerCase().includes(search.toLowerCase()) || bill.patientName?.toLowerCase().includes(search.toLowerCase()) || bill.patientPhone?.includes(search)) && (paymentStatus === 'all' || bill.paymentStatus === paymentStatus)), [bills, paymentStatus, search]);
  const paid = bills.filter(bill => bill.paymentStatus === 'paid'); const pending = bills.filter(bill => bill.paymentStatus !== 'paid');
  const collected = paid.reduce((sum, bill) => sum + (bill.total || 0), 0); const outstanding = pending.reduce((sum, bill) => sum + (bill.total || 0), 0);
  const currency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const clear = () => { setSearch(''); setDate(''); setPaymentStatus('all'); };
  const hasFilters = Boolean(search || date) || paymentStatus !== 'all';
  const exportBills = () => { const rows = [['Bill No', 'Patient', 'Phone', 'Date', 'Total', 'Payment Status'], ...filtered.map(bill => [bill.billNo, bill.patientName, bill.patientPhone, formatDate(bill.createdAt), String(bill.total), bill.paymentStatus])]; const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${activeType}-bills.csv`; anchor.click(); URL.revokeObjectURL(url); };

  const summaries = [
    { label: 'Total invoices', value: total, icon: Receipt, color: 'patients-stat-green' },
    { label: 'Collected', value: currency(collected), icon: IndianRupee, color: 'patients-stat-blue' },
    { label: 'Pending invoices', value: pending.length, icon: WalletCards, color: 'patients-stat-violet' },
    { label: 'Outstanding', value: currency(outstanding), icon: IndianRupee, color: 'patients-stat-amber' },
  ];
  return <div className="space-y-6">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Finance workspace</p><h1 className="text-2xl font-bold tracking-tight text-secondary-900">Billing</h1><p className="mt-1 text-sm text-secondary-500">Create invoices, track collections and review patient payments.</p></div><div className="flex flex-wrap gap-2"><button onClick={exportBills} className="btn-secondary border border-secondary-200 bg-white"><Download className="h-4 w-4" /> Export</button><Link href={`/dashboard/billing/${activeType}/new`} className="btn-primary"><Plus className="h-4 w-4" /> New bill</Link></div></section>
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">{summaries.map(item => <article key={item.label} className={`patients-stat-card ${item.color}`}><span className="patients-stat-icon"><item.icon className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-xl font-bold text-secondary-900">{item.value}</p><p className="text-xs font-medium text-secondary-500">{item.label}</p></div></article>)}</section>
    <section className="grid gap-3 md:grid-cols-3">{types.map(type => <button key={type.id} onClick={() => setActiveType(type.id)} className={`billing-type-card ${type.color} ${activeType === type.id ? 'is-active' : ''}`}><span className="billing-type-icon"><type.icon className="h-5 w-5" /></span><span className="text-left"><span className="block text-sm font-bold text-secondary-900">{type.label}</span><span className="mt-0.5 block text-xs text-secondary-500">{type.description}</span></span></button>)}</section>
    <section className="rounded-xl border border-secondary-200 bg-white p-4 shadow-sm"><div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px_auto]"><label className="relative"><span className="sr-only">Search bills</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" /><input value={search} onChange={event => setSearch(event.target.value)} className="input pl-9" placeholder="Search bill number, patient or phone" /></label><label className="relative"><Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" /><input type="date" value={date} onChange={event => setDate(event.target.value)} className="input pl-9" aria-label="Billing date" /></label><select value={paymentStatus} onChange={event => setPaymentStatus(event.target.value)} className="input" aria-label="Payment status"><option value="all">All payment statuses</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="partial">Partial</option></select><button onClick={clear} disabled={!hasFilters} className="btn-secondary disabled:opacity-40"><X className="h-4 w-4" /> Clear</button></div></section>
    <section className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-sm">{loading ? <div className="space-y-3 p-5">{[1,2,3,4,5].map(item => <div key={item} className="h-16 animate-pulse rounded-lg bg-secondary-50" />)}</div> : error ? <EmptyState icon={Receipt} title="Unable to load bills" description="Check your connection and try loading billing records again." action={<button onClick={fetchBills} className="btn-primary">Try again</button>} /> : filtered.length === 0 ? <EmptyState icon={Receipt} title={hasFilters ? 'No matching bills' : `No ${activeType} bills yet`} description={hasFilters ? 'Try changing or clearing your filters.' : 'Create a bill to begin tracking collections.'} action={hasFilters ? <button onClick={clear} className="btn-secondary">Clear filters</button> : <Link href={`/dashboard/billing/${activeType}/new`} className="btn-primary"><Plus className="h-4 w-4" /> Create bill</Link>} /> : <><div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead><tr><th className="px-5 py-3 text-left">Invoice</th><th className="px-5 py-3 text-left">Patient</th><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-left">Payment</th><th className="px-5 py-3 text-right">Total</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{filtered.map(bill => <tr key={bill._id} className="billing-row border-t border-secondary-100"><td className="px-5 py-4"><Link href={`/dashboard/billing/${activeType}/${bill._id}`} className="font-bold text-secondary-900 hover:text-primary-700">{bill.billNo}</Link><p className="mt-0.5 text-xs capitalize text-secondary-400">{activeType} invoice</p></td><td className="px-5 py-4"><p className="font-semibold text-secondary-800">{bill.patientName}</p><p className="text-xs text-secondary-400">{bill.patientPhone}</p></td><td className="px-5 py-4 text-sm text-secondary-600">{formatDate(bill.createdAt)}</td><td className="px-5 py-4"><StatusBadge status={bill.paymentStatus || 'pending'} /></td><td className="px-5 py-4 text-right text-base font-bold text-secondary-900">{currency(bill.total)}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><Link href={`/dashboard/billing/${activeType}/${bill._id}`} className="icon-button" title="View invoice" aria-label={`View ${bill.billNo}`}><Eye className="h-4 w-4" /></Link><Link href={`/dashboard/billing/${activeType}/${bill._id}`} className="icon-button" title="Print invoice" aria-label={`Print ${bill.billNo}`}><Printer className="h-4 w-4" /></Link></div></td></tr>)}</tbody></table></div><div className="border-t border-secondary-200 px-5 py-3 text-xs text-secondary-500">Showing {filtered.length} of {total} bills</div></>}</section>
  </div>;
}
