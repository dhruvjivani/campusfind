function Navbar({ user, onLogout, onNavigate }) {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <nav>
      <div className="nav-content">
        <h1 onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
          CampusFind
        </h1>
        <ul className="nav-links">
          {user ? (
            <>
              <button onClick={() => onNavigate('browse')}>Browse Items</button>
              <button onClick={() => onNavigate('post')}>Post Item</button>
              <button onClick={() => onNavigate('myclaims')}>My Claims</button>
              <button onClick={handleLogout}>Logout</button>
              <span className="user-info">{user.email}</span>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate('browse')}>Browse</button>
              <button onClick={() => onNavigate('login')}>Login</button>
              <button onClick={() => onNavigate('register')}>Register</button>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
