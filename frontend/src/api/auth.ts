import api from './axios';

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response;
};

export const signupUser = async (email: string, password: string) => {
  const response = await api.post('/auth/signup', { email, password });
  return response;
};

export const logoutUser = async (email: string) => {
  const response = await api.post('/auth/logout', { email });
  return response;
};

export const verifyAuth = async () => {
  const response = await api.get('/auth/authme');
  return response;
};

export const verifyAccount = async (email: string, code: string) => {
  const response = await api.post('/auth/verify', { email, code });
  return response;
};

export const resendVerification = async (email: string) => {
  const response = await api.post('/auth/resend-verify', { email });
  return response;
};

export const resetPassword = async (email: string, password: string, code: number) => {
  const response = await api.post('/auth/reset-password', { email, password, code });
  return response;
};

export const requestPasswordReset = async (email: string) => {
  const response = await api.post('/auth/request-password-reset', { email });
  return response;
};

export const verifyResetCode = async (email: string, code: number) => {
  const response = await api.post('auth/verify-reset-code', { email, code });
  return response;
};