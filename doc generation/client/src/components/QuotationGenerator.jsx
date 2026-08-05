import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Plus, Trash2, Download, Eye, FileText, CheckCircle, Save, FolderOpen, FileCode, ArrowRightLeft, Zap } from 'lucide-react';
import HindQuotationPreview from './previews/HindQuotationPreview';
import YashaQuotationPreview from './previews/YashaQuotationPreview';
import MadhuQuotationPreview from './previews/MadhuQuotationPreview';
import LovelyQuotationPreview from './previews/LovelyQuotationPreview';
import RajuQuotationPreview from './previews/RajuQuotationPreview';

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
  const [activePreviewTab, setActivePreviewTab] = useState('hind'); // 'hind' | 'yasha' | 'madhu' | 'lovely' | 'raju'
  const [savedRecords, setSavedRecords] = useState([]);
  const [showSavedList, setShowSavedList] = useState(false);

  // Common Details State (Starts empty until loaded, imported, uploaded, or added)
  const [commonData, setCommonData] = useState({
    ref_no: '',
    ref_date: '',
    consignee_address: '',
    items: []
  });

  // Organization Specific States
  const [hindData, setHindData] = useState({
    quotation_ref: '',
    quotation_date: '',
    rates: {}
  });

  const [yashaData, setYashaData] = useState({
    quotation_ref: '',
    quotation_date: '',
    rates: {}
  });

  const [madhuData, setMadhuData] = useState({
    quotation_ref: '',
    quotation_date: '',
    rates: {}
  });

  const [lovelyData, setLovelyData] = useState({
    quotation_ref: '',
    quotation_date: '',
    rates: {}
  });

  const [rajuData, setRajuData] = useState({
    quotation_ref: '',
    quotation_date: '',
    rates: {}
  });

  const [lowestOrgKey, setLowestOrgKey] = useState('hind'); // 'hind' | 'yasha' | 'madhu' | 'lovely' | 'raju'

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

  // Auto-Set Lowest Organization (L1) and generate higher rates for other 4 orgs (+₹2 to +₹20)
  const handleAutoSetLowestOrg = (targetL1Key = lowestOrgKey, currentItems = commonData.items) => {
    const orgKeys = ['hind', 'yasha', 'madhu', 'lovely', 'raju'];
    const orgLabels = {
      hind: 'Hind Traders',
      yasha: 'Yasha Enterprises',
      madhu: 'Madhu Enterprises',
      lovely: 'Lovely General Order Supplier',
      raju: 'Raju Engineering Works'
    };

    const currentStates = {
      hind: hindData,
      yasha: yashaData,
      madhu: madhuData,
      lovely: lovelyData,
      raju: rajuData
    };

    const setters = {
      hind: setHindData,
      yasha: setYashaData,
      madhu: setMadhuData,
      lovely: setLovelyData,
      raju: setRajuData
    };

    const l1State = currentStates[targetL1Key];
    const items = currentItems || [];

    const newRatesMap = {
      hind: {},
      yasha: {},
      madhu: {},
      lovely: {},
      raju: {}
    };

    items.forEach((item, idx) => {
      const sr = item.sr_no || (idx + 1);
      const rawVal = l1State.rates[sr] || l1State.rates[String(sr)] || item.rate;
      let baseRate = Math.round(Number(rawVal));
      if (isNaN(baseRate) || baseRate <= 0) {
        baseRate = 20 + (idx * 5);
      }

      newRatesMap[targetL1Key][sr] = String(baseRate);

      orgKeys.forEach((key) => {
        if (key !== targetL1Key) {
          const increment = Math.floor(Math.random() * 19) + 2; // integer 2 to 20
          newRatesMap[key][sr] = String(baseRate + increment);
        }
      });
    });

    orgKeys.forEach((key) => {
      setters[key](prev => ({
        ...prev,
        rates: newRatesMap[key]
      }));
    });

    setStatusMsg(`Set "${orgLabels[targetL1Key]}" as Lowest (L1)! Other 4 organization rates auto-calculated +₹2 to +₹20 higher per item (no decimals).`);
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

    handleAutoSetLowestOrg(lowestOrgKey, poItems);
  };

  // Save Quotation Draft
  const handleSaveQuotationDraft = async () => {
    setIsSaving(true);
    const payload = {
      record_type: 'quotation',
      common: commonData,
      hind_traders: hindData,
      yasha_enterprises: yashaData,
      madhu_enterprises: madhuData,
      lovely_supplier: lovelyData,
      raju_engineering_works: rajuData
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
    if (rec.lovely_supplier) setLovelyData(rec.lovely_supplier);
    if (rec.raju_engineering_works) setRajuData(rec.raju_engineering_works);
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
        const parsedItems = parsed.items || [];

        setCommonData({
          ref_no: parsed.ref_no || 'F/DPS/MMC(D)/27',
          ref_date: parsed.ref_date || new Date().toLocaleDateString('en-GB'),
          consignee_address: parsed.consignee_address || 'AWM (WHEEL)\nEASTERN RLY, JAMALPUR',
          items: parsedItems
        });

        handleAutoSetLowestOrg(lowestOrgKey, parsedItems);
        setStatusMsg(`Successfully extracted ${parsedItems.length} items from ${file.name}! L1 rates auto-configured.`);
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
      madhu_enterprises: madhuData,
      lovely_supplier: lovelyData,
      raju_engineering_works: rajuData
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
    madhu_enterprises: madhuData,
    lovely_supplier: lovelyData,
    raju_engineering_works: rajuData
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
              Generate custom quotations for <strong>Hind Traders</strong>, <strong>Yasha Enterprises</strong>, <strong>Madhu Enterprises</strong>, <strong>Lovely Supplier</strong>, and <strong>Raju Engineering Works</strong> with AI document import.
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
              Download All 5 (ZIP)
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

              {commonData.items.length === 0 ? (
                <div style={{
                  background: '#0f172a',
                  border: '2px dashed #334155',
                  borderRadius: '8px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  color: '#94a3b8'
                }}>
                  <FileText size={36} color="#64748b" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#cbd5e1' }}>No Particulars Loaded Yet</div>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.35rem', color: '#64748b', maxWidth: '420px', margin: '0.35rem auto 0 auto', lineHeight: 1.4 }}>
                    Fields start empty by default. Upload a document (PDF/Photo) above, import from active PO, load a saved draft, or add manually below.
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddItem}
                    style={{ marginTop: '1rem', fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                  >
                    <Plus size={16} /> Add First Particular
                  </button>
                </div>
              ) : (
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
              )}
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

            {/* L1 LOWEST BIDDER CONTROLS */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              border: '1.5px solid #6366f1',
              borderRadius: '10px',
              padding: '1.1rem 1.25rem',
              marginBottom: '1.25rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#a5b4fc', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} color="#fbbf24" /> Select Lowest Organization (L1 Rates)
                  </h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    Choose winning L1 organization. Other 4 orgs will be auto-calculated <strong>₹2 to ₹20 higher per item</strong> (integers only, no decimals).
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <select
                    value={lowestOrgKey}
                    onChange={(e) => {
                      setLowestOrgKey(e.target.value);
                      handleAutoSetLowestOrg(e.target.value);
                    }}
                    style={{
                      background: '#0f172a',
                      color: '#f8fafc',
                      border: '1.5px solid #6366f1',
                      borderRadius: '6px',
                      padding: '0.5rem 0.85rem',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="hind">1. Hind Traders (L1)</option>
                    <option value="yasha">2. Yasha Enterprises (L1)</option>
                    <option value="madhu">3. Madhu Enterprises (L1)</option>
                    <option value="lovely">4. Lovely Supplier (L1)</option>
                    <option value="raju">5. Raju Engineering (L1)</option>
                  </select>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleAutoSetLowestOrg(lowestOrgKey)}
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.5rem 1rem',
                      background: '#6366f1',
                      borderColor: '#4f46e5',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 700
                    }}
                  >
                    <Zap size={16} /> Re-Calculate L1 (+₹2 to +₹20)
                  </button>
                </div>
              </div>
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

              {/* LOVELY GENERAL ORDER SUPPLIER BOX */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, color: '#a855f7', fontSize: '1rem', fontWeight: 700 }}>
                    4. Lovely General Order Supplier
                  </h4>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDownloadDocument('lovely', `Quotation_Lovely_Supplier_${commonData.ref_no.replace(/\//g, '_')}.pdf`)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Download size={13} /> PDF
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDownloadDocument('lovely-excel', `Quotation_Lovely_Supplier_${commonData.ref_no.replace(/\//g, '_')}.xlsx`)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      title="Download Excel Spreadsheet"
                    >
                      <FileCode size={13} /> Excel
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lovely Ref No</label>
                    <input
                      type="text"
                      className="input-field"
                      value={lovelyData.quotation_ref}
                      onChange={(e) => setLovelyData({ ...lovelyData, quotation_ref: e.target.value })}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lovely Date</label>
                    <input
                      type="text"
                      className="input-field"
                      value={lovelyData.quotation_date}
                      onChange={(e) => setLovelyData({ ...lovelyData, quotation_date: e.target.value })}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Enter Rates for Lovely Supplier (₹):
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
                        value={lovelyData.rates[sr] || ''}
                        onChange={(e) => handleRateChange(setLovelyData, sr, e.target.value)}
                        style={{ width: '100px', fontSize: '0.85rem', padding: '0.3rem 0.5rem', textAlign: 'right' }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* RAJU ENGINEERING WORKS BOX */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, color: '#06b6d4', fontSize: '1rem', fontWeight: 700 }}>
                    5. Raju Engineering Works
                  </h4>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDownloadDocument('raju', `Quotation_Raju_Engineering_${commonData.ref_no.replace(/\//g, '_')}.pdf`)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Download size={13} /> PDF
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDownloadDocument('raju-excel', `Quotation_Raju_Engineering_${commonData.ref_no.replace(/\//g, '_')}.xlsx`)}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      title="Download Excel Spreadsheet"
                    >
                      <FileCode size={13} /> Excel
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Raju Ref No</label>
                    <input
                      type="text"
                      className="input-field"
                      value={rajuData.quotation_ref}
                      onChange={(e) => setRajuData({ ...rajuData, quotation_ref: e.target.value })}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Raju Date</label>
                    <input
                      type="text"
                      className="input-field"
                      value={rajuData.quotation_date}
                      onChange={(e) => setRajuData({ ...rajuData, quotation_date: e.target.value })}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Enter Rates for Raju Engineering (₹):
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
                        value={rajuData.rates[sr] || ''}
                        onChange={(e) => handleRateChange(setRajuData, sr, e.target.value)}
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
              <div style={{ display: 'flex', gap: '0.35rem', background: '#0f172a', padding: '0.25rem', borderRadius: '8px', border: '1px solid #334155', flexWrap: 'wrap' }}>
                <button
                  className={`tab-btn ${activePreviewTab === 'hind' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('hind')}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activePreviewTab === 'hind' ? '#f59e0b' : 'transparent',
                    color: activePreviewTab === 'hind' ? '#000' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Hind
                </button>
                <button
                  className={`tab-btn ${activePreviewTab === 'yasha' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('yasha')}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activePreviewTab === 'yasha' ? '#ec4899' : 'transparent',
                    color: activePreviewTab === 'yasha' ? '#fff' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Yasha
                </button>
                <button
                  className={`tab-btn ${activePreviewTab === 'madhu' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('madhu')}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activePreviewTab === 'madhu' ? '#10b981' : 'transparent',
                    color: activePreviewTab === 'madhu' ? '#fff' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Madhu
                </button>
                <button
                  className={`tab-btn ${activePreviewTab === 'lovely' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('lovely')}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activePreviewTab === 'lovely' ? '#a855f7' : 'transparent',
                    color: activePreviewTab === 'lovely' ? '#fff' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Lovely
                </button>
                <button
                  className={`tab-btn ${activePreviewTab === 'raju' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('raju')}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activePreviewTab === 'raju' ? '#06b6d4' : 'transparent',
                    color: activePreviewTab === 'raju' ? '#fff' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Raju Engg
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
              {activePreviewTab === 'lovely' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownloadDocument('lovely', `Quotation_Lovely_Supplier_${commonData.ref_no.replace(/\//g, '_')}.pdf`)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#a855f7', borderColor: '#9333ea' }}
                  >
                    <Download size={14} /> PDF
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleDownloadDocument('lovely-excel', `Quotation_Lovely_Supplier_${commonData.ref_no.replace(/\//g, '_')}.xlsx`)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    <FileCode size={14} /> Excel
                  </button>
                </>
              )}
              {activePreviewTab === 'raju' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownloadDocument('raju', `Quotation_Raju_Engineering_${commonData.ref_no.replace(/\//g, '_')}.pdf`)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#06b6d4', borderColor: '#0891b2' }}
                  >
                    <Download size={14} /> PDF
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleDownloadDocument('raju-excel', `Quotation_Raju_Engineering_${commonData.ref_no.replace(/\//g, '_')}.xlsx`)}
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
              {activePreviewTab === 'lovely' && <LovelyQuotationPreview data={currentFullData} />}
              {activePreviewTab === 'raju' && <RajuQuotationPreview data={currentFullData} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
