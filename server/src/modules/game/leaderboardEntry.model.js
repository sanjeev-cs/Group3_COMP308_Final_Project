import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema(
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
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast leaderboard queries sorted by score
leaderboardEntrySchema.index({ missionId: 1, score: -1 });
leaderboardEntrySchema.index({ completedAt: -1 });

const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
export default LeaderboardEntry;
