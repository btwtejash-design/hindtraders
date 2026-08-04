import React from 'react';

export default function HindQuotationPreview({ data }) {
  const common = data?.common || {};
  const hindData = data?.hind_traders || {};
  const items = common.items || [];
  const rates = hindData.rates || {};

  const consigneeLines = (common.consignee_address || "AWM (WHEEL)\nEASTERN RLY,\nJAMALPUR").split("\n");

  return (
    <div className="quotation-preview-container print-document" style={{
      background: '#fff',
      color: '#000',
      padding: '2rem 2.5rem',
      fontFamily: 'Helvetica, Arial, sans-serif',
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
        {/* Top Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', lineHeight: 1.3 }}>
            GSTIN - 10DFIPK1994B1ZS<br />
            TIN VAT No- 10564553025
          </div>

          <div style={{ textAlign: 'center' }}>
            <img
              src="/sample/hindtraders-top.jpg"
              alt="Hind Traders Header"
              style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <h2 className="fallback-title" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Hind Traders</h2>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 'bold', lineHeight: 1.3 }}>
            <u>Engineering & Machineries</u><br />
            CHHOTI KESHOPUR<br />
            NAKKI NAGAR, JAMALPUR<br />
            <u>Mob:-</u> 7903235877
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '0.5rem 0 1rem 0' }} />

        {/* Quotation Ref & Title Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '1rem' }}>
            Ref :- {hindData.quotation_ref || 'HT/BQ/26-27'}
          </div>

          <div style={{
            border: '2px solid #000',
            padding: '0.35rem 1.25rem',
            fontWeight: 'bold',
            fontSize: '1.05rem',
            letterSpacing: '0.05em'
          }}>
            BUDGETARY QUOTATION
          </div>

          <div style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '1rem' }}>
            Date: {hindData.quotation_date || '03/08/2026'}
          </div>
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
          <div><u>Ref No:-</u> {common.ref_no || 'F/DPS/MMC(D)/27'}</div>
          <div><u>Date:-</u> {common.ref_date || '05/2026'}</div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              <th style={{ border: '1px solid #000', padding: '8px', width: '10%', textAlign: 'center' }}>Sl. No</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '60%', textAlign: 'left' }}>Description</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '15%', textAlign: 'center' }}>Qty</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '15%', textAlign: 'center' }}>Rate</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const sr = item.sr_no || (idx + 1);
              const rateVal = rates[sr] || rates[String(sr)] || '';
              const qtyNum = item.quantity ?? 1;
              const qtyDisplay = `${qtyNum} ${item.unit || 'mtr'}`;

              return (
                <tr key={idx} style={{ height: '40px' }}>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{sr}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 10px', fontWeight: 'bold' }}>{item.description}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{qtyDisplay}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>
                    {rateVal ? `Rs. ${rateVal}` : 'Rs. 0'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Intact Footer at Bottom Most */}
      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px dashed #ccc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
            <strong style={{ fontSize: '0.95rem' }}>Terms & Condition</strong><br />
            1. GST@18% Extra<br />
            2. For Destination<br />
            3. Delivery within 30 days<br />
            4. Material guaranteed as per IRS terms & conditions
          </div>

          <div style={{ textAlign: 'right' }}>
            <img
              src="/sample/hind-stamp.jpg"
              alt="Hind Traders Stamp"
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
            <div className="fallback-stamp" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              HIND TRADERS<br />Satish Kumar (Proprietor)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

