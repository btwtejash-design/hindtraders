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
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8' }}>
          Purchase Order Uploader
        </h3>
        {currentPoNo && (
          <span style={{ fontSize: '0.75rem', background: '#065f46', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <FileCheck size={12} /> Loaded PO #{currentPoNo}
          </span>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #334155',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(15, 23, 42, 0.5)',
          transition: 'border-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
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
            <RefreshCw className="animate-spin" size={28} color="#3b82f6" />
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Parsing Purchase Order PDF...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <UploadCloud size={32} color="#3b82f6" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Drop Purchase Order (PO) PDF here</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Supports IREPS standard PDF format</span>
          </div>
        )}
      </div>
    </div>
  );
}
