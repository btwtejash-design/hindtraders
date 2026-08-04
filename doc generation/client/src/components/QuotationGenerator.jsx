import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Plus, Trash2, Download, Eye, FileText, CheckCircle, Save, FolderOpen, FileCode, ArrowRightLeft } from 'lucide-react';
import HindQuotationPreview from './previews/HindQuotationPreview';
import YashaQuotationPreview from './previews/YashaQuotationPreview';
import MadhuQuotationPreview from './previews/MadhuQuotationPreview';

const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    if (window.location.port !== '8000' && window.location.port !== '') {
      return 'http://127.0.0.1:8000/api';
    }
  }
  return '/api';
};

const API_BASE = getApiBase();

export default function QuotationGenerator({ poData }) {
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState('hind'); // 'hind' | 'yasha' | 'madhu'
  const [savedRecords, setSavedRecords] = useState([]);
  const [showSavedList, setShowSavedList] = useState(false);

  // Common Details State
  const [commonData, setCommonData] = useState({
    ref_no: 'F/DPS/MMC(D)/27',
    ref_date: '28/04/2026',
    consignee_address: 'AWM (WHEEL)\nEASTERN RLY, JAMALPUR',
    items: [
      { sr_no: 1, description: 'Heat Shrink tube Transparent Inner Dia Size – 3mm', unit: 'mtr', quantity: 1 },
      { sr_no: 2, description: 'Heat Shrink tube Transparent Inner Dia Size – 5mm', unit: 'mtr', quantity: 1 },
      { sr_no: 3, description: 'Heat Shrink tube Transparent Inner Dia Size – 10mm', unit: 'mtr', quantity: 1 },
      { sr_no: 4, description: 'Heat Shrink tube Transparent Inner Dia Size – 15mm', unit: 'mtr', quantity: 1 },
      { sr_no: 5, description: 'Heat Shrink tube Transparent Inner Dia Size – 20mm', unit: 'mtr', quantity: 1 },
      { sr_no: 6, description: 'Rubber Gasket Seal for Locomotive Assembly', unit: 'Nos', quantity: 1 },
      { sr_no: 7, description: 'Hex Head Screw M8 x 25mm Stainless Steel', unit: 'Nos', quantity: 1 },
      { sr_no: 8, description: 'Copper Washer Ring Inner Dia 12mm', unit: 'Nos', quantity: 1 },
      { sr_no: 9, description: 'Insulating Sleeve Sleeving 6mm', unit: 'mtr', quantity: 1 },
      { sr_no: 10, description: 'Steel Pin Cotter Lock Type B', unit: 'Nos', quantity: 1 }
    ]
  });

  // Organization Specific States
  const [hindData, setHindData] = useState({
    quotation_ref: 'HT/BQ/26-27',
    quotation_date: '03/08/2026',
    rates: { 1: '22', 2: '28', 3: '45', 4: '55', 5: '68', 6: '120', 7: '15', 8: '18', 9: '35', 10: '42' }
  });

  const [yashaData, setYashaData] = useState({
    quotation_ref: 'YE/BQ/26-27',
    quotation_date: '04/08/2026',
    rates: { 1: '12', 2: '16', 3: '25', 4: '32', 5: '40', 6: '95', 7: '10', 8: '12', 9: '22', 10: '30' }
  });

  const [madhuData, setMadhuData] = useState({
    quotation_ref: 'ME/12/26-27',
    quotation_date: '06/05/2026',
    rates: { 1: '95', 2: '98', 3: '105', 4: '115', 5: '130', 6: '180', 7: '25', 8: '28', 9: '50', 10: '65' }
  });

  useEffect(() => {
    fetchSavedQuotationRecords();
  }, []);

  const fetchSavedQuotationRecords = async () => {
    try {
      const res = await fetch(`${API_BASE}/quotations/records`);
      if (res.ok) {
        const data = await res.json();
        setSavedRecords(data);
      }
    } catch (err) {
      console.warn("Could not fetch saved quotation records:", err);
    }
  };

  // Import items from currently active PO if available
  const handleImportFromPo = () => {
    if (!poData || !poData.items) return;
    const poItems = poData.items.map((item, idx) => ({
      sr_no: idx + 1,
      description: item.description || '',
      unit: item.unit || 'Nos',
      quantity: item.quantity || 1
    }));
    
    setCommonData({
      ref_no: poData.po_number ? `PO-${poData.po_number}` : commonData.ref_no,
      ref_date: poData.po_date || commonData.ref_date,
      consignee_address: poData.consignee || commonData.consignee_address,
      items: poItems
    });

    const newRatesHind = {};
    const newRatesYasha = {};
    const newRatesMadhu = {};
    poItems.forEach((item) => {
      newRatesHind[item.sr_no] = item.rate ? String(item.rate) : '25';
      newRatesYasha[item.sr_no] = item.rate ? String(Math.round(item.rate * 0.9)) : '20';
      newRatesMadhu[item.sr_no] = item.rate ? String(Math.round(item.rate * 1.1)) : '30';
    });

    setHindData(prev => ({ ...prev, rates: newRatesHind }));
    setYashaData(prev => ({ ...prev, rates: newRatesYasha }));
    setMadhuData(prev => ({ ...prev, rates: newRatesMadhu }));
    setStatusMsg(`Successfully imported ${poItems.length} items from active PO #${poData.po_number}!`);
  };

  // Save Quotation Draft
  const handleSaveQuotationDraft = async () => {
    setIsSaving(true);
    const payload = {
      record_type: 'quotation',
      common: commonData,
      hind_traders: hindData,
      yasha_enterprises: yashaData,
      madhu_enterprises: madhuData
    };

    try {
      const res = await fetch(`${API_BASE}/quotations/records/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStatusMsg('Quotation draft saved successfully to database!');
        fetchSavedQuotationRecords();
      } else {
        alert('Failed to save quotation draft.');
      }
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Load a Saved Quotation Record
  const handleLoadSavedRecord = (rec) => {
    if (rec.common) setCommonData(rec.common);
    if (rec.hind_traders) setHindData(rec.hind_traders);
    if (rec.yasha_enterprises) setYashaData(rec.yasha_enterprises);
    if (rec.madhu_enterprises) setMadhuData(rec.madhu_enterprises);
    setStatusMsg(`Loaded saved quotation record: ${rec.common?.ref_no || rec.id}`);
  };

  // Delete a Saved Quotation Record
  const handleDeleteSavedRecord = async (recId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this saved quotation?")) return;
    try {
      const res = await fetch(`${API_BASE}/records/${recId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSavedQuotationRecords();
        setStatusMsg(`Deleted quotation record ${recId}`);
      }
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // AI Document / Photo Upload
  const handleAiFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsParsing(true);
    setStatusMsg(`Reading & parsing document "${file.name}" with Gemini AI...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/quotations/parse`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const parsed = await res.json();
        setCommonData({
          ref_no: parsed.ref_no || 'F/DPS/MMC(D)/27',
          ref_date: parsed.ref_date || new Date().toLocaleDateString('en-GB'),
          consignee_address: parsed.consignee_address || 'AWM (WHEEL)\nEASTERN RLY, JAMALPUR',
          items: parsed.items || []
        });

        // Initialize rates if needed
        const newRatesHind = {};
        const newRatesYasha = {};
        const newRatesMadhu = {};
        (parsed.items || []).forEach((item, idx) => {
          const sr = item.sr_no || (idx + 1);
          newRatesHind[sr] = '25';
          newRatesYasha[sr] = '20';
          newRatesMadhu[sr] = '30';
        });

        setHindData(prev => ({ ...prev, rates: { ...newRatesHind, ...prev.rates } }));
        setYashaData(prev => ({ ...prev, rates: { ...newRatesYasha, ...prev.rates } }));
        setMadhuData(prev => ({ ...prev, rates: { ...newRatesMadhu, ...prev.rates } }));

        setStatusMsg(`Successfully extracted ${parsed.items?.length || 0} items from ${file.name}!`);
      } else {
        const errJson = await res.json();
        alert(`AI Parsing error: ${errJson.detail || 'Could not parse file'}`);
      }
    } catch (err) {
      alert(`Network error parsing document: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Item Handlers
  const handleAddItem = () => {
    const nextSr = commonData.items.length + 1;
    const newItem = {
      sr_no: nextSr,
      description: '',
      unit: 'mtr',
      quantity: 1
    };
    setCommonData({
      ...commonData,
      items: [...commonData.items, newItem]
    });
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...commonData.items];
    updated[index][field] = value;
    setCommonData({ ...commonData, items: updated });
  };

  const handleDeleteItem = (index) => {
    const updated = commonData.items.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      sr_no: idx + 1
    }));
    setCommonData({ ...commonData, items: updated });
  };

  // Rate Update Handler
  const handleRateChange = (orgSetter, sr, value) => {
    orgSetter(prev => ({
      ...prev,
      rates: {
        ...prev.rates,
        [sr]: value
      }
    }));
  };

  // Download PDF / Excel Handler
  const handleDownloadDocument = async (endpoint, filename) => {
    const payload = {
      common: commonData,
      hind_traders: hindData,
      yasha_enterprises: yashaData,
      madhu_enterprises: madhuData
    };

    try {
      const res = await fetch(`${API_BASE}/quotations/generate/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Server error generating document');
      }
    } catch (err) {
      alert(`Download error: ${err.message}`);
    }
  };

  const currentFullData = {
    common: commonData,
    hind_traders: hindData,
    yasha_enterprises: yashaData,
    madhu_enterprises: madhuData
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        color: '#fff',
        marginBottom: '1.5rem',
        border: '1px solid #334155',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              Budgetary Quotation Generator
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
              Generate custom quotations for <strong>Hind Traders</strong>, <strong>Yasha Enterprises</strong>, and <strong>Madhu Enterprises</strong> with AI document import.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {poData && poData.items && poData.items.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={handleImportFromPo}
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                title="Import items & details from active PO"
              >
                <ArrowRightLeft size={16} /> Import from Active PO
              </button>
            )}

            <button
              className="btn btn-outline"
              onClick={handleSaveQuotationDraft}
              disabled={isSaving}
              style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
            >
              <Save size={16} color="#3b82f6" /> {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

            {savedRecords.length > 0 && (
              <button
                className="btn btn-outline"
                onClick={() => setShowSavedList(!showSavedList)}
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              >
                <FolderOpen size={16} color="#f59e0b" /> Saved ({savedRecords.length})
              </button>
            )}

            <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem' }}>
              <Sparkles size={18} color="#fbbf24" />
              <span>{isParsing ? 'Processing AI...' : 'Upload PDF / Photo (AI Auto-Fill)'}</span>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleAiFileUpload}
                disabled={isParsing}
                style={{ display: 'none' }}
              />
            </label>

            <button
              className="btn btn-success"
              onClick={() => handleDownloadDocument('bundle', `Quotations_Bundle_${commonData.ref_no.replace(/\//g, '_')}.zip`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem' }}
            >
              <Download size={18} />
              Download All 3 (ZIP)
            </button>
          </div>
        </div>

        {statusMsg && (
          <div style={{ marginTop: '0.75rem', background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} /> {statusMsg}
          </div>
        )}

        {/* Saved Records Drawer / Card */}
        {showSavedList && savedRecords.length > 0 && (
          <div style={{ marginTop: '1rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#f8fafc' }}>
              Saved Quotation Records Archive
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {savedRecords.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => handleLoadSavedRecord(rec)}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#60a5fa' }}>
                      {rec.common?.ref_no || rec.id}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Items: {rec.common?.items?.length || 0} | {rec.updated_at || 'Saved'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSavedRecord(rec.id, e)}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Input Column & Preview Column */}
      <div className="quotation-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* LEFT COLUMN: Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STEP 1 CARD: Common Information */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#3b82f6', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                1
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Common Details (Applies to All Organizations)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Reference Number (Letter / Tender No.)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={commonData.ref_no}
                  onChange={(e) => setCommonData({ ...commonData, ref_no: e.target.value })}
                  placeholder="e.g. F/DPS/MMC(D)/27"
                  style={{ width: '100%', fontSize: '0.95rem', padding: '0.55rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Reference Date
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={commonData.ref_date}
                  onChange={(e) => setCommonData({ ...commonData, ref_date: e.target.value })}
                  placeholder="e.g. 28/04/2026"
                  style={{ width: '100%', fontSize: '0.95rem', padding: '0.55rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Consignee / Recipient Address (To)
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={commonData.consignee_address}
                onChange={(e) => setCommonData({ ...commonData, consignee_address: e.target.value })}
                placeholder="e.g. AWM (WHEEL)\nEASTERN RLY, JAMALPUR"
                style={{ width: '100%', fontSize: '0.95rem', padding: '0.55rem', fontFamily: 'inherit', lineHeight: 1.4 }}
              />
            </div>

            {/* Particulars / Items Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa' }}>
                  Material Items / Particulars
                </label>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleAddItem}
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {commonData.items.map((item, idx) => (
                  <div key={idx} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ background: '#334155', color: '#94a3b8', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        className="input-field"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                        placeholder="Item Description / Material Specification"
                        style={{ flex: 1, fontSize: '0.9rem', padding: '0.4rem 0.6rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', padding: '0.4rem', cursor: 'pointer' }}
                        title="Delete Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Unit (e.g. mtr, Nos, Set)</span>
                        <input
                          type="text"
                          className="input-field"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem', marginTop: '0.2rem' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Quantity (Editable)</span>
                        <input
                          type="number"
                          className="input-field"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 1)}
                          style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem', marginTop: '0.2rem' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2 CARD: Organization Specific Rates & Dates */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#10b981', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                2
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Organization Rates & Quotation Details
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* HIND TRADERS BOX */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, color: '#f59e0b', fontSize: '1rem', fontWeight: 700 }}>
                    1. Hind Traders
                  </h4>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDownloadDocument('hind', `Quotation_Hind_Traders_${commonData.ref_no.replace(/\//g, '_')}.pdf`)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Download size={13} /> PDF
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDownloadDocument('hind-excel', `Quotation_Hind_Traders_${commonData.ref_no.replace(/\//g, '_')}.xlsx`)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      title="Download Excel Spreadsheet"
                    >
                      <FileCode size={13} /> Excel
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Hind Ref No</label>
                    <input
                      type="text"
                      className="input-field"
                      value={hindData.quotation_ref}
                      onChange={(e) => setHindData({ ...hindData, quotation_ref: e.target.value })}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Hind Date</label>
                    <input
                      type="text"
                      className="input-field"
                      value={hindData.quotation_date}
                      onChange={(e) => setHindData({ ...hindData, quotation_date: e.target.value })}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Enter Rates for Hind Traders (₹):
                </div>
                {commonData.items.map((item, idx) => {
                  const sr = item.sr_no || (idx + 1);
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        #{sr}. {item.description || 'Item'}
                      </span>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Rate ₹"
                        value={hindData.rates[sr] || ''}
                        onChange={(e) => handleRateChange(setHindData, sr, e.target.value)}
                        style={{ width: '100px', fontSize: '0.85rem', padding: '0.3rem 0.5rem', textAlign: 'right' }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* YASHA ENTERPRISES BOX */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, color: '#ec4899', fontSize: '1rem', fontWeight: 700 }}>
                    2. Yasha Enterprises
                  </h4>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDownloadDocument('yasha', `Quotation_Yasha_Enterprises_${commonData.ref_no.replace(/\//g, '_')}.pdf`)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Download size={13} /> PDF
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDownloadDocument('yasha-excel', `Quotation_Yasha_Enterprises_${commonData.ref_no.replace(/\//g, '_')}.xlsx`)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      title="Download Excel Spreadsheet"
                    >
                      <FileCode size={13} /> Excel
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Yasha Ref No</label>
                    <input
                      type="text"
                      className="input-field"
                      value={yashaData.quotation_ref}
                      onChange={(e) => setYashaData({ ...yashaData, quotation_ref: e.target.value })}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Yasha Date</label>
                    <input
                      type="text"
                      className="input-field"
                      value={yashaData.quotation_date}
                      onChange={(e) => setYashaData({ ...yashaData, quotation_date: e.target.value })}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Enter Rates for Yasha Enterprises (₹):
                </div>
                {commonData.items.map((item, idx) => {
                  const sr = item.sr_no || (idx + 1);
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        #{sr}. {item.description || 'Item'}
                      </span>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Rate ₹"
                        value={yashaData.rates[sr] || ''}
                        onChange={(e) => handleRateChange(setYashaData, sr, e.target.value)}
                        style={{ width: '100px', fontSize: '0.85rem', padding: '0.3rem 0.5rem', textAlign: 'right' }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* MADHU ENTERPRISES BOX */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, color: '#10b981', fontSize: '1rem', fontWeight: 700 }}>
                    3. Madhu Enterprises
                  </h4>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDownloadDocument('madhu', `Quotation_Madhu_Enterprises_${commonData.ref_no.replace(/\//g, '_')}.pdf`)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Download size={13} /> PDF
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDownloadDocument('madhu-excel', `Quotation_Madhu_Enterprises_${commonData.ref_no.replace(/\//g, '_')}.xlsx`)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      title="Download Excel Spreadsheet"
                    >
                      <FileCode size={13} /> Excel
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Madhu Ref No</label>
                    <input
                      type="text"
                      className="input-field"
                      value={madhuData.quotation_ref}
                      onChange={(e) => setMadhuData({ ...madhuData, quotation_ref: e.target.value })}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Madhu Date</label>
                    <input
                      type="text"
                      className="input-field"
                      value={madhuData.quotation_date}
                      onChange={(e) => setMadhuData({ ...madhuData, quotation_date: e.target.value })}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Enter Rates for Madhu Enterprises (₹):
                </div>
                {commonData.items.map((item, idx) => {
                  const sr = item.sr_no || (idx + 1);
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        #{sr}. {item.description || 'Item'}
                      </span>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Rate ₹"
                        value={madhuData.rates[sr] || ''}
                        onChange={(e) => handleRateChange(setMadhuData, sr, e.target.value)}
                        style={{ width: '100px', fontSize: '0.85rem', padding: '0.3rem 0.5rem', textAlign: 'right' }}
                      />
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Document Previews */}
        <div>
          <div className="glass-card" style={{ padding: '1rem', position: 'sticky', top: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={20} color="#3b82f6" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Live Document Preview
                </h3>
              </div>

              {/* Organization Preview Switcher Tabs */}
              <div style={{ display: 'flex', gap: '0.35rem', background: '#0f172a', padding: '0.25rem', borderRadius: '8px', border: '1px solid #334155' }}>
                <button
                  className={`tab-btn ${activePreviewTab === 'hind' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('hind')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activePreviewTab === 'hind' ? '#f59e0b' : 'transparent',
                    color: activePreviewTab === 'hind' ? '#000' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Hind Traders
                </button>
                <button
                  className={`tab-btn ${activePreviewTab === 'yasha' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('yasha')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activePreviewTab === 'yasha' ? '#ec4899' : 'transparent',
                    color: activePreviewTab === 'yasha' ? '#fff' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Yasha Enterprises
                </button>
                <button
                  className={`tab-btn ${activePreviewTab === 'madhu' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('madhu')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activePreviewTab === 'madhu' ? '#10b981' : 'transparent',
                    color: activePreviewTab === 'madhu' ? '#fff' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Madhu Enterprises
                </button>
              </div>
            </div>

            {/* Quick Download Button for Current Preview */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
              {activePreviewTab === 'hind' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownloadDocument('hind', `Quotation_Hind_Traders_${commonData.ref_no.replace(/\//g, '_')}.pdf`)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    <Download size={14} /> PDF
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleDownloadDocument('hind-excel', `Quotation_Hind_Traders_${commonData.ref_no.replace(/\//g, '_')}.xlsx`)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    <FileCode size={14} /> Excel
                  </button>
                </>
              )}
              {activePreviewTab === 'yasha' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownloadDocument('yasha', `Quotation_Yasha_Enterprises_${commonData.ref_no.replace(/\//g, '_')}.pdf`)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#ec4899', borderColor: '#db2777' }}
                  >
                    <Download size={14} /> PDF
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleDownloadDocument('yasha-excel', `Quotation_Yasha_Enterprises_${commonData.ref_no.replace(/\//g, '_')}.xlsx`)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    <FileCode size={14} /> Excel
                  </button>
                </>
              )}
              {activePreviewTab === 'madhu' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownloadDocument('madhu', `Quotation_Madhu_Enterprises_${commonData.ref_no.replace(/\//g, '_')}.pdf`)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#10b981', borderColor: '#059669' }}
                  >
                    <Download size={14} /> PDF
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleDownloadDocument('madhu-excel', `Quotation_Madhu_Enterprises_${commonData.ref_no.replace(/\//g, '_')}.xlsx`)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    <FileCode size={14} /> Excel
                  </button>
                </>
              )}
            </div>

            {/* Live Preview Document Render */}
            <div style={{ overflowX: 'auto', background: '#334155', padding: '1rem', borderRadius: '8px' }}>
              {activePreviewTab === 'hind' && <HindQuotationPreview data={currentFullData} />}
              {activePreviewTab === 'yasha' && <YashaQuotationPreview data={currentFullData} />}
              {activePreviewTab === 'madhu' && <MadhuQuotationPreview data={currentFullData} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
