//backend/src/models/timer.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITimer extends Document {
  userId: mongoose.Types.ObjectId;
  startTime: Date | null;
  isRunning: boolean;
  totalElapsed: number; // total seconds
}

const TimerSchema: Schema<ITimer> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // ONE time per user (*for now*)
  },
  startTime: {
    type: Date,
    default: null
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  totalElapsed: {
    type: Number,
    default: 0 // seconds
  }
});

export default mongoose.model<ITimer>('Timer', TimerSchema);