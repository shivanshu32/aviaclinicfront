'use client';

import { useState } from 'react';
import { FlaskConical, ScanLine, Stethoscope, Grid2X2, Search } from 'lucide-react';
import type { ServiceItem } from '@/lib/services';

const categories = [
  { id: 'laboratory', label: 'Laboratory', icon: FlaskConical },
  { id: 'radiology', label: 'Radiology', icon: ScanLine },
  { id: 'procedure', label: 'Procedures', icon: Stethoscope },
  { id: 'other', label: 'Other Services', icon: Grid2X2 },
] as const;

export default function ServiceSelectionPanel({ services, onAdd }: {
  services: ServiceItem[];
  onAdd: (services: ServiceItem[]) => void;
}) {
  const [category, setCategory] = useState<string>('laboratory');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const active = services.filter(service => service.isActive !== false);
  const visible = active.filter(service => service.category === category
    && `${service.name} ${service.description || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  const picked = active.filter(service => selected.includes(service._id));
  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id]);

  return (
    <section aria-label="Select lab tests and services" className="mb-5 rounded-2xl border border-primary-100 bg-white overflow-hidden">
      <div role="tablist" aria-label="Service categories" className="flex overflow-x-auto gap-1 p-2 bg-primary-50 border-b border-primary-100">
        {categories.map(({ id, label, icon: Icon }, index) => (
          <button key={id} id={`service-tab-${id}`} type="button" role="tab" aria-selected={category === id} aria-controls={`service-panel-${id}`} tabIndex={category === id ? 0 : -1}
            onClick={() => { setCategory(id); setSearch(''); }}
            onKeyDown={event => {
              let next = index;
              if (event.key === 'ArrowRight') next = (index + 1) % categories.length;
              else if (event.key === 'ArrowLeft') next = (index + categories.length - 1) % categories.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = categories.length - 1;
              else return;
              event.preventDefault();
              setCategory(categories[next].id);
              setSearch('');
              document.getElementById(`service-tab-${categories[next].id}`)?.focus();
            }}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${category === id ? 'bg-primary-600 text-white shadow-sm' : 'text-primary-800 hover:bg-primary-100'}`}>
            <Icon className="w-4 h-4" />{label}
            <span className="text-xs">({active.filter(service => service.category === id).length})</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`service-panel-${category}`} aria-labelledby={`service-tab-${category}`} tabIndex={0} className="p-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input aria-label="Search services in this category" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search tests or services in this category..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {visible.map(service => (
            <label key={service._id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer focus-within:ring-2 focus-within:ring-primary-500 ${selected.includes(service._id) ? 'bg-primary-50 border-primary-500' : 'bg-white border-gray-200 hover:border-primary-300'}`}>
              <input type="checkbox" checked={selected.includes(service._id)} onChange={() => toggle(service._id)} className="w-5 h-5 shrink-0 accent-primary-600" />
              <span className="flex-1 min-w-0"><span className="block font-medium text-gray-900">{service.name}</span>{service.description && <span className="block mt-1 text-sm text-gray-500">{service.description}</span>}</span>
              <span className="font-semibold text-primary-700">₹{service.rate}</span>
            </label>
          ))}
          {!visible.length && <p role="status" className="col-span-full py-6 text-center text-gray-500">{search ? 'No services match your search.' : 'No services available in this category.'}</p>}
        </div>
      </div>
      <div className="px-4 py-3 border-t border-primary-100 flex flex-wrap items-center justify-between gap-3 bg-primary-50">
        <p aria-live="polite" className="text-sm text-primary-800">{picked.length} selected across all categories · ₹{picked.reduce((total, service) => total + service.rate, 0)}</p>
        <button type="button" disabled={!picked.length} onClick={() => { onAdd(picked); setSelected([]); }} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">Add Selected Services</button>
      </div>
    </section>
  );
}
