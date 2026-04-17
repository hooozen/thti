import { useEffect, useState } from 'react';
import { ui, tpl } from '../i18n';
import { generateShareCard } from '../lib/shareCard';

interface ShareControlsProps {
  code: string;
  cn: string;
  tagline: string;
  shareUrl: string;
  similarity?: number;
  exactCount?: number;
  suitGlyph: string;
  suitIsRed: boolean;
}

type Status = 'idle' | 'generating' | 'ready' | 'error';

export function ShareControls({
  code,
  cn,
  tagline,
  shareUrl,
  similarity,
  exactCount,
  suitGlyph,
  suitIsRed,
}: ShareControlsProps) {
  const t = ui();
  const [linkCopied, setLinkCopied] = useState(false);
  const [imgCopied, setImgCopied] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const shareText = tpl(t.result.shareText, { code, cn, tagline });

  useEffect(() => {
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, [imgUrl]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  async function handleGenerate() {
    if (status === 'generating') return;
    setStatus('generating');
    try {
      const b = await generateShareCard({
        code,
        cn,
        tagline,
        similarity,
        exactCount,
        suitGlyph,
        suitIsRed,
        url: shareUrl,
      });
      if (imgUrl) URL.revokeObjectURL(imgUrl);
      const url = URL.createObjectURL(b);
      setBlob(b);
      setImgUrl(url);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  function handleDownload() {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `THTI-${code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function handleCopyImage() {
    if (!blob) return;
    try {
      if (
        typeof ClipboardItem === 'undefined' ||
        !navigator.clipboard ||
        !('write' in navigator.clipboard)
      ) {
        throw new Error('unsupported');
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setImgCopied(true);
      setTimeout(() => setImgCopied(false), 1800);
    } catch {
      setImgCopied(false);
      alert(t.result.imageCopyFailed);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-chip-gold text-poker-black font-semibold px-4 py-2.5 transition hover:brightness-110 active:scale-[0.98]"
        >
          {linkCopied ? `✓ ${t.result.linkCopied}` : t.result.copyLinkButton}
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={status === 'generating'}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-chip-gold/70 text-chip-gold font-semibold px-4 py-2.5 transition hover:bg-chip-gold/10 active:scale-[0.98] disabled:opacity-60"
        >
          {status === 'generating' ? t.result.generatingImage : t.result.generateImageButton}
        </button>
      </div>

      {status === 'ready' && imgUrl && (
        <div className="rounded-xl border border-felt-700/60 bg-felt-900/50 p-3 sm:p-4">
          <img
            src={imgUrl}
            alt="THTI share card"
            className="w-full max-w-xs mx-auto rounded-lg shadow-lg"
          />
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg bg-chip-gold text-poker-black font-semibold px-3.5 py-2 text-sm transition hover:brightness-110 active:scale-[0.98]"
            >
              ⬇ {t.result.downloadImageButton}
            </button>
            <button
              type="button"
              onClick={handleCopyImage}
              className="inline-flex items-center gap-2 rounded-lg border border-chip-gold/70 text-chip-gold font-semibold px-3.5 py-2 text-sm transition hover:bg-chip-gold/10 active:scale-[0.98]"
            >
              {imgCopied ? `✓ ${t.result.imageCopied}` : t.result.copyImageButton}
            </button>
          </div>
          <div className="mt-2 text-center text-[11px] text-dim/80">{t.result.shareHint}</div>
        </div>
      )}
    </div>
  );
}
