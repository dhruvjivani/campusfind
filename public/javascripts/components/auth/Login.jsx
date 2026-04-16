const { useState } = React;

function Login({ onNavigate, onLoginSuccess }) {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStaff = role === 'staff';

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left branding panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-logo">🔍</div>
          <h2>CampusFind Lost &amp; Found</h2>
          <p>Helping the campus community reunite people with their lost belongings since day one.</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span>📦</span>
              <span>Post lost or found items instantly</span>
            </div>
            <div className="auth-feature-item">
              <span>🔎</span>
              <span>Search &amp; filter by category or location</span>
            </div>
            <div className="auth-feature-item">
              <span>✅</span>
              <span>Secure claim verification by staff</span>
            </div>
            <div className="auth-feature-item">
              <span>🏫</span>
              <span>Covers all campus locations</span>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your CampusFind account</p>
          </div>

          {/* Student / Staff tab switch */}
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`auth-role-tab student-tab${role === 'student' ? ' active' : ''}`}
              onClick={() => { setRole('student'); setError(''); }}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className={`auth-role-tab staff-tab${role === 'staff' ? ' active' : ''}`}
              onClick={() => { setRole('staff'); setError(''); }}
            >
              🏛 Staff
            </button>
          </div>

          {isStaff && (
            <div className="staff-note">
              <span>ℹ️</span>
              <span>Staff members use their assigned college email to log in. Contact IT if you need access.</span>
            </div>
          )}

          {error && (
            <div className="alert error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="has-icon"
                  placeholder={isStaff ? 'staff.name@college.on.ca' : 'student.name@college.on.ca'}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="has-icon has-icon-right"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(v => !v)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-submit${isStaff ? ' staff-submit' : ''}`}
            >
              {loading ? '⏳ Signing in...' : (isStaff ? '🏛 Staff Sign In' : '🎓 Student Sign In')}
            </button>
          </form>

          <div className="divider"></div>

          <div className="auth-link-row">
            Don't have an account?{' '}
            <button className="auth-link-btn" onClick={() => onNavigate('register')}>
              Create one here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
