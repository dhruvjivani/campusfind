const { useState, useEffect } = React;

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
    if (itemId) setSelectedItemId(itemId);
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

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
