import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    xpReward: {
      type: Number,
      default: 0,
    },
    stardustReward: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
