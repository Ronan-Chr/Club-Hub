// CH4 tests: creating a club (success and failure cases).
// The club model is replaced with a fake, so the tests never touch the real database.
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/clubModel');
const clubModel = require('../src/models/clubModel');
const app = require('../src/app');

// A valid login token for user #1
const token = jwt.sign({ userId: 1 }, 'test-secret');

let clubs;
beforeEach(() => {
  clubs = [];
  clubModel.createClubWithOwner.mockImplementation(async (name, description, ownerId) => {
    if (clubs.some((c) => c.name === name)) {
      const err = new Error('duplicate');
      err.code = '23505'; // what PostgreSQL sends for a UNIQUE violation
      throw err;
    }
    const club = { id: clubs.length + 1, name, description, ownerId };
    clubs.push(club);
    return { id: club.id, name, description };
  });
});

const newClub = { name: 'Chess Club', description: 'Weekly games for every skill level.' };

describe('POST /api/clubs', () => {
  test('creates a club and makes the creator the owner', async () => {
    const res = await request(app).post('/api/clubs').set('Authorization', `Bearer ${token}`).send(newClub);
    expect(res.status).toBe(201);
    expect(res.body.club.name).toBe('Chess Club');
    expect(clubs[0].ownerId).toBe(1);
  });

  test('requires a login (401)', async () => {
    const res = await request(app).post('/api/clubs').send(newClub);
    expect(res.status).toBe(401);
  });

  test('rejects a missing name or description (400)', async () => {
    const res = await request(app).post('/api/clubs').set('Authorization', `Bearer ${token}`).send({ name: 'No description' });
    expect(res.status).toBe(400);
  });

  test('rejects a club name that already exists (409)', async () => {
    await request(app).post('/api/clubs').set('Authorization', `Bearer ${token}`).send(newClub);
    const res = await request(app).post('/api/clubs').set('Authorization', `Bearer ${token}`).send(newClub);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/);
  });
});
