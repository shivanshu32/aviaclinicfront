'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Plus,
  Loader2,
  Phone,
  CheckCircle2,
  XCircle,
  QrCode,
  Trash2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { whatsappService, WhatsAppSession, BackendWhatsAppIntegration } from '@/lib/services';

type SetupStep = 'auth' | 'create' | 'qr' | 'success';

// Combined session type that includes backend integration ID
interface CombinedSession extends WhatsAppSession {
  backendId?: string;
  isDefault?: boolean;
}

export default function WhatsAppIntegrationPage() {
  const [sessions, setSessions] = useState<CombinedSession[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [backendIntegrations, setBackendIntegrations] = useState<BackendWhatsAppIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupStep, setSetupStep] = useState<SetupStep>('auth');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Session creation state
  const [sessionName, setSessionName] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentBackendId, setCurrentBackendId] = useState<string | null>(null);

  // QR code state
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [pollingStatus, setPollingStatus] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('pending_qr');

  useEffect(() => {
    checkAuth();
    fetchBackendIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = () => {
    const authenticated = whatsappService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      fetchSessions();
    } else {
      setLoading(false);
    }
  };

  const fetchBackendIntegrations = async () => {
    try {
      const integrations = await whatsappService.getBackendIntegrations();
      setBackendIntegrations(integrations);
    } catch (error) {
      console.error('Failed to fetch backend integrations:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const [whatsappSessions, backendData] = await Promise.all([
        whatsappService.listSessions(),
        whatsappService.getBackendIntegrations().catch(() => []),
      ]);
      
      setBackendIntegrations(backendData);
      
      // Merge WhatsApp API sessions with backend integrations
      const sessionsArray = Array.isArray(whatsappSessions) ? whatsappSessions : [];
      const combinedSessions: CombinedSession[] = sessionsArray.map((session) => {
        const backendMatch = backendData.find((b) => b.sessionId === session.id);
        return {
          ...session,
          backendId: backendMatch?.id,
          isDefault: backendMatch?.isDefault,
        };
      });
      
      setSessions(combinedSessions);
    } catch (error: unknown) {
      const err = error as { detail?: string; error?: string };
      if (err.detail?.includes('Could not validate') || err.detail?.includes('Not authenticated')) {
        whatsappService.logout();
        setIsAuthenticated(false);
      } else {
        toast.error(err.error || err.detail || 'Failed to fetch sessions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        await whatsappService.register(email, password, name);
        toast.success('Registration successful! Please login.');
        setAuthMode('login');
      } else {
        await whatsappService.login(email, password);
        toast.success('Login successful!');
        setIsAuthenticated(true);
        await fetchSessions();
        setSetupStep('create');
      }
    } catch (error: unknown) {
      const err = error as { detail?: string; error?: string };
      toast.error(err.detail || err.error || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    setCreatingSession(true);
    try {
      // Create session on WhatsApp API
      const response = await whatsappService.createSession(sessionName);
      setCurrentSessionId(response.id);
      
      // Store integration in backend database
      try {
        const backendIntegration = await whatsappService.createBackendIntegration(
          response.id,
          sessionName,
          response.status || 'initializing',
          email // Store the WhatsApp API email used
        );
        setCurrentBackendId(backendIntegration.id);
      } catch (backendError) {
        console.error('Failed to store integration in backend:', backendError);
        // Continue anyway - WhatsApp session was created
      }
      
      toast.success('Session created! Scan the QR code to connect.');
      setSetupStep('qr');
      fetchQRCode(response.id);
    } catch (error: unknown) {
      const err = error as { detail?: string; error?: string };
      toast.error(err.detail || err.error || 'Failed to create session');
    } finally {
      setCreatingSession(false);
    }
  };

  const fetchQRCode = async (sessionId: string) => {
    setQrLoading(true);
    try {
      const response = await whatsappService.getQRCode(sessionId);
      setQrCode(response.qr_code);
      startStatusPolling(sessionId);
    } catch (error: unknown) {
      const err = error as { detail?: string; error?: string };
      toast.error(err.detail || err.error || 'Failed to get QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const startStatusPolling = useCallback((sessionId: string) => {
    setPollingStatus(true);
    const pollInterval = setInterval(async () => {
      try {
        const status = await whatsappService.getSessionStatus(sessionId);
        setSessionStatus(status.status);

        if (status.status === 'logged_in') {
          clearInterval(pollInterval);
          setPollingStatus(false);
          
          // Sync status with backend
          if (currentBackendId) {
            try {
              await whatsappService.syncBackendIntegrationStatus(
                currentBackendId,
                'logged_in',
                status.phone_number || undefined
              );
            } catch (syncError) {
              console.error('Failed to sync status with backend:', syncError);
            }
          }
          
          setSetupStep('success');
          toast.success('WhatsApp connected successfully!');
          fetchSessions();
        } else if (status.status === 'error') {
          clearInterval(pollInterval);
          setPollingStatus(false);
          
          // Sync error status with backend
          if (currentBackendId) {
            try {
              await whatsappService.syncBackendIntegrationStatus(
                currentBackendId,
                'error',
                undefined,
                status.error_message || 'Connection failed'
              );
            } catch (syncError) {
              console.error('Failed to sync error status with backend:', syncError);
            }
          }
          
          toast.error(status.error_message || 'Connection failed');
        }
      } catch {
        // Continue polling on error
      }
    }, 3000);

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setPollingStatus(false);
    }, 120000);

    return () => clearInterval(pollInterval);
  }, [currentBackendId]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this WhatsApp session?')) return;

    setDeletingId(sessionId);
    try {
      // Find the session to get backend ID
      const sessionToDelete = sessions.find((s) => s.id === sessionId);
      
      // Delete from WhatsApp API
      await whatsappService.deleteSession(sessionId);
      
      // Delete from backend if we have a backend ID
      if (sessionToDelete?.backendId) {
        try {
          await whatsappService.deleteBackendIntegration(sessionToDelete.backendId);
        } catch (backendError) {
          console.error('Failed to delete from backend:', backendError);
        }
      }
      
      toast.success('Session deleted');
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (error: unknown) {
      const err = error as { detail?: string; error?: string };
      toast.error(err.detail || err.error || 'Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    whatsappService.logout();
    setIsAuthenticated(false);
    setSessions([]);
    toast.success('Logged out from WhatsApp API');
  };

  const resetSetup = () => {
    setShowSetupModal(false);
    setSetupStep(isAuthenticated ? 'create' : 'auth');
    setSessionName('');
    setCurrentSessionId(null);
    setCurrentBackendId(null);
    setQrCode(null);
    setSessionStatus('pending_qr');
    setEmail('');
    setPassword('');
    setName('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'logged_in':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        );
      case 'pending_qr':
      case 'initializing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
            <QrCode className="w-3.5 h-3.5" />
            Pending QR
          </span>
        );
      case 'logged_out':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            <XCircle className="w-3.5 h-3.5" />
            Disconnected
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  const renderSetupContent = () => {
    switch (setupStep) {
      case 'auth':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {authMode === 'login' ? 'Login to WhatsApp API' : 'Create WhatsApp API Account'}
              </h3>
              <p className="text-gray-500 mt-2">
                {authMode === 'login'
                  ? 'Enter your WhatsApp API credentials'
                  : 'Create a new account to get started'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Your name"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {authMode === 'login' ? 'Login' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-sm text-green-600 hover:text-green-700"
              >
                {authMode === 'login'
                  ? "Don't have an account? Register"
                  : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        );

      case 'create':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Add WhatsApp Number</h3>
              <p className="text-gray-500 mt-2">Give your WhatsApp session a name to identify it</p>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Name</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Clinic Main Number"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps you identify the number in your dashboard
                </p>
              </div>

              <button
                type="submit"
                disabled={creatingSession}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creatingSession ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {!isAuthenticated && (
              <button
                onClick={() => setSetupStep('auth')}
                className="w-full py-2 text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            )}
          </div>
        );

      case 'qr':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Scan QR Code</h3>
              <p className="text-gray-500 mt-2">
                Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
              </p>
            </div>

            <div className="flex justify-center">
              {qrLoading ? (
                <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : qrCode ? (
                <div className="p-4 bg-white border-2 border-gray-200 rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                    alt="WhatsApp QR Code"
                    className="w-56 h-56"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <p className="text-gray-500">QR code not available</p>
                </div>
              )}
            </div>

            {pollingStatus && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for scan... Status: {sessionStatus}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => currentSessionId && fetchQRCode(currentSessionId)}
                disabled={qrLoading}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${qrLoading ? 'animate-spin' : ''}`} />
                Refresh QR
              </button>
              <button
                onClick={() => setSetupStep('create')}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">WhatsApp Connected!</h3>
              <p className="text-gray-500 mt-2">
                Your WhatsApp number is now connected and ready to send messages.
              </p>
            </div>
            <button
              onClick={resetSetup}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-green-600" />
            WhatsApp Integration
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">
            Connect and manage your WhatsApp business numbers
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Logout from API
            </button>
          )}
          <button
            onClick={() => {
              setSetupStep(isAuthenticated ? 'create' : 'auth');
              setShowSetupModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Number
          </button>
        </div>
      </div>

      {/* Not Authenticated State */}
      {!isAuthenticated && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect WhatsApp</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Integrate WhatsApp to send appointment reminders, follow-ups, and communicate with your
            patients directly.
          </p>
          <button
            onClick={() => {
              setSetupStep('auth');
              setShowSetupModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Get Started
          </button>
        </div>
      )}

      {/* Sessions List */}
      {isAuthenticated && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Connected Numbers</h2>
            <button
              onClick={fetchSessions}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="p-8 text-center">
              <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No WhatsApp numbers connected yet</p>
              <button
                onClick={() => {
                  setSetupStep('create');
                  setShowSetupModal(true);
                }}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Add your first number
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{session.session_name}</h3>
                      <p className="text-sm text-gray-500">
                        {session.phone_number || 'Phone not linked yet'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(session.status)}
                    {session.status === 'pending_qr' && (
                      <button
                        onClick={() => {
                          setCurrentSessionId(session.id);
                          setSetupStep('qr');
                          setShowSetupModal(true);
                          fetchQRCode(session.id);
                        }}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Scan QR
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deletingId === session.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deletingId === session.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={resetSetup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {['auth', 'create', 'qr', 'success'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      setupStep === step
                        ? 'bg-green-600 text-white'
                        : ['auth', 'create', 'qr', 'success'].indexOf(setupStep) > index
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-8 h-0.5 ${
                        ['auth', 'create', 'qr', 'success'].indexOf(setupStep) > index
                          ? 'bg-green-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {renderSetupContent()}
          </div>
        </div>
      )}
    </div>
  );
}
