'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Save, User, MapPin, Heart, Phone, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientService } from '@/lib/services';
import Select from '@/components/ui/Select';

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const BLOOD_GROUP_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Address', icon: MapPin },
  { id: 3, title: 'Medical', icon: Heart },
  { id: 4, title: 'Emergency', icon: Phone },
];

export default function AddPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    bloodGroup: '',
    address: { line1: '', line2: '', city: '', state: '', pincode: '' },
    allergies: '',
    medicalHistory: '',
    emergencyContact: { name: '', phone: '', relation: '' },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.name.trim()) { toast.error('Name is required'); return false; }
      if (!formData.age || parseInt(formData.age) < 0) { toast.error('Valid age is required'); return false; }
      if (!formData.phone || formData.phone.length !== 10) { toast.error('Valid 10-digit phone required'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1)) { setCurrentStep(1); return; }

    setLoading(true);
    try {
      await patientService.create({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as 'Male' | 'Female' | 'Other',
        phone: formData.phone,
        email: formData.email || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        address: formData.address.line1 ? formData.address : undefined,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
        medicalHistory: formData.medicalHistory || undefined,
        emergencyContact: formData.emergencyContact.name ? formData.emergencyContact : undefined,
      });
      toast.success('Patient registered successfully');
      router.push('/dashboard/patients');
    } catch (err: unknown) {
      toast.error((err as { error?: string }).error || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="h-full flex flex-col -m-4 sm:-m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <Link href="/dashboard/patients" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">Add New Patient</h1>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-1 px-4 py-3 bg-gray-50 border-b">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              onClick={() => currentStep > step.id && setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentStep === step.id
                  ? 'bg-primary-600 text-white'
                  : currentStep > step.id
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > step.id ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              <span className="hidden sm:inline">{step.title}</span>
            </button>
            {idx < STEPS.length - 1 && <div className="w-8 h-0.5 bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 p-6 bg-white">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Patient name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Age *</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} min="0" max="150" className={inputClass} placeholder="Age" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender *</label>
                <Select value={formData.gender} onChange={(v) => setFormData(p => ({ ...p, gender: v }))} options={GENDER_OPTIONS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                <Select value={formData.bloodGroup} onChange={(v) => setFormData(p => ({ ...p, bloodGroup: v }))} options={BLOOD_GROUP_OPTIONS} />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={10} className={inputClass} placeholder="10-digit phone" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="Email" />
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1</label>
                <input type="text" name="address.line1" value={formData.address.line1} onChange={handleChange} className={inputClass} placeholder="Street address" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
                <input type="text" name="address.line2" value={formData.address.line2} onChange={handleChange} className={inputClass} placeholder="Apt, suite, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className={inputClass} placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} className={inputClass} placeholder="State" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
                <input type="text" name="address.pincode" value={formData.address.pincode} onChange={handleChange} maxLength={6} className={inputClass} placeholder="Pincode" />
              </div>
            </div>
          )}

          {/* Step 3: Medical */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Allergies</label>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className={inputClass} placeholder="Comma-separated allergies" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Medical History</label>
                <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} rows={4} className={inputClass} placeholder="Relevant medical history" />
              </div>
            </div>
          )}

          {/* Step 4: Emergency Contact */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Name</label>
                <input type="text" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} className={inputClass} placeholder="Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
                <input type="tel" name="emergencyContact.phone" value={formData.emergencyContact.phone} onChange={handleChange} maxLength={10} className={inputClass} placeholder="Phone" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Relation</label>
                <input type="text" name="emergencyContact.relation" value={formData.emergencyContact.relation} onChange={handleChange} className={inputClass} placeholder="e.g., Spouse" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-gray-50">
          <button type="button" onClick={prevStep} disabled={currentStep === 1} className="flex items-center gap-2 px-4 py-2.5 font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-3">
            <Link href="/dashboard/patients" className="px-4 py-2.5 font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              Cancel
            </Link>
            {currentStep < 4 ? (
              <button type="button" onClick={nextStep} className="flex items-center gap-2 px-4 py-2.5 font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2.5 font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Patient
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
