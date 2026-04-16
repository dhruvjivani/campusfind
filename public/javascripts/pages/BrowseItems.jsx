const { useState, useEffect } = React;

function BrowseItems({ onNavigate, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  });

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    loadItems();
  }, [filters]);

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
    setFilters({ status: '', category: '', search: '' });
    setSearchInput('');
  };

  return (
    <div className="container">
      <h2>Browse Items</h2>

      {/* Search and Filter Panel */}
      <div className="filters">
        {/* Keyword Search */}
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or description..."
            style={{ flex: 1 }}
          />
          <button type="submit">Search</button>
          {(filters.search || filters.status || filters.category) && (
            <button type="button" onClick={handleClearFilters} className="secondary">
              Clear
            </button>
          )}
        </form>

        {/* Dropdown Filters */}
        <div className="filters-grid">
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
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
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* Results count */}
      {!loading && (
        <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
          Showing {items.length} of {totalCount} item(s)
          {filters.search && ` matching "${filters.search}"`}
        </p>
      )}

      {/* Loading / Empty / Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>No items found. Try adjusting your filters.</p>
          <button onClick={handleClearFilters} style={{ marginTop: '1rem' }}>
            Clear Filters
          </button>
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
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="card-header">
                <h3 className="card-title">{item.title}</h3>
                <span className={`badge ${item.status}`}>
                  {item.status === 'lost' ? 'Lost' : item.status === 'found' ? 'Found' : 'Claimed'}
                </span>
              </div>
              <p className="card-description">{item.description}</p>
              <div className="card-meta">
                <span>Category: {item.category}</span>
                <span>Location: {item.location_found}</span>
                <span>Posted: {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <div className="card-actions">
                <button onClick={() => onNavigate('itemdetail', item.id)}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
