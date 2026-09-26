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
  Plus,
  CheckCircle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { superAdminService } from '@/lib/services';

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
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  };
  trialStatus?: {
    status: string;
    isTrial: boolean;
    remainingDays: number;
    trialStartsAt: string;
    trialEndsAt: string;
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
  
  // Trial extension state
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState(7);
  const [extensionReason, setExtensionReason] = useState('');
  const [showExtendConfirm, setShowExtendConfirm] = useState(false);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    fetchTenant();
  }, [tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

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
        
        // Fetch trial status
        try {
          const trialData = await superAdminService.getTenantTrialDetails(tenantId);
          if (trialData.success) {
            setTenant(prev => prev ? { ...prev, trialStatus: trialData.data.trialStatus } : null);
          }
        } catch (error) {
          console.error('Failed to fetch trial status:', error);
        }
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
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

  const getTrialStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Expired': return 'bg-red-100 text-red-700';
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-700';
      case 'Converted to Paid': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateNewExpiryDate = (currentEnd: string, days: number) => {
    const currentEndDate = new Date(currentEnd);
    const baseDate = currentEndDate > new Date() ? currentEndDate : new Date();
    const newDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    return newDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleExtendTrial = async () => {
    if (!extensionReason.trim()) {
      toast.error('Please provide a reason for this extension');
      return;
    }

    if (!tenant) return;

    setExtending(true);
    try {
      const data = await superAdminService.extendTenantTrial(tenantId, extensionDays, extensionReason);
      if (data.success) {
        toast.success('Trial extended successfully');
        setShowExtendConfirm(false);
        setExtensionReason('');
        setExtensionDays(7);
        setShowExtendModal(false);
        fetchTenant(); // Refresh tenant data
      } else {
        toast.error(data.message || 'Failed to extend trial');
      }
    } catch (error) {
      console.error('Failed to extend trial:', error);
      toast.error('Failed to extend trial');
    } finally {
      setExtending(false);
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
              
              {tenant.trialStatus?.isTrial && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Trial Status</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getTrialStatusColor(tenant.trialStatus.status)}`}>
                      {tenant.trialStatus.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Trial Start</span>
                    <span className="font-medium text-secondary-800">{formatDate(tenant.trialStatus.trialStartsAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Trial End</span>
                    <span className="font-medium text-secondary-800">{formatDate(tenant.trialStatus.trialEndsAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Days Remaining</span>
                    <span className={`font-semibold ${
                      tenant.trialStatus.remainingDays <= 3 ? 'text-red-600' : 
                      tenant.trialStatus.remainingDays <= 7 ? 'text-yellow-600' : 
                      'text-secondary-800'
                    }`}>
                      {tenant.trialStatus.remainingDays} days
                    </span>
                  </div>
                  {tenant.trialStatus.isTrial && (
                    <button
                      onClick={() => setShowExtendModal(true)}
                      className="w-full mt-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Extend Trial
                    </button>
                  )}
                </>
              )}
              
              {!tenant.trialStatus?.isTrial && tenant.subscription?.currentPeriodEnd && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Period Start</span>
                    <span className="font-medium text-secondary-800">{formatDate(tenant.subscription.currentPeriodStart)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Period End</span>
                    <span className="font-medium text-secondary-800">{formatDate(tenant.subscription.currentPeriodEnd)}</span>
                  </div>
                </>
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

      {/* Trial Extension Modal */}
      {showExtendModal && tenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-heading font-bold text-secondary-800">Extend Trial Period</h2>
              </div>
              <button 
                onClick={() => { setShowExtendModal(false); setExtensionReason(''); setExtensionDays(7); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-secondary-500">Tenant</p>
                <p className="font-medium text-secondary-800">{tenant.name}</p>
                <p className="text-sm text-secondary-400">{tenant.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Extension Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {tenant.trialStatus && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Proposed New Expiry:</strong>{' '}
                    {calculateNewExpiryDate(tenant.trialStatus.trialEndsAt, extensionDays)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Reason for Extension <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Explain why this extension is necessary..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowExtendConfirm(true)}
                disabled={!extensionReason.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Extend Trial
              </button>
              <button
                onClick={() => { setShowExtendModal(false); setExtensionReason(''); setExtensionDays(7); }}
                className="flex-1 px-4 py-2 bg-gray-100 text-secondary-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension Confirmation Modal */}
      {showExtendConfirm && tenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-heading font-bold text-secondary-800">Confirm Trial Extension</h2>
              </div>
              <button 
                onClick={() => setShowExtendConfirm(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Current Expiry:</span>
                <span className="font-medium">
                  {tenant.trialStatus ? formatDate(tenant.trialStatus.trialEndsAt) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Extension:</span>
                <span className="font-medium text-primary-600">+{extensionDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">New Expiry:</span>
                <span className="font-medium">
                  {tenant.trialStatus ? calculateNewExpiryDate(tenant.trialStatus.trialEndsAt, extensionDays) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Reason:</span>
                <span className="font-medium">{extensionReason}</span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleExtendTrial}
                disabled={extending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {extending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Extension'}
              </button>
              <button
                onClick={() => setShowExtendConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-secondary-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
