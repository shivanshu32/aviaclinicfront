'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar,
  IndianRupee,
  Users,
  FileText,
  Download,
  Loader2,
  TrendingUp,
  Receipt,
  Stethoscope,
} from 'lucide-react';
import { billingService, appointmentService, patientService } from '@/lib/services';

import PatientReportWorkspace from '@/components/reports/PatientReportWorkspace';

type ReportType = 'collection' | 'appointments' | 'patients';

interface CollectionData {
  opd: number;
  misc: number;
  medicine: number;
  total: number;
}

interface AppointmentStats {
  total: number;
  completed: number;
  cancelled: number;
  pending: number;
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('collection');
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  const [collectionData, setCollectionData] = useState<CollectionData>({ opd: 0, misc: 0, medicine: 0, total: 0 });
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({ total: 0, completed: 0, cancelled: 0, pending: 0 });
  const [patientCount, setPatientCount] = useState(0);

  const reports = [
    { id: 'collection' as ReportType, label: 'Collection Report', icon: IndianRupee, color: 'from-green-500 to-green-600' },
    { id: 'appointments' as ReportType, label: 'Appointments Report', icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { id: 'patients' as ReportType, label: 'Patient Report', icon: Users, color: 'from-primary-500 to-primary-600' },
  ];

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeReport === 'collection') {
        const [opdRes, miscRes, medRes] = await Promise.all([
          billingService.opd.getAll({ dateFrom, dateTo }),
          billingService.misc.getAll({ dateFrom, dateTo }),
          billingService.medicine.getAll({ dateFrom, dateTo }),
        ]);
        
        const opdTotal = (opdRes.data?.bills || []).reduce((sum: number, b: { total: number }) => sum + (b.total || 0), 0);
        const miscTotal = (miscRes.data?.bills || []).reduce((sum: number, b: { total: number }) => sum + (b.total || 0), 0);
        const medTotal = (medRes.data?.bills || []).reduce((sum: number, b: { total: number }) => sum + (b.total || 0), 0);
        
        setCollectionData({
          opd: opdTotal,
          misc: miscTotal,
          medicine: medTotal,
          total: opdTotal + miscTotal + medTotal,
        });
      } else if (activeReport === 'appointments') {
        const response = await appointmentService.getAll({ limit: 1000 });
        const appointments = response.data.appointments || [];
        
        const filtered = appointments.filter((a: { date: string }) => {
          const date = a.date.split('T')[0];
          return date >= dateFrom && date <= dateTo;
        });
        
        setAppointmentStats({
          total: filtered.length,
          completed: filtered.filter((a: { status: string }) => a.status === 'completed').length,
          cancelled: filtered.filter((a: { status: string }) => a.status === 'cancelled').length,
          pending: filtered.filter((a: { status: string }) => ['scheduled', 'checked-in', 'in-progress'].includes(a.status)).length,
        });
      } else if (activeReport === 'patients') {
        const response = await patientService.getAll({ limit: 1 });
        setPatientCount(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeReport, dateFrom, dateTo]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExport = () => {
    let csvContent = '';
    const filename = `${activeReport}-report-${dateFrom}-to-${dateTo}.csv`;
    
    if (activeReport === 'collection') {
      csvContent = `Report Type,Amount\nOPD Bills,${collectionData.opd}\nLab/Misc Bills,${collectionData.misc}\nMedicine Bills,${collectionData.medicine}\nTotal,${collectionData.total}`;
    } else if (activeReport === 'appointments') {
      csvContent = `Status,Count\nTotal,${appointmentStats.total}\nCompleted,${appointmentStats.completed}\nCancelled,${appointmentStats.cancelled}\nPending,${appointmentStats.pending}`;
    } else {
      csvContent = `Metric,Value\nTotal Patients,${patientCount}`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Analytics workspace</p>
          <h1 className="text-2xl font-bold tracking-tight text-secondary-900">Reports</h1>
          <p className="mt-1 text-sm text-secondary-500">Review collections, appointments and patient documentation.</p>
        </div>
        {activeReport !== 'patients' && <button
          onClick={handleExport}
          className="btn-primary"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>}
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`billing-type-card ${report.id === 'collection' ? 'billing-type-green' : report.id === 'appointments' ? 'billing-type-blue' : 'billing-type-violet'} ${
              activeReport === report.id
                ? 'is-active' : ''
            }`}
          >
            <div className="billing-type-icon"><report.icon className="w-5 h-5" /></div>
            <p className="font-heading font-semibold text-secondary-800">
              {report.label}
            </p>
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      <div hidden={activeReport === 'patients'} className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-secondary-700 mb-1.5">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={fetchReportData}
            className="px-6 py-2.5 bg-gray-100 text-secondary-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
          >
            Apply
          </button>
        </div>
      </div>

      <div hidden={activeReport !== 'patients'} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <PatientReportWorkspace />
      </div>
      {/* Report Content */}
      <div hidden={activeReport === 'patients'} className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <>
            {/* Collection Report */}
            {activeReport === 'collection' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-800">Collection Summary</h2>
                  <span className="text-sm text-secondary-400">{dateFrom} to {dateTo}</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">OPD Bills</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-800 flex items-center gap-1">
                      <IndianRupee className="w-5 h-5" />
                      {collectionData.opd.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt className="w-5 h-5 text-primary-600" />
                      <span className="text-sm text-primary-600 font-medium">Lab/Misc</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-800 flex items-center gap-1">
                      <IndianRupee className="w-5 h-5" />
                      {collectionData.misc.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Medicine</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-800 flex items-center gap-1">
                      <IndianRupee className="w-5 h-5" />
                      {collectionData.medicine.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-sm font-medium">Total</span>
                    </div>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      <IndianRupee className="w-5 h-5" />
                      {collectionData.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Report */}
            {activeReport === 'appointments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-800">Appointments Summary</h2>
                  <span className="text-sm text-secondary-400">{dateFrom} to {dateTo}</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-600 font-medium mb-2">Total</p>
                    <p className="text-3xl font-bold text-secondary-800">{appointmentStats.total}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-600 font-medium mb-2">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{appointmentStats.completed}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <p className="text-sm text-orange-600 font-medium mb-2">Pending</p>
                    <p className="text-3xl font-bold text-orange-600">{appointmentStats.pending}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-600 font-medium mb-2">Cancelled</p>
                    <p className="text-3xl font-bold text-red-600">{appointmentStats.cancelled}</p>
                  </div>
                </div>

                {appointmentStats.total > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-secondary-700 mb-3">Completion Rate</h3>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                        style={{ width: `${(appointmentStats.completed / appointmentStats.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-secondary-500 mt-2">
                      {((appointmentStats.completed / appointmentStats.total) * 100).toFixed(1)}% completion rate
                    </p>
                  </div>
                )}
              </div>
            )}


          </>
        )}
      </div>
    </div>
  );
}
