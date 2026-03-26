const { useState } = React;

function PostItem({ onNavigate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'lost',
    location_found: '',
    campus: 'Main Campus',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiService.createItem(formData);
      setSuccess('Item posted successfully! Redirecting to browse...');
      setFormData({ title: '', description: '', category: '', status: 'lost', location_found: '', campus: 'Main Campus' });
      setTimeout(() => onNavigate('browse'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to post item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Post an Item</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
          Report something you lost or found on campus.
        </p>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Blue JanSport Backpack"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the item — colour, size, identifying marks..."
            ></textarea>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="textbooks">Textbooks</option>
              <option value="keys">Keys</option>
              <option value="id_cards">ID Cards</option>
              <option value="bags">Bags</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status *</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="lost">I Lost This Item</option>
              <option value="found">I Found This Item</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location_found"
              value={formData.location_found}
              onChange={handleChange}
              required
              placeholder="e.g., Library 2nd Floor, Parking Lot B"
            />
          </div>

          <div className="form-group">
            <label>Campus</label>
            <select name="campus" value={formData.campus} onChange={handleChange}>
              <option value="Main Campus">Main Campus</option>
              <option value="Waterloo">Waterloo</option>
              <option value="Cambridge">Cambridge</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Posting...' : 'Post Item'}
          </button>
        </form>
      </div>
    </div>
  );
}
