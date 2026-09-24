'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserCog, Calendar, Receipt, Package, Settings, Stethoscope, FlaskConical, Shield, MessageSquare, BarChart3, FileText, LogOut, PanelLeftClose, PanelLeftOpen, X, ClipboardPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const groups = [
  { label: 'Workspace', items: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', module: 'dashboard', exact: true }, { path: '/dashboard/patients', icon: Users, label: 'Patients', module: 'patients' },
    { path: '/dashboard/appointments', icon: Calendar, label: 'Appointments', module: 'appointments' }, { path: '/dashboard/doctors', icon: UserCog, label: 'Doctors', module: 'doctors' },
    { path: '/dashboard/prescriptions', icon: ClipboardPlus, label: 'Prescriptions', module: 'prescriptions' },
  ]},
  { label: 'Operations', items: [
    { path: '/dashboard/billing', icon: Receipt, label: 'Billing', module: 'billing' }, { path: '/dashboard/inventory', icon: Package, label: 'Pharmacy', module: 'inventory' },
    { path: '/dashboard/services', icon: FlaskConical, label: 'Service Charges', module: 'services' }, { path: '/dashboard/reports', icon: BarChart3, label: 'Reports', module: 'reports' },
  ]},
  { label: 'Administration', items: [
    { path: '/dashboard/users', icon: Shield, label: 'Staff', module: 'users' }, { path: '/dashboard/whatsapp', icon: MessageSquare, label: 'WhatsApp', module: 'whatsapp' },
    { path: '/dashboard/letterhead', icon: FileText, label: 'Letterhead', module: 'reports' }, { path: '/dashboard/settings', icon: Settings, label: 'Settings', module: 'settings', exact: true },
    { path: '/dashboard/settings/medicine-suggestions', icon: Stethoscope, label: 'Medicine Suggestions', module: 'settings', action: 'manage' },
  ]},
];

interface SidebarProps { collapsed: boolean; mobileOpen: boolean; onToggle: () => void; onCloseMobile: () => void; }
export default function Sidebar({ collapsed, mobileOpen, onToggle, onCloseMobile }: SidebarProps) {
  const pathname = usePathname(); const router = useRouter(); const { tenant, user, logout, can } = useAuth();
  const isActive = (path: string, exact?: boolean) => exact ? pathname === path : pathname.startsWith(path);
  const signOut = () => { logout(); router.push('/login'); };
  return <>
    {mobileOpen && <button className="fixed inset-0 z-40 bg-secondary-900/35 backdrop-blur-[1px] md:hidden" onClick={onCloseMobile} aria-label="Close navigation" />}
    <aside className={`${collapsed ? 'md:w-[76px]' : 'md:w-[252px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} dashboard-sidebar fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col transition-[width,transform] duration-200 md:static md:translate-x-0`}>
      <div className={`flex h-[68px] items-center border-b border-white/10 ${collapsed ? 'md:justify-center md:px-2' : 'px-4'}`}>
        <div className="flex min-w-0 flex-1 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20"><Stethoscope className="h-5 w-5 text-white" /></span><div className={`${collapsed ? 'md:hidden' : ''} min-w-0`}><p className="truncate font-heading text-sm font-semibold text-white">{tenant?.name || 'Avia Wellness'}</p><p className="text-xs text-emerald-100/80">Clinical workspace</p></div></div>
        <button className="icon-button md:hidden" onClick={onCloseMobile} aria-label="Close menu"><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary navigation">{groups.map(group => <div key={group.label} className="mb-5"><p className={`${collapsed ? 'md:sr-only' : ''} mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/60`}>{group.label}</p><div className="space-y-1">{group.items.filter(item => can(item.module, 'action' in item ? item.action : undefined)).map(item => { const active = isActive(item.path, item.exact); return <Link key={item.path} href={item.path} onClick={onCloseMobile} aria-current={active ? 'page' : undefined} title={collapsed ? item.label : undefined} className={`group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${active ? 'bg-white text-emerald-900 shadow-md' : 'text-emerald-50/85 hover:bg-white/10 hover:text-white'} ${collapsed ? 'md:justify-center md:px-0' : ''}`}><item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-emerald-700' : 'text-emerald-200 group-hover:text-white'}`} /><span className={collapsed ? 'md:hidden' : ''}>{item.label}</span></Link>})}</div></div>)}</nav>
      <div className="border-t border-white/10 p-3"><div className={`flex items-center gap-3 rounded-lg bg-white/10 p-2 ${collapsed ? 'md:justify-center' : ''}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-emerald-800">{user?.name?.slice(0, 1).toUpperCase() || 'U'}</span><div className={`${collapsed ? 'md:hidden' : ''} min-w-0 flex-1`}><p className="truncate text-sm font-semibold text-white">{user?.name || 'User'}</p><p className="truncate text-xs capitalize text-emerald-100/70">{user?.role || 'Staff'}</p></div><button onClick={signOut} className={`${collapsed ? 'md:hidden' : ''} flex h-8 w-8 items-center justify-center rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white`} aria-label="Sign out" title="Sign out"><LogOut className="h-4 w-4" /></button></div><button onClick={onToggle} className="mt-1 hidden h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-medium text-emerald-100/70 hover:bg-white/10 hover:text-white md:flex" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span>Collapse sidebar</span></>}</button></div>
    </aside>
  </>;
}
