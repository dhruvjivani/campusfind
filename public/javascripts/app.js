// ============================================================
// CampusFind - React SPA
// Sprint 2: React Basics, State Management, Forms
// ============================================================

// Destructure React hooks at the top (React 18 via CDN)
const { useState, useEffect } = React;

// ============================================================
// NAVBAR COMPONENT
// Props: user (object|null), onLogout (fn), onNavigate (fn)
// Conditionally renders links based on auth state
// ============================================================
function Navbar({ user, onLogout, onNavigate }) {
  return (
    <nav>
      <div className="nav-content">
        <h1 onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
          🎓 CampusFind
        </h1>
        <ul className="nav-links">
          {/* Show different nav links based on whether user is logged in */}
          {user ? (
            <>
              <button onClick={() => onNavigate('browse')}>🔍 Browse</button>
              <button onClick={() => onNavigate('post')}>📝 Post Item</button>
              <button onClick={() => onNavigate('myclaims')}>📋 My Claims</button>
              <button onClick={onLogout}>🚪 Logout</button>
              <span className="user-info">👤 {user.email}</span>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate('browse')}>🔍 Browse</button>
              <button onClick={() => onNavigate('login')}>Login</button>
              <button onClick={() => onNavigate('register')}>Register</button>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

// ============================================================
// LOGIN COMPONENT
// Controlled form using useState
// Calls apiService.login() on submit, stores JWT token
// ============================================================
function Login({ onNavigate, onLoginSuccess }) {
  // State for form fields
  const [formData, setFormData] = useState({ email: '', password: '' });
  // State for error message and loading indicator
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generic change handler — updates matching key in formData
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form submit handler — async API call with error handling
  const handleSubmit = async (e) => {
    e.preventDefault();   // prevent page reload
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(formData);
      apiService.setToken(response.token);   // persist JWT in localStorage
      onLoginSuccess(response.user);
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>🔐 Login to CampusFind</h2>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@college.on.ca"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-link">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('register')}>Register here</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REGISTER COMPONENT
// Controlled form with client-side password match validation
// ============================================================
function Register({ onNavigate, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation before hitting the API
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
      });
      apiService.setToken(response.token);
      onLoginSuccess(response.user);
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>📝 Create an Account</h2>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@college.on.ca"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password (min 6 characters)"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your password"
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div className="auth-link">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')}>Login here</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HOME COMPONENT
// Landing page — shows live item stats and quick-action buttons
// Uses useEffect to fetch stats on mount
// ============================================================
function Home({ onNavigate, user }) {
  // State to hold item counts fetched from the API
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0 });

  // useEffect runs once on mount to load stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [allRes, lostRes, foundRes] = await Promise.all([
          apiService.getItems({}),
          apiService.getItems({ status: 'lost' }),
          apiService.getItems({ status: 'found' }),
        ]);
        setStats({
          total: allRes.total || 0,
          lost: lostRes.total || 0,
          found: foundRes.total || 0,
        });
      } catch (err) {
        // Stats are non-critical — fail silently
      }
    };
    loadStats();
  }, []);

  return (
    <div className="container">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
          🎓 Welcome to CampusFind
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#7f8c8d', marginBottom: '2rem' }}>
          Lost something on campus? Help someone find theirs!
        </p>

        {/* Action buttons — differ based on auth state */}
        {user ? (
          <div>
            <button onClick={() => onNavigate('browse')} style={{ marginRight: '1rem' }}>
              🔍 Browse Items
            </button>
            <button onClick={() => onNavigate('post')} className="success">
              📝 Post an Item
            </button>
          </div>
        ) : (
          <div>
            <button onClick={() => onNavigate('browse')} style={{ marginRight: '1rem' }}>
              🔍 Browse Items
            </button>
            <button onClick={() => onNavigate('login')} style={{ marginRight: '1rem' }}>
              Login
            </button>
            <button onClick={() => onNavigate('register')} className="success">
              Register
            </button>
          </div>
        )}
      </div>

      {/* Live Stats */}
      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#3498db' }}>{stats.total}</h2>
          <p style={{ color: '#7f8c8d' }}>Total Items Listed</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#e74c3c' }}>{stats.lost}</h2>
          <p style={{ color: '#7f8c8d' }}>Items Reported Lost</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#27ae60' }}>{stats.found}</h2>
          <p style={{ color: '#7f8c8d' }}>Items Found & Listed</p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid">
        <div className="card">
          <h3>🔍 Search Items</h3>
          <p>Browse all lost and found items. Filter by category, status, or search by keyword.</p>
        </div>
        <div className="card">
          <h3>📝 Post Items</h3>
          <p>Report a lost item or post something you found to reunite it with its owner.</p>
        </div>
        <div className="card">
          <h3>✅ Claim Verification</h3>
          <p>Submit a claim with proof of ownership. Staff verify and approve claims securely.</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BROWSE ITEMS COMPONENT
// Fetches items from API with filters + keyword search
// useEffect re-runs whenever filters change (reactive)
// ============================================================
function BrowseItems({ onNavigate, user }) {
  const [items, setItems] = useState([]);       // array of item objects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Filter state — each key maps to a query param in the API
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  });

  // Temporary search input value (only applied on submit)
  const [searchInput, setSearchInput] = useState('');

  // Re-fetch whenever filters change
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

  // Dropdown filter change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply keyword search on form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  // Clear all filters and search
  const handleClearFilters = () => {
    setFilters({ status: '', category: '', search: '' });
    setSearchInput('');
  };

  return (
    <div className="container">
      <h2>🔍 Browse Items</h2>

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
                <img src={item.image_url} alt={item.title} className="card-image" />
              )}
              <div className="card-header">
                <h3 className="card-title">{item.title}</h3>
                <span className={`badge ${item.status}`}>
                  {item.status === 'lost' ? '❌ Lost' : item.status === 'found' ? '✅ Found' : '📦 Claimed'}
                </span>
              </div>
              <p className="card-description">{item.description}</p>
              <div className="card-meta">
                <span>📁 {item.category}</span>
                <span>📍 {item.location_found}</span>
                <span>📅 {new Date(item.created_at).toLocaleDateString()}</span>
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

