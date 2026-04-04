import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '🚀',
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    xp: {
      type: Number,
      default: 0,
    },
    stardust: {
      type: Number,
      default: 0,
    },
    unlockedPowerUps: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    stats: {
      gamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      highestCombo: { type: Number, default: 0 },
      totalAsteroidsDestroyed: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Compare plaintext password with hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
