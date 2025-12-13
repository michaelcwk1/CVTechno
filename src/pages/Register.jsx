import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { email, password });
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      alert('Gagal daftar: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-semibold mb-4">Register</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email" className="border p-2 mb-3 w-full rounded" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" className="border p-2 mb-4 w-full rounded" required />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full rounded hover:bg-blue-600">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
