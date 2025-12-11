import {api, safeAPIcall} from './axios';

export const loginUser = async (email: string, password: string, rememberMe: boolean) => {
  const response = await api.post('/auth/login', { email, password, rememberMe });
  return response;
};

export const signupUser = async (email: string, password: string) => {
  const response = await api.post('/auth/signup', { email, password });
  return response;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response;
};

export const verifyAuth = async () => {
  const response = await safeAPIcall(() => api.get('/auth/me'));
  return response;
};

export const verifyAccount = async (email: string, code: string, rememberMe: boolean) => {
  const response = await api.post('/auth/verify', { email, code, rememberMe });
  return response;
};

export const resendVerification = async (email: string) => {
  const response = await api.post('/auth/resend-verify', { email });
  return response;
};

export const resetPassword = async (email: string, password: string, code: number, rememberMe: boolean) => {
  const response = await api.post('/auth/reset-password', { email, password, code, rememberMe });
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

export const googleOAuthLogin = async (token: string, rememberMe: boolean) => {
  const response = await api.post('/auth/google-oauth-login', { token, rememberMe });
  return response;
}