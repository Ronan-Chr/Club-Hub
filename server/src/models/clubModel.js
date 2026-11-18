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

module.exports = { createClubWithOwner };
