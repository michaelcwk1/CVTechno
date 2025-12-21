import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { CVData } from '@/lib/types';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface TailorCVDialogProps {
  cvData: CVData;
}

export function TailorCVDialog({ cvData }: TailorCVDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error('Please enter your question');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cvData })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gemini failed');

      setResult(data.content);
      toast.success('AI response ready');
    } catch (err) {
      console.error(err);
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Ask AI
        </Button>
      </DialogTrigger>

      {/* 🔥 DIALOG DIPERLEBAR */}
      <DialogContent className="max-w-[900px] w-full max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">
            CV AI Assistant
          </DialogTitle>
          <DialogDescription className="text-sm">
            Ask one question and get professional recommendations for your CV.
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 py-4 overflow-y-auto max-h-[75vh]"
        >
          {/* INPUT */}
          <div className="space-y-2">
            <Label>Your Question</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Help me rewrite my professional summary"
              disabled={loading}
              className="
    min-h-[120px]
    resize-none
    focus-visible:ring-0
    focus-visible:ring-offset-0
    focus:outline-none
    border-muted"
            />
          </div>

          {/* OUTPUT */}
          {result && (
            <div className="space-y-2">
              <Label>AI Recommendation</Label>

              <div className="border rounded-lg bg-muted">
                <div className="max-h-[360px] overflow-y-auto px-6 py-4">
                  <div className="prose prose-sm max-w-none leading-relaxed">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Close
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Ask AI
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
