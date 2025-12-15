import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Printer } from 'lucide-react';
import { CVData } from '@/lib/types';
import { toast } from 'sonner';

interface DownloadOptionsProps {
  cvData: CVData;
}

export default function DownloadOptions({ cvData }: DownloadOptionsProps) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const orderIdRef = useRef<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling saat unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const generateHtmlContent = () => {
    const el = document.querySelector('#cv-preview') as HTMLElement;
    if (!el) throw new Error('CV preview not found');

    return `
<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>CV</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body style="display:flex;justify-content:center;">
  <div style="max-width:794px;width:100%;padding:20px;">
    ${el.outerHTML}
  </div>
</body>
</html>`;
  };

  // Simpan order ke localStorage (karena serverless function stateless)
  const saveOrderToLocalStorage = (orderId: string, orderData: any) => {
    try {
      const orders = JSON.parse(localStorage.getItem('cv_orders') || '{}');
      orders[orderId] = {
        ...orderData,
        createdAt: Date.now()
      };
      localStorage.setItem('cv_orders', JSON.stringify(orders));
      console.log('💾 Order saved to localStorage:', orderId);
    } catch (e) {
      console.warn('localStorage not available');
    }
  };

  // Cek order dari localStorage
  const getOrderFromLocalStorage = (orderId: string) => {
    try {
      const orders = JSON.parse(localStorage.getItem('cv_orders') || '{}');
      return orders[orderId] || null;
    } catch (e) {
      return null;
    }
  };

  // Polling status pembayaran
  const checkPaymentStatus = async (orderId: string) => {
    try {
      const res = await fetch(`/api/payment/status?orderId=${orderId}`);
      const data = await res.json();

      console.log('📊 Payment status:', data);

      if (data.paid || data.status === 'success') {
        console.log('✅ Payment confirmed!');
        if (pollingRef.current) clearInterval(pollingRef.current);
        setPaid(true);
        setCheckingPayment(false);
        setLoading(false);
        toast.success('Pembayaran berhasil! Download dimulai...');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Status check error:', err);
      return false;
    }
  };

  // Start payment flow
  const startPayment = async (onSuccess: () => void) => {
    if (loading) return;

    try {
      setLoading(true);
      setCheckingPayment(true);

      // 1. Hit init endpoint
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000,
          name: cvData.basicInfo?.name || 'Guest User',
          email: cvData.basicInfo?.email || 'guest@email.com'
        })
      });

      if (!res.ok) {
        throw new Error('Gagal membuat payment');
      }

      const data = await res.json();

      if (!data.paymentUrl || !data.orderId) {
        throw new Error('Invalid payment response');
      }

      const orderId = data.orderId;
      orderIdRef.current = orderId;

      // 2. Simpan order ke localStorage
      saveOrderToLocalStorage(orderId, {
        amount: data.amount,
        email: cvData.basicInfo?.email,
        status: 'pending'
      });

      console.log('🎫 Order created:', orderId);

      // 3. Open Saweria payment page
      const paymentWindow = window.open(data.paymentUrl, '_blank');
      if (!paymentWindow) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      toast.info('Selesaikan pembayaran di Saweria untuk melanjutkan...');

      // 4. Polling every 3 seconds (max 5 minutes)
      let pollCount = 0;
      const maxPolls = 100; // 5 minutes

      pollingRef.current = setInterval(async () => {
        pollCount++;
        console.log(`🔍 Checking payment status... (${pollCount})`);

        const paid = await checkPaymentStatus(orderId);

        if (paid) {
          clearInterval(pollingRef.current!);
          setCheckingPayment(false);
          onSuccess();
          return;
        }

        if (pollCount >= maxPolls) {
          clearInterval(pollingRef.current!);
          setCheckingPayment(false);
          setLoading(false);
          toast.error('Timeout. Pembayaran tidak terdeteksi dalam 5 menit.');
        }
      }, 3000); // Poll setiap 3 detik

    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Pembayaran gagal');
      setLoading(false);
      setCheckingPayment(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  };

  // Export HTML
  const exportHTML = () => {
    if (!paid) {
      return startPayment(() => exportHTML());
    }

    try {
      const blob = new Blob([generateHtmlContent()], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `CV-${cvData.basicInfo?.name || 'Document'}.html`;
      a.click();

      URL.revokeObjectURL(url);
      toast.success('File berhasil diunduh');
    } catch (err: any) {
      toast.error(err.message || 'Export gagal');
    }
  };

  // Print CV
  const printCV = () => {
    if (!paid) {
      return startPayment(() => printCV());
    }

    try {
      const w = window.open('', '_blank');
      if (!w) {
        throw new Error('Popup blocked');
      }

      w.document.write(generateHtmlContent());
      w.document.close();
      w.focus();
      w.onload = () => w.print();
      toast.success('Halaman print terbuka');
    } catch (err: any) {
      toast.error(err.message || 'Print gagal');
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        💰 Bayar Rp5.000 untuk unlock download & print
      </p>

      {checkingPayment && (
        <div className="text-xs text-blue-600 animate-pulse">
          ⏳ Menunggu konfirmasi pembayaran...
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          disabled={loading}
          onClick={exportHTML}
        >
          <FileText className="w-4 h-4 mr-2" />
          {loading ? 'Loading...' : 'Export HTML'}
        </Button>

        <Button
          variant="outline"
          disabled={loading}
          onClick={printCV}
        >
          <Printer className="w-4 h-4 mr-2" />
          {loading ? 'Loading...' : 'Print'}
        </Button>
      </div>

      {paid && (
        <p className="text-xs text-green-600 font-semibold">
          ✅ Pembayaran berhasil! Fitur unlock.
        </p>
      )}
    </div>
  );
}
// import { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { FileText, Printer } from 'lucide-react';
// import { CVData } from '@/lib/types';
// import { toast } from 'sonner';

// declare global {
//   interface Window {
//     snap: any;
//   }
// }

// interface DownloadOptionsProps {
//   cvData: CVData;
// }

// export default function DownloadOptions({ cvData }: DownloadOptionsProps) {
//   const [snapReady, setSnapReady] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const paymentLock = useRef(false);

//   /* ==============================
//      LOAD MIDTRANS SNAP
//   =============================== */
//   useEffect(() => {
//     if (document.getElementById('midtrans-snap')) {
//       setSnapReady(true);
//       return;
//     }

//     const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

//     const script = document.createElement('script');
//     script.id = 'midtrans-snap';
//     script.src = 'https://app.midtrans.com/snap/snap.js';
//     script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';



//     const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
//     if (!clientKey) {
//         console.error('❌ Midtrans client key not found');
//         toast.error('Payment configuration error');
//         return;
//     }

//     script.setAttribute('data-client-key', clientKey);
//     script.async = true;

//     script.onload = () => setSnapReady(true);
//     script.onerror = () => toast.error('Failed to load payment system');

//     document.body.appendChild(script);
//   }, []);

//   /* ==============================
//      HTML GENERATOR
//   =============================== */
//   const generateHtmlContent = () => {
//     const el = document.querySelector('#cv-preview') as HTMLElement;
//     if (!el) throw new Error('CV preview not found');

//     return `
// <!doctype html>
// <html>
// <head>
//   <meta charset="UTF-8" />
//   <title>CV</title>
//   <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
// </head>
// <body style="display:flex;justify-content:center;">
//   <div style="max-width:794px;width:100%;padding:20px;">
//     ${el.outerHTML}
//   </div>
// </body>
// </html>`;
//   };

//   /* ==============================
//      PAYMENT HANDLER
//   =============================== */
//   const startPayment = async (onSuccess: () => void) => {
//     if (paymentLock.current || !snapReady || !window.snap) return;

//     try {
//       paymentLock.current = true;
//       setLoading(true);

//       const payload = {
//         orderId: `ORDER-${Date.now()}`,
//         amount: 5000,
//         email: cvData.basicInfo.email || 'guest@email.com',
//         phone: (cvData.basicInfo.phone || '08123456789').replace(/\D/g, ''),
//         name: cvData.basicInfo.name || 'Guest User',
//         itemDetails: [
//           {
//             id: 'cv-export',
//             price: 5000,
//             quantity: 1,
//             name: 'CV Export & Print License'
//           }
//         ]
//       };

//       const res = await fetch('/api/payment/init', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       if (!res.ok) throw new Error('Failed to init payment');

//       const data = await res.json();
//       if (!data.success || !data.token) throw new Error('Invalid payment token');

//       window.snap.pay(data.token, {
//         onSuccess: () => {
//           toast.success('Payment successful');
//           onSuccess();
//           cleanup();
//         },
//         onError: () => {
//           toast.error('Payment failed');
//           cleanup();
//         },
//         onClose: cleanup
//       });
//     } catch (err: any) {
//       toast.error(err.message || 'Payment error');
//       cleanup();
//     }
//   };

//   const cleanup = () => {
//     paymentLock.current = false;
//     setLoading(false);
//   };

//   /* ==============================
//      EXPORT & PRINT
//   =============================== */
//   const exportHTML = () =>
//     startPayment(() => {
//       const blob = new Blob([generateHtmlContent()], { type: 'text/html' });
//       const url = URL.createObjectURL(blob);

//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'CV.html';
//       a.click();

//       URL.revokeObjectURL(url);
//     });

//   const printCV = () =>
//     startPayment(() => {
//       const w = window.open('', '_blank');
//       if (!w) return toast.error('Popup blocked');

//       w.document.write(generateHtmlContent());
//       w.document.close();
//       w.onload = () => w.print();
//     });

//   /* ==============================
//      UI
//   =============================== */
//   return (
//     <div className="space-y-3">
//       <p className="text-xs text-muted-foreground">
//         Pay once (Rp5.000) to unlock download & print
//       </p>

//       <div className="grid grid-cols-2 gap-3">
//         <Button
//           variant="outline"
//           disabled={!snapReady || loading}
//           onClick={exportHTML}
//         >
//           <FileText className="w-4 h-4 mr-2" />
//           {loading ? 'Processing…' : 'Export HTML'}
//         </Button>

//         <Button
//           variant="outline"
//           disabled={!snapReady || loading}
//           onClick={printCV}
//         >
//           <Printer className="w-4 h-4 mr-2" />
//           {loading ? 'Processing…' : 'Print'}
//         </Button>
//       </div>
//     </div>
//   );
// }
