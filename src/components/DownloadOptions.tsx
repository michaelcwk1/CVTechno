import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Printer } from 'lucide-react';
import { CVData } from '@/lib/types';
import { toast } from 'sonner';

declare global {
  interface Window {
    snap: any;
  }
}

interface DownloadOptionsProps {
  cvData: CVData;
}

export default function DownloadOptions({ cvData }: DownloadOptionsProps) {
  const [snapReady, setSnapReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const paymentLock = useRef(false);

  /* ==============================
     LOAD MIDTRANS SNAP
  =============================== */
  useEffect(() => {
    if (document.getElementById('midtrans-snap')) {
      setSnapReady(true);
      return;
    }

    const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

    const script = document.createElement('script');
    script.id = 'midtrans-snap';
    // script.src = 'https://app.midtrans.com/snap/snap.js';
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';



    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    if (!clientKey) {
        console.error('❌ Midtrans client key not found');
        toast.error('Payment configuration error');
        return;
    }

    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    script.onload = () => setSnapReady(true);
    script.onerror = () => toast.error('Failed to load payment system');

    document.body.appendChild(script);
  }, []);

  /* ==============================
     HTML GENERATOR
  =============================== */
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

  /* ==============================
     PAYMENT HANDLER
  =============================== */
  const startPayment = async (onSuccess: () => void) => {
    if (paymentLock.current || !snapReady || !window.snap) return;

    try {
      paymentLock.current = true;
      setLoading(true);

      const payload = {
        orderId: `ORDER-${Date.now()}`,
        amount: 5000,
        email: cvData.basicInfo.email || 'guest@email.com',
        phone: (cvData.basicInfo.phone || '08123456789').replace(/\D/g, ''),
        name: cvData.basicInfo.name || 'Guest User',
        itemDetails: [
          {
            id: 'cv-export',
            price: 5000,
            quantity: 1,
            name: 'CV Export & Print License'
          }
        ]
      };

      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to init payment');

      const data = await res.json();
      if (!data.success || !data.token) throw new Error('Invalid payment token');

      window.snap.pay(data.token, {
        onSuccess: () => {
          toast.success('Payment successful');
          onSuccess();
          cleanup();
        },
        onError: () => {
          toast.error('Payment failed');
          cleanup();
        },
        onClose: cleanup
      });
    } catch (err: any) {
      toast.error(err.message || 'Payment error');
      cleanup();
    }
  };

  const cleanup = () => {
    paymentLock.current = false;
    setLoading(false);
  };

  /* ==============================
     EXPORT & PRINT
  =============================== */
  const exportHTML = () =>
    startPayment(() => {
      const blob = new Blob([generateHtmlContent()], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'CV.html';
      a.click();

      URL.revokeObjectURL(url);
    });

  const printCV = () =>
    startPayment(() => {
      const w = window.open('', '_blank');
      if (!w) return toast.error('Popup blocked');

      w.document.write(generateHtmlContent());
      w.document.close();
      w.onload = () => w.print();
    });

  /* ==============================
     UI
  =============================== */
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Pay once (Rp5.000) to unlock download & print
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          disabled={!snapReady || loading}
          onClick={exportHTML}
        >
          <FileText className="w-4 h-4 mr-2" />
          {loading ? 'Processing…' : 'Export HTML'}
        </Button>

        <Button
          variant="outline"
          disabled={!snapReady || loading}
          onClick={printCV}
        >
          <Printer className="w-4 h-4 mr-2" />
          {loading ? 'Processing…' : 'Print'}
        </Button>
      </div>
    </div>
  );
}
