'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { serviceItemService, type ServiceItem } from '@/lib/services';
import NewServiceForm from '@/components/billing/NewServiceForm';
import ServiceSelectionPanel from '@/components/billing/ServiceSelectionPanel';
import { useMiscBillDraft } from '@/components/billing/MiscBillDraft';

export default function SelectBillServicesPage() {
  const router = useRouter();
  const { setFormData } = useMiscBillDraft();
  const [addingService, setAddingService] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    serviceItemService.getAll().then(response => {
      if (active) setServices(response.data?.services || []);
    }).catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  const addServices = (selected: ServiceItem[]) => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items.filter(item => item.description.trim() || item.rate !== 0 || item.quantity !== 1),
        ...selected.map(service => ({ serviceId: service._id, description: service.name, quantity: 1, rate: service.rate })),
      ],
    }));
    router.push('/dashboard/billing/misc/new');
  };

  return (
    <div className="space-y-5">
      <Link href="/dashboard/billing/misc/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800"><ArrowLeft className="w-4 h-4" />Back to bill</Link>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Select Lab Tests / Services</h1>
        <p className="mt-1 text-sm text-gray-500">Choose tests from the category tabs, then add them to your bill.</p>
      </div>
      {!addingService && <button type="button" onClick={() => setAddingService(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700"><Plus className="w-5 h-5" />New Service</button>}
      {addingService && <NewServiceForm onCancel={() => setAddingService(false)} onSaved={service => { setServices(prev => [...prev, service]); setAddingService(false); }} />}
      <div hidden={addingService}>
      {loading ? <div className="flex items-center justify-center gap-2 py-16 text-primary-700"><Loader2 className="w-6 h-6 animate-spin" />Loading services…</div>
        : error ? <div role="alert" className="p-4 rounded-xl bg-red-50 text-red-700">Unable to load services. <button type="button" onClick={() => setAttempt(value => value + 1)} className="underline">Retry</button></div>
        : <ServiceSelectionPanel services={services} onAdd={addServices} />}
      </div>
    </div>
  );
}
