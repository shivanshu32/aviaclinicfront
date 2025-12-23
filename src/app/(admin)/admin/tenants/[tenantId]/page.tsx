'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Users,
  Calendar,
  Stethoscope,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Clock,
  ToggleLeft,
  ToggleRight,
  Save,
  LogIn,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TenantDetails {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
  };
  isActive: boolean;
  subscription: {
    status: string;
    plan: string;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
  };
  stats: {
    users: number;
    patients: number;
    doctors: number;
    appointments: number;
  };
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  }>;
  createdAt: string;
}

export default function TenantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan: '',
    status: '',
  });
  const [impersonating, setImpersonating] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchTenantDetails = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/tenants/${tenantId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTenant(data.data.tenant);
        setSubscriptionForm({
          plan: data.data.tenant.subscription?.plan || 'free',
          status: data.data.tenant.subscription?.status || 'trial',
        });
      } else {
        toast.error('Tenant not found');
        router.push('/admin/tenants');
      }
    } catch {
      toast.error('Failed to load tenant details');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tenantId) {
      fetchTenantDetails();
    }
  }, [tenantId]);

  const toggleTenantStatus = async () => {
    if (!tenant) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/tenants/${tenantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !tenant.isActive }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Tenant ${!tenant.isActive ? 'activated' : 'deactivated'}`);
        setTenant(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      } else {
        toast.error(data.error || 'Failed to update tenant');
      }
    } catch {
      toast.error('Failed to update tenant');
    } finally {
      setSaving(false);
    }
  };

  const updateSubscription = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/tenants/${tenantId}/subscription`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscriptionForm),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Subscription updated');
        fetchTenantDetails();
      } else {
        toast.error(data.error || 'Failed to update subscription');
      }
    } catch {
      toast.error('Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700';
      case 'admin': return 'bg-red-100 text-red-700';
      case 'doctor': return 'bg-green-100 text-green-700';
      case 'receptionist': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleImpersonate = async () => {
    if (!tenant) return;
    setImpersonating(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/tenants/${tenantId}/impersonate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
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
      setImpersonating(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!tenant || deleteConfirmation !== tenant.tenantId) {
      toast.error('Please enter the correct tenant ID to confirm');
      return;
    }
    setDeleting(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmationCode: deleteConfirmation }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Tenant "${tenant.name}" deleted successfully`);
        router.push('/admin/tenants');
      } else {
        toast.error(data.error || 'Failed to delete tenant');
      }
    } catch {
      toast.error('Failed to delete tenant');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-400 font-sans">Tenant not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tenants"
            className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-secondary-800">{tenant.name}</h1>
            <p className="text-secondary-400 font-sans">{tenant.tenantId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1.5 text-sm font-semibold rounded-xl font-sans capitalize ${getStatusColor(tenant.subscription?.status)}`}>
            {tenant.subscription?.status}
          </span>
          <button
            onClick={handleImpersonate}
            disabled={impersonating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-sans font-semibold transition-all bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            {impersonating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><LogIn className="w-4 h-4" /> Access Dashboard</>
            )}
          </button>
          <button
            onClick={toggleTenantStatus}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-sans font-semibold transition-all ${
              tenant.isActive
                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : tenant.isActive ? (
              <><ToggleRight className="w-5 h-5" /> Deactivate</>
            ) : (
              <><ToggleLeft className="w-5 h-5" /> Activate</>
            )}
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-sans font-semibold transition-all bg-red-50 text-red-600 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-secondary-800">{tenant.stats?.users || 0}</p>
              <p className="text-sm text-secondary-400 font-sans">Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-secondary-800">{tenant.stats?.doctors || 0}</p>
              <p className="text-sm text-secondary-400 font-sans">Doctors</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-secondary-800">{tenant.stats?.patients || 0}</p>
              <p className="text-sm text-secondary-400 font-sans">Patients</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-secondary-800">{tenant.stats?.appointments || 0}</p>
              <p className="text-sm text-secondary-400 font-sans">Appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Info */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
          <h2 className="font-heading font-semibold text-secondary-800 mb-4">Tenant Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-secondary-400" />
              <div>
                <p className="text-sm text-secondary-400 font-sans">Email</p>
                <p className="font-semibold text-secondary-800 font-sans">{tenant.email}</p>
              </div>
            </div>
            {tenant.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-400 font-sans">Phone</p>
                  <p className="font-semibold text-secondary-800 font-sans">{tenant.phone}</p>
                </div>
              </div>
            )}
            {tenant.address?.city && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-400 font-sans">Location</p>
                  <p className="font-semibold text-secondary-800 font-sans">
                    {[tenant.address.city, tenant.address.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-secondary-400" />
              <div>
                <p className="text-sm text-secondary-400 font-sans">Created</p>
                <p className="font-semibold text-secondary-800 font-sans">{formatDate(tenant.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
          <h2 className="font-heading font-semibold text-secondary-800 mb-4">Subscription</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">Plan</label>
              <select
                value={subscriptionForm.plan}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, plan: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">Status</label>
              <select
                value={subscriptionForm.status}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
              >
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {tenant.subscription?.trialEndsAt && (
              <div>
                <p className="text-sm text-secondary-400 font-sans">Trial Ends</p>
                <p className="font-semibold text-secondary-800 font-sans">{formatDate(tenant.subscription.trialEndsAt)}</p>
              </div>
            )}
            <button
              onClick={updateSubscription}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Subscription</>}
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-heading font-semibold text-secondary-800">Users ({tenant.users?.length || 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {tenant.users?.map((user) => (
                <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-semibold text-secondary-800 font-sans">{user.name}</p>
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell">
                    <p className="text-sm text-secondary-600 font-sans">{user.email}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-xl font-sans capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-xl font-sans ${user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!tenant.users || tenant.users.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-secondary-400 font-sans">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
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
                onClick={() => { setDeleteModal(false); setDeleteConfirmation(''); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 font-sans text-sm">
                  <strong>Warning:</strong> This action is irreversible. All data associated with this tenant will be permanently deleted.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-secondary-600 font-sans text-sm mb-1">Tenant to delete:</p>
                <p className="font-heading font-bold text-secondary-800">{tenant.name}</p>
                <p className="text-sm text-secondary-400 font-sans">{tenant.tenantId}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
                  Type <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-red-600">{tenant.tenantId}</span> to confirm
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
                  onClick={() => { setDeleteModal(false); setDeleteConfirmation(''); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-secondary-600 rounded-xl hover:bg-gray-50 transition-all font-sans font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTenant}
                  disabled={deleting || deleteConfirmation !== tenant.tenantId}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
