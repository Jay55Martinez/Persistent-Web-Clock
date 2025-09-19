import {api, safeAPIcall} from './axios';

export const startTimer = async () => {
  const response = await safeAPIcall(() => api.post("/timer/start"));
  return response.data;
};

export const pauseTimer = async () => {
  const response = await safeAPIcall(() => api.post('/timer/pause'));
  return response.data;
};

export const resetTimer = async () => {
  const response = await safeAPIcall(() => api.post('/timer/reset'));
  return response.data;
};

export const getTimerStatus = async () => {
  const response = await safeAPIcall(() => api.get('/timer/status'));
  return response.data;
};