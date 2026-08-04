import React from 'react';
import { FileText, Sparkles, Download, Printer, FileSpreadsheet } from 'lucide-react';

export default function Navbar({
  onLoadSample,
  onLoadSampleQuotation,
  onExportAll,
  onExportQuotationBundle,
  onPrintCurrent,
  hasPo,
  activeMode,
  onModeChange
}) {
  return (
    <header className="app-header no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#3b82f6', padding: '0.4rem 0.5rem', borderRadius: '8px', display: 'flex' }}>
          <FileText size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            IREPS Document Automation
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Tax Invoice, Challan, GC & Budgetary Quotation System
          </p>
        </div>
      </div>

      {/* Center Nav Mode Switcher */}
      <div style={{
        display: 'flex',
        background: '#0f172a',
        padding: '0.25rem',
        borderRadius: '8px',
        border: '1px solid #334155'
      }}>
        <button
          onClick={() => onModeChange('quotations')}
          style={{
            padding: '0.45rem 0.9rem',
            fontSize: '0.85rem',
            borderRadius: '6px',
            border: 'none',
            background: activeMode === 'quotations' ? '#3b82f6' : 'transparent',
            color: activeMode === 'quotations' ? '#fff' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <FileSpreadsheet size={16} /> Budgetary Quotations
        </button>

        <button
          onClick={() => onModeChange('po')}
          style={{
            padding: '0.45rem 0.9rem',
            fontSize: '0.85rem',
            borderRadius: '6px',
            border: 'none',
            background: activeMode === 'po' ? '#3b82f6' : 'transparent',
            color: activeMode === 'po' ? '#fff' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <FileText size={16} /> PO Documents Suite
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {activeMode === 'po' ? (
          <>
            <button className="btn btn-outline" onClick={onLoadSample} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
              <Sparkles size={14} color="#fbbf24" />
              Load Sample PO
            </button>

            {hasPo && (
              <>
                <button className="btn btn-secondary" onClick={onPrintCurrent} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                  <Printer size={14} />
                  Print
                </button>

                <button className="btn btn-success" onClick={onExportAll} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                  <Download size={14} />
                  Export All Bundle
                </button>
              </>
            )}
          </>
        ) : (
          <>
            {onLoadSampleQuotation && (
              <button className="btn btn-outline" onClick={onLoadSampleQuotation} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                <Sparkles size={14} color="#fbbf24" />
                Load Sample Quotation
              </button>
            )}

            <button className="btn btn-secondary" onClick={onPrintCurrent} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
              <Printer size={14} />
              Print
            </button>

            {onExportQuotationBundle && (
              <button className="btn btn-success" onClick={onExportQuotationBundle} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                <Download size={14} />
                Export All 3 (ZIP)
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}

