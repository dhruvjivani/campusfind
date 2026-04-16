function Navbar({ user, onLogout, onNavigate }) {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout();
    }
  };

  const isStaff = user && user.role === 'staff';

  return (
    <nav>
      <div className="nav-content">
        {/* Brand */}
        <div className="nav-brand" onClick={() => onNavigate('home')}>
          <div className="nav-brand-icon">🔍</div>
          <h1>CampusFind</h1>
        </div>

        {/* Links */}
        <ul className="nav-links">
          {user ? (
            <>
              <li>
                <button className="nav-btn" onClick={() => onNavigate('browse')}>
                  Browse Items
                </button>
              </li>
              <li>
                <button className="nav-btn" onClick={() => onNavigate('post')}>
                  + Post Item
                </button>
              </li>
              {!isStaff && (
                <li>
                  <button className="nav-btn" onClick={() => onNavigate('myclaims')}>
                    My Claims
                  </button>
                </li>
              )}
              {isStaff && (
                <li>
                  <button className="nav-btn btn-staff" onClick={() => onNavigate('staffdashboard')}
                    style={{ background: 'rgba(124,58,237,0.25)', color: '#c4b5fd' }}>
                    🏛 Staff Panel
                  </button>
                </li>
              )}
              <li>
                <div className="nav-user-info">
                  <span>{user.first_name || user.email.split('@')[0]}</span>
                  <span className={`nav-role-badge ${user.role || 'student'}`}>
                    {user.role === 'staff' ? '🏛 Staff' : '🎓 Student'}
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
                <button className="nav-btn" onClick={() => onNavigate('browse')}>
                  Browse
                </button>
              </li>
              <li>
                <button className="nav-btn" onClick={() => onNavigate('login')}>
                  Login
                </button>
              </li>
              <li>
                <button className="nav-btn nav-cta" onClick={() => onNavigate('register')}>
                  Register
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
