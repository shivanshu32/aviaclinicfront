'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/Header';
import ImpersonationBar from '@/components/dashboard/ImpersonationBar';
import { onboardingService } from '@/lib/services';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, tenant, access, can } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    const checkImpersonation = () => {
      const data = localStorage.getItem('impersonation');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setIsImpersonating(parsed.active === true);
        } catch {
          setIsImpersonating(false);
        }
      } else {
        setIsImpersonating(false);
      }
    };
    checkImpersonation();
    window.addEventListener('storage', checkImpersonation);
    return () => window.removeEventListener('storage', checkImpersonation);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      // First check from tenant data in context
      if (tenant?.onboarding?.completed) {
        setCheckingOnboarding(false);
        return;
      }

      // If not in context, fetch from API
      const response = await onboardingService.getStatus();
      if (!response.data.onboarding.completed) {
        router.push('/onboarding');
        return;
      }
      setCheckingOnboarding(false);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // On error, allow access but log the issue
      setCheckingOnboarding(false);
    }
  }, [tenant, router]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check onboarding status when authenticated
    if (!loading && isAuthenticated) {
      checkOnboardingStatus();
    }
  }, [loading, isAuthenticated, router, checkOnboardingStatus]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const routeModules: [string, string][] = [['/dashboard/patients', 'patients'], ['/dashboard/appointments', 'appointments'], ['/dashboard/doctors', 'doctors'], ['/dashboard/billing', 'billing'], ['/dashboard/inventory', 'inventory'], ['/dashboard/services', 'services'], ['/dashboard/reports', 'reports'], ['/dashboard/letterhead', 'reports'], ['/dashboard/users', 'users'], ['/dashboard/whatsapp', 'whatsapp'], ['/dashboard/settings', 'settings']];
  const requiredModule = routeModules.find(([path]) => pathname.startsWith(path))?.[1] || 'dashboard';
  const unauthorized = access && !can(requiredModule);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) setMobileSidebarOpen(value => !value);
    else setSidebarCollapsed(value => !value);
  };

  return (
    <>
      <ImpersonationBar />
      <div className={`flex h-screen bg-[#f7faf8] ${isImpersonating ? 'pt-12' : ''}`}>
        <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebarOpen} onToggle={toggleSidebar} onCloseMobile={() => setMobileSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
          <main className="dashboard-main flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{unauthorized ? <div className="flex min-h-[65vh] items-center justify-center"><div className="max-w-md text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600"><LockKeyhole className="h-6 w-6" /></span><h1 className="mt-5 text-2xl font-bold text-secondary-900">Access denied</h1><p className="mt-2 text-sm leading-6 text-secondary-500">You don&apos;t have permission to access this section. Please contact your administrator if you believe you should have access.</p></div></div> : children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
