import axios, { AxiosRequestConfig } from 'axios';

type ApiClientOptions = AxiosRequestConfig & {
  retryOnAuth?: boolean;
};

let refreshInFlight: Promise<boolean> | null = null;

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
          return retryRes.data;
        }

        throw new Error('Session expired');
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
