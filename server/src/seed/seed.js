import 'dotenv/config';
import mongoose from 'mongoose';
import Achievement from '../models/Achievement.js';
import Challenge from '../models/Challenge.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stellar-smash';

const achievements = [
  {
    key: 'first_contact',
    name: 'First Contact',
    description: 'Complete your first mission',
    icon: '🚀',
    xpReward: 25,
    stardustReward: 15,
  },
  {
    key: 'quick_draw',
    name: 'Lightning Reflexes',
    description: 'Destroy 5 objects in under 2 seconds',
    icon: '⚡',
    xpReward: 50,
    stardustReward: 30,
  },
  {
    key: 'untouchable',
    name: 'Untouchable',
    description: 'Complete a mission without taking any damage',
    icon: '🛡️',
    xpReward: 75,
    stardustReward: 50,
  },
  {
    key: 'combo_master',
    name: 'Combo Master',
    description: 'Reach a 10× combo multiplier in a single mission',
    icon: '🔥',
    xpReward: 60,
    stardustReward: 40,
  },
  {
    key: 'star_commander',
    name: 'Star Commander',
    description: 'Complete all 3 missions',
    icon: '🏆',
    xpReward: 150,
    stardustReward: 100,
  },
  {
    key: 'stardust_collector',
    name: 'Stardust Collector',
    description: 'Earn 500 or more Stardust in total',
    icon: '💎',
    xpReward: 100,
    stardustReward: 50,
  },
];

const challenges = [
  {
    title: 'Asteroid Hunter',
    description: 'Destroy 20 asteroids in a single mission',
    type: 'daily',
    condition: { missionId: null, metric: 'objectsDestroyed', threshold: 20 },
    xpReward: 30,
    stardustReward: 20,
    isActive: true,
  },
  {
    title: 'High Scorer',
    description: 'Score 200 or more points in any mission',
    type: 'daily',
    condition: { missionId: null, metric: 'score', threshold: 200 },
    xpReward: 40,
    stardustReward: 25,
    isActive: true,
  },
  {
    title: 'Combo Starter',
    description: 'Reach a 5× combo in any mission',
    type: 'daily',
    condition: { missionId: null, metric: 'maxCombo', threshold: 5 },
    xpReward: 25,
    stardustReward: 15,
    isActive: true,
  },
  {
    title: 'Marathon Runner',
    description: 'Play 10 games total',
    type: 'weekly',
    condition: { missionId: null, metric: 'gamesPlayed', threshold: 10 },
    xpReward: 80,
    stardustReward: 60,
    isActive: true,
  },
  {
    title: 'Storm Chaser',
    description: 'Score 300+ on Meteor Storm',
    type: 'weekly',
    condition: { missionId: 3, metric: 'score', threshold: 300 },
    xpReward: 100,
    stardustReward: 75,
    isActive: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing seed data
    await Achievement.deleteMany({});
    await Challenge.deleteMany({});

    // Insert achievements
    await Achievement.insertMany(achievements);
    console.log(`✅ Seeded ${achievements.length} achievements`);

    // Insert challenges
    await Challenge.insertMany(challenges);
    console.log(`✅ Seeded ${challenges.length} challenges`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seed();
