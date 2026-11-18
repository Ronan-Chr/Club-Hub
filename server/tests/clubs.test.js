// CH2, CH3 and CH4 tests: listing clubs, opening a club page, joining/leaving and creating a club.
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
  jest.clearAllMocks(); // forget calls from earlier tests
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

// CH2: club directory and club page
const chess = { id: 1, name: 'Chess Club', description: 'Weekly games for every skill level.' };

describe('GET /api/clubs', () => {
  test('lists every club with its member count, no login needed', async () => {
    clubModel.listClubs.mockResolvedValue([{ ...chess, member_count: 2 }]);
    const res = await request(app).get('/api/clubs');
    expect(res.status).toBe(200);
    expect(res.body.clubs).toHaveLength(1);
    expect(res.body.clubs[0].member_count).toBe(2);
  });
});

describe('GET /api/clubs/:id', () => {
  test('shows the club description and member list', async () => {
    clubModel.getClub.mockResolvedValue({ ...chess, members: [{ id: 1, name: 'Ronan', role: 'owner' }] });
    const res = await request(app).get('/api/clubs/1');
    expect(res.status).toBe(200);
    expect(res.body.club.description).toBe(chess.description);
    expect(res.body.club.members[0].role).toBe('owner');
  });

  test('returns 404 for a club that does not exist', async () => {
    clubModel.getClub.mockResolvedValue(undefined);
    const res = await request(app).get('/api/clubs/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Club not found.');
  });

  test('returns 400 for an id that is not a number', async () => {
    const res = await request(app).get('/api/clubs/abc');
    expect(res.status).toBe(400);
    expect(clubModel.getClub).not.toHaveBeenCalled();
  });
});

// CH3: join and leave
const auth = { Authorization: `Bearer ${token}` };

describe('POST /api/clubs/:id/join', () => {
  test('joins a club as a member (201)', async () => {
    const res = await request(app).post('/api/clubs/1/join').set(auth);
    expect(res.status).toBe(201);
    expect(clubModel.joinClub).toHaveBeenCalledWith(1, 1);
  });

  test('requires a login (401)', async () => {
    const res = await request(app).post('/api/clubs/1/join');
    expect(res.status).toBe(401);
  });

  test('rejects joining the same club twice (409)', async () => {
    clubModel.joinClub.mockRejectedValueOnce(Object.assign(new Error('duplicate'), { code: '23505' }));
    const res = await request(app).post('/api/clubs/1/join').set(auth);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('You are already in this club.');
  });

  test('returns 404 for a club that does not exist', async () => {
    clubModel.joinClub.mockRejectedValueOnce(Object.assign(new Error('no club'), { code: '23503' }));
    const res = await request(app).post('/api/clubs/999/join').set(auth);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/clubs/:id/leave', () => {
  test('a member can leave', async () => {
    clubModel.getRole.mockResolvedValue('member');
    const res = await request(app).post('/api/clubs/1/leave').set(auth);
    expect(res.status).toBe(200);
    expect(clubModel.leaveClub).toHaveBeenCalledWith(1, 1);
  });

  test('the owner cannot leave their own club (400)', async () => {
    clubModel.getRole.mockResolvedValue('owner');
    const res = await request(app).post('/api/clubs/1/leave').set(auth);
    expect(res.status).toBe(400);
    expect(clubModel.leaveClub).not.toHaveBeenCalled();
  });

  test('returns 404 if you are not in the club', async () => {
    clubModel.getRole.mockResolvedValue(undefined);
    const res = await request(app).post('/api/clubs/1/leave').set(auth);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/me/clubs', () => {
  test('lists the ids of the clubs I am in', async () => {
    clubModel.listMyClubIds.mockResolvedValue([1, 3]);
    const res = await request(app).get('/api/me/clubs').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.clubIds).toEqual([1, 3]);
  });
});
