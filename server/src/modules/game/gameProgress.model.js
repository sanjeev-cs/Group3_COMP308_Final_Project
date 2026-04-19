import mongoose from 'mongoose';

const gameProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    missionId: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },
    score: {
      type: Number,
      default: 0,
    },
    wavesCompleted: {
      type: Number,
      default: 0,
    },
    objectsDestroyed: {
      type: Number,
      default: 0,
    },
    livesRemaining: {
      type: Number,
      default: 3,
    },
    maxCombo: {
      type: Number,
      default: 0,
    },
    starsEarned: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    attempts: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
gameProgressSchema.index({ userId: 1, missionId: 1 });

const GameProgress = mongoose.model('GameProgress', gameProgressSchema);
export default GameProgress;
