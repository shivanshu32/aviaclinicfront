'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Plus,
  Search,
  AlertTriangle,
  Clock,
  Loader2,
  Pill,
} from 'lucide-react';
import { medicineService, Medicine } from '@/lib/services';

const tabs = [
  { id: 'medicines', label: 'All Medicines', icon: Pill },
  { id: 'low-stock', label: 'Low Stock', icon: AlertTriangle },
  { id: 'expiring', label: 'Expiring Soon', icon: Clock },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('medicines');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Medicine[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, lowStock: 0, expiring: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'medicines') {
      fetchMedicines();
    }
  }, [activeTab, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medicinesRes, lowStockRes, expiringRes] = await Promise.all([
        medicineService.getAll({ includeStock: true, limit: 100 }),
        medicineService.getLowStock(),
        medicineService.getExpiring(90),
      ]);

      setMedicines(medicinesRes.data?.medicines || []);
      setLowStockItems(lowStockRes.data?.medicines || []);
      setExpiringItems(expiringRes.data?.medicines || []);
      setStats({
        total: medicinesRes.data?.pagination?.total || medicinesRes.data?.medicines?.length || 0,
        lowStock: lowStockRes.data?.medicines?.length || 0,
        expiring: expiringRes.data?.medicines?.length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await medicineService.getAll({ 
        includeStock: true, 
        limit: 100,
        search: searchQuery || undefined 
      });
      setMedicines(response.data?.medicines || []);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'low-stock': return lowStockItems;
      case 'expiring': return expiringItems;
      default: return medicines;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <Package className="w-7 h-7 text-primary-600" />
            Pharmacy & Inventory
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Manage medicines and stock</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/inventory/medicines/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-secondary-700 rounded-xl hover:bg-gray-50 transition-all font-sans font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Medicine
          </Link>
          <Link
            href="/dashboard/inventory/stock"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold"
          >
            <Package className="w-5 h-5" />
            Add Stock
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Total Medicines</p>
              <p className="text-2xl font-heading font-bold text-secondary-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Pill className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Low Stock Items</p>
              <p className="text-2xl font-heading font-bold text-orange-600 mt-1">{stats.lowStock}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-400 font-sans">Expiring Soon</p>
              <p className="text-2xl font-heading font-bold text-red-600 mt-1">{stats.expiring}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md shadow-red-500/20">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap font-sans flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20'
                      : 'text-secondary-500 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700 placeholder:text-secondary-300"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : getCurrentData().length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-secondary-400 font-sans">No medicines found</p>
              <Link
                href="/dashboard/inventory/medicines/add"
                className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-sans font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add your first medicine
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Medicine</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentData().map((item: any) => (
                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-secondary-800 font-sans">{item.name}</p>
                        <p className="text-sm text-secondary-400 font-sans">{item.genericName || item.medicineId}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-xl font-sans bg-gray-100 text-secondary-600 capitalize">
                          {item.category || 'general'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold font-sans ${
                          (item.currentStock || 0) <= (item.reorderLevel || 10) ? 'text-red-600' : 'text-secondary-800'
                        }`}>
                          {item.currentStock || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
