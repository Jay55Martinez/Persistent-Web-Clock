import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';


// Create socket without auto-connect; auth payload set on connect
const socket: Socket = io(import.meta.env.VITE_NODE_BASE_URL || 'http://localhost:5000', {
  withCredentials: true,
  autoConnect: false,
});

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

const connectSocket = (userId?: string) => {
  if (userId) {
    socket.auth = { userId };
  }
  if (!socket.connected) {
    socket.connect();
  }
};

export default socket;
export { disconnectSocket, connectSocket };