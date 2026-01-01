'use client';

import { useState, useEffect } from 'react';
import { Settings, Loader2, Save, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsService, ClinicSettings } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { tenant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Partial<ClinicSettings>>({
    clinicName: '',
    tagline: '',
    phone: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    },
    appointmentDuration: 15,
    currency: 'INR',
    taxRate: 0,
    invoicePrefix: 'INV',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.get();
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.update(settings);
      toast.success('Settings saved successfully');
    } catch (err: unknown) {
      const error = err as { error?: string };
      toast.error(error.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="h-full flex flex-col -m-4 sm:-m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <Settings className="w-5 h-5 text-primary-600" />
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white space-y-6 overflow-y-auto">
          {/* Subscription Info */}
          {tenant?.subscription && (
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-100">Current Plan</p>
                  <p className="text-xl font-bold capitalize">{tenant.subscription.plan}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  tenant.subscription.status === 'active' ? 'bg-green-400 text-green-900' :
                  tenant.subscription.status === 'trial' ? 'bg-yellow-400 text-yellow-900' : 'bg-red-400 text-red-900'
                }`}>{tenant.subscription.status}</span>
              </div>
              {tenant.subscription.status === 'trial' && (
                <p className="mt-3 text-sm text-primary-100">Trial ends: {new Date(tenant.subscription.trialEndsAt).toLocaleDateString()}</p>
              )}
            </div>
          )}

          {/* Clinic Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-800">Clinic Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Clinic Name</label>
                <input type="text" name="clinicName" value={settings.clinicName || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
                <input type="text" name="tagline" value={settings.tagline || ''} onChange={handleChange} className={inputClass} placeholder="Your health, our priority" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input type="tel" name="phone" value={settings.phone || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" value={settings.email || ''} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1</label>
                <input type="text" name="address.line1" value={settings.address?.line1 || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
                <input type="text" name="address.line2" value={settings.address?.line2 || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input type="text" name="address.city" value={settings.address?.city || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input type="text" name="address.state" value={settings.address?.state || ''} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
                <input type="text" name="address.pincode" value={settings.address?.pincode || ''} onChange={handleChange} maxLength={6} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Billing Settings */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Billing Settings</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Invoice Prefix</label>
                <input type="text" name="invoicePrefix" value={settings.invoicePrefix || ''} onChange={handleChange} className={inputClass} placeholder="INV" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Rate (%)</label>
                <input type="number" name="taxRate" value={settings.taxRate || 0} onChange={handleChange} min="0" max="100" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointment Duration (min)</label>
                <input type="number" name="appointmentDuration" value={settings.appointmentDuration || 15} onChange={handleChange} min="5" max="120" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2.5 font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
