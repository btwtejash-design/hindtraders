import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, RefreshCw, Globe, Search, Download, ExternalLink } from 'lucide-react';

export default function PoUploader({ onFileUpload, onFetchPoByNumber, isLoading, currentPoNo, apiBase }) {
  const [mode, setMode] = useState('ireps-fetch'); // 'ireps-fetch' | 'upload'
  const [poNumberInput, setPoNumberInput] = useState('');
  const [yearInput, setYearInput] = useState('2026');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleFetchSubmit = (e) => {
    e.preventDefault();
    if (!poNumberInput.trim()) {
      alert('Please enter a PO Number.');
      return;
    }
    if (onFetchPoByNumber) {
      onFetchPoByNumber(poNumberInput.trim(), yearInput.trim());
    }
  };

  const targetUrlPreview = `https://www.ireps.gov.in/ireps/etender/pdfdocs/MMIS/PO/${yearInput || '2026'}/02/${poNumberInput.trim() || '<po-number>'}.pdf`;

  return (
    <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', color: '#a0a0a0', letterSpacing: '0.5px' }}>
          Purchase Order (PO) Extractor
        </h3>
        {currentPoNo && (
          <span style={{
            fontSize: '0.75rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#34d399',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <FileCheck size={12} /> Loaded PO #{currentPoNo}
          </span>
        )}
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', background: '#0a0a0a', padding: '4px', borderRadius: '6px', border: '1px solid #222' }}>
        <button
          type="button"
          onClick={() => setMode('ireps-fetch')}
          style={{
            flex: 1,
            padding: '0.4rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: '4px',
            border: 'none',
            background: mode === 'ireps-fetch' ? 'var(--gold)' : 'transparent',
            color: mode === 'ireps-fetch' ? '#000' : '#aaa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: '0.2s'
          }}
        >
          <Globe size={14} /> Fetch from IREPS URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          style={{
            flex: 1,
            padding: '0.4rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: '4px',
            border: 'none',
            background: mode === 'upload' ? 'var(--gold)' : 'transparent',
            color: mode === 'upload' ? '#000' : '#aaa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: '0.2s'
          }}
        >
          <UploadCloud size={14} /> Upload PDF File
        </button>
      </div>

      {/* Mode 1: Fetch PO from IREPS */}
      {mode === 'ireps-fetch' && (
        <form onSubmit={handleFetchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2', minWidth: '180px' }}>
              <label style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                IREPS Purchase Order Number:
              </label>
              <input
                type="text"
                value={poNumberInput}
                onChange={(e) => setPoNumberInput(e.target.value)}
                placeholder="e.g. 55265692101304"
                className="input-field"
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '90px' }}>
              <label style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Year:
              </label>
              <select
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                className="input-field"
                style={{ width: '100%', padding: '0.45rem 0.5rem', fontSize: '0.85rem' }}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>

          {/* Target URL Preview */}
          <div style={{ fontSize: '0.72rem', color: '#888', background: '#0a0a0a', padding: '6px 10px', borderRadius: '4px', border: '1px solid #222', wordBreak: 'break-all' }}>
            <strong style={{ color: 'var(--gold)' }}>Target IREPS URL:</strong> {targetUrlPreview}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
              Fetch & Extract PO Details
            </button>

            {poNumberInput.trim() && (
              <a
                href={targetUrlPreview}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Open directly on IREPS"
              >
                <ExternalLink size={14} /> Open URL
              </a>
            )}
          </div>
        </form>
      )}

      {/* Mode 2: Upload PDF File */}
      {mode === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '6px',
            padding: '1.25rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#0d0d0d',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.background = '#0d0d0d';
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw className="animate-spin" size={28} color="var(--gold)" />
              <span style={{ fontSize: '0.875rem', color: '#a0a0a0' }}>Parsing IREPS Purchase Order PDF...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <UploadCloud size={32} color="var(--gold)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>Drop Purchase Order (PO) PDF here</span>
              <span style={{ fontSize: '0.72rem', color: '#888' }}>Supports official IREPS PDF files</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
