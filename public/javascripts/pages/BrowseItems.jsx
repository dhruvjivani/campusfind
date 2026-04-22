/**
 * BrowseItems.jsx — Browse / Search all items  (route: /browse)
 *
 * Features:
 *  • Keyword search + status / category / campus filter dropdowns
 *  • Grid of item cards; each links to /items/:id
 *  • Loading spinner, empty-state, and error alert
 *  • Result count badge
 */

const { useState, useEffect } = React;
const { useHistory, Link }    = ReactRouterDOM;

/**
 * BrowseItems component
 * @param {{ user: object|null }} props
 */
function BrowseItems({ user }) {
  const history = useHistory();

  /* ── State ───────────────────────────────────────────────────────────────── */
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [totalCount, setTotalCount] = useState(0);

  /** Active filter values applied to the API call */
  const [filters, setFilters] = useState({
    status: '', category: '', campus: '', search: '',
  });

  /** Controlled value for the search text input (before submitting) */
  const [searchInput, setSearchInput] = useState('');

  /* Re-fetch whenever filters change */
  useEffect(() => { loadItems(); }, [filters]);

  /** Calls GET /api/items with the current filter params */
  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getItems(filters);
      setItems(response.data || []);
      setTotalCount(response.total || 0);
    } catch {
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /** Updates a single dropdown filter and triggers a re-fetch */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  /** Applies the search text when the form is submitted */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  /** Resets all filters and the search box */
  const handleClearFilters = () => {
    setFilters({ status: '', category: '', campus: '', search: '' });
    setSearchInput('');
  };

  /** True when at least one filter is active */
  const hasFilters = filters.search || filters.status || filters.category || filters.campus;

  /** Returns an emoji for the given item status */
  const statusIcon = (s) => s === 'lost' ? '🔴' : s === 'found' ? '🟢' : '✅';

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="container">

      {/* Page heading */}
      <div className="page-header">
        <h2>Browse Items</h2>
        <p>Search lost and found items across all campus locations.</p>
      </div>

      {/* ── Search & filter panel ─────────────────────────────────────────── */}
      <div className="filters">
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <div className="input-wrapper" style={{ flex: 1 }}>
            <span className="input-icon">🔎</span>
            <input
              type="text" value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or description…"
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
          {/* Status filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="lost">🔴 Lost</option>
              <option value="found">🟢 Found</option>
            </select>
          </div>

          {/* Category filter */}
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

          {/* Campus filter */}
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

      {/* Results count */}
      {!loading && (
        <p className="results-info">
          Showing <strong>{items.length}</strong> of <strong>{totalCount}</strong>{' '}
          item{totalCount !== 1 ? 's' : ''}
          {filters.search && ` matching "${filters.search}"`}
        </p>
      )}

      {/* ── Loading / Empty / Grid ────────────────────────────────────────── */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading items…</p>
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
              {/* Item image (hidden on error) */}
              {item.image_url && (
                <img
                  src={item.image_url} alt={item.title}
                  className="card-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

              <div className="card-header">
                <h3 className="card-title">{item.title}</h3>
                <span className={`badge ${item.status}`}>
                  {statusIcon(item.status)}{' '}
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>

              {/* Truncate long descriptions */}
              <p className="card-description">
                {item.description && item.description.length > 100
                  ? item.description.slice(0, 100) + '…'
                  : item.description}
              </p>

              <div className="card-meta">
                <span className="card-meta-item">🏷 {item.category}</span>
                <span className="card-meta-item">📍 {item.location_found}</span>
                <span className="card-meta-item">🏫 {item.campus}</span>
                <span className="card-meta-item">
                  📅 {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="card-actions">
                {/* React Router Link — no page reload */}
                <Link to={`/items/${item.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{ width: '100%' }}>View Details →</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
