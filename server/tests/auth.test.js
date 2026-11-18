// CH1 tests: sign up and log in (success and failure cases).
// The user model is replaced with a fake in-memory version, so the tests
// run fast and never touch the real Render database.
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const bcrypt = require('bcryptjs');

jest.mock('../src/models/userModel');
const userModel = require('../src/models/userModel');
const app = require('../src/app');

// Fake "users table" that the mocked model reads and writes
let users;
beforeEach(() => {
  users = [];
  userModel.findByEmail.mockImplementation(async (email) => users.find((u) => u.email === email));
  userModel.findById.mockImplementation(async (id) => {
    const user = users.find((u) => u.id === id);
    return user && { id: user.id, name: user.name, email: user.email };
  });
  userModel.createUser.mockImplementation(async (name, email, passwordHash) => {
    const user = { id: users.length + 1, name, email, password_hash: passwordHash };
    users.push(user);
    return { id: user.id, name, email };
  });
});

const newUser = { name: 'Ronan', email: 'ronan@test.edu', password: 'password123' };

describe('POST /api/auth/signup', () => {
  test('creates an account and returns a token', async () => {
    const res = await request(app).post('/api/auth/signup').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toEqual({ id: 1, name: 'Ronan', email: 'ronan@test.edu' });
  });

  test('stores a bcrypt hash, never the real password', async () => {
    await request(app).post('/api/auth/signup').send(newUser);
    expect(users[0].password_hash).not.toBe('password123');
    expect(await bcrypt.compare('password123', users[0].password_hash)).toBe(true);
  });

  test('rejects an email that already has an account (409)', async () => {
    await request(app).post('/api/auth/signup').send(newUser);
    const res = await request(app).post('/api/auth/signup').send(newUser);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/);
  });

  test('rejects missing fields, a bad email and a short password (400)', async () => {
    const missing = await request(app).post('/api/auth/signup').send({ email: 'a@b.com' });
    const badEmail = await request(app).post('/api/auth/signup').send({ ...newUser, email: 'not-an-email' });
    const shortPassword = await request(app).post('/api/auth/signup').send({ ...newUser, password: 'short' });
    expect(missing.status).toBe(400);
    expect(badEmail.status).toBe(400);
    expect(shortPassword.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/signup').send(newUser);
  });

  test('logs in with the right email and password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ronan@test.edu', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password_hash).toBeUndefined();
  });

  test('gives the same error for a wrong password and an unknown email (401)', async () => {
    const wrongPassword = await request(app).post('/api/auth/login').send({ email: 'ronan@test.edu', password: 'wrongpass1' });
    const unknownEmail = await request(app).post('/api/auth/login').send({ email: 'nobody@test.edu', password: 'password123' });
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error).toBe(unknownEmail.body.error);
  });
});

describe('GET /api/auth/me', () => {
  test('returns the logged-in user when given a valid token', async () => {
    const signup = await request(app).post('/api/auth/signup').send(newUser);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${signup.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('ronan@test.edu');
  });

  test('rejects a request with no token or a fake token (401)', async () => {
    const noToken = await request(app).get('/api/auth/me');
    const fakeToken = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(noToken.status).toBe(401);
    expect(fakeToken.status).toBe(401);
  });
});
