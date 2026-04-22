/**
 * App.jsx — Root component
 *
 * Responsibilities:
 *  • Owns global `user` state and auth helpers
 *  • Sets up React Router BrowserRouter with all application routes
 *  • Provides PrivateRoute (login required) and StaffRoute (staff-only) guards
 *  • Shows a full-screen spinner while the saved JWT is being verified
 */

/* ── Pull in React Router from the CDN global ─────────────────────────────── */
const {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
  useLocation,
} = ReactRouterDOM;

const { useState, useEffect } = React;

/* ─────────────────────────────────────────────────────────────────────────────
   PrivateRoute
   Redirects unauthenticated users to /login, preserving the intended URL so
   they are sent back after a successful login.
───────────────────────────────────────────────────────────────────────────── */
function PrivateRoute({ component: Component, user, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <Component {...props} user={user} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StaffRoute
   Same as PrivateRoute but also verifies the user has the 'staff' role.
───────────────────────────────────────────────────────────────────────────── */
function StaffRoute({ component: Component, user, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        user && user.role === 'staff' ? (
          <Component {...props} user={user} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   App
   Top-level component rendered into #root.
───────────────────────────────────────────────────────────────────────────── */
function App() {
  /** @type {[object|null, Function]} Authenticated user object or null */
  const [user, setUser] = useState(null);

  /** @type {[boolean, Function]} True while verifying a saved JWT token */
  const [authLoading, setAuthLoading] = useState(true);

  /* On mount: if a JWT exists in localStorage, verify it with the server */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserProfile();
    } else {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Fetches the current user's profile using the stored JWT.
   * Clears the token if it is expired or invalid.
   */
  const loadUserProfile = async () => {
    try {
      const response = await apiService.getMyProfile();
      setUser(response.user);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Called by Login / Register after a successful authentication response.
   * @param {object} userData - User object returned from the API
   */
  const handleLoginSuccess = (userData) => setUser(userData);

  /** Clears the JWT and user state, effectively logging out */
  const handleLogout = () => {
    apiService.logout();
    setUser(null);
  };

  /* Show a centred spinner while the JWT is being verified */
  if (authLoading) {
    return (
      <div className="loading" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="spinner"></div>
        <p>Loading CampusFind…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Navbar is always visible; it reads user from props */}
      <Navbar user={user} onLogout={handleLogout} />

      <Switch>
        {/* ── Public routes ─────────────────────────────────────────────── */}
        <Route exact path="/"         render={(p) => <Home        {...p} user={user} />} />
        <Route       path="/browse"   render={(p) => <BrowseItems {...p} user={user} />} />
        <Route       path="/items/:id" render={(p) => <ItemDetail  {...p} user={user} />} />

        {/* Redirect logged-in users away from auth pages */}
        <Route path="/login"    render={(p) => user ? <Redirect to="/" /> : <Login    {...p} onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" render={(p) => user ? <Redirect to="/" /> : <Register {...p} onLoginSuccess={handleLoginSuccess} />} />

        {/* ── Protected routes (login required) ────────────────────────── */}
        <PrivateRoute path="/post"      component={PostItem}  user={user} />
        <PrivateRoute path="/edit/:id"  component={EditItem}  user={user} />
        <PrivateRoute path="/my-claims" component={MyClaims}  user={user} />

        {/* ── Staff-only route ──────────────────────────────────────────── */}
        <StaffRoute path="/staff" component={StaffDashboard} user={user} />

        {/* ── 404 catch-all ────────────────────────────────────────────── */}
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

/* Mount the React application */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
