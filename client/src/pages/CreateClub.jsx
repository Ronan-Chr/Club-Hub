// Create Club page for CH4. The person who creates the club becomes its owner.
import { useState } from 'react';
import api, { getErrorMessage } from '../api';

function CreateClub() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [createdClub, setCreatedClub] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setCreatedClub(null);
    try {
      const response = await api.post('/clubs', { name, description });
      setCreatedClub(response.data.club);
      setName('');
      setDescription('');
    } catch (err) {
      setError(getErrorMessage(err)); // e.g. "A club with that name already exists."
    }
  }

  return (
    <section className="home">
      <h1>Create a club</h1>

      {createdClub && (
        <p className="success">{createdClub.name} was created and you're the owner.</p>
      )}

      <form className="auth_form" onSubmit={handleSubmit}>
        <input placeholder="Club name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea
          placeholder="Short description of what the club does"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="button">Create club</button>
      </form>
    </section>
  );
}

export default CreateClub;
