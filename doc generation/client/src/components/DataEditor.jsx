import React from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';

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
    const item = { ...updatedItems[index], [key]: value };

    // Recalculate amount if rate or quantity changes
    if (key === 'rate' || key === 'quantity') {
      const q = parseFloat(item.quantity) || 0;
      const r = parseFloat(item.rate) || 0;
      item.total_amount = roundVal(q * r);
    }

    if (key === 'quantity' || key === 'unit') {
      const q = item.quantity ?? 0;
      const u = item.unit ?? 'Nos';
      item.quantity_display = `${q} ${u}`;
    }

    updatedItems[index] = item;
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <Settings size={18} color="var(--gold)" />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Document Configuration Studio</h3>
      </div>

      {/* TOP SECTION: Invoice No & Invoice Date */}
      <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--gold)', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ★ Primary Invoice & Challan Identification
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#fff' }}>Invoice & Challan No.</label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: 'var(--gold)', fontWeight: 'bold', color: 'var(--gold)' }}
              value={poData.invoice_no || '42'}
              onChange={(e) => handleFieldChange('invoice_no', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#fff' }}>Invoice Date</label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: 'var(--gold)', fontWeight: 'bold', color: 'var(--gold)' }}
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
        <label className="form-label" style={{ color: 'var(--gold)' }}>
          Consignee Name (To Field for GC & Challan)
        </label>
        <input
          type="text"
          className="form-input"
          style={{ borderColor: 'var(--gold)', fontWeight: 'bold' }}
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
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', color: '#a0a0a0' }}>
            Line Items ({poData.items?.length || 0})
          </span>
          <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={addItem}>
            <Plus size={14} /> Add Item
          </button>
        </div>

        {poData.items?.map((item, idx) => (
          <div key={idx} style={{ background: '#0d0d0d', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)' }}>Item #{item.sr_no}</span>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '0.4rem' }}>
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
                <span className="form-label" style={{ fontSize: '0.7rem' }}>Unit</span>
                <select
                  className="form-input"
                  style={{ padding: '0.2rem 0.3rem', fontSize: '0.8rem', background: '#111', color: 'var(--gold)', fontWeight: 'bold' }}
                  value={item.unit || 'Nos'}
                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                >
                  <option value="Nos">Nos (Numbers)</option>
                  <option value="Set">Set</option>
                  <option value="Sets">Sets</option>
                  <option value="Kg">Kg (Kilograms)</option>
                  <option value="Mtr">Mtr (Meters)</option>
                  <option value="SqFt">SqFt (Square Feet)</option>
                  <option value="Pair">Pair</option>
                  <option value="Pairs">Pairs</option>
                  <option value="Pkt">Pkt (Packets)</option>
                  <option value="Ltr">Ltr (Litres)</option>
                  <option value="Box">Box</option>
                  <option value="Dozen">Dozen</option>
                  <option value="MT">MT (Metric Ton)</option>
                  <option value="Quintal">Quintal</option>
                  <option value="Roll">Roll</option>
                  <option value="Bundle">Bundle</option>
                </select>
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
