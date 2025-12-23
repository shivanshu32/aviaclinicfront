'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Building2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImpersonationData {
  active: boolean;
  superAdminToken: string;
  tenantId: string;
  tenantName: string;
  superAdminName: string;
}

export default function ImpersonationBar() {
  const router = useRouter();
  const [impersonation, setImpersonation] = useState<ImpersonationData | null>(null);

  useEffect(() => {
    const checkImpersonation = () => {
      const data = localStorage.getItem('impersonation');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.active) {
            setImpersonation(parsed);
          }
        } catch {
          setImpersonation(null);
        }
      } else {
        setImpersonation(null);
      }
    };

    checkImpersonation();
    
    // Listen for storage changes
    window.addEventListener('storage', checkImpersonation);
    return () => window.removeEventListener('storage', checkImpersonation);
  }, []);

  const handleExitImpersonation = () => {
    if (!impersonation) return;

    // Clear tenant auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('impersonation');

    // Restore super admin token if available
    if (impersonation.superAdminToken) {
      localStorage.setItem('superAdminToken', impersonation.superAdminToken);
    }

    toast.success('Exited tenant view');
    router.push('/admin/dashboard');
  };

  if (!impersonation) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-semibold">Super Admin Mode</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Building2 className="w-4 h-4 opacity-80" />
              <span className="text-sm">
                Viewing: <strong>{impersonation.tenantName}</strong>
              </span>
              <span className="text-xs opacity-70">({impersonation.tenantId})</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-sm opacity-80">
              Logged in as: {impersonation.superAdminName}
            </span>
            <button
              onClick={handleExitImpersonation}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Tenant View</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
