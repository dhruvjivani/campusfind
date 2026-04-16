const { useState, useEffect } = React;

function BrowseItems({ onNavigate, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({ status: '', category: '', campus: '', search: '' });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => { loadItems(); }, [filters]);

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getItems(filters);
      setItems(response.data || []);
      setTotalCount(response.total || 0);
    } catch (err) {
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleClearFilters = () => {
    setFilters({ status: '', category: '', campus: '', search: '' });
    setSearchInput('');
  };

  const hasFilters = filters.search || filters.status || filters.category || filters.campus;

  const statusIcon = (s) => s === 'lost' ? '🔴' : s === 'found' ? '🟢' : '✅';

  return (
    <div className="container">
      <div className="page-header">
        <h2>Browse Items</h2>
        <p>Search lost and found items across all campus locations.</p>
      </div>

      {/* Search & Filters */}
      <div className="filters">
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <div className="input-wrapper" style={{ flex: 1 }}>
            <span className="input-icon">🔎</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or description..."
              className="has-icon"
            />
          </div>
          <button type="submit">Search</button>
          {hasFilters && (
            <button type="button" className="btn-secondary" onClick={handleClearFilters}>
              Clear
            </button>
          )}
        </form>

        <div className="filters-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="lost">🔴 Lost</option>
              <option value="found">🟢 Found</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Campus</label>
            <select name="campus" value={filters.campus} onChange={handleFilterChange}>
              <option value="">All Campuses</option>
              <option value="Main Campus">Main Campus</option>
              <option value="Waterloo">Waterloo</option>
              <option value="Cambridge">Cambridge</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="alert error">⚠️ {error}</div>}

      {!loading && (
        <p className="results-info">
          Showing <strong>{items.length}</strong> of <strong>{totalCount}</strong> item{totalCount !== 1 ? 's' : ''}
          {filters.search && ` matching "${filters.search}"`}
        </p>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📭</span>
          <h3>No items found</h3>
          <p>Try adjusting your filters or search terms.</p>
          <button onClick={handleClearFilters}>Clear Filters</button>
        </div>
      ) : (
        <div className="grid">
          {items.map(item => (
            <div key={item.id} className="card">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="card-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="card-header">
                <h3 className="card-title">{item.title}</h3>
                <span className={`badge ${item.status}`}>
                  {statusIcon(item.status)} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
              <p className="card-description">
                {item.description && item.description.length > 100
                  ? item.description.slice(0, 100) + '…'
                  : item.description}
              </p>
              <div className="card-meta">
                <span className="card-meta-item">🏷 {item.category}</span>
                <span className="card-meta-item">📍 {item.location_found}</span>
                <span className="card-meta-item">🏫 {item.campus}</span>
                <span className="card-meta-item">📅 {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <div className="card-actions">
                <button onClick={() => onNavigate('itemdetail', item.id)}>
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
