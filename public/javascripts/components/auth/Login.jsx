/**
 * Login.jsx — Authentication: Sign In
 *
 * Features:
 *  • Student / Staff tab switcher (same API endpoint; visual UX cue)
 *  • Show / hide password toggle
 *  • Redirects back to the page the user originally tried to visit
 *    (via React Router location.state.from)
 *
 * Props:
 *   onLoginSuccess {Function} — called with the user object after login
 */

const { useState } = React;
const { useHistory, useLocation } = ReactRouterDOM;

/**
 * Login component
 * @param {{ onLoginSuccess: Function }} props
 */
function Login({ onLoginSuccess }) {
  const history  = useHistory();
  const location = useLocation();

  /* After login, send the user where they originally wanted to go */
  const { from } = location.state || { from: { pathname: '/' } };

  /* ── State ───────────────────────────────────────────────────────────────── */
  const [role,         setRole]         = useState('student'); // 'student' | 'staff'
  const [formData,     setFormData]     = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  /* Generic change handler */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Submits credentials to POST /api/auth/login
   * Stores the returned JWT and calls onLoginSuccess.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login(formData);
      apiService.setToken(response.token);
      onLoginSuccess(response.user);
      history.replace(from); // go back to the intended page
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStaff = role === 'staff';

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="auth-page">
      <div className="auth-split">

        {/* ── Left branding panel ──────────────────────────────────────────── */}
        <div className="auth-brand-panel">
          <div className="auth-brand-logo">🔍</div>
          <h2>CampusFind Lost &amp; Found</h2>
          <p>Helping the campus community reunite people with their lost belongings.</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span>📦</span><span>Post lost or found items instantly</span>
            </div>
            <div className="auth-feature-item">
              <span>🔎</span><span>Search &amp; filter by category or location</span>
            </div>
            <div className="auth-feature-item">
              <span>✅</span><span>Secure claim verification by staff</span>
            </div>
            <div className="auth-feature-item">
              <span>🏫</span><span>All campus locations supported</span>
            </div>
          </div>
        </div>

        {/* ── Right form panel ─────────────────────────────────────────────── */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your CampusFind account</p>
          </div>

          {/* Student / Staff tab selector */}
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`auth-role-tab student-tab${role === 'student' ? ' active' : ''}`}
              onClick={() => { setRole('student'); setError(''); }}
            >🎓 Student</button>
            <button
              type="button"
              className={`auth-role-tab staff-tab${role === 'staff' ? ' active' : ''}`}
              onClick={() => { setRole('staff'); setError(''); }}
            >🏛 Staff</button>
          </div>

          {/* Staff note */}
          {isStaff && (
            <div className="staff-note">
              <span>ℹ️</span>
              <span>Staff use their assigned college email. Contact IT for access issues.</span>
            </div>
          )}

          {/* Error alert */}
          {error && <div className="alert error"><span>⚠️</span> {error}</div>}

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="form-group">
              <label>Email address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  required autoComplete="email" className="has-icon"
                  placeholder={isStaff ? 'staff.name@college.on.ca' : 'student.name@college.on.ca'}
                />
              </div>
            </div>

            {/* Password with show/hide toggle */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password} onChange={handleChange}
                  required autoComplete="current-password"
                  className="has-icon has-icon-right"
                  placeholder="Enter your password"
                />
                <button
                  type="button" className="input-icon-right"
                  onClick={() => setShowPassword(v => !v)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >{showPassword ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className={`btn-submit${isStaff ? ' staff-submit' : ''}`}
            >
              {loading ? '⏳ Signing in…' : isStaff ? '🏛 Staff Sign In' : '🎓 Student Sign In'}
            </button>
          </form>

          <div className="divider"></div>

          <div className="auth-link-row">
            Don't have an account?{' '}
            <button className="auth-link-btn" onClick={() => history.push('/register')}>
              Create one here
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