// ============================================================
// ITEM DETAIL COMPONENT
// Fetches a single item by ID — shows full details + claim button
// ============================================================
function ItemDetail({ itemId, onNavigate, user }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');

  // Fetch item on mount or when itemId changes
  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getItemById(itemId);
      setItem(response.data);
    } catch (err) {
      setError('Could not load item. It may have been removed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading"><div className="spinner"></div><p>Loading...</p></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container">
        <div className="alert error">{error || 'Item not found.'}</div>
        <button onClick={() => onNavigate('browse')}>← Back to Browse</button>
      </div>
    );
  }

  return (
    <div className="container">
      <button onClick={() => onNavigate('browse')} className="secondary" style={{ marginBottom: '1.5rem' }}>
        ← Back to Browse
      </button>

      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
          />
        )}
        <div className="card-header">
          <h2 className="card-title">{item.title}</h2>
          <span className={`badge ${item.status}`}>
            {item.status === 'lost' ? '❌ Lost' : item.status === 'found' ? '✅ Found' : '📦 Claimed'}
          </span>
        </div>

        <p style={{ marginBottom: '1.5rem', color: '#555' }}>{item.description}</p>

        <div className="card-meta" style={{ marginBottom: '1.5rem' }}>
          <span>📁 <strong>Category:</strong> {item.category}</span>
          <span>📍 <strong>Location:</strong> {item.location_found}</span>
          <span>🏫 <strong>Campus:</strong> {item.campus}</span>
          <span>📅 <strong>Posted:</strong> {new Date(item.created_at).toLocaleDateString()}</span>
          {item.first_name && (
            <span>👤 <strong>By:</strong> {item.first_name} {item.last_name}</span>
          )}
        </div>

        {claimSuccess && <div className="alert success">{claimSuccess}</div>}

        {/* Claim button — only shown when appropriate */}
        {user && item.status !== 'claimed' && item.user_id !== user.id && (
          <button onClick={() => setShowClaimForm(true)} className="success">
            📋 Claim This Item
          </button>
        )}
        {!user && (
          <div className="alert info">
            <button onClick={() => onNavigate('login')}
              style={{ background: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'inherit', border: 'none', padding: 0 }}>
              Login
            </button>{' '}to claim this item.
          </div>
        )}
        {item.status === 'claimed' && (
          <div className="alert info">This item has already been claimed.</div>
        )}
      </div>

      {/* Claim modal rendered on top when triggered */}
      {showClaimForm && (
        <ClaimItem
          itemId={itemId}
          onClose={() => setShowClaimForm(false)}
          onClaimSuccess={() => {
            setShowClaimForm(false);
            setClaimSuccess('Claim submitted successfully! We will review it shortly.');
            loadItem();   // refresh item status
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// POST ITEM COMPONENT
// Controlled form — posts to /api/items/found or /api/items/lost
// based on the status dropdown selection
// ============================================================
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
      // apiService.createItem routes to /items/found or /items/lost based on status
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
        <h2>📝 Post an Item</h2>
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
            {loading ? 'Posting...' : '📤 Post Item'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// CLAIM ITEM MODAL COMPONENT
// Overlay modal — submits a claim for a specific item
// ============================================================
function ClaimItem({ itemId, onClose, onClaimSuccess }) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.createClaim({
        item_id: itemId,
        verification_notes: notes,
      });
      if (onClaimSuccess) onClaimSuccess(response.data);
    } catch (err) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000,
    }}>
      <div className="form-container" style={{ maxWidth: '500px', width: '90%', margin: 0 }}>
        <h2>📋 Submit a Claim</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
          Describe why you believe this item is yours. Include serial numbers, initials, or other identifying details.
        </p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Proof of Ownership *</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              rows="5"
              placeholder="e.g., Serial number: ABC123, initials 'DJ' on the inside tag, bought it from Staples last September..."
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
            <button type="button" onClick={onClose} className="secondary" style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// MY CLAIMS COMPONENT
// Fetches the logged-in user's submitted claims from the API
// ============================================================
function MyClaims({ onNavigate }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load claims on mount
  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    setError('');
    try {
      // GET /api/claims/user/my-claims — returns claims for the logged-in user
      const response = await apiService.getMyClaims();
      setClaims(response.data || []);
    } catch (err) {
      setError('Failed to load claims. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Map claim status to badge CSS class
  const getStatusClass = (status) => {
    const map = { pending: 'pending', verified: 'found', rejected: 'lost', completed: 'claimed' };
    return map[status] || 'pending';
  };

  return (
    <div className="container">
      <h2>📋 My Claims</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
        Track the status of items you have claimed.
      </p>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading"><div className="spinner"></div><p>Loading your claims...</p></div>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          <p>You haven't submitted any claims yet.</p>
          <button onClick={() => onNavigate('browse')} style={{ marginTop: '1rem' }}>
            Browse Items to Claim
          </button>
        </div>
      ) : (
        <div className="grid">
          {claims.map(claim => (
            <div key={claim.id} className="card">
              {claim.item_image && (
                <img src={claim.item_image} alt={claim.item_title} className="card-image" />
              )}
              <div className="card-header">
                <h3 className="card-title">{claim.item_title || 'Item'}</h3>
                <span className={`badge ${getStatusClass(claim.status)}`}>
                  {claim.status.toUpperCase()}
                </span>
              </div>
              {claim.verification_notes && (
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Your notes:</strong> {claim.verification_notes}
                </p>
              )}
              <div className="card-meta">
                <span>📅 Submitted: {new Date(claim.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// AUTH REQUIRED — shown when a page needs login
// ============================================================
function AuthRequired({ onNavigate }) {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="alert info">
        You must be logged in to access this page.{' '}
        <button
          onClick={() => onNavigate('login')}
          style={{ background: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'inherit', border: 'none', padding: 0 }}>
          Click here to login
        </button>
      </div>
    </div>
  );
}

// ============================================================
// APP (ROOT COMPONENT)
// Manages global state: current page, logged-in user
// Acts as the router — renders the right component based on currentPage
// ============================================================
function App() {
  const [currentPage, setCurrentPage] = useState('home');  // active "route"
  const [user, setUser] = useState(null);                   // logged-in user or null
  const [selectedItemId, setSelectedItemId] = useState(null);

  // On first load — check if a JWT token exists and restore session
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserProfile();
    }
  }, []);

  // Fetch user profile using stored JWT token
  const loadUserProfile = async () => {
    try {
      const response = await apiService.getMyProfile();  // GET /api/auth/me
      setUser(response.user);
    } catch (err) {
      // Token invalid or expired — clear it
      localStorage.removeItem('token');
    }
  };

  // Navigation handler — updates currentPage state (no page reloads)
  const handleNavigate = (page, itemId = null) => {
    setCurrentPage(page);
    if (itemId) setSelectedItemId(itemId);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    apiService.logout();   // clears token from localStorage
    setUser(null);
    setCurrentPage('home');
  };

  // Route switcher — renders the matching component for currentPage
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} user={user} />;
      case 'login':
        return user ? <Home onNavigate={handleNavigate} user={user} /> : <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case 'register':
        return user ? <Home onNavigate={handleNavigate} user={user} /> : <Register onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case 'browse':
        return <BrowseItems onNavigate={handleNavigate} user={user} />;
      case 'itemdetail':
        return <ItemDetail itemId={selectedItemId} onNavigate={handleNavigate} user={user} />;
      case 'post':
        return user ? <PostItem onNavigate={handleNavigate} /> : <AuthRequired onNavigate={handleNavigate} />;
      case 'myclaims':
        return user ? <MyClaims onNavigate={handleNavigate} /> : <AuthRequired onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} user={user} />;
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
      <div>{renderPage()}</div>
    </>
  );
}

// Mount the React app into the #root div
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
