'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  Receipt,
  Package,
  Settings,
  Stethoscope,
  FlaskConical,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/dashboard/patients', icon: Users, label: 'Patients' },
  { path: '/dashboard/doctors', icon: UserCog, label: 'Doctors' },
  { path: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
  { path: '/dashboard/billing', icon: Receipt, label: 'Billing' },
  { path: '/dashboard/inventory', icon: Package, label: 'Pharmacy' },
  { path: '/dashboard/services', icon: FlaskConical, label: 'Service Charges' },
  { path: '/dashboard/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { path: '/dashboard/users', icon: Shield, label: 'User Management' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings', exact: true },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const { tenant } = useAuth();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <aside 
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out shadow-sm`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center justify-center border-b border-gray-100 ${collapsed ? 'px-2' : 'px-4'}`}>
        {collapsed ? (
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary-500/20">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary-500/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-heading font-bold text-secondary-800 text-sm leading-tight truncate">
                {tenant?.name || 'Avia Wellness'}
              </h1>
              <p className="text-xs text-secondary-400 font-sans">Management System</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'p-2' : 'p-4'} space-y-1`}>
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all font-sans ${
                active 
                  ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm' 
                  : 'text-secondary-500 hover:bg-gray-50 hover:text-secondary-700'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-600' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
