/**
 * PostItem.jsx — Report a lost or found item  (route: /post)
 *
 * Protected route — user must be logged in (enforced by PrivateRoute in App.jsx).
 *
 * Features:
 *  • Status toggle: "I Lost This" / "I Found This"
 *  • Full item form: name, description, category, campus, location
 *  • Calls POST /api/items/lost or /api/items/found
 *  • Redirects to /browse on success
 */

const { useState } = React;
const { useHistory } = ReactRouterDOM;

/**
 * PostItem component
 * @param {{ user: object }} props - Authenticated user (guaranteed by PrivateRoute)
 */
function PostItem({ user }) {
  const history = useHistory();

  /* ── State ───────────────────────────────────────────────────────────────── */
  const [formData, setFormData] = useState({
    title: '', description: '', category: '',
    status: 'lost', location_found: '', campus: 'Main Campus',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  /* Generic change handler */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Validates and submits the form.
   * Calls POST /api/items/lost or /api/items/found depending on formData.status
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    /* Client-side required-field check */
    if (!formData.title || !formData.description || !formData.category || !formData.location_found) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await apiService.createItem(formData);
      setSuccess('Item posted successfully! Redirecting to browse…');
      /* Reset form */
      setFormData({ title:'', description:'', category:'', status:'lost',
                    location_found:'', campus:'Main Campus' });
      setTimeout(() => history.push('/browse'), 1800);
    } catch (err) {
      setError(err.message || 'Failed to post item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFound = formData.status === 'found';

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="container">
      <div className="form-container">

        {/* Header — changes based on lost vs. found */}
        <div style={{ marginBottom: 24 }}>
          <h2>{isFound ? '📦 Report Found Item' : '🔍 Report Lost Item'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            {isFound
              ? 'Help someone reclaim their belonging by describing what you found.'
              : 'Let the campus community help you locate what you lost.'}
          </p>
        </div>

        {error   && <div className="alert error">⚠️ {error}</div>}
        {success && <div className="alert success">✅ {success}</div>}

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Status toggle ───────────────────────────────────────────── */}
          <div className="form-group">
            <label>What happened? <span className="required-star">*</span></label>
            <div className="auth-role-tabs" style={{ marginBottom: 0 }}>
              <button type="button"
                className={`auth-role-tab${formData.status === 'lost' ? ' active student-tab' : ''}`}
                onClick={() => setFormData(p => ({ ...p, status: 'lost' }))}>
                🔴 I Lost This
              </button>
              <button type="button"
                className={`auth-role-tab${formData.status === 'found' ? ' active staff-tab' : ''}`}
                onClick={() => setFormData(p => ({ ...p, status: 'found' }))}>
                🟢 I Found This
              </button>
            </div>
          </div>

          {/* Item name */}
          <div className="form-group">
            <label>Item Name <span className="required-star">*</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange}
              required placeholder="e.g., Blue JanSport Backpack" />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description <span className="required-star">*</span></label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              required placeholder="Colour, size, brand, identifying marks, contents…" />
          </div>

          {/* Category + Campus */}
          <div className="form-row">
            <div className="form-group">
              <label>Category <span className="required-star">*</span></label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select category</option>
                <option value="electronics">📱 Electronics</option>
                <option value="clothing">👕 Clothing</option>
                <option value="accessories">💍 Accessories</option>
                <option value="textbooks">📚 Textbooks</option>
                <option value="keys">🔑 Keys</option>
                <option value="id_cards">🪪 ID Cards</option>
                <option value="bags">🎒 Bags</option>
                <option value="other">📦 Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Campus</label>
              <select name="campus" value={formData.campus} onChange={handleChange}>
                <option value="Main Campus">Main Campus</option>
                <option value="Waterloo">Waterloo</option>
                <option value="Cambridge">Cambridge</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label>
              {isFound ? 'Where You Found It' : 'Last Known Location'}
              <span className="required-star"> *</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon">📍</span>
              <input type="text" name="location_found"
                value={formData.location_found} onChange={handleChange}
                required className="has-icon"
                placeholder="e.g., Library 2nd Floor, Cafeteria, Parking Lot B" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-submit" style={{ marginTop: 8 }}>
            {loading ? '⏳ Posting…' : isFound ? '📦 Post Found Item' : '🔍 Post Lost Item'}
          </button>
        </form>

      </div>
    </div>
  );
}
