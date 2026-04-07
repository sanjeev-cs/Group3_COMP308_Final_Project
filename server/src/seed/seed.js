import 'dotenv/config';
import mongoose from 'mongoose';
import Achievement from '../models/Achievement.js';
import Challenge from '../models/Challenge.js';
import { ACTIVE_CHALLENGE_PRESETS } from '../config/challengePresets.js';
import { ACHIEVEMENT_PRESETS } from '../config/achievementPresets.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stellar-smash';

const achievements = [
  {
    key: 'first_contact',
    xpReward: 25,
    stardustReward: 15,
  },
  {
    key: 'quick_draw',
    xpReward: 50,
    stardustReward: 30,
  },
  {
    key: 'untouchable',
    xpReward: 75,
    stardustReward: 50,
  },
  {
    key: 'combo_master',
    xpReward: 60,
    stardustReward: 40,
  },
  {
    key: 'star_commander',
    xpReward: 150,
    stardustReward: 100,
  },
  {
    key: 'stardust_collector',
    xpReward: 100,
    stardustReward: 50,
  },
].map((achievement) => ({
  ...achievement,
  ...ACHIEVEMENT_PRESETS[achievement.key],
}));

const challenges = ACTIVE_CHALLENGE_PRESETS;

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    await Achievement.deleteMany({});
    await Challenge.deleteMany({});

    await Achievement.insertMany(achievements);
    console.log(`Seeded ${achievements.length} achievements`);

    await Challenge.insertMany(challenges);
    console.log(`Seeded ${challenges.length} challenges`);

    console.log('Seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seed();
