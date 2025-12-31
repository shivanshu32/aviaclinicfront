'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Image as ImageIcon, 
  UserPlus, 
  Check, 
  ChevronRight, 
  Loader2,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { onboardingService, OnboardingStatus, TenantAddress, TenantBranding } from '@/lib/services';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
}

function StepIndicator({ number, title, description, icon, isActive, isCompleted }: StepProps) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
      isActive ? 'bg-primary-50 border-2 border-primary-500' : 
      isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
    }`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isCompleted ? 'bg-green-500 text-white' :
        isActive ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-600'
      }`}>
        {isCompleted ? <Check className="w-5 h-5" /> : icon}
      </div>
      <div>
        <p className={`font-medium ${isActive ? 'text-primary-700' : isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
          Step {number}: {title}
        </p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, tenant, isAuthenticated, loading: authLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Onboarding status
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  
  // Step 1: Clinic Details
  const [clinicName, setClinicName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState<TenantAddress>({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  
  // Step 2: Branding
  const [logo, setLogo] = useState<string | null>(null);
  const [billHeaderImage, setBillHeaderImage] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  
  // Step 3: Doctor
  const [doctorName, setDoctorName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [doctorCount, setDoctorCount] = useState(0);

  const fetchOnboardingStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await onboardingService.getStatus();
      const { onboarding, tenant: tenantData, doctorCount: count } = response.data;
      
      setOnboardingStatus(onboarding);
      setDoctorCount(count);
      
      // Pre-fill clinic details
      setClinicName(tenantData.name || '');
      setPhone(tenantData.phone || '');
      setEmail(tenantData.email || '');
      setAddress(tenantData.address || { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' });
      
      // Pre-fill branding
      if (tenantData.branding?.logo) {
        setLogo(tenantData.branding.logo);
        setLogoPreview(tenantData.branding.logo);
      }
      if (tenantData.branding?.billHeaderImage) {
        setBillHeaderImage(tenantData.branding.billHeaderImage);
        setHeaderPreview(tenantData.branding.billHeaderImage);
      }
      
      // If onboarding is complete, redirect to dashboard
      if (onboarding.completed) {
        router.push('/dashboard');
        return;
      }
      
      // Determine current step based on completion
      if (!onboarding.steps.clinicDetails) {
        setCurrentStep(1);
      } else if (!onboarding.steps.branding) {
        setCurrentStep(2);
      } else if (count === 0) {
        setCurrentStep(3);
      } else {
        setCurrentStep(3);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load onboarding status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (isAuthenticated) {
      fetchOnboardingStatus();
    }
  }, [authLoading, isAuthenticated, router, fetchOnboardingStatus]);

  const handleFileUpload = async (file: File, type: 'logo' | 'header') => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }
    
    try {
      const base64 = await onboardingService.fileToBase64(file);
      if (type === 'logo') {
        setLogo(base64);
        setLogoPreview(base64);
      } else {
        setBillHeaderImage(base64);
        setHeaderPreview(base64);
      }
    } catch {
      setError('Failed to process image');
    }
  };

  const handleSaveClinicDetails = async () => {
    if (!clinicName.trim()) {
      setError('Clinic name is required');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      await onboardingService.saveClinicDetails({
        clinicName,
        phone,
        email,
        address,
      });
      setOnboardingStatus(prev => prev ? {
        ...prev,
        steps: { ...prev.steps, clinicDetails: true }
      } : null);
      setCurrentStep(2);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save clinic details';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!logo && !billHeaderImage) {
      setError('Please upload at least a logo or header image');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      await onboardingService.saveBranding({
        logo,
        billHeaderImage,
      });
      setOnboardingStatus(prev => prev ? {
        ...prev,
        steps: { ...prev.steps, branding: true }
      } : null);
      setCurrentStep(3);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save branding';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!doctorName.trim()) {
      setError('Doctor name is required');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      await onboardingService.addDoctor({
        name: doctorName,
        specialization: specialization || undefined,
        qualification: qualification || undefined,
        phone: doctorPhone || undefined,
        email: doctorEmail || undefined,
        consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
      });
      setDoctorCount(prev => prev + 1);
      setOnboardingStatus(prev => prev ? {
        ...prev,
        steps: { ...prev.steps, doctor: true }
      } : null);
      // Clear form for adding more doctors
      setDoctorName('');
      setSpecialization('');
      setQualification('');
      setDoctorPhone('');
      setDoctorEmail('');
      setConsultationFee('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add doctor';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      setSaving(true);
      setError(null);
      await onboardingService.complete();
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Clinic Details', description: 'Basic information about your clinic', icon: <Building2 className="w-5 h-5" /> },
    { number: 2, title: 'Branding', description: 'Logo and bill header image', icon: <ImageIcon className="w-5 h-5" /> },
    { number: 3, title: 'Add Doctor', description: 'Add at least one doctor', icon: <UserPlus className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Avia Wellness</h1>
          <p className="mt-2 text-gray-600">Let&apos;s set up your clinic in a few simple steps</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5 text-red-500" />
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {steps.map((step) => (
              <StepIndicator
                key={step.number}
                {...step}
                isActive={currentStep === step.number}
                isCompleted={
                  step.number === 1 ? onboardingStatus?.steps.clinicDetails || false :
                  step.number === 2 ? onboardingStatus?.steps.branding || false :
                  doctorCount > 0
                }
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              {/* Step 1: Clinic Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Clinic Details</h2>
                    <p className="text-gray-500 mt-1">Tell us about your clinic</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Clinic Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter clinic name"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="10 digit phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="clinic@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={address.line1}
                        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Street address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        value={address.line2}
                        onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={address.pincode}
                          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Pincode"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveClinicDetails}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Branding */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Branding</h2>
                    <p className="text-gray-500 mt-1">Upload your clinic logo and bill header image</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinic Logo
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                        {logoPreview ? (
                          <div className="relative">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="max-h-32 mx-auto object-contain"
                            />
                            <button
                              onClick={() => { setLogo(null); setLogoPreview(null); }}
                              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                            <p className="mt-2 text-sm text-gray-500">Click to upload logo</p>
                            <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Header Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bill Header Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                        {headerPreview ? (
                          <div className="relative">
                            <img
                              src={headerPreview}
                              alt="Header preview"
                              className="max-h-32 mx-auto object-contain"
                            />
                            <button
                              onClick={() => { setBillHeaderImage(null); setHeaderPreview(null); }}
                              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                            <p className="mt-2 text-sm text-gray-500">Click to upload header</p>
                            <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'header')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    These images will appear on your bills and invoices.
                  </p>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSaveBranding}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Add Doctor */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Add Doctor</h2>
                    <p className="text-gray-500 mt-1">Add at least one doctor to your clinic</p>
                    {doctorCount > 0 && (
                      <p className="text-green-600 text-sm mt-1">
                        ✓ {doctorCount} doctor{doctorCount > 1 ? 's' : ''} added
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doctor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Dr. John Doe"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                        <input
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., General Physician"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                        <input
                          type="text"
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., MBBS, MD"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={doctorPhone}
                          onChange={(e) => setDoctorPhone(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="10 digit phone"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={doctorEmail}
                          onChange={(e) => setDoctorEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="doctor@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                      <input
                        type="number"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddDoctor}
                      disabled={saving}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      {doctorCount > 0 ? 'Add Another Doctor' : 'Add Doctor'}
                    </button>
                    {doctorCount > 0 && (
                      <button
                        onClick={handleCompleteOnboarding}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Complete Setup
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
