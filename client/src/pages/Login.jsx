import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);

      // Redirect based on role
      if (res.data.user.role === 'employer') navigate('/employer');
      else if (res.data.user.role === 'applicant') navigate('/applicant');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Login</h2>

      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="off"
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;