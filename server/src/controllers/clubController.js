// Club controller (the "C" in MVC) for CH2-CH4.
const clubModel = require('../models/clubModel');

const MAX_NAME = 100;
const MAX_DESCRIPTION = 500;

// Read a field from the request body as text (protects against numbers, objects, etc.)
function text(value) {
  return typeof value === 'string' ? value : '';
}

// POST /api/clubs  (CH4: create a club, needs a login token)
async function create(req, res) {
  const name = text(req.body.name).trim();
  const description = text(req.body.description).trim();

  if (!name || !description) {
    return res.status(400).json({ error: 'A club needs a name and a description.' });
  }
  if (name.length > MAX_NAME || description.length > MAX_DESCRIPTION) {
    return res.status(400).json({ error: `Name must be under ${MAX_NAME} characters and description under ${MAX_DESCRIPTION}.` });
  }

  try {
    const club = await clubModel.createClubWithOwner(name, description, req.userId);
    res.status(201).json({ club });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A club with that name already exists.' });
    }
    throw err;
  }
}

module.exports = { create };
