// Club page for CH2: one club's description and member list.
import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api';

function ClubPage({ clubId, onBack }) {
  const [club, setClub] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/clubs/${clubId}`)
      .then((response) => setClub(response.data.club))
      .catch((err) => setError(getErrorMessage(err))); // e.g. "Club not found."
  }, [clubId]);

  return (
    <section className="home">
      <a href="#" className="switch_link" onClick={onBack}>← Back to directory</a>

      {error && <p className="error">{error}</p>}
      {!club && !error && <p>Loading...</p>}

      {club && (
        <>
          <h1>{club.name}</h1>
          <p>{club.description}</p>

          <h3>Members ({club.members.length})</h3>
          <ul className="member_list">
            {club.members.map((member) => (
              <li key={member.id}>
                {member.name}
                {member.role !== 'member' && <span className="role"> {member.role}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default ClubPage;
