import { NavLink, useNavigate } from 'react-router-dom';

/**
 * Navbar — global navigation bar
 * Props: user (object|null), onLogout (Function)
 */
function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout();
      navigate('/');
    }
  };

  const isStaff = user && user.role === 'staff';

  // NavLink receives isActive from react-router-dom v6
  const navStyle = ({ isActive }) =>
    isActive ? { color: '#fff', background: 'rgba(255,255,255,0.12)' } : undefined;

  return (
    <nav>
      <div className="nav-content">

        {/* Brand / Logo */}
        <NavLink to="/" end style={{ textDecoration: 'none' }}>
          <div className="nav-brand">
            <div className="nav-brand-icon">🔍</div>
            <h1>CampusFind</h1>
          </div>
        </NavLink>

        {/* Navigation links */}
        <ul className="nav-links">
          {user ? (
            <>
              <li>
                <NavLink to="/browse" style={navStyle}>
                  <button className="nav-btn">Browse Items</button>
                </NavLink>
              </li>
              <li>
                <NavLink to="/post" style={navStyle}>
                  <button className="nav-btn">+ Post Item</button>
                </NavLink>
              </li>

              {!isStaff && (
                <li>
                  <NavLink to="/my-claims" style={navStyle}>
                    <button className="nav-btn">My Claims</button>
                  </NavLink>
                </li>
              )}

              {isStaff && (
                <li>
                  <NavLink to="/staff" style={navStyle}>
                    <button
                      className="nav-btn"
                      style={{ background: 'rgba(124,58,237,0.25)', color: '#c4b5fd' }}
                    >
                      🏛 Staff Panel
                    </button>
                  </NavLink>
                </li>
              )}

              <li>
                <div className="nav-user-info">
                  <span>{user.first_name || user.email.split('@')[0]}</span>
                  <span className={`nav-role-badge ${user.role || 'student'}`}>
                    {isStaff ? '🏛 Staff' : '🎓 Student'}
                  </span>
                </div>
              </li>

              <li>
                <button className="nav-btn nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/browse" style={navStyle}>
                  <button className="nav-btn">Browse</button>
                </NavLink>
              </li>
              <li>
                <NavLink to="/login" style={navStyle}>
                  <button className="nav-btn">Login</button>
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" style={navStyle}>
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

export default Navbar;
