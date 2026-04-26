import { Link } from 'react-router-dom';

/**
 * AuthRequired — fallback page for unauthenticated access attempts
 * Props: message (string, optional)
 */
function AuthRequired({ message }) {
  return (
    <div className="container">
      <div className="auth-required">
        <span className="auth-required-icon">🔐</span>
        <h3>Login Required</h3>
        <p>{message || 'You need to be logged in to access this page.'}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button>Sign In</button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary">Create Account</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthRequired;
