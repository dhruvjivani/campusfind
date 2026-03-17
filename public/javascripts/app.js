// Main React App with all components

const { useState, useEffect } = React;

// ===== NAVBAR COMPONENT =====
function Navbar({ user, onLogout, onNavigate }) {
  return (
    <nav>
      <div className="nav-content">
        <h1 onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
          🎓 CampusFind
        </h1>
        <ul className="nav-links">
          {user ? (
            <>
              <button onClick={() => onNavigate('browse')}>🔍 Browse Items</button>
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

// ===== LOGIN COMPONENT =====
function Login({ onNavigate, onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(formData);
      apiService.setToken(response.token);
      onLoginSuccess(response.user);
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'Login failed');
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
          <button onClick={() => onNavigate('register')}>
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== REGISTER COMPONENT =====
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
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>📝 Register for CampusFind</h2>
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
              placeholder="Create a password"
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
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="auth-link">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')}>
            Login here
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== HOME COMPONENT =====
function Home({ onNavigate, user }) {
  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
          🎓 Welcome to CampusFind
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#7f8c8d', marginBottom: '2rem' }}>
          Lost something on campus? Help someone find theirs!
        </p>
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

      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3>🔍 Search Items</h3>
          <p>Browse all lost and found items on campus. Filter by category, location, or status.</p>
        </div>
        <div className="card">
          <h3>📝 Post Items</h3>
          <p>Report a lost item or post a found item to help reunite belongings with their owners.</p>
        </div>
        <div className="card">
          <h3>✅ Claim Verification</h3>
          <p>Our secure claim and verification system ensures items reach their rightful owners.</p>
        </div>
      </div>
    </div>
  );
}

// ===== BROWSE ITEMS COMPONENT =====
function BrowseItems({ onNavigate, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  });

  useEffect(() => {
    loadItems();
  }, [filters]);

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getItems(filters);
      setItems(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container">
      <h2>🔍 Browse Items</h2>

      <div className="filters">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
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

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>No items found matching your filters.</p>
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

// ===== ITEM DETAIL COMPONENT =====
function ItemDetail({ itemId, onNavigate, user }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading item...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container">
        <div className="alert error">{error || 'Item not found'}</div>
        <button onClick={() => onNavigate('browse')}>← Back to Browse</button>
      </div>
    );
  }

  return (
    <div className="container">
      <button onClick={() => onNavigate('browse')} className="secondary" style={{ marginBottom: '1rem' }}>
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

        <p style={{ marginBottom: '1rem' }}>{item.description}</p>

        <div className="card-meta" style={{ marginBottom: '1.5rem' }}>
          <span>📁 Category: {item.category}</span>
          <span>📍 Location: {item.location_found}</span>
          <span>🏫 Campus: {item.campus}</span>
          <span>📅 Date: {new Date(item.created_at).toLocaleDateString()}</span>
          {item.first_name && (
            <span>👤 Posted by: {item.first_name} {item.last_name}</span>
          )}
        </div>

        {user && item.status !== 'claimed' && item.user_id !== user.id && (
          <button onClick={() => setShowClaimForm(true)} className="success">
            📋 Claim This Item
          </button>
        )}

        {!user && (
          <div className="alert info">
            <button
              onClick={() => onNavigate('login')}
              style={{ background: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'inherit', border: 'none', padding: 0 }}>
              Login
            </button>
            {' '}to claim this item.
          </div>
        )}

        {item.status === 'claimed' && (
          <div className="alert info">This item has already been claimed.</div>
        )}
      </div>

      {showClaimForm && (
        <ClaimItem
          itemId={itemId}
          onClose={() => setShowClaimForm(false)}
          onClaimSuccess={() => {
            setShowClaimForm(false);
            loadItem();
          }}
        />
      )}
    </div>
  );
}

// ===== POST ITEM COMPONENT =====
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
      setSuccess('Item posted successfully!');
      setFormData({
        title: '',
        description: '',
        category: '',
        status: 'lost',
        location_found: '',
        campus: 'Main Campus',
      });
      setTimeout(() => onNavigate('browse'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>📝 Post an Item</h2>

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
              placeholder="e.g., Blue Backpack"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the item in detail..."
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
              placeholder="e.g., Library, Building A, Campus East"
            />
          </div>

          <div className="form-group">
            <label>Campus</label>
            <input
              type="text"
              name="campus"
              value={formData.campus}
              onChange={handleChange}
              placeholder="e.g., Main Campus"
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Posting...' : 'Post Item'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ===== CLAIM ITEM COMPONENT (MODAL) =====
function ClaimItem({ itemId, onClose, onClaimSuccess }) {
  const [formData, setFormData] = useState({
    verification_notes: '',
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
    setLoading(true);

    try {
      const response = await apiService.createClaim({
        item_id: itemId,
        ...formData,
      });
      if (onClaimSuccess) onClaimSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div className="form-container" style={{ maxWidth: '500px', width: '90%' }}>
        <h2>📋 Claim This Item</h2>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Describe why this item is yours *</label>
            <textarea
              name="verification_notes"
              value={formData.verification_notes}
              onChange={handleChange}
              required
              placeholder="Describe distinctive features, serial numbers, initials, where you last had it, etc."
              rows="4"
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

// ===== MY CLAIMS COMPONENT =====
function MyClaims({ onNavigate }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getMyClaims();
      setClaims(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const map = {
      pending: 'pending',
      verified: 'found',
      rejected: 'lost',
      completed: 'claimed',
    };
    return map[status] || 'pending';
  };

  return (
    <div className="container">
      <h2>📋 My Claims</h2>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your claims...</p>
        </div>
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
                <div>
                  <h3 className="card-title">{claim.item_title || 'Item'}</h3>
                </div>
                <span className={`badge ${getStatusClass(claim.status)}`}>
                  {claim.status.toUpperCase()}
                </span>
              </div>
              {claim.verification_notes && (
                <p><strong>Notes:</strong> {claim.verification_notes}</p>
              )}
              <div className="card-meta">
                <span>📅 {new Date(claim.created_at).toLocaleDateString()}</span>
                <span>📊 Status: {claim.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== MAIN APP COMPONENT =====
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await apiService.getMyProfile();
      setUser(response.user);
    } catch (err) {
      localStorage.removeItem('token');
    }
  };

  const handleNavigate = (page, itemId = null) => {
    setCurrentPage(page);
    if (itemId) {
      setSelectedItemId(itemId);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} user={user} />;
      case 'login':
        return user
          ? <Home onNavigate={handleNavigate} user={user} />
          : <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case 'register':
        return user
          ? <Home onNavigate={handleNavigate} user={user} />
          : <Register onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case 'browse':
        return <BrowseItems onNavigate={handleNavigate} user={user} />;
      case 'itemdetail':
        return <ItemDetail itemId={selectedItemId} onNavigate={handleNavigate} user={user} />;
      case 'post':
        return user
          ? <PostItem onNavigate={handleNavigate} />
          : <AuthRequired onNavigate={handleNavigate} />;
      case 'myclaims':
        return user
          ? <MyClaims onNavigate={handleNavigate} />
          : <AuthRequired onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} user={user} />;
    }
  };

  return (
    <>
      <Navbar
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      <div>
        {renderPage()}
      </div>
    </>
  );
}

// ===== AUTH REQUIRED HELPER =====
function AuthRequired({ onNavigate }) {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="alert info">
        Please login to access this feature.{' '}
        <button
          onClick={() => onNavigate('login')}
          style={{
            background: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: '0.5rem',
            color: 'inherit',
            border: 'none',
            padding: 0,
          }}>
          Click here to login
        </button>
      </div>
    </div>
  );
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
