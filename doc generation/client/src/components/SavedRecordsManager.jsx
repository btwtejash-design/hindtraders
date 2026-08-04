import React, { useState, useEffect } from 'react';
import { Database, Edit3, Check, RefreshCw, FileText, Calendar, ArrowRight } from 'lucide-react';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} color="#10b981" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Saved Document History & CRN Manager</h3>
        </div>
        <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={fetchRecords}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh Archive
        </button>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
        Every generation is automatically saved here. You can update the <strong>CRN Number & Date</strong> anytime in the future.
      </p>

      {records.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '1rem' }}>
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
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : '#0f172a',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid #334155',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="#3b82f6" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>PO #{rec.po_number}</span>
                    <span style={{ fontSize: '0.75rem', background: '#334155', color: '#cbd5e1', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      Inv #{rec.invoice_no || '42'}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#1e293b', color: '#fbbf24', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      To: {rec.consignee}
                    </span>
                  </div>

                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => onLoadRecord(rec)}
                  >
                    Load & Preview <ArrowRight size={12} />
                  </button>
                </div>

                {/* CRN Number & Date Section */}
                <div style={{ background: '#1e293b', padding: '0.4rem 0.6rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="CRN No."
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '45%' }}
                        value={crnNoInput}
                        onChange={(e) => setCrnNoInput(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="CRN Date"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '35%' }}
                        value={crnDateInput}
                        onChange={(e) => setCrnDateInput(e.target.value)}
                      />
                      <button className="btn btn-success" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => saveCrn(rec.id)}>
                        <Check size={12} /> Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <strong>CRN No:</strong> {rec.crn_no || 'Not set'} | <strong>Date:</strong> {rec.crn_date || 'Not set'}
                      </span>
                      <button
                        style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                        onClick={() => startEditCrn(rec)}
                      >
                        <Edit3 size={12} /> Edit CRN
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
