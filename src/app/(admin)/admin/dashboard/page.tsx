'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  totalPatients: number;
  recentTenants: Array<{
    _id: string;
    tenantId: string;
    name: string;
    email: string;
    subscription: { status: string; plan: string };
    createdAt: string;
  }>;
}

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/super-admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'trial': return 'bg-blue-100 text-blue-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Total Tenants</p>
              <p className="text-2xl font-heading font-bold text-secondary-800 mt-1">{stats?.totalTenants || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Active Tenants</p>
              <p className="text-2xl font-heading font-bold text-green-600 mt-1">{stats?.activeTenants || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-500/20">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Trial Tenants</p>
              <p className="text-2xl font-heading font-bold text-blue-600 mt-1">{stats?.trialTenants || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Suspended</p>
              <p className="text-2xl font-heading font-bold text-red-600 mt-1">{stats?.suspendedTenants || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md shadow-red-500/20">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Total Users (All Tenants)</p>
              <p className="text-2xl font-heading font-bold text-secondary-800 mt-1">{stats?.totalUsers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Total Patients (All Tenants)</p>
              <p className="text-2xl font-heading font-bold text-secondary-800 mt-1">{stats?.totalPatients || 0}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tenants */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-secondary-800">Recent Tenants</h2>
          <Link 
            href="/admin/tenants"
            className="text-sm text-primary-600 hover:text-primary-700 font-sans font-semibold flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Tenant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden sm:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTenants?.map((tenant) => (
                <tr key={tenant._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/tenants/${tenant.tenantId}`} className="hover:text-primary-600">
                      <p className="font-semibold text-secondary-800 font-sans">{tenant.name}</p>
                      <p className="text-sm text-secondary-400 font-sans">{tenant.tenantId}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-secondary-600 font-sans">{tenant.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-xl font-sans capitalize ${getStatusColor(tenant.subscription?.status)}`}>
                      {tenant.subscription?.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <p className="text-sm text-secondary-500 font-sans">{formatDate(tenant.createdAt)}</p>
                  </td>
                </tr>
              ))}
              {(!stats?.recentTenants || stats.recentTenants.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-secondary-400 font-sans">
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
