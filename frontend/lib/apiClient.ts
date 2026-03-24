import axios, { AxiosRequestConfig } from 'axios';

export async function apiClient<T>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const res = await axios({
      url: endpoint,
      withCredentials: true, // Replaces `credentials: 'include'`
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    return res.data; // Axios automatically parses JSON responses
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        try {
          // Attempt to refresh the token
          const refreshRes = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
          if (refreshRes.status === 200) {
            // Retry the original request
            const retryRes = await axios({
              url: endpoint,
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                ...options.headers,
              },
              ...options,
            });
            return retryRes.data;
          }
        } catch {
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }

      const responseData = error.response?.data as { message?: string } | undefined;
      const errorMessage =
        responseData?.message || error.message || 'Request failed';
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}
