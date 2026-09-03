import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { shortenUrl } from '../api';

function ShortenForm({ onNewLink }) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCopied(false);
    try {
      const res = await shortenUrl(url, alias || undefined, expiresIn || undefined, password || undefined);
      setResult(res.data);
      setUrl('');
      setAlias('');
      setExpiresIn('');
      setPassword('');
      if (onNewLink) onNewLink();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleCopy = () => {
    const textarea = document.createElement('textarea');
    textarea.value = result.shortUrl;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 200, 200);
      ctx.drawImage(img, 10, 10, 180, 180);
      const link = document.createElement('a');
      link.download = `qr-${result.short_code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="shorten-form">
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Paste your long URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Custom alias (optional)"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
        <select value={expiresIn} onChange={(e) => setExpiresIn(e.target.value)}>
          <option value="">Never expires</option>
          <option value="7d">Expires in 7 days</option>
          <option value="30d">Expires in 30 days</option>
        </select>
        <input
          type="password"
          placeholder="Password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Shorten</button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result-box">
          <div className="result-info">
            <p>Short URL: <a href={result.shortUrl} target="_blank" rel="noreferrer">{result.shortUrl}</a></p>
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <div className="qr-box" ref={qrRef}>
            <QRCodeSVG value={result.shortUrl} size={128} />
            <button className="download-btn" onClick={handleDownloadQR}>Download QR</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShortenForm;
