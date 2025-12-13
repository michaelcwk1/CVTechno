// src/components/AIGenerator.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { aiService, premiumService } from '@/services/paymentService';
import { toast } from 'sonner';

interface AIGeneratorProps {
  onGenerated: (content: string) => void;
  onUpgradeClick: () => void;
}

export function AIGenerator({ onGenerated, onUpgradeClick }: AIGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  const isPremium = premiumService.hasActivePremium();

  const handleGenerate = async () => {
    if (!isPremium) {
      toast.error('Fitur AI hanya untuk user premium');
      onUpgradeClick();
      return;
    }

    if (!jobTitle.trim()) {
      toast.error('Masukkan posisi pekerjaan');
      return;
    }

    setLoading(true);
    try {
      const premiumData = premiumService.getPremiumData();
      
      const result = await aiService.generateContent(
        premiumData.premiumCode!,
        jobTitle,
        company,
        customPrompt
      );

      setGeneratedContent(result.content);
      toast.success('Konten berhasil digenerate!');
    } catch (error: any) {
      toast.error(error.message || 'Gagal generate konten');
      
      // If premium expired, clear and show upgrade
      if (error.message?.includes('Premium')) {
        premiumService.clearPremiumData();
        onUpgradeClick();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success('Konten disalin ke clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    onGenerated(generatedContent);
    setOpen(false);
    toast.success('Konten ditambahkan ke CV');
    
    // Reset
    setJobTitle('');
    setCompany('');
    setCustomPrompt('');
    setGeneratedContent('');
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (!isPremium) {
            onUpgradeClick();
          } else {
            setOpen(true);
          }
        }}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4 text-yellow-500" />
        AI Generate {!isPremium && '(Premium)'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              AI Content Generator
            </DialogTitle>
            <DialogDescription>
              AI akan membantu generate deskripsi pekerjaan yang profesional dan ATS-friendly
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!generatedContent ? (
              <>
                <div>
                  <Label htmlFor="jobTitle">Posisi Pekerjaan *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="company">Nama Perusahaan (Opsional)</Label>
                  <Input
                    id="company"
                    placeholder="e.g., PT. Tech Indonesia"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="prompt">Custom Prompt (Opsional)</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Berikan instruksi khusus, misal: 'Fokus pada skill leadership dan project management'"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate dengan AI
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label>Generated Content:</Label>
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Anda bisa edit konten di atas sebelum menggunakan
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setGeneratedContent('')}
                    className="flex-1"
                  >
                    Generate Ulang
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleUse}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500"
                  >
                    Gunakan Konten Ini
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ATS Score Checker Component
interface ATSCheckerProps {
  cvContent: string;
  jobDescription?: string;
  onUpgradeClick: () => void;
}

export function ATSChecker({ cvContent, jobDescription, onUpgradeClick }: ATSCheckerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const isPremium = premiumService.hasActivePremium();

  const handleCheck = async () => {
    if (!isPremium) {
      toast.error('Fitur ATS Checker hanya untuk user premium');
      onUpgradeClick();
      return;
    }

    if (!cvContent.trim()) {
      toast.error('CV masih kosong');
      return;
    }

    setLoading(true);
    try {
      const premiumData = premiumService.getPremiumData();
      
      const analysis = await aiService.getATSScore(
        premiumData.premiumCode!,
        cvContent,
        jobDescription
      );

      setResult(analysis.analysis);
      toast.success('Analisis ATS selesai!');
    } catch (error: any) {
      toast.error(error.message || 'Gagal analyze ATS');
      
      if (error.message?.includes('Premium')) {
        premiumService.clearPremiumData();
        onUpgradeClick();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          if (!isPremium) {
            onUpgradeClick();
          } else {
            setOpen(true);
          }
        }}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4 text-blue-500" />
        Check ATS Score {!isPremium && '(Premium)'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              ATS Compatibility Checker
            </DialogTitle>
            <DialogDescription>
              AI akan menganalisis CV Anda dan memberikan score ATS compatibility
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!result ? (
              <>
                <div>
                  <Label htmlFor="jobDesc">Job Description (Opsional)</Label>
                  <Textarea
                    id="jobDesc"
                    placeholder="Paste job description untuk analisis yang lebih akurat..."
                    rows={5}
                  />
                </div>

                <Button
                  onClick={handleCheck}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze ATS Score'
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setResult('')}
                  className="w-full"
                >
                  Check Lagi
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}