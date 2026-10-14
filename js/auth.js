const USERS_KEY = 'inventrack_users';
const SESSION_KEY = 'inventrack_session';
const ADMIN_USERNAME = 'Joel .Pauth25';
const ADMIN_PASSWORD = 'root2100@';
const PASSWORD_ITERATIONS = 150000;

function readUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored === null) return [];

  const users = JSON.parse(stored);
  if (!Array.isArray(users)) {
    throw new TypeError('Los usuarios guardados no tienen un formato válido.');
  }

  return users;
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeUsername(username) {
  return username.trim().toLocaleLowerCase();
}

function normalizeEmail(email) {
  return email.trim().toLocaleLowerCase();
}

function encodeBase64(bytes) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

async function derivePassword(password, salt) {
  if (!window.crypto?.subtle) {
    throw new Error('Este navegador no permite proteger contraseñas. Usa HTTPS o un servidor local seguro.');
  }

  const key = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PASSWORD_ITERATIONS },
    key,
    256
  );
  return encodeBase64(new Uint8Array(bits));
}

async function createPasswordRecord(password) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  return {
    passwordSalt: encodeBase64(salt),
    passwordHash: await derivePassword(password, salt)
  };
}

async function passwordMatches(user, password) {
  const salt = Uint8Array.from(atob(user.passwordSalt), character => character.charCodeAt(0));
  return (await derivePassword(password, salt)) === user.passwordHash;
}

export function validatePassword(password) {
  if (!/\p{Lu}/u.test(password)) {
    throw new Error('La contraseña debe incluir al menos una letra mayúscula.');
  }
  if (!/\d/.test(password)) {
    throw new Error('La contraseña debe incluir al menos un número.');
  }
  if (!/[^\p{L}\p{N}\s]/u.test(password)) {
    throw new Error('La contraseña debe incluir al menos un carácter especial.');
  }
}

export async function ensureAdminUser() {
  const users = readUsers();
  if (users.some(user => user.role === 'admin')) return;

  const existingUser = users.find(
    user => normalizeUsername(user.username) === normalizeUsername(ADMIN_USERNAME)
  );
  const admin = {
    ...(existingUser || {}),
    id: existingUser?.id || 'admin-default',
    username: ADMIN_USERNAME,
    email: existingUser?.email || '',
    role: 'admin',
    ...await createPasswordRecord(ADMIN_PASSWORD)
  };

  if (existingUser) {
    users[users.indexOf(existingUser)] = admin;
  } else {
    users.push(admin);
  }
  writeUsers(users);
}

export async function authenticateUser(username, password) {
  const user = readUsers().find(
    entry => normalizeUsername(entry.username) === normalizeUsername(username)
  );
  if (!user || !(await passwordMatches(user, password))) {
    throw new Error('Usuario o contraseña incorrectos.');
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify({
    userId: user.id,
    issuedAt: Date.now()
  }));
}

export async function registerUser({ username, email, password }) {
  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = normalizeEmail(email);
  if (!username.trim()) throw new Error('Ingresa un nombre de usuario.');
  validatePassword(password);

  const users = readUsers();
  if (users.some(user => normalizeUsername(user.username) === normalizedUsername)) {
    throw new Error('Ese nombre de usuario ya está registrado.');
  }
  if (users.some(user => user.email && normalizeEmail(user.email) === normalizedEmail)) {
    throw new Error('Ese correo electrónico ya está registrado.');
  }

  const user = {
    id: window.crypto.randomUUID(),
    username: username.trim(),
    email: email.trim(),
    role: 'user',
    ...await createPasswordRecord(password)
  };
  writeUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    userId: user.id,
    issuedAt: Date.now()
  }));
}

export async function resetPassword(identity, password) {
  validatePassword(password);
  const normalizedIdentity = identity.trim().toLocaleLowerCase();
  const users = readUsers();
  const user = users.find(entry =>
    normalizeUsername(entry.username) === normalizedIdentity
    || (entry.email && normalizeEmail(entry.email) === normalizedIdentity)
  );

  if (!user) throw new Error('No se encontró una cuenta con ese usuario o correo.');

  Object.assign(user, await createPasswordRecord(password));
  writeUsers(users);
}
