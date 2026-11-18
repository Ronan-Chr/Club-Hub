// App: decides which page to show and keeps track of who is logged in.
import { useEffect, useState } from 'react';
import api from './api';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import CreateClub from './pages/CreateClub';
import Directory from './pages/Directory';
import ClubPage from './pages/ClubPage';

function App() {
  const [page, setPage] = useState('home'); // 'home', 'login', 'create' or 'club'
  const [openClubId, setOpenClubId] = useState(null); // which club page is open
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

  function openClub(id) {
    setOpenClubId(id);
    setPage('club');
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
        {page === 'login' && <Login onLoggedIn={handleLoggedIn} />}

        {page === 'create' && user && <CreateClub />}

        {page === 'club' && (
          <ClubPage clubId={openClubId} user={user} onBack={() => setPage('home')} onLogin={() => setPage('login')} />
        )}

        {page === 'home' && <Directory user={user} onOpenClub={openClub} />}
      </main>

      <footer>
        <p>Club Hub — a student project by Ronan Christie at Centenary University.</p>
      </footer>
    </>
  );
}

export default App;
