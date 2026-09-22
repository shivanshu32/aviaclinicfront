import type { Appointment } from './services/appointmentService';

export function appointmentLetterheadNotes(appointment: Appointment, doctorName: string): string {
  return [
    'APPOINTMENT DETAILS',
    `Token: #${appointment.tokenNo}`,
    `Visit type: ${appointment.type === 'follow-up' ? 'Follow-up' : 'New visit'}`,
    `Status: ${appointment.status.replace(/-/g, ' ')}`,
    `Doctor: ${doctorName}`,
    ...(appointment.notes?.trim() ? ['', 'Notes', appointment.notes.trim()] : []),
  ].join('\n');
}
