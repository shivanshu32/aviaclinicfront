'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Loader2, 
  Building2, 
  Users,
  Calendar,
  Receipt,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  LogIn,
  ToggleLeft,
  ToggleRight,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TenantDetail {
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
    currentPeriodEnd?: string;
  };
  settings?: {
    clinicName?: string;
    tagline?: string;
    address?: {
      line1?: string;
      city?: string;
      state?: string;
    };
  };
  stats: {
    users: number;
    patients: number;
    appointments: number;
    bills: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    fetchTenant();
  }, [tenantId]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/tenants/${tenantId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTenant(data.data.tenant);
      } else {
        setError(data.error || 'Failed to load tenant');
      }
    } catch (err) {
      console.error('Failed to fetch tenant:', err);
      setError('Failed to load tenant details');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!tenant) return;
    setUpdatingStatus(true);
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
      setUpdatingStatus(false);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-secondary-600 mb-4">{error || 'Tenant not found'}</p>
        <button
          onClick={() => router.back()}
          className="text-primary-600 hover:text-primary-700"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-primary-600" />
              {tenant.name}
            </h1>
            <p className="text-secondary-400 mt-1 font-sans">{tenant.tenantId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleImpersonate}
            disabled={impersonating}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-secondary-700 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
          >
            {impersonating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Access Dashboard
          </button>
          <button
            onClick={toggleStatus}
            disabled={updatingStatus}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium disabled:opacity-50 ${
              tenant.isActive 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {updatingStatus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : tenant.isActive ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            {tenant.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Users</p>
              <p className="text-2xl font-heading font-bold text-secondary-800 mt-1">{tenant.stats?.users || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Patients</p>
              <p className="text-2xl font-heading font-bold text-secondary-800 mt-1">{tenant.stats?.patients || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-500/20">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Appointments</p>
              <p className="text-2xl font-heading font-bold text-secondary-800 mt-1">{tenant.stats?.appointments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Bills</p>
              <p className="text-2xl font-heading font-bold text-secondary-800 mt-1">{tenant.stats?.bills || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
              <Receipt className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Tenant Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Tenant Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium text-secondary-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  {tenant.email}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Phone</p>
                <p className="font-medium text-secondary-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-500" />
                  {tenant.phone || 'Not provided'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Address</p>
                <p className="font-medium text-secondary-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  {tenant.settings?.address?.line1 
                    ? `${tenant.settings.address.line1}, ${tenant.settings.address.city || ''}, ${tenant.settings.address.state || ''}`
                    : 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Clinic Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Clinic Name</p>
                <p className="font-medium text-secondary-800">{tenant.settings?.clinicName || tenant.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Tagline</p>
                <p className="font-medium text-secondary-800">{tenant.settings?.tagline || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Subscription</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Plan</span>
                <span className="font-semibold text-secondary-800 capitalize">{tenant.subscription?.plan || 'Free'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Status</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(tenant.subscription?.status)}`}>
                  {tenant.subscription?.status}
                </span>
              </div>
              {tenant.subscription?.status === 'trial' && tenant.subscription?.trialEndsAt && (
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600">Trial Ends</span>
                  <span className="font-medium text-secondary-800">{formatDate(tenant.subscription.trialEndsAt)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Account</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {tenant.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-500">Created</span>
                <span className="text-secondary-800 font-medium">{formatDate(tenant.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Last Updated</span>
                <span className="text-secondary-800 font-medium">{formatDate(tenant.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
