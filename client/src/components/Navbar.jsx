import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '10px 20px', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
        JobTracker
      </Link>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {!user ? (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
          </>
        ) : (
          <>
            <span style={{ color: '#aaa' }}>Hi, {user.name} ({user.role})</span>
            {user.role === 'employer' && (
              <Link to="/employer" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
            )}
            {user.role === 'applicant' && (
              <Link to="/applicant" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
            )}
            <button onClick={handleLogout} style={{ background: 'red', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;