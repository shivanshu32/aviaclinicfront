'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Loader2, Search, ShieldCheck, UserCog, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface HierarchyUser {
  _id: string; name: string; email: string; phone?: string | null; role: string;
  designation?: string | null; department?: string | null; status: string; isActive: boolean;
  legacyAssignment?: boolean;
}
interface TenantGroup {
  tenant: { tenantId: string; name: string; email: string; isActive: boolean };
  staff: HierarchyUser[]; totals: { admins: number; staff: number };
}

export default function SuperAdminStaffPage() {
  const [groups, setGroups] = useState<TenantGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());

  const load = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/staff?search=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to load staff');
      const next: TenantGroup[] = data.data.hierarchy || [];
      setGroups(next);
      if (query) {
        setExpandedTenants(new Set(next.map(group => group.tenant.tenantId)));
      } else if (!expandedTenants.size) setExpandedTenants(new Set(next.map(group => group.tenant.tenantId)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load staff');
    } finally { setLoading(false); }
  }, [expandedTenants.size]);

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => setter(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const totalAdmins = groups.reduce((sum, group) => sum + group.totals.admins, 0);
  const totalStaff = groups.reduce((sum, group) => sum + group.totals.staff, 0);
  const statusClass = (active: boolean) => active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700';

  return <div className="mx-auto max-w-7xl space-y-6">
    <div><h1 className="flex items-center gap-3 text-2xl font-bold text-secondary-800"><UserCog className="h-7 w-7 text-primary-600" />Staff Management</h1><p className="mt-1 text-secondary-400">Each clinic is a tenant Admin; every user account inside it is shown as its staff.</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><Summary icon={Building2} label="Clinics" value={groups.length} /><Summary icon={ShieldCheck} label="Administrators" value={totalAdmins} /><Summary icon={Users} label="Staff members" value={totalStaff} /></div>
    <form onSubmit={event => { event.preventDefault(); void load(search); }} className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search clinic, Admin, staff, email, role or department" className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-100" /></div><button className="rounded-xl bg-primary-600 px-5 py-2.5 font-medium text-white">Search</button></form>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div> : groups.length === 0 ? <div className="rounded-2xl border bg-white py-16 text-center text-gray-500">No administrators or staff matched your search.</div> : <div className="space-y-4">{groups.map(group => {
      const tenantOpen = expandedTenants.has(group.tenant.tenantId);
      return <section key={group.tenant.tenantId} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><button type="button" onClick={() => toggle(setExpandedTenants, group.tenant.tenantId)} className="flex w-full items-center gap-3 bg-secondary-50 px-5 py-4 text-left"><span className="rounded-lg bg-primary-100 p-2 text-primary-700"><Building2 className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block font-semibold text-secondary-900">{group.tenant.name}</span><span className="block truncate text-xs text-secondary-500">{group.tenant.email} · {group.tenant.tenantId}</span></span><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(group.tenant.isActive)}`}>{group.tenant.isActive ? 'Active' : 'Inactive'}</span><span className="text-sm text-secondary-500">{group.totals.admins} Admins · {group.totals.staff} Staff</span>{tenantOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}</button>
        {tenantOpen && <div className="p-4 md:pl-10"><div className="mb-3 flex items-center gap-2 text-sm font-medium text-secondary-700"><ShieldCheck className="h-4 w-4 text-primary-600" />Tenant Admin: {group.tenant.name}</div><div className="overflow-hidden rounded-xl border border-gray-200"><StaffTable staff={group.staff} empty="This tenant Admin has not created any staff accounts." /></div></div>}
      </section>;
    })}</div>}
  </div>;
}

function Summary({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: number }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><span className="rounded-xl bg-primary-50 p-3 text-primary-700"><Icon className="h-6 w-6" /></span><div><p className="text-sm text-secondary-500">{label}</p><p className="text-2xl font-bold text-secondary-900">{value}</p></div></div>;
}

function StaffTable({ staff, empty }: { staff: HierarchyUser[]; empty?: string }) {
  if (!staff.length) return <p className="px-4 py-5 text-sm text-gray-500">{empty || 'No staff members.'}</p>;
  return <div className="overflow-x-auto border-t"><table className="w-full min-w-[720px] text-sm"><thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-2.5">Staff member</th><th className="px-4 py-2.5">Role</th><th className="px-4 py-2.5">Department</th><th className="px-4 py-2.5">Status</th></tr></thead><tbody className="divide-y">{staff.map(member => <tr key={member._id}><td className="px-4 py-3"><p className="font-medium text-secondary-800">{member.name}{member.legacyAssignment && <span className="ml-2 text-xs font-normal text-amber-700">Legacy assignment</span>}</p><p className="text-xs text-secondary-500">{member.email}{member.phone ? ` · ${member.phone}` : ''}</p></td><td className="px-4 py-3 capitalize text-secondary-700">{member.designation || member.role.replaceAll('_', ' ')}</td><td className="px-4 py-3 text-secondary-600">{member.department || '—'}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${member.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{member.isActive ? 'Active' : 'Inactive'}</span></td></tr>)}</tbody></table></div>;
}
