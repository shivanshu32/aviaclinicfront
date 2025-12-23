'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search,
  Loader2,
  Eye,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Tenant {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  subscription: {
    status: string;
    plan: string;
    trialEndsAt?: string;
  };
  stats: {
    users: number;
    patients: number;
  };
  createdAt: string;
}

export default function TenantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; tenant: Tenant | null }>({ open: false, tenant: null });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/tenants?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTenants(data.data.tenants || []);
        setTotalPages(data.data.pagination?.pages || 1);
        setTotal(data.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTenants();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTenants();
  };

  const toggleTenantStatus = async (tenantId: string, currentStatus: boolean) => {
    setUpdatingId(tenantId);
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/tenants/${tenantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Tenant ${!currentStatus ? 'activated' : 'deactivated'}`);
        setTenants(prev => prev.map(t => 
          t.tenantId === tenantId ? { ...t, isActive: !currentStatus } : t
        ));
      } else {
        toast.error(data.error || 'Failed to update tenant');
      }
    } catch {
      toast.error('Failed to update tenant');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'trial': return 'bg-blue-100 text-blue-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleImpersonate = async (tenant: Tenant) => {
    setImpersonating(tenant.tenantId);
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/tenants/${tenant.tenantId}/impersonate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Store impersonation data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('impersonation', JSON.stringify({
          active: true,
          superAdminToken: token,
          tenantId: data.data.tenant.tenantId,
          tenantName: data.data.tenant.name,
          superAdminName: data.data.impersonation.superAdminName,
        }));
        
        toast.success(`Accessing ${tenant.name} as Super Admin`);
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Failed to impersonate tenant');
      }
    } catch {
      toast.error('Failed to impersonate tenant');
    } finally {
      setImpersonating(null);
    }
  };

  const handleDeleteTenant = async () => {
    if (!deleteModal.tenant) return;
    if (deleteConfirmation !== deleteModal.tenant.tenantId) {
      toast.error('Please enter the correct tenant ID to confirm');
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/tenants/${deleteModal.tenant.tenantId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmationCode: deleteConfirmation }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Tenant "${deleteModal.tenant.name}" deleted successfully`);
        setDeleteModal({ open: false, tenant: null });
        setDeleteConfirmation('');
        fetchTenants();
      } else {
        toast.error(data.error || 'Failed to delete tenant');
      }
    } catch {
      toast.error('Failed to delete tenant');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary-600" />
            All Tenants
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Manage clinic accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or tenant ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700 placeholder:text-secondary-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
          >
            <option value="">All Status</option>
            <option value="trial">Trial</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gray-100 text-secondary-600 rounded-xl hover:bg-gray-200 transition-all font-sans font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-secondary-400 font-sans">No tenants found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Tenant</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Status</th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden lg:table-cell">Users</th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden lg:table-cell">Patients</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-secondary-800 font-sans">{tenant.name}</p>
                          <p className="text-sm text-secondary-400 font-sans">{tenant.tenantId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-secondary-600 font-sans">{tenant.email}</p>
                        <p className="text-xs text-secondary-400 font-sans">{formatDate(tenant.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-xl font-sans capitalize w-fit ${getStatusColor(tenant.subscription?.status)}`}>
                            {tenant.subscription?.status}
                          </span>
                          {!tenant.isActive && (
                            <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-xl font-sans bg-red-100 text-red-700 w-fit">
                              Disabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center hidden lg:table-cell">
                        <span className="font-semibold text-secondary-700 font-sans">{tenant.stats?.users || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center hidden lg:table-cell">
                        <span className="font-semibold text-secondary-700 font-sans">{tenant.stats?.patients || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleImpersonate(tenant)}
                            disabled={impersonating === tenant.tenantId}
                            className="p-2 text-secondary-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Access Tenant Dashboard"
                          >
                            {impersonating === tenant.tenantId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <LogIn className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            href={`/admin/tenants/${tenant.tenantId}`}
                            className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => toggleTenantStatus(tenant.tenantId, tenant.isActive)}
                            disabled={updatingId === tenant.tenantId}
                            className={`p-2 rounded-xl transition-all ${
                              tenant.isActive 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            title={tenant.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {updatingId === tenant.tenantId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : tenant.isActive ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, tenant })}
                            className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Tenant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-secondary-400 font-sans">
                Showing {tenants.length} of {total} tenants
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-secondary-400 hover:bg-gray-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-secondary-600 font-sans font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-secondary-400 hover:bg-gray-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.tenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-heading font-bold text-secondary-800">Delete Tenant</h2>
              </div>
              <button 
                onClick={() => { setDeleteModal({ open: false, tenant: null }); setDeleteConfirmation(''); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 font-sans text-sm">
                  <strong>Warning:</strong> This action is irreversible. All data associated with this tenant will be permanently deleted, including:
                </p>
                <ul className="mt-2 text-red-700 text-sm font-sans list-disc list-inside">
                  <li>All users and their accounts</li>
                  <li>All patients and medical records</li>
                  <li>All appointments and billing data</li>
                  <li>All inventory and service data</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-secondary-600 font-sans text-sm mb-1">Tenant to delete:</p>
                <p className="font-heading font-bold text-secondary-800">{deleteModal.tenant.name}</p>
                <p className="text-sm text-secondary-400 font-sans">{deleteModal.tenant.tenantId}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
                  Type <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-red-600">{deleteModal.tenant.tenantId}</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 font-sans text-secondary-700 font-mono"
                  placeholder="Enter tenant ID"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setDeleteModal({ open: false, tenant: null }); setDeleteConfirmation(''); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-secondary-600 rounded-xl hover:bg-gray-50 transition-all font-sans font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTenant}
                  disabled={deleting || deleteConfirmation !== deleteModal.tenant.tenantId}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete Permanently</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
