import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<h1 style={{ padding: '20px' }}>Welcome to JobTracker</h1>} />
          <Route path="/login" element={<h1 style={{ padding: '20px' }}>Login Page Coming Soon</h1>} />
          <Route path="/register" element={<h1 style={{ padding: '20px' }}>Register Page Coming Soon</h1>} />
          <Route path="/unauthorized" element={<h1 style={{ padding: '20px' }}>Unauthorized Access</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;