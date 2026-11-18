// App: decides which page to show and keeps track of who is logged in.
import { useEffect, useState } from 'react';
import api from './api';
import NavBar from './components/NavBar';
import Login from './pages/Login';

// Placeholder clubs until the directory is connected to the backend (CH2)
const sampleClubs = [
  { name: 'Tech & Innovation Society', description: 'Build projects, talk tech, meet people who code.' },
  { name: 'History Club', description: 'Debates, trivia nights and museum trips.' },
  { name: 'Chess Club', description: 'Weekly games for every skill level.' },
];

function App() {
  const [page, setPage] = useState('home'); // 'home' or 'login'
  const [user, setUser] = useState(null);   // null means nobody is logged in

  // When the page loads, if there's a saved token, ask the server who it belongs to
  useEffect(() => {
    if (localStorage.getItem('token')) {
      api.get('/auth/me')
        .then((response) => setUser(response.data.user))
        .catch(() => localStorage.removeItem('token')); // token expired or invalid
    }
  }, []);

  function handleLoggedIn(loggedInUser) {
    setUser(loggedInUser);
    setPage('home');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
    setPage('home');
  }

  return (
    <>
      <NavBar user={user} onNavigate={setPage} onLogout={handleLogout} />

      <main>
        {page === 'login' ? (
          <Login onLoggedIn={handleLoggedIn} />
        ) : (
          <>
            <section className="home">
              <h1>{user ? `Welcome, ${user.name}` : 'Find your people at Centenary'}</h1>
              <p>Every club on campus in one place. Browse, join, and stay in the loop.</p>
              {!user && (
                <a href="#" className="button" onClick={() => setPage('login')}>Sign up or log in</a>
              )}
            </section>

            <section className="club_grid">
              {sampleClubs.map((club) => (
                <article className="club_card" key={club.name}>
                  <h3>{club.name}</h3>
                  <p>{club.description}</p>
                </article>
              ))}
            </section>
          </>
        )}
      </main>

      <footer>
        <p>Club Hub — a student project by Ronan Christie at Centenary University.</p>
      </footer>
    </>
  );
}

export default App;
