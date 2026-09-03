import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { REDIRECT_BASE } from '../api';

function Unlock() {
  const { shortCode } = useParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${REDIRECT_BASE}/verify/${shortCode}`, { password });
      window.location.href = res.data.originalUrl;
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Protected Link</h1>
      <p>This link is password-protected. Enter the password to continue.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Unlock'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Unlock;
