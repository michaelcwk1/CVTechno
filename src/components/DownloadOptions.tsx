import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Printer, CheckCircle } from 'lucide-react';
import { CVData } from '@/lib/types';
import { toast } from 'sonner';

interface DownloadOptionsProps {
  cvData: CVData;
}

export default function DownloadOptions({ cvData }: DownloadOptionsProps) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const paymentWindowRef = useRef<Window | null>(null);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
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

  const startPaymentFlow = async (onSuccess: () => void) => {
    if (loading) return;

    try {
      setLoading(true);
      setCountdown(15); // 15 detik countdown

      // 1. Buat order di backend (untuk tracking, optional)
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000,
          name: cvData.basicInfo?.name || 'Guest User',
          email: cvData.basicInfo?.email || 'guest@email.com'
        })
      });

      const data = await res.json();
      const paymentUrl = data.paymentUrl || 'https://saweria.co/eilasya';

      // 2. Buka Saweria payment page
      paymentWindowRef.current = window.open(paymentUrl, '_blank');
      if (!paymentWindowRef.current) {
        throw new Error('Popup blocked. Silakan izinkan popup dan coba lagi.');
      }

      toast.info('Jendela pembayaran terbuka. Silakan selesaikan pembayaran...');

      // 3. Countdown 15 detik
      let secondsLeft = 15;

      countdownRef.current = setInterval(() => {
        secondsLeft--;
        setCountdown(secondsLeft);

        if (secondsLeft <= 0) {
          clearInterval(countdownRef.current!);
          setLoading(false);
          setPaid(true);
          setCountdown(null);
          toast.success('✅ Pembayaran berhasil! Fitur download & print sudah unlock.');
          onSuccess();
        }
      }, 1000);

    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Pembayaran gagal');
      setLoading(false);
      setCountdown(null);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
  };

  // Export HTML
  const exportHTML = () => {
    if (!paid) {
      return startPaymentFlow(() => exportHTML());
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
      return startPaymentFlow(() => printCV());
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

      {countdown !== null && (
        <div className="text-sm font-semibold text-blue-600 bg-blue-50 p-3 rounded-lg animate-pulse">
          ⏳ Menungkan konfirmasi pembayaran... {countdown}s
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
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg font-semibold">
          <CheckCircle className="w-4 h-4" />
          ✅ Pembayaran berhasil! Fitur unlock.
        </div>
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
