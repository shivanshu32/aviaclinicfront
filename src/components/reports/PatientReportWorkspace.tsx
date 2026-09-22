'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Printer, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { patientService, type Patient } from '@/lib/services';
import { reportTemplates, templateContent, reportHTML, reportStyles, escapeReportText, type ReportNode, type PatientReport } from '@/lib/patientReport';
import ReportEditor from './ReportEditor';

const today = () => new Date().toLocaleDateString('en-CA');
export default function PatientReportWorkspace() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [reportId, setReportId] = useState('');
  const [title, setTitle] = useState('Patient Report');
  const [date, setDate] = useState(today);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState<ReportNode[]>([{ tag: 'p', children: [{ text: '' }] }]);
  const [revision, setRevision] = useState(0);
  const [template, setTemplate] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const input = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500';

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(false);
      try {
        const response = await patientService.getAll({ search: search.trim() || undefined, limit: 20 });
        if (active) setPatients(response.data.patients || []);
      } catch { if (active) setSearchError(true); }
      finally { if (active) setSearching(false); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);

  useEffect(() => {
    if (!patient) return;
    let active = true;
    setLoading(true);
    setListError(false);
    api.get(`/patients/${patient._id}/reports`).then(response => {
      if (active) setReports(response.data.reports);
    }).catch(() => { if (active) setListError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [patient, retry]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const canReplace = () => !dirty || window.confirm('Discard unsaved report changes?');
  const reset = () => {
    setReportId(''); setTitle('Patient Report'); setDate(today()); setAuthor('');
    setContent([{ tag: 'p', children: [{ text: '' }] }]); setRevision(value => value + 1); setTemplate(''); setDirty(false);
  };
  const save = async () => {
    if (!patient || saving) return;
    if (!title.trim() || !date || !reportHTML(content).replace(/<[^>]*>/g, '').trim()) { toast.error('Enter a title, date and report content'); return; }
    setSaving(true);
    try {
      const payload = { title, date, author, content };
      const response = reportId ? await api.put(`/patients/${patient._id}/reports/${reportId}`, payload) : await api.post(`/patients/${patient._id}/reports`, payload);
      const saved = response.data.report as PatientReport;
      setReportId(saved._id); setReports(prev => [saved, ...prev.filter(report => report._id !== saved._id)]); setDirty(false);
      toast.success('Patient report saved');
    } catch { toast.error('Unable to save report. Your changes are still in the editor.'); }
    finally { setSaving(false); }
  };
  const print = () => {
    if (!patient) return;
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;';
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    if (!doc) { frame.remove(); return; }
    doc.open();
    doc.write(`<!doctype html><html><head><title>${escapeReportText(title)}</title><style>${reportStyles}</style></head><body><h1>${escapeReportText(title)}</h1><p><b>Patient:</b> ${escapeReportText(patient.name)} · ${patient.age} years · ${escapeReportText(patient.gender)}</p><p><b>Date:</b> ${escapeReportText(date)}${author ? ` · <b>Reported by:</b> ${escapeReportText(author)}` : ''}</p><hr>${reportHTML(content)}</body></html>`);
    doc.close();
    setTimeout(() => { frame.contentWindow?.focus(); frame.contentWindow?.print(); setTimeout(() => frame.remove(), 60000); }, 200);
  };
  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-semibold text-gray-900">Create Patient Report</h2><p className="text-sm text-gray-500 mt-1">Choose a patient, start with a template or a blank report, and edit directly on the page.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="text-sm font-medium text-gray-700">Search patients<input disabled={saving} value={search} onChange={event => setSearch(event.target.value)} placeholder="Name or phone" className={`${input} mt-1`} /></label>
        <label className="text-sm font-medium text-gray-700">Patient<select disabled={saving} value={patient?._id || ''} onChange={event => { const selected = patients.find(item => item._id === event.target.value); if (selected && canReplace()) { setPatient(selected); setReports([]); reset(); } }} className={`${input} mt-1`}><option value="">Select patient</option>{patient && !patients.some(item => item._id === patient._id) && <option value={patient._id}>{patient.name} · {patient.phone}</option>}{patients.map(item => <option key={item._id} value={item._id}>{item.name} · {item.phone}</option>)}</select></label>
      </div>
      {searching && <p className="text-sm text-gray-500">Searching patients…</p>}
      {searchError && <p role="alert" className="text-sm text-red-600">Unable to load patients. Change the search to try again.</p>}
      {!searching && !searchError && !patients.length && <p className="text-sm text-gray-500">No matching patients.</p>}
      {patient && <>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-primary-50 p-3">
          <select aria-label="Saved patient reports" disabled={loading || saving} value={reportId} onChange={event => { const report = reports.find(item => item._id === event.target.value); if (report && canReplace()) { setReportId(report._id); setTitle(report.title); setDate(report.date); setAuthor(report.author); setContent(report.content); setRevision(value => value + 1); setDirty(false); } }} className="flex-1 min-w-48 p-2 border border-primary-200 rounded-lg bg-white"><option value="">{loading ? 'Loading reports…' : 'Open a saved report'}</option>{reports.map(report => <option key={report._id} value={report._id}>{report.date} — {report.title}</option>)}</select>
          <button disabled={saving} onClick={() => { if (canReplace()) reset(); }} className="inline-flex items-center gap-2 px-3 py-2 text-primary-700 font-medium"><Plus className="w-4 h-4" />New report</button>
        </div>
        {listError && <p role="alert" className="text-sm text-red-600">Unable to load saved reports. <button onClick={() => setRetry(value => value + 1)} className="underline">Retry</button></p>}
        <fieldset disabled={saving} className="space-y-4 disabled:opacity-70">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-48 text-sm font-medium text-gray-700">Report template<select value={template} onChange={event => setTemplate(event.target.value)} className={`${input} mt-1`}><option value="">Choose one of seven templates</option>{reportTemplates.map((item, index) => <option key={item.name} value={index}>{item.name}</option>)}</select></label>
            <button disabled={template === ''} onClick={() => { if (!canReplace()) return; const chosen = reportTemplates[Number(template)]; setTitle(chosen.name); setContent(templateContent(chosen.sections)); setRevision(value => value + 1); setDirty(true); }} className="px-4 py-2.5 rounded-xl bg-primary-600 text-white disabled:opacity-50">Use template</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-sm font-medium text-gray-700">Report title<input maxLength={150} value={title} onChange={event => { setTitle(event.target.value); setDirty(true); }} className={`${input} mt-1`} /></label>
            <label className="text-sm font-medium text-gray-700">Report date<input type="date" value={date} onChange={event => { setDate(event.target.value); setDirty(true); }} className={`${input} mt-1`} /></label>
            <label className="text-sm font-medium text-gray-700">Reported by<input maxLength={150} value={author} onChange={event => { setAuthor(event.target.value); setDirty(true); }} placeholder="Doctor / clinician name" className={`${input} mt-1`} /></label>
          </div>
          <div className={saving ? 'pointer-events-none' : ''}><ReportEditor disabled={saving} content={content} revision={revision} onChange={value => { setContent(value); setDirty(true); }} /></div>
        </fieldset>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-gray-500">{dirty ? 'Unsaved changes' : reportId ? 'Report saved' : 'New report'}</p>
          <div className="flex gap-3"><button disabled={saving} onClick={print} className="inline-flex items-center gap-2 px-4 py-2.5 border border-primary-200 rounded-xl text-primary-700"><Printer className="w-4 h-4" />Print / Save PDF</button><button disabled={saving} onClick={save} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Report</button></div>
        </div>
      </>}
    </div>
  );
}
