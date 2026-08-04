import React from 'react';

export default function MadhuQuotationPreview({ data }) {
  const common = data?.common || {};
  const madhuData = data?.madhu_enterprises || {};
  const items = common.items || [];
  const rates = madhuData.rates || {};

  const consigneeLines = (common.consignee_address || "The, AWM (DIESEL)\nEASTERN RLY, JAMALPUR").split("\n");

  return (
    <div className="quotation-preview-container print-document" style={{
      background: '#fff',
      color: '#2e7d32',
      padding: '2rem 2.5rem',
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: '0.95rem',
      lineHeight: 1.3,
      minHeight: '297mm',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      borderRadius: '4px',
      margin: '0 auto',
      maxWidth: '800px',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      {/* Top Body Content */}
      <div style={{ flex: 1 }}>
        {/* Header Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ color: '#2e7d32', fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '0.04em' }}>
              MADHU ENTERPRISES
            </h1>
            <div style={{
              border: '1px solid #2e7d32',
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: '#2e7d32',
              marginTop: '4px',
              display: 'inline-block'
            }}>
              <strong>Supplier Of :</strong> All Types of Mechanical Spare, Fabrication Work, Hydraulic Related Job & General Order Supplier
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8rem', fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1.4, color: '#2e7d32' }}>
            <strong>GSTIN No. : 10AXZPS6246GIZ0</strong><br />
            <strong>Vender Code : 62402</strong><br />
            <strong>Mobile No. : 9471903155</strong><br />
            <strong>email : rsharma19711@gmail.com</strong>
          </div>
        </div>

        {/* Address Bar */}
        <div style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: 'bold', fontFamily: 'Helvetica, Arial, sans-serif', margin: '0.5rem 0 1.25rem 0', color: '#2e7d32' }}>
          MADHOPUR, NAYA TOLA, MUNGER - 811202 (BIHAR)
        </div>

        {/* Ref & Date Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '1.25rem', fontSize: '0.95rem', color: '#2e7d32' }}>
          <div>Ref. No :- <span style={{ borderBottom: '1px dotted #2e7d32' }}>{madhuData.quotation_ref || 'ME/12/26-27'}</span></div>
          <div>Date . <span style={{ borderBottom: '1px dotted #2e7d32' }}>{madhuData.quotation_date || '06/05/2026'}</span></div>
        </div>

        {/* Recipient Address */}
        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.4, color: '#2e7d32' }}>
          TO,<br />
          {consigneeLines.map((line, i) => (
            <div key={i} style={{ paddingLeft: '1.5rem' }}>{line}</div>
          ))}
        </div>

        {/* Tender Ref No & Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '1.5rem', fontSize: '0.95rem', color: '#2e7d32' }}>
          <div>Ref. No :- {common.ref_no || 'F/DPS/MMC(D)/27'}</div>
          <div>Date:- {common.ref_date || '28/04/2026'}</div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #2e7d32', padding: '8px', width: '10%', textAlign: 'center', color: '#2e7d32' }}>Sl. No</th>
              <th style={{ border: '1px solid #2e7d32', padding: '8px', width: '60%', textAlign: 'center', color: '#2e7d32' }}>Description</th>
              <th style={{ border: '1px solid #2e7d32', padding: '8px', width: '15%', textAlign: 'center', color: '#2e7d32' }}>Qty</th>
              <th style={{ border: '1px solid #2e7d32', padding: '8px', width: '15%', textAlign: 'center', color: '#2e7d32' }}>Rate</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const sr = item.sr_no || (idx + 1);
              const rateVal = rates[sr] || rates[String(sr)] || '';
              const qtyNum = item.quantity ?? 1;
              const qtyDisplay = `${qtyNum} ${item.unit || 'Nos'}`;

              return (
                <tr key={idx} style={{ height: '40px' }}>
                  <td style={{ border: '1px solid #2e7d32', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>{sr}</td>
                  <td style={{ border: '1px solid #2e7d32', padding: '6px 10px', fontWeight: 'bold', color: '#000', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>{item.description}</td>
                  <td style={{ border: '1px solid #2e7d32', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>{qtyDisplay}</td>
                  <td style={{ border: '1px solid #2e7d32', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
                    {rateVal ? `₹${rateVal}` : '₹0'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Intact Footer at Bottom Most */}
      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px dashed #2e7d32' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', fontStyle: 'italic', color: '#2e7d32', lineHeight: 1.5 }}>
            Terms & Condition<br />
            1. GST@18% Extra<br />
            2. For Destination<br />
            3. Delivery within 30 days<br />
            4. As per IRS terms & conditions
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: "'Brush Script MT', cursive, Georgia, serif",
              fontSize: '1.4rem',
              color: '#1565c0',
              fontWeight: 'bold',
              marginBottom: '4px'
            }}>
              Yours Sincerely
            </div>
            <img
              src="/sample/madhu-stamp.jpg"
              alt="Madhu Enterprises Stamp"
              style={{ maxWidth: '180px', height: 'auto', display: 'inline-block' }}
              onLoad={(e) => {
                const next = e.target.nextElementSibling;
                if (next) next.style.display = 'none';
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                const next = e.target.nextElementSibling;
                if (next) next.style.display = 'block';
              }}
            />
            <div className="fallback-stamp" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1565c0' }}>
              MADHU ENTERPRISES<br />Rakesh Sharma (Proprietor)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

