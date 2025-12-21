import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Printer,
  CheckCircle,
  CreditCard,
  Upload,
} from 'lucide-react';
import { CVData } from '@/lib/types';
import { toast } from 'sonner';

interface DownloadOptionsProps {
  cvData: CVData;
}

export default function DownloadOptions({ cvData }: DownloadOptionsProps) {
  const [paid, setPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  // 🔒 KUNCI STEP 2 SAMPAI STEP 1 DIKLIK
  const [paymentStarted, setPaymentStarted] = useState(false);

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

  const exportHTML = () => {
    if (!paid) return setShowModal(true);

    const blob = new Blob([generateHtmlContent()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV-${cvData.basicInfo?.name || 'Document'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File berhasil diunduh');
  };

  const printCV = () => {
    if (!paid) return setShowModal(true);

    const w = window.open('', '_blank');
    if (!w) return toast.error('Popup diblokir browser');

    w.document.write(generateHtmlContent());
    w.document.close();
    w.focus();
    w.onload = () => w.print();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        💰 Bayar Rp5.000 untuk unlock download & print
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={exportHTML}>
          <FileText className="w-4 h-4 mr-2" />
          Export HTML
        </Button>

        <Button variant="outline" onClick={printCV}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      {paid && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-xl font-semibold">
          <CheckCircle className="w-4 h-4" />
          Pembayaran berhasil, fitur terbuka
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showModal &&
        typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

              {/* HEADER */}
              <div className="px-6 pt-6 pb-4 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  Unlock Download & Print
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Selesaikan pembayaran untuk mengakses fitur premium
                </p>
              </div>

              {/* BODY */}
              <div className="px-6 py-5 space-y-5">

                {/* PRICE */}
                <div className="rounded-xl border bg-gradient-to-br from-indigo-50 to-white p-4 text-center">
                  <p className="text-sm text-gray-500">Biaya sekali bayar</p>
                  <p className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                    Rp5.000
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Berlaku untuk CV ini (tanpa login)
                  </p>
                </div>

                {/* STEP 1 */}
                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <p className="font-semibold">Lakukan Pembayaran</p>
                  </div>

                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      setPaymentStarted(true);
                      window.open('https://saweria.co/eilasya', '_blank');
                    }}
                  >
                    Bayar via Saweria
                  </Button>
                </div>

                {/* STEP 2 (LOCKED) */}
                <div
                  className={`rounded-xl border p-4 space-y-3 transition ${
                    !paymentStarted
                      ? 'opacity-50 pointer-events-none'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        paymentStarted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      2
                    </div>
                    <p className="font-semibold">Upload Bukti Pembayaran</p>
                  </div>

                  <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-sm cursor-pointer hover:bg-gray-50 transition">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 truncate">
                      {proofFile
                        ? proofFile.name
                        : 'Klik untuk upload bukti transfer'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        setProofFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>
              </div>

              {/* FOOTER */}
              <div className="px-6 py-5 border-t space-y-3">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  disabled={!proofFile}
                  onClick={() => {
                    setPaid(true);
                    setShowModal(false);
                    toast.success('Pembayaran berhasil dikonfirmasi');
                  }}
                >
                  Konfirmasi Pembayaran
                </Button>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full text-sm text-gray-500 hover:underline"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>,
          document.body
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
