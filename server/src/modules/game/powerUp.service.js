import { findUserByIdOrThrow } from '../users/user.service.js';
import { POWER_UPS } from './powerUps.js';

export const purchasePowerUp = async ({ userId, powerUpId }) => {
  const powerUp = POWER_UPS[powerUpId];

  if (!powerUp) {
    throw new Error('Invalid power-up');
  }

  const user = await findUserByIdOrThrow(userId);

  if (user.unlockedPowerUps.includes(powerUpId)) {
    throw new Error('Power-up already owned');
  }

  if (user.stardust < powerUp.cost) {
    throw new Error(`Not enough Stardust. Need ${powerUp.cost}, have ${user.stardust}`);
  }

  user.stardust -= powerUp.cost;
  user.unlockedPowerUps.push(powerUpId);

  await user.save();
  return user;
};
