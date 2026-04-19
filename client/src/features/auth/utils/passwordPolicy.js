const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_RULE_TEXT = 'Password must be at least 8 characters and include a lowercase letter, uppercase letter, number, and special character.';

export const isValidPassword = (password) => PASSWORD_POLICY.test(password);
