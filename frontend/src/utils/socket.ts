import { io } from 'socket.io-client';

console.log(localStorage.getItem('userId') || ''); // for debugging purposes

const socket = io(import.meta.env.VITE_NODE_BASE_URL || 'http://localhost:5000', {
  withCredentials: true,
  auth: {
    // send the current user ID so server can join this socket to the correct room
    userId: sessionStorage.getItem('userId') || undefined,
  },
});

export default socket;