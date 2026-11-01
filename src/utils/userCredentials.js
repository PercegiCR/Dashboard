const ITERATIONS = 310000;
const KEY_LENGTH = 256;
const HASH_ALGORITHM = 'SHA-256';

const toBase64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromBase64 = (value) => Uint8Array.from(atob(value), char => char.charCodeAt(0));

export const hashUserPassword = async (password, salt = null) => {
  const saltBytes = salt ? fromBase64(salt) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: ITERATIONS, hash: HASH_ALGORITHM }, key, KEY_LENGTH);
  return { passwordHash: toBase64(bits), passwordSalt: toBase64(saltBytes), passwordIterations: ITERATIONS };
};

export const verifyUserPassword = async (password, user) => {
  if (!user?.passwordHash || !user?.passwordSalt) return false;
  const result = await hashUserPassword(password, user.passwordSalt);
  const expected = fromBase64(user.passwordHash);
  const actual = fromBase64(result.passwordHash);
  if (expected.length !== actual.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) mismatch |= expected[index] ^ actual[index];
  return mismatch === 0;
};
