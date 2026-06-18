import { Link } from "react-router-dom";

function NavigationBar({ user, loggedIn, onLogout }) {
  return (
    <header className="navigation">
      <Link className="title" to="/">
        Last Race
      </Link>

      <nav className="nav-links">
        <Link to="/">Instructions</Link>
        {loggedIn && <Link to="/setup">Play</Link>}
        {loggedIn && <Link to="/ranking">Ranking</Link>}
        {!loggedIn && <Link to="/login">Login</Link>}
      </nav>

      <div className="nav-user">
        {loggedIn && <span>Logged in as {user.username}</span>}
        {loggedIn && (
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default NavigationBar;
