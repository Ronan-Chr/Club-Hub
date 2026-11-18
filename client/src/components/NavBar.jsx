// Top navigation bar. Shows "Log In" or the user's name depending on login state.
function NavBar({ user, onNavigate, onLogout }) {
  return (
    <header>
      <nav>
        <a href="#" onClick={() => onNavigate('home')}><strong>Club Hub</strong></a>
        <a href="#" onClick={() => onNavigate('home')}>Directory</a>
        {user ? (
          <>
            <span className="nav_user">Hi, {user.name}</span>
            <a href="#" onClick={onLogout}>Log Out</a>
          </>
        ) : (
          <a href="#" onClick={() => onNavigate('login')}>Log In</a>
        )}
      </nav>
    </header>
  );
}

export default NavBar;
