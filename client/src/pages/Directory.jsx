// Club directory for CH2 and CH3: every club from the database, with a search box.
// Clubs you've joined get a "Joined" tag.
import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api';

function Directory({ user, onOpenClub }) {
  const [clubs, setClubs] = useState([]);
  const [myClubIds, setMyClubIds] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load the clubs once when the page opens
  useEffect(() => {
    api.get('/clubs')
      .then((response) => setClubs(response.data.clubs))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // CH3: if logged in, find out which clubs I'm already in
  useEffect(() => {
    if (user) {
      api.get('/me/clubs').then((response) => setMyClubIds(response.data.clubIds));
    } else {
      setMyClubIds([]);
    }
  }, [user]);

  // Only show clubs whose name or description matches the search
  const term = search.trim().toLowerCase();
  const shownClubs = clubs.filter(
    (club) => club.name.toLowerCase().includes(term) || club.description.toLowerCase().includes(term)
  );

  return (
    <>
      <section className="home">
        <h1>Club Directory</h1>
        <p>Every club on campus in one place. Click a club to see who's in it.</p>
        <input
          className="search"
          placeholder="Search clubs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {error && <p className="error page_message">{error}</p>}
      {loading && <p className="page_message">Loading clubs...</p>}
      {!loading && !error && shownClubs.length === 0 && (
        <p className="page_message">No clubs found.</p>
      )}

      <section className="club_grid">
        {shownClubs.map((club) => (
          <article className="club_card clickable" key={club.id} onClick={() => onOpenClub(club.id)}>
            <h3>
              {club.name}
              {myClubIds.includes(club.id) && <span className="joined">Joined</span>}
            </h3>
            <p>{club.description}</p>
            <p className="member_count">
              {club.member_count} {club.member_count === 1 ? 'member' : 'members'}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}

export default Directory;
