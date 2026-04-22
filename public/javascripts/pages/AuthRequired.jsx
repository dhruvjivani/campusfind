/**
 * AuthRequired.jsx — Fallback page for unauthenticated access attempts
 *
 * This component is only used for pages that aren't covered by PrivateRoute
 * (e.g., direct component usage). The main protection is in App.jsx via
 * PrivateRoute which redirects to /login automatically.
 */

const { Link } = ReactRouterDOM;

/**
 * AuthRequired component
 * @param {{ message?: string }} props - Optional custom message
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
