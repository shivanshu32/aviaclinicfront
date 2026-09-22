'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceItemService, type ServiceItem } from '@/lib/services';

export default function NewServiceForm({ onSaved, onCancel }: {
  onSaved: (service: ServiceItem) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceItem['category']>('laboratory');
  const [rate, setRate] = useState('');
  const [description, setDescription] = useState('');
  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (!name.trim() || !Number.isFinite(Number(rate)) || Number(rate) <= 0) {
      toast.error('Enter a service name and a valid rate greater than zero');
      return;
    }
    setSaving(true);
    try {
      const response = await serviceItemService.create({ name: name.trim(), category, rate: Number(rate), description: description.trim() });
      onSaved(response.data.service);
      toast.success('Service added successfully');
    } catch {
      toast.error('Failed to add service. Please try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-primary-100 bg-white p-5 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">New Service</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1.5 text-sm font-medium text-gray-700">Service name *<input autoFocus required value={name} onChange={event => setName(event.target.value)} className={inputClass} placeholder="Enter test or service name" /></label>
        <label className="space-y-1.5 text-sm font-medium text-gray-700">Category *<select value={category} onChange={event => setCategory(event.target.value as ServiceItem['category'])} className={inputClass}><option value="laboratory">Laboratory</option><option value="radiology">Radiology</option><option value="procedure">Procedures</option><option value="other">Other Services</option></select></label>
        <label className="space-y-1.5 text-sm font-medium text-gray-700">Rate (₹) *<input type="number" required min="0.01" step="0.01" value={rate} onChange={event => setRate(event.target.value)} className={inputClass} placeholder="0.00" /></label>
        <label className="space-y-1.5 text-sm font-medium text-gray-700">Description<input value={description} onChange={event => setDescription(event.target.value)} className={inputClass} placeholder="Optional description" /></label>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" disabled={saving} onClick={onCancel} className="px-4 py-2.5 border border-gray-200 rounded-xl">Cancel</button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Service</button>
      </div>
    </form>
  );
}
