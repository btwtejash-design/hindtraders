import React from 'react';
import { Settings, Info, Tag, Plus, Trash2 } from 'lucide-react';

export default function DataEditor({ poData, onChange }) {
  if (!poData) return null;

  const handleFieldChange = (field, value) => {
    if (field === 'invoice_no') {
      onChange({ ...poData, invoice_no: value, challan_no: value });
    } else {
      onChange({ ...poData, [field]: value });
    }
  };

  const handleItemChange = (index, key, value) => {
    const updatedItems = [...poData.items];
    updatedItems[index] = { ...updatedItems[index], [key]: value };
    // Recalculate amount if rate or quantity changes
    if (key === 'rate' || key === 'quantity') {
      const q = parseFloat(updatedItems[index].quantity) || 0;
      const r = parseFloat(updatedItems[index].rate) || 0;
      updatedItems[index].total_amount = roundVal(q * r);
    }
    onChange({ ...poData, items: updatedItems });
  };

  const addItem = () => {
    const nextSr = poData.items.length + 1;
    const newItem = {
      sr_no: nextSr,
      pl_no: '',
      description: 'New Item Description',
      hsn: '7318',
      quantity: 1,
      unit: 'Nos',
      quantity_display: '1Nos',
      rate: 100,
      total_amount: 100,
      gst_percent: 18
    };
    onChange({ ...poData, items: [...poData.items, newItem] });
  };

  const removeItem = (index) => {
    const updatedItems = poData.items.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      sr_no: i + 1
    }));
    onChange({ ...poData, items: updatedItems });
  };

  function roundVal(v) {
    return Math.round(v * 100) / 100;
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
        <Settings size={18} color="#3b82f6" />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Document Configuration Studio</h3>
      </div>

      {/* TOP SECTION: Invoice No & Invoice Date */}
      <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
          ★ Primary Invoice & Challan Identification
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#fff' }}>Invoice & Challan No.</label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: '#3b82f6', fontWeight: 'bold' }}
              value={poData.invoice_no || '42'}
              onChange={(e) => handleFieldChange('invoice_no', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#fff' }}>Invoice Date</label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: '#3b82f6', fontWeight: 'bold' }}
              value={poData.invoice_date || '15/06/2026'}
              onChange={(e) => handleFieldChange('invoice_date', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* PO Details Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <label className="form-label">PO Number</label>
          <input
            type="text"
            className="form-input"
            value={poData.po_number || ''}
            onChange={(e) => handleFieldChange('po_number', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">PO Date</label>
          <input
            type="text"
            className="form-input"
            value={poData.po_date || ''}
            onChange={(e) => handleFieldChange('po_date', e.target.value)}
          />
        </div>
      </div>

      {/* Challan Date & GC File No Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Challan Date</label>
          <input
            type="text"
            className="form-input"
            value={poData.challan_date || '24/07/2026'}
            onChange={(e) => handleFieldChange('challan_date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">GC File No.</label>
          <input
            type="text"
            className="form-input"
            value={poData.gc_file_no || 'HT/GC-WC/26-27'}
            onChange={(e) => handleFieldChange('gc_file_no', e.target.value)}
          />
        </div>
      </div>

      {/* Consignee Input */}
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label className="form-label" style={{ color: '#fbbf24' }}>
          Consignee Name (To Field for GC & Challan)
        </label>
        <input
          type="text"
          className="form-input"
          style={{ borderColor: '#f59e0b', fontWeight: 'bold' }}
          value={poData.consignee || ''}
          onChange={(e) => handleFieldChange('consignee', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <label className="form-label">CRN No. (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 091042-26-00268"
            value={poData.crn_no || ''}
            onChange={(e) => handleFieldChange('crn_no', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">CRN Date (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 08/07/2026"
            value={poData.crn_date || ''}
            onChange={(e) => handleFieldChange('crn_date', e.target.value)}
          />
        </div>
      </div>

      {/* Items Section */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8' }}>
            Line Items ({poData.items?.length || 0})
          </span>
          <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={addItem}>
            <Plus size={14} /> Add Item
          </button>
        </div>

        {poData.items?.map((item, idx) => (
          <div key={idx} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6' }}>Item #{item.sr_no}</span>
              {poData.items.length > 1 && (
                <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => removeItem(idx)}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <textarea
              className="form-input"
              rows={2}
              style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}
              value={item.description}
              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.4rem' }}>
              <div>
                <span className="form-label" style={{ fontSize: '0.7rem' }}>Qty</span>
                <input
                  type="number"
                  className="form-input"
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <span className="form-label" style={{ fontSize: '0.7rem' }}>Rate (₹)</span>
                <input
                  type="number"
                  className="form-input"
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                  value={item.rate}
                  onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <span className="form-label" style={{ fontSize: '0.7rem' }}>HSN</span>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                  value={item.hsn}
                  onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                />
              </div>

              <div>
                <span className="form-label" style={{ fontSize: '0.7rem' }}>GST %</span>
                <input
                  type="number"
                  className="form-input"
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                  value={item.gst_percent}
                  onChange={(e) => handleItemChange(idx, 'gst_percent', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
