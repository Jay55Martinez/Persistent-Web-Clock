import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_NODE_BASE_URL || 'http://localhost:5000', {
  withCredentials: true,
});

export default socket;