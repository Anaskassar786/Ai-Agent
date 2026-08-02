import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('profit_token', data.token);
      localStorage.setItem('profit_refresh_token', data.refreshToken);
      localStorage.setItem('store_id', data.user.storeId);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLogin();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      justifyContent:'center',
      alignItems:'center'
    }}>

      <div>
        <h1>
          Profit Tool AI
        </h1>

        <input
          placeholder="Merchant Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && (
          <p>{error}</p>
        )}

      </div>

    </div>
  );
}
