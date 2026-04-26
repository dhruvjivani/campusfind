import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';

/**
 * EditItem — Edit / Update an existing item (route: /edit/:id)
 * Protected route — login required.
 * Props: user (object)
 */
function EditItem({ user }) {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '', description: '', category: '',
    status: 'found', location_found: '', campus: 'Main Campus',
  });
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await apiService.getItemById(id);
        const item = res.data;

        if (item.user_id !== user.id) {
          setNotAllowed(true);
          return;
        }

        setFormData({
          title:          item.title          || '',
          description:    item.description    || '',
          category:       item.category       || '',
          status:         item.status         || 'found',
          location_found: item.location_found || '',
          campus:         item.campus         || 'Main Campus',
        });
      } catch {
        setError('Could not load item. It may have been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.category || !formData.location_found) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      await apiService.updateItem(id, formData);
      setSuccess('Item updated successfully! Redirecting…');
      setTimeout(() => navigate(`/items/${id}`), 1500);
    } catch (err) {
      setError(err.message || 'Failed to update item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading"><div className="spinner"></div><p>Loading item…</p></div>
      </div>
    );
  }

  if (notAllowed) {
    return (
      <div className="container">
        <div className="alert error">⛔ You can only edit your own items.</div>
        <Link to="/browse"><button className="btn-secondary">← Back to Browse</button></Link>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="container">
        <div className="alert error">⚠️ {error}</div>
        <Link to="/browse"><button className="btn-secondary">← Back to Browse</button></Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-container">
        <div style={{ marginBottom: 24 }}>
          <Link to={`/items/${id}`} style={{ textDecoration: 'none' }}>
            <button className="btn-secondary btn-sm" style={{ marginBottom: 12 }}>← Back to Item</button>
          </Link>
          <h2>✏️ Edit Item</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Update the details for your listing.
          </p>
        </div>

        {error   && <div className="alert error">⚠️ {error}</div>}
        {success && <div className="alert success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Status toggle */}
          <div className="form-group">
            <label>Status <span className="required-star">*</span></label>
            <div className="auth-role-tabs" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`auth-role-tab${formData.status === 'lost' ? ' active student-tab' : ''}`}
                onClick={() => setFormData(p => ({ ...p, status: 'lost' }))}
              >🔴 Lost</button>
              <button
                type="button"
                className={`auth-role-tab${formData.status === 'found' ? ' active staff-tab' : ''}`}
                onClick={() => setFormData(p => ({ ...p, status: 'found' }))}
              >🟢 Found</button>
            </div>
          </div>

          <div className="form-group">
            <label>Item Name <span className="required-star">*</span></label>
            <input type="text" name="title"
              value={formData.title} onChange={handleChange}
              required placeholder="e.g., Blue JanSport Backpack" />
          </div>

          <div className="form-group">
            <label>Description <span className="required-star">*</span></label>
            <textarea name="description"
              value={formData.description} onChange={handleChange}
              required placeholder="Colour, size, brand, identifying marks…" />
          </div>

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

          <div className="form-group">
            <label>Location <span className="required-star">*</span></label>
            <div className="input-wrapper">
              <span className="input-icon">📍</span>
              <input type="text" name="location_found"
                value={formData.location_found} onChange={handleChange}
                required className="has-icon"
                placeholder="e.g., Library 2nd Floor, Cafeteria, Parking Lot B" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-submit" style={{ marginTop: 8 }}>
            {saving ? '⏳ Saving…' : '💾 Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditItem;
