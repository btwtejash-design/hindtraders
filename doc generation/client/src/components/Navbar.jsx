import React from 'react';
import { FileText, Sparkles, Download, Printer, Lock, Home, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function Navbar({ onLoadSample, onExportAll, onPrintCurrent, hasPo, onLock }) {
  return (
    <header className="app-header no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <a href="/" className="brand-name-gold">HIND TRADERS</a>
          <div style={{ fontSize: '0.72rem', color: '#a0a0a0', letterSpacing: '0.5px' }}>
            Railway Document Automation Portal
          </div>
        </div>

        <nav className="site-nav-links">
          <a href="/" className="site-nav-link">
            <Home size={14} /> Home
          </a>
          <a href="/catalog.html" className="site-nav-link">
            <ShoppingBag size={14} /> Catalog
          </a>
          <a href="/documents" className="site-nav-link active">
            <FileText size={14} /> Documents 🔒
          </a>
        </nav>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={onLoadSample} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          <Sparkles size={14} color="#d4af37" />
          Load Sample PO
        </button>

        {hasPo && (
          <>
            <button className="btn btn-secondary" onClick={onPrintCurrent} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <Printer size={14} />
              Print
            </button>

            <button className="btn btn-primary" onClick={onExportAll} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <Download size={14} />
              Export Bundle (ZIP)
            </button>
          </>
        )}

        <button
          className="btn btn-secondary"
          onClick={onLock}
          title="Lock Document Generator Portal"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderColor: 'rgba(212, 175, 55, 0.4)' }}
        >
          <Lock size={14} color="#d4af37" />
          <span style={{ fontSize: '0.75rem' }}>Lock</span>
        </button>
      </div>
    </header>
  );
}
