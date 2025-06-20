import api from './axios';

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signupUser = async (email: string, password: string) => {
  const response = await api.post('/auth/signup', { email, password });
  return response.data;
};