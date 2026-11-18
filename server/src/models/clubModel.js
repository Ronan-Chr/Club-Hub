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

module.exports = { createClubWithOwner, listClubs, getClub };
