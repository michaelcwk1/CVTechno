// src/components/PremiumModal.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Shield, Zap } from 'lucide-react';
import { paymentService, premiumService } from '@/services/paymentService';
import { toast } from 'sonner';

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PremiumModal({ open, onClose, onSuccess }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'features' | 'payment' | 'code'>('features');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [premiumCode, setPremiumCode] = useState('');

  const handlePayment = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Mohon lengkapi semua data');
      return;
    }

    setLoading(true);
    try {
      const result = await paymentService.createPayment(formData);
      
      // Open Midtrans popup
      paymentService.openPaymentPopup(
        result.snapToken,
        async (paymentResult) => {
          // Payment success
          console.log('Payment success:', paymentResult);
          
          // Verify payment and get premium code
          const verification = await paymentService.verifyPayment(result.orderId);
          
          if (verification.success) {
            // Save premium data
            premiumService.savePremiumData({
              premiumCode: verification.premiumCode,
              expiresAt: verification.expiresAt,
              isValid: true
            });

            toast.success(`Berhasil! Kode Premium: ${verification.premiumCode}`);
            onSuccess();
            onClose();
          }
        },
        (error) => {
          console.error('Payment error:', error);
          toast.error('Pembayaran gagal atau dibatalkan');
        }
      );
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Gagal memproses pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCode = async () => {
    if (!premiumCode.trim()) {
      toast.error('Masukkan kode premium');
      return;
    }

    setLoading(true);
    try {
      const result = await premiumService.validateCode(premiumCode);
      
      if (result.valid) {
        premiumService.savePremiumData({
          premiumCode: premiumCode.toUpperCase(),
          expiresAt: result.expiresAt,
          isValid: true
        });

        toast.success('Kode premium berhasil diaktifkan!');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Kode tidak valid');
      }
    } catch (error) {
      toast.error('Gagal memvalidasi kode');
    } finally {
      setLoading(false);
    }
  };

  const premiumFeatures = [
    { icon: Sparkles, text: '10+ Template Premium ATS-Optimized' },
    { icon: Zap, text: 'AI Auto-Generate Work Descriptions' },
    { icon: Shield, text: 'ATS Score Checker & Analyzer' },
    { icon: Check, text: 'Export PDF Tanpa Watermark' },
    { icon: Check, text: 'AI Job Description Matcher' },
    { icon: Check, text: 'Unlimited Downloads (24 Jam)' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'features' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <DialogTitle>Upgrade ke Premium</DialogTitle>
              </div>
              <DialogDescription>
                Unlock semua fitur AI dan template premium untuk CV yang lebih profesional!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Price */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-6 rounded-lg text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">One-Time Payment</div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">Rp 19.000</div>
                <Badge variant="secondary" className="mt-2">Akses 24 Jam</Badge>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <feature.icon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" 
                  size="lg"
                  onClick={() => setStep('payment')}
                >
                  Beli Sekarang - Rp 19.000
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setStep('code')}
                >
                  Sudah Punya Kode Premium?
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle>Form Pembayaran</DialogTitle>
              <DialogDescription>
                Isi data untuk melanjutkan pembayaran Rp 19.000
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">No. WhatsApp</Label>
                <Input
                  id="phone"
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep('features')} className="flex-1">
                  Kembali
                </Button>
                <Button 
                  onClick={handlePayment} 
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500"
                >
                  {loading ? 'Memproses...' : 'Bayar Sekarang'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'code' && (
          <>
            <DialogHeader>
              <DialogTitle>Aktivasi Kode Premium</DialogTitle>
              <DialogDescription>
                Masukkan kode premium yang sudah Anda beli
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Kode Premium</Label>
                <Input
                  id="code"
                  placeholder="QUICK-XXXX-YYYY"
                  value={premiumCode}
                  onChange={(e) => setPremiumCode(e.target.value.toUpperCase())}
                  className="font-mono text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: QUICK-XXXX-YYYY
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('features')} className="flex-1">
                  Kembali
                </Button>
                <Button 
                  onClick={handleValidateCode} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Validasi...' : 'Aktivasi Kode'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}