import axios, { AxiosRequestConfig } from 'axios';
import { setRedirectToast } from '@/lib/postRedirectToast';

type ApiClientOptions = AxiosRequestConfig & {
  retryOnAuth?: boolean;
};

export class SessionExpiredError extends Error {
  constructor(message = 'Session expired') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

let refreshInFlight: Promise<boolean> | null = null;

function getLoginRedirectPath(pathname: string): string {
  if (pathname.startsWith('/users/employer')) return '/login/employer';
  if (pathname.startsWith('/users/admin')) return '/login/admin';
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return pathname;
  return '/login';
}

function redirectOnSessionExpired(): void {
  if (typeof window === 'undefined') return;

  const hasRedirected = window.sessionStorage.getItem('talvio:session-expired-redirected') === '1';
  if (hasRedirected) return;

  window.sessionStorage.setItem('talvio:session-expired-redirected', '1');
  const target = getLoginRedirectPath(window.location.pathname);
  setRedirectToast({ message: 'Session expired. Please log in again.', tone: 'error' });
  window.location.href = target;
}

function clearSessionExpiredRedirectFlag(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem('talvio:session-expired-redirected');
}

function isAuthEndpoint(endpoint: string): boolean {
  return endpoint.startsWith('/api/auth/');
}

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post('/api/auth/refresh', {}, { withCredentials: true })
      .then((res) => res.status === 200)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { retryOnAuth = true, ...axiosOptions } = options;

  try {
    const res = await axios({
      url: endpoint,
      withCredentials: true, // Replaces `credentials: 'include'`
      headers: {
        'Content-Type': 'application/json',
        ...axiosOptions.headers,
      },
      ...axiosOptions,
    });

    clearSessionExpiredRedirectFlag();
    return res.data; // Axios automatically parses JSON responses
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const isUnauthorized = error.response?.status === 401;
      const canRetryWithRefresh = retryOnAuth && isUnauthorized && !isAuthEndpoint(endpoint);

      if (canRetryWithRefresh) {
        const refreshed = await refreshSession();

        if (refreshed) {
          const retryRes = await axios({
            url: endpoint,
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              ...axiosOptions.headers,
            },
            ...axiosOptions,
          });
          clearSessionExpiredRedirectFlag();
          return retryRes.data;
        }

        redirectOnSessionExpired();
        throw new SessionExpiredError();
      }

      const responseData = error.response?.data as { message?: string } | undefined;
      const errorMessage =
        responseData?.message || error.message || 'Request failed';
      throw new Error(errorMessage);
    } else {
      if (error instanceof Error) {
        throw new Error(error.message || 'An unexpected error occurred');
      }
      throw new Error('An unexpected error occurred');
    }
  }
}
