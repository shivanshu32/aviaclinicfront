'use client';

import { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Plus,
  Search,
  Scan,
  Stethoscope,
  MoreHorizontal,
  Loader2,
  Edit2,
  Trash2,
  X,
  IndianRupee,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceItemService, ServiceItem } from '@/lib/services';
import Select from '@/components/ui/Select';

const CATEGORY_OPTIONS = [
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'other', label: 'Other' },
];

const categories = [
  { id: '', label: 'All Services', icon: FlaskConical, color: 'gray' },
  { id: 'laboratory', label: 'Laboratory', icon: FlaskConical, color: 'blue' },
  { id: 'radiology', label: 'Radiology', icon: Scan, color: 'purple' },
  { id: 'procedure', label: 'Procedure', icon: Stethoscope, color: 'green' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'gray' },
];

const CATEGORY_COLORS: Record<string, string> = {
  laboratory: 'bg-blue-100 text-blue-700',
  radiology: 'bg-purple-100 text-purple-700',
  procedure: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function ServiceChargesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'laboratory',
    rate: '',
    description: '',
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params: { category?: string } = {};
      if (selectedCategory) params.category = selectedCategory;
      const response = await serviceItemService.getAll(params);
      setServices(response.data?.services || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (service: ServiceItem | null = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        category: service.category,
        rate: service.rate.toString(),
        description: service.description || '',
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        category: selectedCategory || 'laboratory',
        rate: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', category: 'laboratory', rate: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }
    if (!formData.rate || Number(formData.rate) <= 0) {
      toast.error('Valid rate is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category as ServiceItem['category'],
        rate: Number(formData.rate),
        description: formData.description.trim(),
      };

      if (editingService) {
        await serviceItemService.update(editingService._id, payload);
        toast.success('Service updated successfully');
      } else {
        await serviceItemService.create(payload);
        toast.success('Service added successfully');
      }
      handleCloseModal();
      fetchServices();
    } catch {
      toast.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await serviceItemService.delete(id);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <FlaskConical className="w-7 h-7 text-primary-600" />
            Service Charges
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Manage lab tests and service rates</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all font-sans flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20'
                : 'bg-white border border-gray-200 text-secondary-600 hover:bg-gray-50'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700 placeholder:text-secondary-300"
          />
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-secondary-400 font-sans">No services found</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-sans font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add your first service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Service</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Rate</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-secondary-800 font-sans">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-secondary-400 font-sans">{service.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-xl font-sans capitalize ${CATEGORY_COLORS[service.category] || 'bg-gray-100 text-gray-700'}`}>
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-secondary-800 font-sans flex items-center justify-end gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {service.rate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(service)}
                          className="p-2 text-secondary-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Service Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="e.g., Blood Test - CBC" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <Select value={formData.category} onChange={(v) => setFormData({ ...formData, category: v })} options={CATEGORY_OPTIONS} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rate (₹)</label>
                  <input type="number" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Rate" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Brief description (optional)" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={handleCloseModal} className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingService ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
