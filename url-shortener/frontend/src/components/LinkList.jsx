import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { REDIRECT_BASE } from '../api';

function LinkList({ links, onSelectLink }) {
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (e, shortUrl, id) => {
    e.stopPropagation(); // card ke click (analytics khulna) ko rokta hai
    const textarea = document.createElement('textarea');
    textarea.value = shortUrl;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleQR = (e, id) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  if (links.length === 0) {
    return <p className="empty-state">No links yet. Shorten one above to get started!</p>;
  }

  return (
    <div className="link-list">
      {links.map((link) => {
        const shortUrl = `${REDIRECT_BASE}/${link.short_code}`;
        return (
          <div key={link.id} className="link-card-wrapper">
            <div className="link-card" onClick={() => onSelectLink(link.id)}>
              <div className="link-info">
                <p className="short-code">/{link.short_code}</p>
                <p className="original-url">{link.original_url}</p>
              </div>
              <div className="card-actions">
                <button className="small-btn" onClick={(e) => handleCopy(e, shortUrl, link.id)}>
                  {copiedId === link.id ? 'Copied!' : 'Copy'}
                </button>
                <button className="small-btn" onClick={(e) => toggleQR(e, link.id)}>
                  {expandedId === link.id ? 'Hide QR' : 'QR Code'}
                </button>
                <div className="click-count">
                  <span>{link.total_clicks}</span>
                  <small>clicks</small>
                </div>
              </div>
            </div>
            {expandedId === link.id && (
              <div className="qr-inline-box">
                <QRCodeSVG value={shortUrl} size={120} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default LinkList;
