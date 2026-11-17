// App: the page layout (header, home section, club cards, footer).
// The clubs below are placeholders until the directory is connected to the backend.
const sampleClubs = [
  { name: 'Tech & Innovation Society', description: 'Build projects, talk tech, meet people who code.' },
  { name: 'History Club', description: 'Debates, trivia nights and museum trips.' },
  { name: 'Chess Club', description: 'Weekly games for every skill level.' },
];

function App() {
  return (
    <>
      <header>
        <nav>
          <a href="#"><strong>Club Hub</strong></a>
          <a href="#">Directory</a>
          <a href="#">Create Club</a>
          <a href="#">Log In</a>
        </nav>
      </header>

      <main>
        <section className="home">
          <h1>Find your people at Centenary</h1>
          <p>Every club on campus in one place. Browse, join, and stay in the loop.</p>
          <a href="#" className="button">Browse clubs</a>
        </section>

        <section className="club_grid">
          {sampleClubs.map((club) => (
            <article className="club_card" key={club.name}>
              <h3>{club.name}</h3>
              <p>{club.description}</p>
            </article>
          ))}
        </section>
      </main>

      <footer>
        <p>Club Hub — a student project by Ronan Christie at Centenary University.</p>
      </footer>
    </>
  );
}

export default App;
