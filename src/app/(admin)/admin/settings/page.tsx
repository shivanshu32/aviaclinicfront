'use client';

import { useState, useEffect } from 'react';
import { 
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  History,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { superAdminService } from '@/lib/services';

interface TrialSettings {
  defaultTrialDays: number;
  timezone: string;
  updatedAt: string;
}

interface Tenant {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  subscription: {
    plan: string;
    status: string;
    trialEndsAt: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  trialStatus?: {
    status: string;
    isTrial: boolean;
    remainingDays: number;
    trialStartsAt: string;
    trialEndsAt: string;
  };
}

export default function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState<'global' | 'tenants'>('global');
  const [loading, setLoading] = useState(true);
  const [trialSettings, setTrialSettings] = useState<TrialSettings | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  // Global settings form state
  const [newTrialDays, setNewTrialDays] = useState<number>(14);
  const [changeReason, setChangeReason] = useState('');
  const [showGlobalConfirm, setShowGlobalConfirm] = useState(false);
  const [updatingGlobal, setUpdatingGlobal] = useState(false);

  // Tenant extension form state
  const [extensionDays, setExtensionDays] = useState<number>(7);
  const [extensionReason, setExtensionReason] = useState('');
  const [showExtendConfirm, setShowExtendConfirm] = useState(false);
  const [extending, setExtending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [extensionHistory, setExtensionHistory] = useState<unknown[]>([]);

  useEffect(() => {
    fetchTrialSettings();
    fetchTenants();
  }, []);

  const fetchTrialSettings = async () => {
    try {
      const data = await superAdminService.getTrialSettings();
      if (data.success) {
        setTrialSettings(data.data);
        setNewTrialDays(data.data.defaultTrialDays);
      }
    } catch (error) {
      console.error('Failed to fetch trial settings:', error);
      toast.error('Failed to load trial settings');
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await superAdminService.getTenants();
      if (data.success) {
        // Fetch trial status for each tenant
        const tenantsWithStatus = await Promise.all(
          data.data.tenants.map(async (tenant: Tenant) => {
            try {
              const trialData = await superAdminService.getTenantTrialDetails(tenant.tenantId);
              if (trialData.success) {
                return { ...tenant, trialStatus: trialData.data.trialStatus };
              }
              return tenant;
            } catch {
              return tenant;
            }
          })
        );
        setTenants(tenantsWithStatus);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGlobalSettings = async () => {
    if (!changeReason.trim()) {
      toast.error('Please provide a reason for this change');
      return;
    }

    setUpdatingGlobal(true);
    try {
      const data = await superAdminService.updateTrialSettings(newTrialDays, changeReason);
      if (data.success) {
        toast.success('Default trial duration updated successfully');
        setTrialSettings(data.data);
        setShowGlobalConfirm(false);
        setChangeReason('');
      } else {
        toast.error(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to update trial settings:', error);
      toast.error('Failed to update trial settings');
    } finally {
      setUpdatingGlobal(false);
    }
  };

  const handleExtendTrial = async () => {
    if (!extensionReason.trim()) {
      toast.error('Please provide a reason for this extension');
      return;
    }

    if (!selectedTenant) return;

    setExtending(true);
    try {
      const data = await superAdminService.extendTenantTrial(selectedTenant.tenantId, extensionDays, extensionReason);
      if (data.success) {
        toast.success('Trial extended successfully');
        setShowExtendConfirm(false);
        setExtensionReason('');
        setExtensionDays(7);
        setSelectedTenant(null);
        fetchTenants(); // Refresh tenant list
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

  const fetchExtensionHistory = async (tenantId: string) => {
    try {
      const data = await superAdminService.getTenantTrialHistory(tenantId);
      if (data.success) {
        setExtensionHistory(data.data.history);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Failed to fetch extension history:', error);
      toast.error('Failed to load extension history');
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

  const getTrialStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Expired': return 'bg-red-100 text-red-700';
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-700';
      case 'Converted to Paid': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.tenantId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage trial periods and customer subscriptions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'global'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Global Trial Settings
        </button>
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'tenants'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Manage Individual Trials
        </button>
      </div>

      {/* Global Settings Tab */}
      {activeTab === 'global' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Default Trial Duration</h2>
              <p className="text-gray-500 text-sm mt-1">
                Set the default trial period for new customer accounts. This change only affects new signups after the update.
              </p>
            </div>
          </div>

          {trialSettings && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current Default</p>
                    <p className="text-2xl font-bold text-gray-900">{trialSettings.defaultTrialDays} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-700">
                      {new Date(trialSettings.updatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Default Trial Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={newTrialDays}
                  onChange={(e) => setNewTrialDays(parseInt(e.target.value) || 1)}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Must be between 1 and 365 days</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Change <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Explain why this change is necessary..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowGlobalConfirm(true)}
                  disabled={newTrialDays === trialSettings.defaultTrialDays}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setNewTrialDays(trialSettings.defaultTrialDays);
                    setChangeReason('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Individual Tenants Tab */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tenants by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Tenant List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trial Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trial Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining Days
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{tenant.name}</p>
                          <p className="text-sm text-gray-500">{tenant.email}</p>
                          <p className="text-xs text-gray-400">{tenant.tenantId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tenant.trialStatus?.isTrial ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTrialStatusColor(tenant.trialStatus.status)}`}>
                            {tenant.trialStatus.status}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            Converted to Paid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {new Date(tenant.subscription.currentPeriodStart).toLocaleDateString('en-IN')} - {' '}
                            {new Date(tenant.subscription.trialEndsAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tenant.trialStatus?.isTrial ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className={`font-medium ${
                              tenant.trialStatus.remainingDays <= 3 ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {tenant.trialStatus.remainingDays} days
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {tenant.trialStatus?.isTrial && (
                            <button
                              onClick={() => setSelectedTenant(tenant)}
                              className="px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                            >
                              Extend Trial
                            </button>
                          )}
                          <button
                            onClick={() => fetchExtensionHistory(tenant.tenantId)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTenants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No tenants found matching your search</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Settings Confirmation Modal */}
      {showGlobalConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold">Confirm Trial Duration Change</h3>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Duration:</span>
                <span className="font-medium">{trialSettings?.defaultTrialDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">New Duration:</span>
                <span className="font-medium text-primary-600">{newTrialDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reason:</span>
                <span className="font-medium">{changeReason}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> This change will only apply to new trials created after this update. Existing trials will not be affected.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpdateGlobalSettings}
                disabled={updatingGlobal}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {updatingGlobal ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Change'}
              </button>
              <button
                onClick={() => setShowGlobalConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Extension Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold">Extend Trial Period</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Tenant</p>
                <p className="font-medium text-gray-900">{selectedTenant.name}</p>
                <p className="text-sm text-gray-500">{selectedTenant.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extension Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {selectedTenant.trialStatus && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Proposed New Expiry:</strong>{' '}
                    {calculateNewExpiryDate(selectedTenant.subscription.trialEndsAt, extensionDays)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Extension <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Explain why this extension is necessary..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExtendConfirm(true)}
                disabled={!extensionReason.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Extend Trial
              </button>
              <button
                onClick={() => {
                  setSelectedTenant(null);
                  setExtensionReason('');
                  setExtensionDays(7);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension Confirmation Modal */}
      {showExtendConfirm && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Confirm Trial Extension</h3>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Expiry:</span>
                <span className="font-medium">
                  {new Date(selectedTenant.subscription.trialEndsAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Extension:</span>
                <span className="font-medium text-primary-600">+{extensionDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">New Expiry:</span>
                <span className="font-medium">
                  {calculateNewExpiryDate(selectedTenant.subscription.trialEndsAt, extensionDays)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reason:</span>
                <span className="font-medium">{extensionReason}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExtendTrial}
                disabled={extending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {extending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Extension'}
              </button>
              <button
                onClick={() => setShowExtendConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Trial Extension History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {extensionHistory.length > 0 ? (
                <div className="space-y-3">
                  {extensionHistory.map((log) => (
                    <div key={log._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{log.superAdminName}</p>
                          <p className="text-sm text-gray-500">{log.superAdminEmail}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Old Expiry:</span>
                          <span className="ml-2 font-medium">
                            {new Date(log.details.oldTrialEnd).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">New Expiry:</span>
                          <span className="ml-2 font-medium text-primary-600">
                            {new Date(log.details.newTrialEnd).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Method:</span>
                          <span className="ml-2 font-medium">{log.details.extensionMethod}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-500 text-sm">Reason:</span>
                        <p className="text-sm text-gray-700 mt-1">{log.details.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No extension history found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}