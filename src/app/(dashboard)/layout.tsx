'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
  const { isAuthenticated, loading, tenant } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    // Check if mobile on initial render
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      <ImpersonationBar />
      <div className={`flex h-screen bg-gray-50 ${isImpersonating ? 'pt-12' : ''}`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
