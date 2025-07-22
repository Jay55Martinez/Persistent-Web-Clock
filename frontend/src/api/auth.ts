import api from './axios';

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response;
};

export const signupUser = async (email: string, password: string) => {
  const response = await api.post('/auth/signup', { email, password });
  console.log("Signup successful:", response.data);
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