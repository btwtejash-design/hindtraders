import React from 'react';

export default function LovelyQuotationPreview({ data }) {
  const common = data?.common || {};
  const lovelyData = data?.lovely_supplier || {};
  const items = common.items || [];
  const rates = lovelyData.rates || {};

  const consigneeLines = (common.consignee_address || "The, AWM (DIESEL)\nEASTERN RLY, JAMALPUR").split("\n");

  return (
    <div className="quotation-preview-container print-document" style={{
      background: '#fff',
      color: '#000',
      padding: '2rem 2.5rem',
      fontFamily: "'Garamond', 'Georgia', 'Times New Roman', serif",
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
        {/* Top GST, Vender Code & Mobile Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', fontStyle: 'italic' }}>
          <div>
            GSTIN- 10EOBPK6340Q1ZU<br />
            Vender Code: 57722
          </div>
          <div style={{ textAlign: 'right' }}>
            <u>Mob.:</u> 9852949143
          </div>
        </div>

        {/* Top Banner Image Header */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <img
            src="/sample/lovely-top.jpg"
            alt="Lovely General Order Supplier Header"
            style={{ width: '100%', maxHeight: '110px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
          <h1 className="fallback-title" style={{ margin: 0, fontSize: '1.7rem', fontWeight: 800, fontFamily: 'serif' }}>
            LOVELY GENERAL ORDER SUPPLIER
          </h1>
        </div>

        {/* Ref & Date Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontStyle: 'italic', fontSize: '0.95rem', margin: '0.5rem 0' }}>
          <div><u>Ref:-</u> {lovelyData.quotation_ref || 'LV/23/26-27'}</div>
          <div>Date:- {lovelyData.quotation_date || '29/04/2026'}</div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #444', margin: '0.5rem 0 1rem 0' }} />

        {/* Budgetary Quotation Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <span style={{
            fontSize: '1.15rem',
            fontWeight: 'bold',
            textDecoration: 'underline',
            letterSpacing: '0.02em'
          }}>
            Budgetary Quotation
          </span>
        </div>

        {/* Recipient Address */}
        <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
          TO,<br />
          {consigneeLines.map((line, i) => (
            <div key={i} style={{ paddingLeft: '1.5rem' }}>{line}</div>
          ))}
        </div>

        {/* Ref No & Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          <div><u>Ref:-</u> {common.ref_no || 'F/DPS/MMC(D)/27'}</div>
          <div><u>Date:-</u> {common.ref_date || '28/04/2026'}</div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ background: '#222', color: '#fff' }}>
              <th style={{ border: '1px solid #000', padding: '8px', width: '10%', textAlign: 'center' }}>[Sl. No</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '60%', textAlign: 'center' }}>Description</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '15%', textAlign: 'center' }}>Qty</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '15%', textAlign: 'center' }}>Rate</th>
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
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{sr}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 10px', fontWeight: 'bold' }}>{item.description}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{qtyDisplay}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>
                    {rateVal ? `${rateVal}/-` : '0/-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Intact Footer at Bottom Most */}
      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px dashed #aaa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.5 }}>
            <strong style={{ textDecoration: 'underline', fontSize: '0.95rem' }}>Terms & Condition</strong><br />
            1. GST@18% Extra<br />
            2. For Destination<br />
            3. Delivery within 30 days
          </div>

          <div style={{ textAlign: 'right' }}>
            <img
              src="/sample/lovely-stamp.jpg"
              alt="Lovely General Order Supplier Stamp"
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
            <div className="fallback-stamp" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1e3a8a' }}>
              LOVELY GENERAL ORDER SUPPLIER<br />Manish Kumar (Proprietor)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
