import mongoose from 'mongoose';
import app from './app';
import http from 'http';
import userModel from './models/user.model';
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
io.on('connection', async (socket) => {
  // Access the userId from the socket handshake auth object
  const user = await userModel.findOne({ email: socket.handshake.auth?.userEmail });
  const userId = user?._id?.toString();
  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} connected and joined room`);
  } else {
    console.warn('No userEmail provided in socket handshake auth or user not found');
  }
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