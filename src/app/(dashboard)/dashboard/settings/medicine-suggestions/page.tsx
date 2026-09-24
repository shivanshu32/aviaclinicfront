'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { medicineService, prescriptionService, type DiagnosisMapping, type Medicine } from '@/lib/services';

type ConfiguredMedicine = DiagnosisMapping['medicines'][number] & { name: string };
const empty = { diagnosis: '', aliases: '', isActive: true };

export default function MedicineSuggestionsSettings() {
  const [mappings, setMappings] = useState<DiagnosisMapping[]>([]);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(empty);
  const [configured, setConfigured] = useState<ConfiguredMedicine[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const input = 'w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

  const load = async () => { setLoading(true); try { const response = await prescriptionService.getMappings(); setMappings(response.data.mappings || []); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  const selectMapping = (mapping?: DiagnosisMapping) => {
    if (!mapping) { setEditingId(''); setForm(empty); setConfigured([]); return; }
    const names = new Map((mapping.medicineDetails || []).map(item => [item._id, item.name]));
    setEditingId(mapping._id); setForm({ diagnosis: mapping.diagnosis, aliases: mapping.aliases.join(', '), isActive: mapping.isActive });
    setConfigured(mapping.medicines.map(item => ({ ...item, name: names.get(item.medicineId) || 'Medicine' })));
  };
  const search = async (value: string) => { setMedicineSearch(value); if (value.trim().length < 2) return setResults([]); const response = await medicineService.getAll({ search: value, limit: 10 }); setResults(response.data.medicines || []); };
  const add = (medicine: Medicine) => { if (configured.some(item => item.medicineId === medicine._id)) return toast.error('Medicine already configured'); setConfigured(items => [...items, { medicineId: medicine._id, name: medicine.name, priority: (items.length + 1) * 10, isCommon: true, isActive: true, dosage: '', frequency: '', duration: '', instructions: '' }]); setResults([]); setMedicineSearch(''); };
  const update = (index: number, field: keyof ConfiguredMedicine, value: string | number | boolean) => setConfigured(items => items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  const save = async () => {
    if (form.diagnosis.trim().length < 2) return toast.error('Enter a diagnosis or condition');
    setSaving(true);
    const data = { diagnosis: form.diagnosis, aliases: form.aliases.split(',').map(value => value.trim()).filter(Boolean), isActive: form.isActive, medicines: configured.map(item => ({ medicineId: item.medicineId, priority: item.priority, isCommon: item.isCommon, isActive: item.isActive, dosage: item.dosage, frequency: item.frequency, duration: item.duration, instructions: item.instructions })) };
    try { if (editingId) await prescriptionService.updateMapping(editingId, data); else await prescriptionService.createMapping(data); toast.success('Suggestion mapping saved'); selectMapping(); await load(); }
    catch (error: unknown) { toast.error((error as { error?: string }).error || 'Unable to save mapping'); }
    finally { setSaving(false); }
  };

  return <div className="mx-auto max-w-7xl space-y-5"><div className="flex items-center gap-3"><Link href="/dashboard/settings" className="rounded-lg p-2 hover:bg-gray-100"><ArrowLeft className="h-5 w-5" /></Link><div><h1 className="text-xl font-semibold">Diagnosis → Common Medicine Mapping</h1><p className="text-sm text-gray-500">Configure optional clinical suggestions. Doctors always make the final selection.</p></div></div>
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]"><aside className="rounded-2xl border bg-white p-4"><button type="button" onClick={() => selectMapping()} className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" />New diagnosis</button>{loading ? <Loader2 className="mx-auto mt-8 h-5 w-5 animate-spin" /> : <div className="space-y-1">{mappings.map(mapping => <button type="button" key={mapping._id} onClick={() => selectMapping(mapping)} className={`w-full rounded-lg px-3 py-2 text-left ${editingId === mapping._id ? 'bg-primary-50 text-primary-800' : 'hover:bg-gray-50'}`}><p className="font-medium">{mapping.diagnosis}</p><p className="text-xs text-gray-500">{mapping.medicines.length} medicines · {mapping.isActive ? 'Active' : 'Inactive'}</p></button>)}</div>}</aside>
      <main className="space-y-4 rounded-2xl border bg-white p-5"><div className="grid gap-3 md:grid-cols-2"><label className="text-sm font-medium">Diagnosis / condition *<input value={form.diagnosis} onChange={e => setForm(value => ({ ...value, diagnosis: e.target.value }))} className={`${input} mt-1`} /></label><label className="text-sm font-medium">Aliases <input value={form.aliases} onChange={e => setForm(value => ({ ...value, aliases: e.target.value }))} placeholder="Comma-separated" className={`${input} mt-1`} /></label></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(value => ({ ...value, isActive: e.target.checked }))} />Show suggestions for this diagnosis</label>
        <div><label className="text-sm font-medium">Add from Medicine Master</label><input value={medicineSearch} onChange={e => void search(e.target.value)} placeholder="Search medicine name or generic name" className={`${input} mt-1`} />{results.length > 0 && <div className="mt-1 rounded-lg border">{results.map(medicine => <button type="button" key={medicine._id} onClick={() => add(medicine)} className="block w-full px-3 py-2 text-left hover:bg-gray-50">{medicine.name} <span className="text-sm text-gray-500">{medicine.genericName}</span></button>)}</div>}</div>
        <div className="space-y-3">{configured.map((item, index) => <div key={item.medicineId} className="rounded-xl border p-4"><div className="mb-3 flex items-center justify-between"><p className="font-medium">{item.name}</p><button type="button" onClick={() => setConfigured(items => items.filter((_, i) => i !== index))}><Trash2 className="h-5 w-5 text-red-500" /></button></div><div className="grid gap-2 md:grid-cols-4"><label className="text-xs text-gray-600">Priority<input type="number" min="0" max="9999" value={item.priority} onChange={e => update(index, 'priority', Number(e.target.value))} className={`${input} mt-1`} /></label><label className="text-xs text-gray-600">Dosage<input value={item.dosage} onChange={e => update(index, 'dosage', e.target.value)} className={`${input} mt-1`} /></label><label className="text-xs text-gray-600">Frequency<input value={item.frequency} onChange={e => update(index, 'frequency', e.target.value)} className={`${input} mt-1`} /></label><label className="text-xs text-gray-600">Duration<input value={item.duration} onChange={e => update(index, 'duration', e.target.value)} className={`${input} mt-1`} /></label></div><input value={item.instructions} onChange={e => update(index, 'instructions', e.target.value)} placeholder="Optional instructions" className={`${input} mt-2`} /><div className="mt-2 flex gap-5 text-sm"><label><input type="checkbox" checked={item.isCommon} onChange={e => update(index, 'isCommon', e.target.checked)} className="mr-2" />Commonly used</label><label><input type="checkbox" checked={item.isActive} onChange={e => update(index, 'isActive', e.target.checked)} className="mr-2" />Active suggestion</label></div></div>)}</div>
        <div className="flex justify-end border-t pt-4"><button type="button" disabled={saving} onClick={() => void save()} className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 font-medium text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save mapping</button></div></main></div></div>;
}
