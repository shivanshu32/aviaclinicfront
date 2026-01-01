'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User,
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
} from 'lucide-react';
import { patientService, Patient } from '@/lib/services';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-secondary-800">
              Patient Details
            </h1>
            <p className="text-secondary-400 mt-1 font-sans">ID: {patient.patientId}</p>
          </div>
        </div>
        <Link
          href={`/dashboard/patients/${patient._id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold"
        >
          <Edit className="w-4 h-4" />
          Edit Patient
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-primary-600 font-sans">
                  {getInitials(patient.name)}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-secondary-800 font-sans">{patient.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-secondary-500 font-sans">{patient.age} years</span>
                  <span className="text-secondary-300">•</span>
                  <span className="text-secondary-500 font-sans">{patient.gender}</span>
                  {patient.bloodGroup && (
                    <>
                      <span className="text-secondary-300">•</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg font-sans">
                        <Droplets className="w-3 h-3" />
                        {patient.bloodGroup}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                patient.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {patient.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
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
                    {[
                      patient.address.line1,
                      patient.address.line2,
                      patient.address.city,
                      patient.address.state,
                      patient.address.pincode
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
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
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg font-sans"
                    >
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
          {/* Emergency Contact */}
          {patient.emergencyContact && (patient.emergencyContact.name || patient.emergencyContact.phone) && (
            <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary-500" />
                Emergency Contact
              </h3>
              <div className="space-y-3">
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

          {/* Record Info */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Record Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-secondary-400 font-sans">Created</p>
                <p className="text-secondary-700 font-sans">
                  {new Date(patient.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary-400 font-sans">Last Updated</p>
                <p className="text-secondary-700 font-sans">
                  {new Date(patient.updatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-secondary-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/appointments/add?patient=${patient._id}`}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-secondary-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all font-sans"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Link>
              <Link
                href={`/dashboard/billing/add?patient=${patient._id}`}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-secondary-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all font-sans"
              >
                <FileText className="w-4 h-4" />
                Create Bill
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
