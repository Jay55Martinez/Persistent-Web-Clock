import axios from 'axios';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_NODE_BASE_URL || 'http://localhost:5000') + '/api',
  withCredentials: true,
});

/**
 * Safely calls an API function and handles errors. Calls a refresh endpoint on 401 errors.
 * Retrieving a new access token and retrying the original request once.
 * @param fn The API function to call.
 * @returns The result of the API call or an error.
 */
export async function safeAPIcall<T>(fn: () => Promise<T>): Promise<T> {
    try {
    const res = await fn();
    return res;
  } catch (err: any) {
    if (err.response?.status === 401) {
      // Try to refresh
      try {
        await api.post("/auth/refresh");

        // Retry original call
        const retryRes = await fn();
        return retryRes;
      } catch {
        // Refresh failed → logout
        throw new Error("Session expired. Please log in again.");
      }
    }
    throw err;
  }
}