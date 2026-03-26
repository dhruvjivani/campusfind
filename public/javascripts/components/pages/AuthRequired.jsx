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
