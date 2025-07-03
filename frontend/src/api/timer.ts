import api from './axios';

export const startTimer = async (isRunning: boolean) => {
  const response = await api.post('/timer/start', {isRunning});
  return response.data;
};

export const pauseTimer = async () => {
  const response = await api.post('/timer/pause');
  return response.data;
};

export const resetTimer = async () => {
  const response = await api.post('/timer/reset');
  return response.data;
};

export const getTimerStatus = async () => {
  const response = await api.get('/timer/status');
  return response.data;
};