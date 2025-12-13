import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/cv-builder');
    } catch (err) {
      alert('Login gagal: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email" className="border p-2 mb-3 w-full rounded" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" className="border p-2 mb-4 w-full rounded" required />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 w-full rounded hover:bg-green-600">
          Login
        </button>
        <p className="mt-3 text-sm text-center">
          Belum punya akun? <Link to="/register" className="text-blue-500">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
