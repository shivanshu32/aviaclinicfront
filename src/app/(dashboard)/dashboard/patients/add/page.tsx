'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Save, User, MapPin, Heart, Phone, Check, UserPlus, Calendar, Mail, Building, Lock, AlertCircle } from 'lucide-react';
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
  { id: 1, title: 'Basic Info', icon: User, description: 'Personal details' },
  { id: 2, title: 'Address', icon: MapPin, description: 'Location info' },
  { id: 3, title: 'Medical', icon: Heart, description: 'Health history' },
  { id: 4, title: 'Emergency', icon: Phone, description: 'Contact person' },
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

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400 text-sm";
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-2";

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/patients" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Add New Patient</h1>
                  <p className="text-white/80 text-[10px]">Register a new patient to the system</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-4 py-2 bg-white">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                    className={`relative w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      currentStep === step.id
                        ? 'bg-primary-600 text-white shadow-md scale-105'
                        : currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <step.icon className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className={`mt-1 text-[9px] font-medium ${currentStep === step.id ? 'text-primary-600' : currentStep > step.id ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1.5 rounded-full ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto pb-4">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Basic Information</h2>
                    <p className="text-[10px] text-gray-500">Enter the patient's personal details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <User className="w-3 h-3" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className={inputClass} 
                      placeholder="Enter patient's full name" 
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>
                      <Calendar className="w-3 h-3" />
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="age" 
                      value={formData.age} 
                      onChange={handleChange} 
                      min="0" 
                      max="150" 
                      className={inputClass} 
                      placeholder="Enter age" 
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>
                      <User className="w-3 h-3" />
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={formData.gender} 
                      onChange={(v) => setFormData(p => ({ ...p, gender: v }))} 
                      options={GENDER_OPTIONS} 
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>
                      <Heart className="w-3 h-3" />
                      Blood Group
                    </label>
                    <Select 
                      value={formData.bloodGroup} 
                      onChange={(v) => setFormData(p => ({ ...p, bloodGroup: v }))} 
                      options={BLOOD_GROUP_OPTIONS} 
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>
                      <Phone className="w-3 h-3" />
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      maxLength={10} 
                      className={inputClass} 
                      placeholder="10-digit phone number" 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <Mail className="w-3 h-3" />
                      Email
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className={inputClass} 
                      placeholder="email@example.com" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Address Information</h2>
                    <p className="text-[10px] text-gray-500">Enter the patient's address details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <Building className="w-3 h-3" />
                      Address Line 1
                    </label>
                    <input 
                      type="text" 
                      name="address.line1" 
                      value={formData.address.line1} 
                      onChange={handleChange} 
                      className={inputClass} 
                      placeholder="Street address, building name" 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <Building className="w-3 h-3" />
                      Address Line 2
                    </label>
                    <input 
                      type="text" 
                      name="address.line2" 
                      value={formData.address.line2} 
                      onChange={handleChange} 
                      className={inputClass} 
                      placeholder="Apartment, suite, unit, etc." 
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>
                      <Building className="w-3 h-3" />
                      City
                    </label>
                    <input 
                      type="text" 
                      name="address.city" 
                      value={formData.address.city} 
                      onChange={handleChange} 
                      className={inputClass} 
                      placeholder="City name" 
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>
                      <Building className="w-3 h-3" />
                      State
                    </label>
                    <input 
                      type="text" 
                      name="address.state" 
                      value={formData.address.state} 
                      onChange={handleChange} 
                      className={inputClass} 
                      placeholder="State name" 
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>
                      <MapPin className="w-3 h-3" />
                      Pincode
                    </label>
                    <input 
                      type="text" 
                      name="address.pincode" 
                      value={formData.address.pincode} 
                      onChange={handleChange} 
                      maxLength={6} 
                      className={inputClass} 
                      placeholder="6-digit pincode" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Medical */}
            {currentStep === 3 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Medical Information</h2>
                    <p className="text-[10px] text-gray-500">Enter the patient's health details</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>
                      <AlertCircle className="w-3 h-3" />
                      Allergies
                    </label>
                    <input 
                      type="text" 
                      name="allergies" 
                      value={formData.allergies} 
                      onChange={handleChange} 
                      className={inputClass} 
                      placeholder="Enter allergies separated by commas" 
                    />
                    <p className="text-[9px] text-gray-500 mt-1">Example: Penicillin, Dust, Peanuts</p>
                  </div>
                  
                  <div>
                    <label className={labelClass}>
                      <Heart className="w-3 h-3" />
                      Medical History
                    </label>
                    <textarea 
                      name="medicalHistory" 
                      value={formData.medicalHistory} 
                      onChange={handleChange} 
                      rows={3} 
                      className={inputClass} 
                      placeholder="Enter relevant medical history, previous conditions, surgeries, etc." 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Emergency Contact */}
            {currentStep === 4 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Emergency Contact</h2>
                    <p className="text-[10px] text-gray-500">Enter emergency contact information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>
                      <User className="w-3 h-3" />
                      Contact Name
                    </label>
                    <input 
                      type="text" 
                      name="emergencyContact.name" 
                      value={formData.emergencyContact.name} 
                      onChange={handleChange} 
                      className={inputClass} 
                      placeholder="Full name" 
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>
                      <Phone className="w-3 h-3" />
                      Contact Phone
                    </label>
                    <input 
                      type="tel" 
                      name="emergencyContact.phone" 
                      value={formData.emergencyContact.phone} 
                      onChange={handleChange} 
                      maxLength={10} 
                      className={inputClass} 
                      placeholder="10-digit phone" 
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>
                      <User className="w-3 h-3" />
                      Relation
                    </label>
                    <input 
                      type="text" 
                      name="emergencyContact.relation" 
                      value={formData.emergencyContact.relation} 
                      onChange={handleChange} 
                      className={inputClass} 
                      placeholder="e.g., Spouse, Parent" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-white border-t border-gray-200 flex-shrink-0">
          <button 
            type="button" 
            onClick={prevStep} 
            disabled={currentStep === 1} 
            className="flex items-center gap-2 px-3 py-1.5 font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          
          <div className="flex gap-2">
            <Link 
              href="/dashboard/patients" 
              className="px-3 py-1.5 font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-xs"
            >
              Cancel
            </Link>
            
            {currentStep < 4 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="flex items-center gap-2 px-3 py-1.5 font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg hover:from-primary-700 hover:to-primary-600 shadow-md transition-all text-xs"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading} 
                className="flex items-center gap-2 px-3 py-1.5 font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 rounded-lg hover:from-green-700 hover:to-green-600 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Register Patient
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
