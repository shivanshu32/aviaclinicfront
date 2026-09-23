'use client';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, Menu, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const names: Record<string, string> = { dashboard: 'Dashboard', patients: 'Patients', doctors: 'Doctors', appointments: 'Appointments', billing: 'Billing', inventory: 'Pharmacy', services: 'Service Charges', reports: 'Reports', letterhead: 'Letterhead', whatsapp: 'WhatsApp', users: 'Staff', settings: 'Settings', add: 'Add', edit: 'Edit', book: 'Book appointment', new: 'New' };
export default function DashboardHeader({ onToggleSidebar }: { onToggleSidebar: () => void; sidebarCollapsed: boolean }) {
  const pathname = usePathname(); const { user, tenant } = useAuth();
  const segments = pathname.split('/').filter(Boolean).slice(1); const current = segments[segments.length - 1];
  const currentName = names[current] || (segments.length > 1 ? 'Details' : 'Dashboard');
  return <header className="flex h-[68px] shrink-0 items-center gap-3 border-b border-secondary-200 bg-white px-4 lg:px-6">
    <button onClick={onToggleSidebar} className="icon-button md:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
    <div className="min-w-0 flex-1"><div className="hidden items-center gap-1 text-xs text-secondary-400 sm:flex"><span>Workspace</span><span>/</span><span className="text-secondary-600">{currentName}</span></div><p className="truncate text-sm font-semibold text-secondary-900 sm:hidden">{currentName}</p></div>
    <div className="relative hidden w-full max-w-xs lg:block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" /><input type="search" placeholder="Search this workspace" aria-label="Global search" className="h-9 w-full rounded-lg border border-secondary-200 bg-secondary-50 pl-9 pr-3 text-sm placeholder:text-secondary-400" /></div>
    <button className="icon-button relative" aria-label="Notifications" title="Notifications"><Bell className="h-[18px] w-[18px]" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary-600 ring-2 ring-white" /></button>
    <button className="hidden items-center gap-2 rounded-lg border border-secondary-200 px-2 py-1.5 text-left hover:bg-secondary-50 sm:flex" aria-label="User and clinic menu"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-50 text-xs font-semibold text-primary-800">{user?.name?.slice(0, 1).toUpperCase() || 'U'}</span><span className="max-w-[150px]"><span className="block truncate text-xs font-semibold text-secondary-900">{tenant?.name || user?.name || 'Clinic'}</span><span className="block truncate text-[10px] capitalize text-secondary-500">{user?.role || 'Staff'}</span></span><ChevronDown className="h-3.5 w-3.5 text-secondary-400" /></button>
  </header>;
}
