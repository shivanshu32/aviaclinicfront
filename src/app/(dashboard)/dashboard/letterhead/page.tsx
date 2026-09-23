'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { appointmentLetterheadNotes } from '@/lib/appointmentLetterhead';
import { Printer, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientService, doctorService, appointmentService, type Appointment, type Patient, type Doctor } from '@/lib/services';
import { settingsService } from '@/lib/services/settingsService';

const paperStyles = `
.letterhead-paper{position:relative;width:100%;aspect-ratio:2/3;container-type:inline-size;background:white;color:#183e2a;font-family:Arial,sans-serif;box-sizing:border-box}
.letterhead-art{position:absolute;inset:0;width:100%;height:100%}
.letterhead-doctor{position:absolute;left:50.3%;top:4.4%;width:32%;height:8.2%;background:#fff;padding:.3cqw;box-sizing:border-box;overflow:hidden}
.letterhead-doctor strong{display:block;font-size:3cqw;line-height:1.15;color:#17683c;overflow-wrap:anywhere}
.letterhead-doctor p{font-size:1.6cqw;line-height:1.35;margin:.65cqw 0;overflow-wrap:anywhere}
.letterhead-patient{position:absolute;left:6%;right:6%;top:16%;display:grid;grid-template-columns:1fr 1fr;gap:1cqw 3cqw;padding-bottom:1.5cqw;border-bottom:1px solid #a7c8ae;font-size:1.65cqw;line-height:1.5;overflow-wrap:anywhere}
.letterhead-patient p{margin:0}
.letterhead-body{position:absolute;left:6%;right:6%;top:25%;bottom:15%;font-size:1.85cqw;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere;overflow:hidden;color:#152a1e}
.letterhead-contact{position:absolute;top:94.6%;height:3%;background:#e8f4e9;font-size:1.22cqw;line-height:1.25;overflow-wrap:anywhere;overflow:hidden;padding:.15cqw;box-sizing:border-box}
.letterhead-phone{left:19.8%;width:12%}.letterhead-email{left:39.8%;width:14.1%}.letterhead-address{left:61%;width:13.3%}.letterhead-website{left:81.8%;width:15.5%}
@page{size:A4;margin:0}
@media print{html,body{margin:0!important;padding:0!important;background:white}.letterhead-paper{width:198mm;height:297mm;aspect-ratio:auto;margin:0 auto;break-after:avoid;print-color-adjust:exact;-webkit-print-color-adjust:exact}}
`;
const localDate = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; };

