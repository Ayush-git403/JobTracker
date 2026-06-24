import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role_name: 'applicant' });
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
      const res = await API.post('/auth/register', form);
      login(res.data.user, res.data.token);

      if (res.data.user.role === 'employer') navigate('/employer');
      else navigate('/applicant');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Register</h2>

      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

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
             autoComplete="new-password"
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Register as</label>
          <select
            name="role_name"
            value={form.role_name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="applicant">Applicant</option>
            <option value="employer">Employer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;