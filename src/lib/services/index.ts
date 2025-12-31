/**
 * Services Index
 * Export all services from a single entry point
 */

export { authService } from './authService';
export type { User, Tenant, LoginResponse, SignupResponse } from './authService';

export { patientService } from './patientService';
export type { Patient, PatientsResponse } from './patientService';

export { appointmentService } from './appointmentService';
export type { Appointment, AppointmentsResponse } from './appointmentService';

export { doctorService } from './doctorService';
export type { Doctor, DoctorsResponse } from './doctorService';

export { dashboardService } from './dashboardService';
export type { DashboardStats, DashboardStatsResponse } from './dashboardService';

export { settingsService } from './settingsService';
export type { ClinicSettings, SettingsResponse } from './settingsService';

export { medicineService } from './medicineService';
export type { Medicine, StockBatch } from './medicineService';

export { serviceItemService } from './serviceItemService';
export type { ServiceItem } from './serviceItemService';

export { billingService } from './billingService';
export type { Bill, BillItem } from './billingService';

export { whatsappService } from './whatsappService';
export type { WhatsAppSession, WhatsAppLoginResponse, WhatsAppQRResponse, CreateSessionResponse, SendMessageResponse, BackendWhatsAppIntegration } from './whatsappService';

export { onboardingService } from './onboardingService';
export type { OnboardingStatus, OnboardingSteps, TenantBranding, TenantAddress, OnboardingStatusResponse, ClinicDetailsData, BrandingData, DoctorData } from './onboardingService';
