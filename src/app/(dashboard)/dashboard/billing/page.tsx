'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  FileText, 
  FlaskConical, 
  Pill,
  Plus,
  Search,
  Calendar,
  Loader2,
  Eye,
  Printer,
  IndianRupee,
} from 'lucide-react';
import { billingService, Bill } from '@/lib/services';

const billTypes = [
  { id: 'opd', label: 'OPD Bills', icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { id: 'misc', label: 'Lab/Misc Bills', icon: FlaskConical, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  { id: 'medicine', label: 'Medicine Bills', icon: Pill, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-600' },
];

export default function BillingPage() {
  const [activeType, setActiveType] = useState('opd');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const params: { page?: number; limit?: number; dateFrom?: string; dateTo?: string } = {
          page: 1,
          limit: 20,
        };
        if (dateFilter) {
          params.dateFrom = dateFilter;
          params.dateTo = dateFilter;
        }

        let response;
        switch (activeType) {
          case 'opd':
            response = await billingService.opd.getAll(params);
            break;
          case 'misc':
            response = await billingService.misc.getAll(params);
            break;
          case 'medicine':
            response = await billingService.medicine.getAll(params);
            break;
          default:
            response = { data: { bills: [], pagination: { total: 0, totalPages: 1 } } };
        }

        setBills(response.data?.bills || []);
        if (response.data?.pagination) {
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch bills:', error);
        setBills([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [activeType, dateFilter]);

  const filteredBills = bills.filter(bill => 
    bill.billNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-primary-600" />
            Billing
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Manage invoices and billing</p>
        </div>
        <button
          onClick={() => alert('New Bill feature coming soon!')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold"
        >
          <Plus className="w-5 h-5" />
          New Bill
        </button>
      </div>

      {/* Bill Type Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {billTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              activeType === type.id
                ? `border-primary-500 ${type.bgColor} shadow-md`
                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
              <type.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`font-heading font-semibold ${activeType === type.id ? type.textColor : 'text-secondary-800'}`}>
              {type.label}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bills..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700 placeholder:text-secondary-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
            />
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-secondary-400 font-sans">No bills found</p>
            <button
              onClick={() => alert('New Bill feature coming soon!')}
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-sans font-semibold"
            >
              <Plus className="w-4 h-4" />
              Create your first bill
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Bill No</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Patient</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Amount</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-secondary-800 font-sans">{bill.billNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-secondary-800 font-sans">{bill.patientName}</p>
                      <p className="text-sm text-secondary-400 font-sans">{bill.patientPhone}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-secondary-600 font-sans">{formatDate(bill.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-secondary-800 font-sans flex items-center justify-end gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {bill.total}
                      </span>
                      <span className={`text-xs font-semibold ${bill.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                        {bill.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => alert('View Bill feature coming soon!')}
                          className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-secondary-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination info */}
        {!loading && filteredBills.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-secondary-400 font-sans">
              Showing {filteredBills.length} of {pagination.total} bills
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
