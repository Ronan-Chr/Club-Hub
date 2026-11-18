// Club model (the "M" in MVC). All the SQL for clubs and memberships lives here.
const pool = require('../db/pool');

// CH4: create a club and make the creator its owner.
// Both inserts run in one transaction, so we never end up with a club that has no owner.
async function createClubWithOwner(name, description, ownerId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO clubs (name, description) VALUES ($1, $2) RETURNING id, name, description',
      [name, description]
    );
    const club = result.rows[0];
    await client.query(
      "INSERT INTO memberships (user_id, club_id, role) VALUES ($1, $2, 'owner')",
      [ownerId, club.id]
    );
    await client.query('COMMIT');
    return club;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// CH2: every club for the directory, with how many members each has (A to Z)
async function listClubs() {
  const result = await pool.query(
    `SELECT c.id, c.name, c.description, COUNT(m.user_id)::int AS member_count
     FROM clubs c
     LEFT JOIN memberships m ON m.club_id = c.id
     GROUP BY c.id
     ORDER BY c.name`
  );
  return result.rows;
}

// CH2: one club and its member list (owner first, then by name)
async function getClub(id) {
  const clubResult = await pool.query('SELECT id, name, description FROM clubs WHERE id = $1', [id]);
  const club = clubResult.rows[0];
  if (!club) {
    return undefined;
  }

  const membersResult = await pool.query(
    `SELECT u.id, u.name, m.role
     FROM memberships m
     JOIN users u ON u.id = m.user_id
     WHERE m.club_id = $1
     ORDER BY (m.role = 'owner') DESC, u.name`,
    [id]
  );
  return { ...club, members: membersResult.rows };
}

// CH3: join a club as a regular member.
// The (user_id, club_id) primary key stops someone joining the same club twice.
async function joinClub(userId, clubId) {
  await pool.query(
    "INSERT INTO memberships (user_id, club_id, role) VALUES ($1, $2, 'member')",
    [userId, clubId]
  );
}

// CH3: leave a club
async function leaveClub(userId, clubId) {
  await pool.query('DELETE FROM memberships WHERE user_id = $1 AND club_id = $2', [userId, clubId]);
}

// CH3: the user's role in a club ('owner', 'officer', 'member'), or undefined if they aren't in it
async function getRole(userId, clubId) {
  const result = await pool.query(
    'SELECT role FROM memberships WHERE user_id = $1 AND club_id = $2',
    [userId, clubId]
  );
  return result.rows[0]?.role;
}

// CH3: ids of every club the user is in, so the directory can mark them as joined
async function listMyClubIds(userId) {
  const result = await pool.query('SELECT club_id FROM memberships WHERE user_id = $1', [userId]);
  return result.rows.map((row) => row.club_id);
}

module.exports = { createClubWithOwner, listClubs, getClub, joinClub, leaveClub, getRole, listMyClubIds };
