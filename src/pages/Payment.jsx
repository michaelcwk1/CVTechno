import React, { useState } from 'react';
import axios from 'axios';

const Payment = () => {
  const [plan, setPlan] = useState('monthly');

  const handlePay = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:5000/api/payment/create', { plan }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.REACT_APP_MIDTRANS_CLIENT_KEY);
      document.body.appendChild(script);

      script.onload = () => {
        window.snap.pay(res.data.token, {
          onSuccess: () => alert('Pembayaran sukses! Subscription aktif.'),
          onPending: () => alert('Pembayaran pending.'),
          onError: () => alert('Pembayaran gagal.'),
        });
      };
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Pilih Paket Subscription</h2>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className="border p-2 mb-4 w-full rounded">
          <option value="monthly">1 Bulan - Rp 30.000</option>
          <option value="semiannual">6 Bulan - Rp 150.000</option>
          <option value="annual">1 Tahun - Rp 250.000</option>
        </select>
        <button onClick={handlePay} className="bg-blue-500 text-white px-4 py-2 w-full rounded hover:bg-blue-600">
          Bayar Sekarang
        </button>
      </div>
    </div>
  );
};

export default Payment;
