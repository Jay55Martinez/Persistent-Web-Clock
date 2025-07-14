import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';


let socket: Socket;

socket = io(import.meta.env.VITE_NODE_BASE_URL || 'http://localhost:5000', {
  withCredentials: true,
  auth: {
    // send the current user ID so server can join this socket to the correct room
    userId: sessionStorage.getItem('userId') || undefined,
  },
});

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export default socket;
export { disconnectSocket, connectSocket };