export default function LetterheadPage() {
  const searchParams = useSearchParams();
  const appointmentFromUrl = searchParams.get('appointment') || '';
  const [appointmentId, setAppointmentId] = useState(appointmentFromUrl);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointment, setLoadingAppointment] = useState(!!appointmentFromUrl);
  const [appointmentError, setAppointmentError] = useState(false);
  const [appointmentListError, setAppointmentListError] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [linkedDoctor, setLinkedDoctor] = useState<Doctor | null>(null);
  const [retryAppointment, setRetryAppointment] = useState(0);
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [searching, setSearching] = useState(false);
  const [patientError, setPatientError] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [registration, setRegistration] = useState('');
  const [date, setDate] = useState(localDate);
  const [notes, setNotes] = useState('');
  const [contacts, setContacts] = useState({ phone: '', email: '', address: '', website: '' });
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [printing, setPrinting] = useState(false);
  const paper = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const doctor = doctors.find(item => item._id === doctorId) || (linkedDoctor?._id === doctorId ? linkedDoctor : undefined);
  const field = 'w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500';

  useEffect(() => { setAppointmentId(appointmentFromUrl); }, [appointmentFromUrl]);

  useEffect(() => {
    if (!appointmentId) { setLoadingAppointment(false); setAppointmentError(false); return; }
    let active = true;
    setLoadingAppointment(true);
    setAppointmentError(false);
    const load = async () => {
      try {
        const response = await appointmentService.getById(appointmentId);
        const appointment = response.data.appointment;
        const [patientResponse, doctorResponse] = await Promise.all([
          patientService.getById(appointment.patientId), doctorService.getById(appointment.doctorId),
        ]);
        if (!active) return;
        setPatient(patientResponse.data.patient);
        setLinkedDoctor(doctorResponse.data.doctor);
        setDoctorId(appointment.doctorId);
        setRegistration('');
        setDate(appointment.date.split('T')[0]);
        setNotes(appointmentLetterheadNotes(appointment, doctorResponse.data.doctor.name));
        setAppointments(prev => [appointment, ...prev.filter(item => item._id !== appointment._id)]);
      } catch { if (active) setAppointmentError(true); }
      finally { if (active) setLoadingAppointment(false); }
    };
    load();
    return () => { active = false; };
  }, [appointmentId, retryAppointment]);

  useEffect(() => {
    if (!patient) return;
    let active = true;
    setLoadingAppointments(true);
    setAppointmentListError(false);
    const load = async () => {
      try {
        const all: Appointment[] = [];
        let page = 1;
        let pages = 1;
        do {
          const response = await appointmentService.getAll({ patientId: patient._id, limit: 100, page });
          all.push(...response.data.appointments);
          const pagination = response.data.pagination;
          pages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;
          page++;
        } while (active && page <= pages);
        if (active) setAppointments(all);
      } catch { if (active) setAppointmentListError(true); }
      finally { if (active) setLoadingAppointments(false); }
    };
    load();
    return () => { active = false; };
  }, [patient, retryAppointment]);

  useEffect(() => {
    let active = true;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await patientService.getAll({ search: search.trim() || undefined, limit: 30 });
        if (active) { setPatients(response.data.patients); setPatientError(false); }
      } catch { if (active) setPatientError(true); }
      finally { if (active) setSearching(false); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);

  useEffect(() => {
    let active = true;
    doctorService.getAll({ isActive: true }).then(response => { if (active) setDoctors(response.data.doctors); }).catch(() => toast.error('Unable to load doctors. Reload to try again.'));
    settingsService.get().then(response => {
      if (!active) return;
      const settings = response.data.settings;
      setContacts({ phone: settings.phone || '', email: settings.email || '', address: settings.address ? Object.values(settings.address).filter(Boolean).join(', ') : '', website: '' });
    }).catch(() => { /* Contact fields remain available for manual entry. */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const element = body.current;
    if (!element) return;
    const measure = () => setOverflow(element.scrollHeight > element.clientHeight + 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [notes]);

  const print = async () => {
    if (!patient || !paper.current || !imageReady || overflow || !date || loadingAppointment || appointmentError || printing) return;
    setPrinting(true);
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;';
    document.body.appendChild(frame);
    try {
      const doc = frame.contentDocument;
      if (!doc) throw new Error('Print window unavailable');
      doc.open();
      doc.write('<!doctype html><html><head><title>Patient Letterhead</title></head><body></body></html>');
      doc.close();
      const style = doc.createElement('style'); style.textContent = paperStyles; doc.head.appendChild(style);
      const clone = paper.current.cloneNode(true) as HTMLElement;
      clone.querySelector('img')?.setAttribute('src', new URL('/latter%20haed.png', window.location.origin).href);
      doc.body.appendChild(clone);
      await Promise.all(Array.from(doc.images).map(image => image.decode()));
      await doc.fonts.ready;
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      setTimeout(() => frame.remove(), 60000);
    } catch { frame.remove(); toast.error('Unable to prepare the letterhead for printing. Please try again.'); }
    finally { setPrinting(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Clinical documents</p><h1 className="text-2xl font-bold tracking-tight text-secondary-900">Letterhead</h1><p className="mt-1 text-sm text-secondary-500">Prepare a professional patient document using your clinic letterhead.</p></div>
        <button onClick={print} disabled={!patient || !date || !imageReady || overflow || printing || loadingAppointment || appointmentError} className="btn-primary disabled:opacity-50">{printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}Print / Save PDF</button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-5 items-start">
        <div className="space-y-4 rounded-xl border border-secondary-200 bg-white p-5 shadow-sm">
          {loadingAppointment && <p role="status" className="text-sm text-primary-700">Loading appointment letterhead…</p>}
          {appointmentError && <p role="alert" className="text-sm text-red-600">Unable to load this appointment. <button onClick={() => setRetryAppointment(value => value + 1)} className="underline">Retry</button></p>}
          <label className="block text-sm font-medium text-gray-700">Search patient<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Name or phone" className={field} /></label>
          <label className="block text-sm font-medium text-gray-700">Patient *<select disabled={loadingAppointment} value={patient?._id || ''} onChange={event => { if (notes.trim() && !window.confirm('Switch patients and clear the current notes?')) return; setPatient(patients.find(item => item._id === event.target.value) || null); setNotes(''); setAppointmentId(''); setAppointments([]); setDoctorId(''); setLinkedDoctor(null); }} className={field}><option value="">Select patient</option>{patient && !patients.some(item => item._id === patient._id) && <option value={patient._id}>{patient.name}</option>}{patients.map(item => <option key={item._id} value={item._id}>{item.name} · {item.phone}</option>)}</select></label>
          {searching && <p className="text-sm text-gray-500">Searching patients…</p>}
          {patientError && <p role="alert" className="text-sm text-red-600">Unable to load patients. Change the search to retry.</p>}
          {!searching && !patientError && !patients.length && <p className="text-sm text-gray-500">No matching patients.</p>}
          {patient && <label className="block text-sm font-medium text-gray-700">Appointment<select disabled={loadingAppointment || loadingAppointments} value={appointmentId} onChange={event => { if (notes.trim() && !window.confirm('Replace the current notes with this appointment?')) return; setAppointmentId(event.target.value); if (!event.target.value) setNotes(''); }} className={field}><option value="">{loadingAppointments ? 'Loading appointments…' : 'Select appointment (optional)'}</option>{appointments.map(item => <option key={item._id} value={item._id}>{item.date.split('T')[0]} · Token #{item.tokenNo} · {item.doctor?.name || item.type}</option>)}</select></label>}
          {appointmentListError && <p role="alert" className="text-sm text-red-600">Unable to load appointments. <button onClick={() => setRetryAppointment(value => value + 1)} className="underline">Retry</button></p>}
          <label className="block text-sm font-medium text-gray-700">Doctor<select value={doctorId} onChange={event => { setDoctorId(event.target.value); setRegistration(''); }} className={field}><option value="">Select doctor</option>{linkedDoctor && !doctors.some(item => item._id === linkedDoctor._id) && <option value={linkedDoctor._id}>{linkedDoctor.name}</option>}{doctors.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
          <label className="block text-sm font-medium text-gray-700">Doctor registration number<input value={registration} onChange={event => setRegistration(event.target.value)} maxLength={60} className={field} placeholder="Optional" /></label>
          <label className="block text-sm font-medium text-gray-700">Date *<input type="date" value={date} onChange={event => setDate(event.target.value)} className={field} /></label>
          <label className="block text-sm font-medium text-gray-700">Notes / report content<textarea value={notes} onChange={event => setNotes(event.target.value)} rows={7} className={field} placeholder="Write the patient’s notes here…" /></label>
          <details className="border-t pt-3"><summary className="cursor-pointer text-sm font-medium text-primary-700">Clinic contact details</summary><div className="mt-3 space-y-3">{(['phone', 'email', 'address', 'website'] as const).map(key => <label key={key} className="block text-sm font-medium text-gray-700 capitalize">{key}<input value={contacts[key]} onChange={event => setContacts(prev => ({ ...prev, [key]: event.target.value }))} className={field} /></label>)}</div></details>
          <p className="text-xs text-gray-500">Switching patients clears the notes. Letterhead edits are for this print session.</p>
        </div>
        <div className="min-w-0">
          {imageError && <p role="alert" className="mb-3 text-red-600">Unable to load the letterhead image. Reload the page to retry.</p>}
          {overflow && <p role="alert" className="mb-3 rounded-xl bg-orange-50 p-3 text-orange-800">The notes exceed the writing area. Shorten them before printing so no content is cut off.</p>}
          <div className="mx-auto max-w-[794px] overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,.1)]">
            <div ref={paper} className="letterhead-paper">
              {/* The uploaded artwork is also used as an image in print, independent of background-print settings. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="letterhead-art" src="/latter%20haed.png" alt="Avia Wellness letterhead" onLoad={() => { setImageReady(true); setImageError(false); }} onError={() => { setImageReady(false); setImageError(true); }} />
              <div className="letterhead-doctor"><strong>{doctor?.name || 'Avia Wellness'}</strong><p>{[doctor?.qualification, doctor?.specialization].filter(Boolean).join(' / ')}</p>{registration && <p>Registration No.: {registration}</p>}</div>
              <div className="letterhead-patient"><p><b>Patient:</b> {patient?.name || 'Select a patient'}</p><p><b>Date:</b> {date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-IN') : '—'}</p><p><b>Age / Gender:</b> {patient ? `${patient.age} years / ${patient.gender}` : '—'}</p><p><b>Phone:</b> {patient?.phone || '—'}</p></div>
              <div ref={body} className="letterhead-body">{notes}</div>
              {(['phone', 'email', 'address', 'website'] as const).map(key => <div key={key} className={`letterhead-contact letterhead-${key}`}>{contacts[key] || '—'}</div>)}
            </div>
          </div>
        </div>
      </div>
      <style>{paperStyles}</style>
    </div>
  );
}
