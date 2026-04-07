import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['daily', 'weekly'],
      required: true,
    },
    condition: {
      missionId: { type: Number, default: null },
      metric: {
        type: String,
        enum: ['score', 'objectsDestroyed', 'maxCombo', 'wavesCompleted', 'gamesPlayed'],
        required: true,
      },
      threshold: {
        type: Number,
        required: true,
      },
    },
    xpReward: {
      type: Number,
      default: 0,
    },
    stardustReward: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
