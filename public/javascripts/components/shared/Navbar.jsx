/**
 * Navbar.jsx — Global navigation bar
 *
 * Uses React Router's <NavLink> for accessible, active-state-aware links so
 * no full page reloads occur when the user navigates between sections.
 *
 * Props:
 *   user     {object|null} — authenticated user or null
 *   onLogout {Function}    — clears auth state in App
 */

const { NavLink, useHistory } = ReactRouterDOM;

/**
 * Navbar component
 * @param {{ user: object|null, onLogout: Function }} props
 */
function Navbar({ user, onLogout }) {
  const history = useHistory(); // programmatic navigation after logout

  /** Confirm logout then redirect to home */
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout();
      history.push('/');
    }
  };

  /** Whether the current user has the staff role */
  const isStaff = user && user.role === 'staff';

  /* Active-link style applied by NavLink when the route matches */
  const activeStyle = { color: '#fff', background: 'rgba(255,255,255,0.12)' };

  return (
    <nav>
      <div className="nav-content">

        {/* ── Brand / Logo ───────────────────────────────────────────────── */}
        <NavLink to="/" exact style={{ textDecoration: 'none' }}>
          <div className="nav-brand">
            <div className="nav-brand-icon">🔍</div>
            <h1>CampusFind</h1>
          </div>
        </NavLink>

        {/* ── Navigation links ───────────────────────────────────────────── */}
        <ul className="nav-links">
          {user ? (
            /* ── Authenticated links ─────────────────────────────────────── */
            <>
              <li>
                <NavLink to="/browse" activeStyle={activeStyle}>
                  <button className="nav-btn">Browse Items</button>
                </NavLink>
              </li>
              <li>
                <NavLink to="/post" activeStyle={activeStyle}>
                  <button className="nav-btn">+ Post Item</button>
                </NavLink>
              </li>

              {/* Students see their own claims; staff manage via the panel */}
              {!isStaff && (
                <li>
                  <NavLink to="/my-claims" activeStyle={activeStyle}>
                    <button className="nav-btn">My Claims</button>
                  </NavLink>
                </li>
              )}

              {/* Staff-only panel link */}
              {isStaff && (
                <li>
                  <NavLink to="/staff" activeStyle={activeStyle}>
                    <button
                      className="nav-btn"
                      style={{ background: 'rgba(124,58,237,0.25)', color: '#c4b5fd' }}
                    >
                      🏛 Staff Panel
                    </button>
                  </NavLink>
                </li>
              )}

              {/* User info chip */}
              <li>
                <div className="nav-user-info">
                  <span>{user.first_name || user.email.split('@')[0]}</span>
                  <span className={`nav-role-badge ${user.role || 'student'}`}>
                    {isStaff ? '🏛 Staff' : '🎓 Student'}
                  </span>
                </div>
              </li>

              {/* Logout */}
              <li>
                <button className="nav-btn nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            /* ── Guest links ─────────────────────────────────────────────── */
            <>
              <li>
                <NavLink to="/browse" activeStyle={activeStyle}>
                  <button className="nav-btn">Browse</button>
                </NavLink>
              </li>
              <li>
                <NavLink to="/login" activeStyle={activeStyle}>
                  <button className="nav-btn">Login</button>
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" activeStyle={activeStyle}>
                  <button className="nav-btn nav-cta">Register</button>
                </NavLink>
              </li>
            </>
          )}
        </ul>

      </div>
    </nav>
  );
}
