import React, { useRef } from 'react';
import { UploadCloud, FileCheck, RefreshCw } from 'lucide-react';

export default function PoUploader({ onFileUpload, isLoading, currentPoNo }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', color: '#a0a0a0', letterSpacing: '0.5px' }}>
          Purchase Order Uploader
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

      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '6px',
          padding: '1.5rem',
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
            <UploadCloud size={34} color="var(--gold)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Drop Purchase Order (PO) PDF here</span>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>Supports official IREPS PDF format</span>
          </div>
        )}
      </div>
    </div>
  );
}
