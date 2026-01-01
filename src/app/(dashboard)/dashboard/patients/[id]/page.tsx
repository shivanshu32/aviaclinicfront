'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  AlertTriangle,
  FileText,
  UserCheck,
  ArrowLeft,
  Edit,
  Loader2,
  Activity,
  Receipt,
  Plus,
  Clock,
  IndianRupee,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { patientService, Patient, appointmentService, Appointment, billingService, Bill, doctorService, Doctor, serviceItemService, ServiceItem } from '@/lib/services';

type TabType = 'info' | 'appointments' | 'billing';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  
  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  
  // Billing state
  const [bills, setBills] = useState<Bill[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  
  // Bill creation modal state
  const [showBillModal, setShowBillModal] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [billFormLoading, setBillFormLoading] = useState(false);
  const [billForm, setBillForm] = useState({
    doctorId: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
    discountType: 'fixed' as 'percentage' | 'fixed',
    discountValue: 0,
    paymentMode: 'cash' as 'cash' | 'card' | 'upi',
    remarks: '',
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const response = await patientService.getById(patientId);
        setPatient(response.data.patient);
      } catch (err) {
        console.error('Failed to fetch patient:', err);
        setError('Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);
  
  useEffect(() => {
    if (activeTab === 'appointments' && patient) {
      fetchAppointments();
    } else if (activeTab === 'billing' && patient) {
      fetchBills();
    }
  }, [activeTab, patient]);
  
  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const response = await appointmentService.getAll({ patientId });
      setAppointments(response.data.appointments);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };
  
  const fetchBills = async () => {
    try {
      setBillsLoading(true);
      const response = await billingService.opd.getAll({ patientId });
      setBills(response.data?.bills || []);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setBillsLoading(false);
    }
  };
  
  const openBillModal = async () => {
    setShowBillModal(true);
    try {
      const [doctorsRes, servicesRes] = await Promise.all([
        doctorService.getAll({ isActive: true }),
        serviceItemService.getAll(),
      ]);
      setDoctors(doctorsRes.data.doctors);
      setServices(servicesRes.data?.services || []);
      if (doctorsRes.data.doctors.length > 0) {
        setBillForm(prev => ({ ...prev, doctorId: doctorsRes.data.doctors[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load bill form data:', err);
    }
  };
  
  const addBillItem = () => {
    setBillForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0 }],
    }));
  };
  
  const removeBillItem = (index: number) => {
    setBillForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };
  
  const updateBillItem = (index: number, field: string, value: string | number) => {
    setBillForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };
  
  const selectService = (index: number, serviceId: string) => {
    const service = services.find(s => s._id === serviceId);
    if (service) {
      updateBillItem(index, 'description', service.name);
      updateBillItem(index, 'rate', service.rate);
    }
  };
  
  const calculateSubtotal = () => {
    return billForm.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };
  
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (billForm.discountType === 'percentage') {
      return (subtotal * billForm.discountValue) / 100;
    }
    return billForm.discountValue;
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };
  
  const handleCreateBill = async () => {
    if (!billForm.doctorId) {
      toast.error('Please select a doctor');
      return;
    }
    if (billForm.items.length === 0 || !billForm.items[0].description) {
      toast.error('Please add at least one item');
      return;
    }
    
    setBillFormLoading(true);
    try {
      await billingService.opd.create({
        patientId,
        doctorId: billForm.doctorId,
        items: billForm.items.filter(item => item.description),
        discountType: billForm.discountType,
        discountValue: billForm.discountValue,
        paymentMode: billForm.paymentMode,
        remarks: billForm.remarks,
      });
      toast.success('Bill created successfully');
      setShowBillModal(false);
      setBillForm({
        doctorId: doctors[0]?._id || '',
        items: [{ description: '', quantity: 1, rate: 0 }],
        discountType: 'fixed',
        discountValue: 0,
        paymentMode: 'cash',
        remarks: '',
      });
      fetchBills();
    } catch (err: unknown) {
      const error = err as { error?: string };
      toast.error(error.error || 'Failed to create bill');
    } finally {
      setBillFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Patient not found'}</p>
        <button
          onClick={() => router.back()}
          className="text-primary-600 hover:text-primary-700"
        >
          Go back
        </button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const tabs = [
    { id: 'info' as TabType, label: 'Patient Info', icon: User },
    { id: 'appointments' as TabType, label: 'Appointments', icon: Calendar },
    { id: 'billing' as TabType, label: 'Billing', icon: Receipt },
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'checked-in': return 'bg-yellow-100 text-yellow-700';
      case 'in-progress': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Patient Summary */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary-600 font-sans">
                {getInitials(patient.name)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-secondary-800">{patient.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm text-secondary-500 font-sans">ID: {patient.patientId}</span>
                <span className="text-secondary-300">•</span>
                <span className="text-sm text-secondary-500 font-sans">{patient.age}y, {patient.gender}</span>
                {patient.bloodGroup && (
                  <>
                    <span className="text-secondary-300">•</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg font-sans">
                      <Droplets className="w-3 h-3" />
                      {patient.bloodGroup}
                    </span>
                  </>
                )}
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  patient.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {patient.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/appointments/book?patient=${patient._id}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-secondary-700 rounded-xl hover:bg-gray-50 transition-all font-sans font-medium"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </Link>
            <Link
              href={`/dashboard/patients/${patient._id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-secondary-500 hover:bg-gray-50 hover:text-secondary-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary-500" />
                    Contact Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-secondary-400" />
                      <div>
                        <p className="text-xs text-secondary-400 font-sans">Phone</p>
                        <p className="text-secondary-700 font-sans font-medium">{patient.phone}</p>
                      </div>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Mail className="w-5 h-5 text-secondary-400" />
                        <div>
                          <p className="text-xs text-secondary-400 font-sans">Email</p>
                          <p className="text-secondary-700 font-sans font-medium">{patient.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {patient.address && (patient.address.line1 || patient.address.city) && (
                    <div className="mt-4 flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-secondary-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-secondary-400 font-sans">Address</p>
                        <p className="text-secondary-700 font-sans">
                          {[patient.address.line1, patient.address.line2, patient.address.city, patient.address.state, patient.address.pincode].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical Information */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-500" />
                    Medical Information
                  </h3>
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-secondary-400 font-sans mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Allergies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, index) => (
                          <span key={index} className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg font-sans">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.medicalHistory && (
                    <div>
                      <p className="text-sm text-secondary-400 font-sans mb-2 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Medical History
                      </p>
                      <p className="text-secondary-700 font-sans bg-gray-50 p-3 rounded-xl whitespace-pre-wrap">
                        {patient.medicalHistory}
                      </p>
                    </div>
                  )}
                  {(!patient.allergies || patient.allergies.length === 0) && !patient.medicalHistory && (
                    <p className="text-secondary-400 font-sans text-sm">No medical information recorded</p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {patient.emergencyContact && (patient.emergencyContact.name || patient.emergencyContact.phone) && (
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-primary-500" />
                      Emergency Contact
                    </h3>
                    <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                      {patient.emergencyContact.name && (
                        <div>
                          <p className="text-xs text-secondary-400 font-sans">Name</p>
                          <p className="text-secondary-700 font-sans font-medium">{patient.emergencyContact.name}</p>
                        </div>
                      )}
                      {patient.emergencyContact.relation && (
                        <div>
                          <p className="text-xs text-secondary-400 font-sans">Relation</p>
                          <p className="text-secondary-700 font-sans">{patient.emergencyContact.relation}</p>
                        </div>
                      )}
                      {patient.emergencyContact.phone && (
                        <div>
                          <p className="text-xs text-secondary-400 font-sans">Phone</p>
                          <p className="text-secondary-700 font-sans font-medium">{patient.emergencyContact.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" />
                    Record Info
                  </h3>
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-secondary-400 font-sans">Created</p>
                      <p className="text-secondary-700 font-sans">
                        {new Date(patient.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-400 font-sans">Last Updated</p>
                      <p className="text-secondary-700 font-sans">
                        {new Date(patient.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-800">Appointment History</h3>
                <Link
                  href={`/dashboard/appointments/book?patient=${patient._id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-sans font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Book New
                </Link>
              </div>
              {appointmentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-secondary-400 font-sans">No appointments found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center border border-gray-200">
                          <span className="text-xs text-secondary-400 font-sans">
                            {new Date(apt.date).toLocaleDateString('en-IN', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold text-secondary-800">
                            {new Date(apt.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-secondary-800 font-sans">
                            {apt.doctor?.name || 'Doctor'}
                          </p>
                          <p className="text-sm text-secondary-400 font-sans">
                            Token #{apt.tokenNo} • {apt.type === 'new' ? 'New Visit' : 'Follow-up'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-800">Billing History</h3>
                <button
                  onClick={openBillModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-sans font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Bill
                </button>
              </div>
              {billsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-secondary-400 font-sans">No bills found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bills.map((bill) => (
                    <div key={bill._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                          <Receipt className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-800 font-sans">{bill.billNo}</p>
                          <p className="text-sm text-secondary-400 font-sans">
                            {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary-800 font-sans flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {bill.total}
                        </p>
                        <span className={`text-xs font-semibold ${bill.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                          {bill.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bill Creation Modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-secondary-800">Create OPD Bill</h2>
              <button onClick={() => setShowBillModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-primary-600 font-sans">Patient</p>
                <p className="font-semibold text-secondary-800">{patient.name}</p>
                <p className="text-sm text-secondary-500">{patient.phone}</p>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select
                  value={billForm.doctorId}
                  onChange={(e) => setBillForm(prev => ({ ...prev, doctorId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>{doc.name}</option>
                  ))}
                </select>
              </div>

              {/* Bill Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Items</label>
                  <button onClick={addBillItem} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    + Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {billForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <select
                          value=""
                          onChange={(e) => selectService(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-1"
                        >
                          <option value="">Select service or type custom</option>
                          {services.map((svc) => (
                            <option key={svc._id} value={svc._id}>{svc.name} - ₹{svc.rate}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateBillItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateBillItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateBillItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Rate"
                      />
                      {billForm.items.length > 1 && (
                        <button onClick={() => removeBillItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={billForm.discountType}
                    onChange={(e) => setBillForm(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={billForm.discountValue}
                    onChange={(e) => setBillForm(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={billForm.paymentMode}
                  onChange={(e) => setBillForm(prev => ({ ...prev, paymentMode: e.target.value as 'cash' | 'card' | 'upi' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={billForm.remarks}
                  onChange={(e) => setBillForm(prev => ({ ...prev, remarks: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Optional remarks"
                />
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-500">Subtotal</span>
                  <span className="font-medium">₹{calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-500">Discount</span>
                  <span className="font-medium text-red-600">-₹{calculateDiscount()}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span className="text-primary-600">₹{calculateTotal()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowBillModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBill}
                disabled={billFormLoading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {billFormLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Receipt className="w-5 h-5" />}
                Create Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
