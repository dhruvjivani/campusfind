function AuthRequired({ onNavigate, message }) {
  return (
    <div className="container">
      <div className="auth-required">
        <span className="auth-required-icon">🔐</span>
        <h3>Login Required</h3>
        <p>{message || 'You need to be logged in to access this page.'}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('login')}>
            Sign In
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('register')}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
