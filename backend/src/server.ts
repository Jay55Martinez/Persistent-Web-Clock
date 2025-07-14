import mongoose from 'mongoose';
import app from './app';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
// @ts-ignore: no types for 'cookie'
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// BIG BUG: no matter what account I use the instances are always added to the same room
// Very buggy and not sure if it works 
// I really want it to work with multiple different users on the same browser
// Attach io to Express and set up socket authentication & rooms
app.set('io', io);


// On connection, join the user-specific room
io.on('connection', (socket) => {
  // Access the userId from the socket handshake auth object
  console.log('New socket connection:', socket.id);
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} connected and joined room`);
  } else {
    console.warn('No userId provided in socket handshake auth');
  }

  socket.on('disconnect', (reason) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) {
      socket.leave(userId);
      console.log(`User ${userId} disconnected and left room. Reason: ${reason}`);
    } else {
      console.warn('No userId provided in socket handshake auth on disconnect');
    }
  });
});
 

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Mongo error:', err));

// Export the io instance so controllers can use it
export { io }; 