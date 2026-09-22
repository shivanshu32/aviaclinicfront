'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FlaskConical, ScanLine, Stethoscope, Grid2X2, Search } from 'lucide-react';
import type { ServiceItem } from '@/lib/services';

const categories = [
  { id: 'laboratory', label: 'Laboratory', icon: FlaskConical },
  { id: 'radiology', label: 'Radiology', icon: ScanLine },
  { id: 'procedure', label: 'Procedures', icon: Stethoscope },
  { id: 'other', label: 'Other Services', icon: Grid2X2 },
] as const;

export default function ServiceSelectionModal({ services, onAdd, onClose }: {
  services: ServiceItem[];
  onAdd: (services: ServiceItem[]) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => opener?.focus();
  }, []);
  const active = services.filter(service => service.isActive !== false);
  const visible = active.filter(service => service.category === category
    && `${service.name} ${service.description || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  const picked = active.filter(service => selected.includes(service._id));
  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onKeyDown={event => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)') || []);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="service-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden outline-none">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 id="service-modal-title" className="text-xl font-semibold text-gray-900">Select Service</h2>
          <p className="mt-1 text-sm text-gray-500">Choose services from any category. Your selections stay checked as you browse.</p>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto bg-gray-50/70">
          {category === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => { setCategory(id); setSearch(''); }} className="p-5 bg-white border border-gray-200 rounded-2xl text-left hover:border-purple-400 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-purple-500">
                  <Icon className="w-7 h-7 text-purple-600 mb-3" />
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="mt-1 text-sm text-gray-500">{active.filter(service => service.category === id).length} services</p>
                  {active.some(service => service.category === id && selected.includes(service._id)) && <p className="mt-2 text-sm font-medium text-purple-700">{active.filter(service => service.category === id && selected.includes(service._id)).length} selected</p>}
                </button>
              ))}
            </div>
          ) : (
            <>
              <button type="button" onClick={() => { setCategory(null); setSearch(''); }} className="inline-flex items-center gap-2 text-sm text-purple-700 mb-4"><ArrowLeft className="w-4 h-4" />All categories</button>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">{categories.find(item => item.id === category)?.label}</h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input aria-label="Search services" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search services..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="space-y-3">
                {visible.map(service => (
                  <label key={service._id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer focus-within:ring-2 focus-within:ring-purple-500 ${selected.includes(service._id) ? 'bg-purple-50 border-purple-500' : 'bg-white border-gray-200 hover:border-purple-300'}`}>
                    <input type="checkbox" checked={selected.includes(service._id)} onChange={() => toggle(service._id)} className="w-5 h-5 shrink-0 accent-purple-600" />
                    <span className="flex-1 min-w-0"><span className="block font-medium text-gray-900">{service.name}</span>{service.description && <span className="block mt-1 text-sm text-gray-500">{service.description}</span>}</span>
                    <span className="font-semibold text-purple-700">₹{service.rate}</span>
                  </label>
                ))}
                {!visible.length && <p className="py-6 text-center text-gray-500">{search ? 'No services match your search.' : 'No services available in this category.'}</p>}
              </div>
            </>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-gray-600">{picked.length} selected · ₹{picked.reduce((total, service) => total + service.rate, 0)}</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600">Cancel</button>
            <button type="button" disabled={!picked.length} onClick={() => onAdd(picked)} className="px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50">Add Selected Services</button>
          </div>
        </div>
      </div>
    </div>
  );
}
