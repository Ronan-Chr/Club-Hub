// Club page for CH2 and CH3: one club's description, member list and Join / Leave button.
import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api';

function ClubPage({ clubId, user, onBack, onLogin }) {
  const [club, setClub] = useState(null);
  const [error, setError] = useState('');

  // Load (or reload) the club and its members
  function loadClub() {
    api.get(`/clubs/${clubId}`)
      .then((response) => setClub(response.data.club))
      .catch((err) => setError(getErrorMessage(err))); // e.g. "Club not found."
  }

  useEffect(loadClub, [clubId]);

  // CH3: join or leave, then reload so the member list updates right away
  async function handleJoinOrLeave(action) {
    setError('');
    try {
      await api.post(`/clubs/${clubId}/${action}`);
      loadClub();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // Am I in this club, and with what role?
  const me = user && club ? club.members.find((member) => member.id === user.id) : null;

  return (
    <section className="home">
      <a href="#" className="switch_link" onClick={onBack}>← Back to directory</a>

      {!club && !error && <p>Loading...</p>}

      {club && (
        <>
          <h1>{club.name}</h1>
          <p>{club.description}</p>

          {!user && <button className="button join_button" onClick={onLogin}>Log in to join</button>}
          {user && !me && <button className="button join_button" onClick={() => handleJoinOrLeave('join')}>Join club</button>}
          {me && me.role === 'owner' && <p className="success">You own this club.</p>}
          {me && me.role !== 'owner' && <button className="button join_button" onClick={() => handleJoinOrLeave('leave')}>Leave club</button>}

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

      {error && <p className="error">{error}</p>}
    </section>
  );
}

export default ClubPage;
