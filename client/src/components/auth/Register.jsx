import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

/**
 * Register — Create Account page
 * Props: onLoginSuccess(userData)
 */
function Register({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '',
    confirmPassword: '', campus: 'Main Campus', program: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getPasswordStrength = (pw) => {
    if (!pw) return { score: 0, label: '', cls: '', bars: [false, false, false, false] };
    let score = 0;
    if (pw.length >= 6)                        score++;
    if (pw.length >= 10)                       score++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw))              score++;
    const labels  = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const classes = ['', 'weak', 'fair', 'good', 'strong'];
    return { score, label: labels[score], cls: classes[score],
             bars: [score>=1, score>=2, score>=3, score>=4] };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Full name, email, and password are required.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.register({
        email:    formData.email,
        password: formData.password,
        full_name: formData.fullName,
        campus:   formData.campus,
        program:  formData.program || 'Not Specified',
      });
      apiService.setToken(response.token);
      onLoginSuccess(response.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. That email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">

        {/* Left branding panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-logo">🎓</div>
          <h2>Join CampusFind Today</h2>
          <p>Create a free account and help your campus community stay connected to their belongings.</p>
          <div className="auth-features">
            <div className="auth-feature-item"><span>⚡</span><span>Free — takes 30 seconds</span></div>
            <div className="auth-feature-item"><span>🔐</span><span>Secure &amp; private by design</span></div>
            <div className="auth-feature-item"><span>📬</span><span>Track your claims in real time</span></div>
            <div className="auth-feature-item"><span>🏫</span><span>All Conestoga campuses supported</span></div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Student registration — staff accounts are managed by IT</p>
          </div>

          {error && <div className="alert error"><span>⚠️</span> {error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Full Name <span className="required-star">*</span></label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text" name="fullName"
                  value={formData.fullName} onChange={handleChange}
                  required autoComplete="name" className="has-icon"
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <div className="form-group">
              <label>College Email <span className="required-star">*</span></label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  required autoComplete="email" className="has-icon"
                  placeholder="jane.smith@college.on.ca"
                />
              </div>
              {formData.email.endsWith('.on.ca') && (
                <p style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: 4 }}>
                  ✅ College email — account will be auto-verified
                </p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Campus</label>
                <select name="campus" value={formData.campus} onChange={handleChange}>
                  <option value="Main Campus">Main Campus</option>
                  <option value="Waterloo">Waterloo</option>
                  <option value="Cambridge">Cambridge</option>
                </select>
              </div>
              <div className="form-group">
                <label>Program</label>
                <input
                  type="text" name="program"
                  value={formData.program} onChange={handleChange}
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password <span className="required-star">*</span></label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password} onChange={handleChange}
                  required minLength="6" autoComplete="new-password"
                  className="has-icon has-icon-right"
                  placeholder="At least 6 characters"
                />
                <button type="button" className="input-icon-right"
                  onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  {strength.bars.map((filled, i) => (
                    <div key={i} className={`strength-bar${filled ? ' ' + strength.cls : ''}`} />
                  ))}
                  <span className="strength-label">{strength.label}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password <span className="required-star">*</span></label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange}
                  required autoComplete="new-password"
                  className="has-icon has-icon-right"
                  placeholder="Re-enter your password"
                />
                <button type="button" className="input-icon-right"
                  onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: 4 }}>❌ Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 6 && (
                <p style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: 4 }}>✅ Passwords match</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? '⏳ Creating account…' : '🎓 Create Student Account'}
            </button>
          </form>

          <div className="divider"></div>

          <div className="auth-link-row">
            Already have an account?{' '}
            <button className="auth-link-btn" onClick={() => navigate('/login')}>
              Sign in here
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Are you staff? Contact your IT administrator for account access.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;
