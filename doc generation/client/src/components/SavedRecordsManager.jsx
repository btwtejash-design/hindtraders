import React, { useState, useEffect } from 'react';
import { Database, Edit3, Check, RefreshCw, FileText } from 'lucide-react';

export default function SavedRecordsManager({ apiBase, onLoadRecord, currentRecordId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCrnId, setEditingCrnId] = useState(null);
  const [crnNoInput, setCrnNoInput] = useState('');
  const [crnDateInput, setCrnDateInput] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/records`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditCrn = (rec) => {
    setEditingCrnId(rec.id);
    setCrnNoInput(rec.crn_no || '');
    setCrnDateInput(rec.crn_date || '');
  };

  const saveCrn = async (recId) => {
    try {
      const res = await fetch(`${apiBase}/records/${recId}/crn`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crn_no: crnNoInput, crn_date: crnDateInput })
      });
      if (res.ok) {
        const updated = await res.json();
        setEditingCrnId(null);
        fetchRecords();
        if (onLoadRecord && updated.record) {
          onLoadRecord(updated.record);
        }
      } else {
        alert('Failed to update CRN details');
      }
    } catch (err) {
      alert(`Error updating CRN: ${err.message}`);
    }
  };

  return (
    <div className="glass-card" style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} color="var(--gold)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Saved History & CRN Archive</h3>
        </div>
        <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={fetchRecords}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh Archive
        </button>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#a0a0a0', marginBottom: '0.75rem' }}>
        Every document generation is stored in internal records. You can modify <strong>CRN Number & Date</strong> anytime.
      </p>

      {records.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', padding: '1rem' }}>
          No saved document records found yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
          {records.map((rec) => {
            const isEditing = editingCrnId === rec.id;
            const isSelected = currentRecordId === rec.id || currentRecordId === rec.po_number;

            return (
              <div
                key={rec.id}
                style={{
                  background: isSelected ? 'rgba(212, 175, 55, 0.1)' : '#0d0d0d',
                  border: isSelected ? '1px solid var(--gold)' : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--gold)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>PO #{rec.po_number}</span>
                    <span style={{ fontSize: '0.7rem', color: '#a0a0a0' }}>Inv: {rec.invoice_no || 'N/A'}</span>
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                    onClick={() => onLoadRecord(rec)}
                  >
                    Load
                  </button>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
                  Consignee: <span style={{ color: '#e0e0e0' }}>{rec.consignee || 'N/A'}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  background: '#141414',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  marginTop: '0.2rem'
                }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '0.4rem', width: '100%', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="CRN No"
                        className="form-input"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                        value={crnNoInput}
                        onChange={(e) => setCrnNoInput(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="CRN Date"
                        className="form-input"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                        value={crnDateInput}
                        onChange={(e) => setCrnDateInput(e.target.value)}
                      />
                      <button className="btn btn-primary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => saveCrn(rec.id)}>
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>CRN: </span>
                        {rec.crn_no ? (
                          <span style={{ color: '#34d399', fontWeight: 600 }}>{rec.crn_no} ({rec.crn_date || 'N/A'})</span>
                        ) : (
                          <span style={{ color: '#888', italic: 'true' }}>Not set</span>
                        )}
                      </div>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}
                        onClick={() => startEditCrn(rec)}
                        title="Edit CRN Details"
                      >
                        <Edit3 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
