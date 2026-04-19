import { calculateLevel } from '../game/gameLogic.js';
import { assertValidPassword, buildInternalEmail, buildUsernameLookup } from './authCredentials.js';
import { AVATAR_OPTIONS } from './avatarOptions.js';
import { generateToken } from './tokenService.js';
import User from './user.model.js';

export const DEFAULT_AVATAR = AVATAR_OPTIONS[0];

const sanitizeUser = (user) => {
  const userObject = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete userObject.passwordHash;

  return {
    ...userObject,
    id: userObject.id || userObject._id?.toString(),
  };
};

const assertValidAvatar = (avatar) => {
  if (avatar !== undefined && avatar !== null && !AVATAR_OPTIONS.includes(avatar)) {
    throw new Error('Invalid avatar selection');
  }
};

export const findUserByIdOrThrow = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const applyRewardsToUser = (user, { xp = 0, stardust = 0 } = {}) => {
  user.xp += xp;
  user.stardust += stardust;
  user.level = Math.max(user.level, calculateLevel(user.xp));
  return user;
};

export const registerUser = async ({ username, password, avatar }) => {
  const trimmedUsername = username.trim();
  const internalEmail = buildInternalEmail(trimmedUsername);

  assertValidPassword(password);
  assertValidAvatar(avatar);

  const existingUser = await User.findOne({
    $or: [{ email: internalEmail }, { username: buildUsernameLookup(trimmedUsername) }],
  });

  if (existingUser) {
    throw new Error('Username already taken');
  }

  const user = new User({
    username: trimmedUsername,
    email: internalEmail,
    passwordHash: password,
    avatar: avatar || DEFAULT_AVATAR,
  });

  await user.save();

  return {
    token: generateToken(user),
    user: sanitizeUser(user),
  };
};

export const loginUser = async ({ username, password }) => {
  const user = await User.findOne({ username: buildUsernameLookup(username) });

  if (!user) {
    throw new Error('Invalid username or password');
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) {
    throw new Error('Invalid username or password');
  }

  return {
    token: generateToken(user),
    user: sanitizeUser(user),
  };
};

export const updateUserProfile = async ({ userId, input }) => {
  const { avatar, currentPassword, newPassword } = input;
  const user = await findUserByIdOrThrow(userId);

  if (avatar !== undefined) {
    assertValidAvatar(avatar);
    user.avatar = avatar;
  }

  if (newPassword) {
    if (!currentPassword) {
      throw new Error('Current password is required to set a new password');
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    assertValidPassword(newPassword);
    user.passwordHash = newPassword;
  }

  await user.save();
  return user;
};
