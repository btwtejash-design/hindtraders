import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PoUploader from './components/PoUploader';
import DataEditor from './components/DataEditor';
import SavedRecordsManager from './components/SavedRecordsManager';
import QuotationGenerator from './components/QuotationGenerator';
import TaxInvoicePreview from './components/previews/TaxInvoicePreview';
import ChallanPreview from './components/previews/ChallanPreview';
import GcPreview from './components/previews/GcPreview';
import { FileText, Truck, ShieldCheck, Download, Printer, CheckCircle, FileCode } from 'lucide-react';

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

export default function App() {
  const [activeMode, setActiveMode] = useState('quotations'); // 'quotations' | 'po'
  const [poData, setPoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tax-invoice'); // 'tax-invoice' | 'challan' | 'gc'
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    // Start empty on app load as requested
  }, []);

  const loadSampleData = async () => {
    setIsLoading(true);
    setStatusMsg('Loading sample purchase order PO #55265692101304...');
    try {
      const res = await fetch(`${API_BASE}/sample-data`);
      if (res.ok) {
        const data = await res.json();
        if (!data.invoice_no) data.invoice_no = '42';
        if (!data.invoice_date) data.invoice_date = '15/06/2026';
        data.challan_no = data.invoice_no;
        if (!data.challan_date) data.challan_date = '24/07/2026';
        if (!data.gc_file_no) data.gc_file_no = 'HT/GC-WC/26-27';
        if (!data.gc_date) data.gc_date = '24/07/2026';
        if (data.crn_no === undefined) data.crn_no = '';
        if (data.crn_date === undefined) data.crn_date = '';

        setPoData(data);
        setStatusMsg('Sample PO loaded successfully!');
      } else {
        loadFallbackSample();
      }
    } catch (err) {
      loadFallbackSample();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackSample = () => {
    setPoData({
      id: 'REC-55265692101304',
      po_number: '55265692101304',
      po_date: '13/07/2026',
      consignee: 'SSE/DPS/JAMALPUR',
      invoice_no: '42',
      invoice_date: '15/06/2026',
      challan_no: '42',
      challan_date: '24/07/2026',
      gc_file_no: 'HT/GC-WC/26-27',
      gc_date: '24/07/2026',
      crn_no: '',
      crn_date: '',
      vendor: {
        name: 'Hind Traders',
        address: 'Chhoti Keshopur Nakki Nagar, Jamalpur, Bihar, 811214',
        phone: '+91 7903235877',
        email: 'hindtraders19699@gmail.com',
        gstin: '10DFIPK1994B1ZS',
        bank_name: 'Bank Of Baroda',
        account_no: '37230200000116',
        ifsc: 'BARB0JAMALP',
        branch: 'JAMALPUR'
      },
      bill_to: {
        name: 'Deputy Chief Account Officer (W)',
        department: 'Eastern Railway Locomotive Workshop',
        location: 'Jamalpur, Bihar',
        consignee: '--',
        state_code: 'Bihar - 10'
      },
      items: [
        {
          sr_no: 1,
          pl_no: '19390075',
          description: 'SPRING (LENGTH -22 MM, DIA - 11 MM. OD, ID - 9 MM., NO. OF TURN - 16 NOS. Accepted Make. Indigenous.',
          hsn: '7318',
          quantity: 100,
          unit: 'Nos',
          quantity_display: '100Nos',
          rate: 34.0,
          total_amount: 3400.0,
          gst_percent: 18.0
        },
        {
          sr_no: 2,
          pl_no: '31151784',
          description: 'SPRING (LENGTH -12 MM, DIA - 7 MM. OD, ID - 5 MM., NO. THICKNESS - 1/2 MM. NO. OF TURN - 24 NOS. Accepted Make. Indigenous.',
          hsn: '7318',
          quantity: 200,
          unit: 'Nos',
          quantity_display: '200Nos',
          rate: 24.5,
          total_amount: 4900.0,
          gst_percent: 18.0
        },
        {
          sr_no: 3,
          pl_no: '466155281493',
          description: 'BUS BAR INSULATORS HEX TYPE HIGHT-66 MM., DIA - 3 MM. FOR BATTERY CHARGER Accepted Make. Indigenous.',
          hsn: '7318',
          quantity: 200,
          unit: 'Nos',
          quantity_display: '200Nos',
          rate: 147.5,
          total_amount: 29500.0,
          gst_percent: 18.0
        }
      ]
    });
  };

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setStatusMsg(`Uploading and parsing ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/parse-po`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        data.invoice_no = '42';
        data.invoice_date = new Date().toLocaleDateString('en-GB');
        data.challan_no = data.invoice_no;
        data.challan_date = new Date().toLocaleDateString('en-GB');
        data.gc_file_no = 'HT/GC-WC/26-27';
        data.gc_date = new Date().toLocaleDateString('en-GB');
        data.crn_no = '';
        data.crn_date = '';

        setPoData(data);
        setStatusMsg(`Successfully extracted and saved data from ${file.name}!`);
      } else {
        const errJson = await res.json();
        alert(`Parsing error: ${errJson.detail}`);
      }
    } catch (err) {
      alert(`Network error parsing PO file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackendFile = async (endpoint, defaultFilename) => {
    if (!poData) return;
    try {
      const res = await fetch(`${API_BASE}/generate/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData)
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultFilename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error generating document on server');
      }
    } catch (err) {
      alert(`Failed to download document: ${err.message}`);
    }
  };

  const exportAllPdfBundle = async () => {
    if (!poData) return;
    await downloadBackendFile('bundle-pdf', `Documents_Bundle_PO_${poData.po_number}.zip`);
  };

  const exportQuotationBundle = async () => {
    try {
      const res = await fetch(`${API_BASE}/quotations/sample`);
      const sample = res.ok ? await res.json() : null;
      const payload = sample || {
        common: { ref_no: 'F/DPS/MMC(D)/27' }
      };
      const resBundle = await fetch(`${API_BASE}/quotations/generate/bundle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resBundle.ok) {
        const blob = await resBundle.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Quotations_Bundle.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(`Quotation bundle error: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onLoadSample={loadSampleData}
        onExportAll={exportAllPdfBundle}
        onExportQuotationBundle={exportQuotationBundle}
        onPrintCurrent={handlePrint}
        hasPo={!!poData}
        activeMode={activeMode}
        onModeChange={setActiveMode}
      />

      {statusMsg && activeMode === 'po' && (
        <div className="no-print" style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '0.4rem 1.5rem', fontSize: '0.8rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle size={14} /> {statusMsg}
        </div>
      )}

      {activeMode === 'quotations' ? (
        <QuotationGenerator poData={poData} />
      ) : (

        <main className="dashboard-grid">
        {/* LEFT COLUMN: Controls, Editor & Saved Archive */}
        <div className="no-print">
          <PoUploader
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            currentPoNo={poData?.po_number}
          />

          {poData && (
            <DataEditor
              poData={poData}
              onChange={setPoData}
            />
          )}

          <SavedRecordsManager
            apiBase={API_BASE}
            onLoadRecord={(rec) => {
              setPoData(rec);
              setStatusMsg(`Loaded saved record PO #${rec.po_number}`);
            }}
            currentRecordId={poData?.id || poData?.po_number}
          />
        </div>

        {/* RIGHT COLUMN: Document Tabs & Live Document Preview */}
        <div>
          {!poData ? (
            <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <FileText size={32} color="#3b82f6" />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No Purchase Order Loaded
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: '460px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                Upload an official IREPS Purchase Order PDF file using the left panel, or click <strong>Load Sample PO</strong> in the top header to preview and edit documents.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={loadSampleData}>
                  Load Sample PO
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div className="tabs-container" style={{ margin: 0, border: 'none', flexWrap: 'wrap' }}>
                  <button
                    className={`tab-btn ${activeTab === 'tax-invoice' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tax-invoice')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FileText size={16} /> Tax Invoice
                  </button>

                  <button
                    className={`tab-btn ${activeTab === 'challan' ? 'active' : ''}`}
                    onClick={() => setActiveTab('challan')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Truck size={16} /> Delivery Challan
                  </button>

                  <button
                    className={`tab-btn ${activeTab === 'gc' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gc')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ShieldCheck size={16} /> Guarantee Certificate (GC)
                  </button>
                </div>

                {/* PDF & Source Export Actions */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {activeTab === 'tax-invoice' && (
                    <>
                      <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => downloadBackendFile('tax-invoice-pdf', `Tax_Invoice_${poData.invoice_no}.pdf`)}>
                        <Download size={14} /> PDF
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} title="Download Excel" onClick={() => downloadBackendFile('tax-invoice', `Tax_Invoice_${poData.invoice_no}.xlsx`)}>
                        <FileCode size={14} /> Excel
                      </button>
                    </>
                  )}

                  {activeTab === 'challan' && (
                    <>
                      <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => downloadBackendFile('challan-pdf', `Delivery_Challan_${poData.challan_no}.pdf`)}>
                        <Download size={14} /> PDF
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} title="Download Excel" onClick={() => downloadBackendFile('challan', `Delivery_Challan_${poData.challan_no}.xlsx`)}>
                        <FileCode size={14} /> Excel
                      </button>
                    </>
                  )}

                  {activeTab === 'gc' && (
                    <>
                      <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => downloadBackendFile('gc-pdf', `Guarantee_Certificate_${poData.po_number}.pdf`)}>
                        <Download size={14} /> PDF
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} title="Download Word" onClick={() => downloadBackendFile('gc', `Guarantee_Certificate_${poData.po_number}.docx`)}>
                        <FileCode size={14} /> Word
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Document Paper Render Container */}
              <div className="document-paper-container">
                {activeTab === 'tax-invoice' && <TaxInvoicePreview poData={poData} />}
                {activeTab === 'challan' && <ChallanPreview poData={poData} />}
                {activeTab === 'gc' && <GcPreview poData={poData} />}
              </div>
            </div>
          )}
        </div>
      </main>
      )}
    </div>
  );
}
