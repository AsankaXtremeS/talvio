'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/auth.service';
import { CheckCircle, XCircle, Building2, FileText, LogOut, RefreshCw } from 'lucide-react';

interface EmployerProfile {
  companyName: string;
  registrationFileUrl: string;
  registrationFileName: string;
  verificationStatus: string;
  createdAt: string;
}

interface PendingEmployer {
  id: string;
  email: string;
  createdAt: string;
  employerProfile: EmployerProfile;
}

export default function AdminDashboard() {
  const { user, accessToken, logout } = useAuth();
  const router = useRouter();
  const [employers, setEmployers] = useState<PendingEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Give React state a moment to rehydrate before redirecting
    const timer = setTimeout(() => {
      setAuthChecking(false);
      if (!user || user.role !== 'ADMIN') {
        router.replace('/login/admin');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [user, router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN' && accessToken) {
      fetchPending();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accessToken]);

  // Auto-dismiss messages after 4 seconds
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await authService.getPendingEmployers(accessToken!);
      setEmployers(data);
    } catch {
      setMessage({ text: 'Failed to load pending employers.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId + '_approve');
    try {
      await authService.approveEmployer(userId, accessToken!);
      setMessage({ text: 'Employer approved successfully.', type: 'success' });
      setEmployers(prev => prev.filter(e => e.id !== userId));
    } catch {
      setMessage({ text: 'Failed to approve employer.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId + '_reject');
    try {
      await authService.rejectEmployer(userId, accessToken!);
      setMessage({ text: 'Employer rejected.', type: 'success' });
      setEmployers(prev => prev.filter(e => e.id !== userId));
    } catch {
      setMessage({ text: 'Failed to reject employer.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {authChecking ? (
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-white border-b shadow-sm">
            <div className="flex items-center justify-between max-w-6xl px-6 py-4 mx-auto">
              <div>
                <h1 className="text-xl font-bold text-violet-700">Talvio Admin</h1>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 transition border border-red-200 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </header>

          {/* Main */}
          <main className="max-w-6xl px-6 py-10 mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Pending Employer Approvals</h2>
          <p className="mt-1 text-sm text-slate-500">Review and approve or reject employer registrations below.</p>
        </div>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading...</div>
        ) : employers.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No pending employer registrations.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {employers.map((employer) => (
              <div key={employer.id} className="flex flex-col gap-4 p-6 bg-white border border-gray-200 shadow-sm rounded-xl md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100">
                      <Building2 className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{employer.employerProfile?.companyName}</p>
                      <p className="text-sm text-slate-500">{employer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{employer.employerProfile?.registrationFileName}</span>
                    <span className="mx-1">|</span>
                    <span>Registered: {new Date(employer.createdAt).toLocaleDateString()}</span>
                  </div>
                  {employer.employerProfile?.registrationFileName && (
                    <a
                      href={`http://localhost:8000/api/uploads/${employer.employerProfile.registrationFileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-blue-600 hover:underline"
                    >
                      View Registration PDF
                    </a>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(employer.id)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-2 px-5 py-2 text-sm text-white transition rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actionLoading === employer.id + '_approve' ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(employer.id)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-2 px-5 py-2 text-sm text-white transition rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: '#dc2626' }}
                  >
                    <XCircle className="w-4 h-4" />
                    {actionLoading === employer.id + '_reject' ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </main>
        </>
      )}
    </div>
  );
}
