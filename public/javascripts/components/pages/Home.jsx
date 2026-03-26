const { useState, useEffect } = React;

function Home({ onNavigate, user }) {
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0 });
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
      }
    };
    loadStats();
  }, []);

  return (
    <div className="container">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
          Welcome to CampusFind
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#7f8c8d', marginBottom: '2rem' }}>
          Lost something on campus? Help someone find theirs!
        </p>

        {/* Action buttons — differ based on auth state */}
        {user ? (
          <div>
            <button onClick={() => onNavigate('browse')} style={{ marginRight: '1rem' }}>
              Browse Items
            </button>
            <button onClick={() => onNavigate('post')} className="success">
              Post an Item
            </button>
          </div>
        ) : (
          <div>
            <button onClick={() => onNavigate('browse')} style={{ marginRight: '1rem' }}>
              Browse Items
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
          <h3>Search Items</h3>
          <p>Browse all lost and found items. Filter by category, status, or search by keyword.</p>
        </div>
        <div className="card">
          <h3>Post Items</h3>
          <p>Report a lost item or post something you found to reunite it with its owner.</p>
        </div>
        <div className="card">
          <h3>Claim Verification</h3>
          <p>Submit a claim with proof of ownership. Staff verify and approve claims securely.</p>
        </div>
      </div>
    </div>
  );
}
