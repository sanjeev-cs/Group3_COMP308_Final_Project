const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const INTERNAL_EMAIL_DOMAIN = 'player.local';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildUsernameLookup = (username) => new RegExp(`^${escapeRegExp(username.trim())}$`, 'i');

export const buildInternalEmail = (username) => `${username.trim().toLowerCase()}@${INTERNAL_EMAIL_DOMAIN}`;

export const assertValidPassword = (password) => {
  if (!PASSWORD_POLICY.test(password)) {
    throw new Error('Password must be at least 8 characters and include a lowercase letter, uppercase letter, number, and special character.');
  }
};
