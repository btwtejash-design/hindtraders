import React from 'react';

export default function RajuQuotationPreview({ data }) {
  const common = data?.common || {};
  const rajuData = data?.raju_engineering_works || {};
  const items = common.items || [];
  const rates = rajuData.rates || {};

  const consigneeLines = (common.consignee_address || "Dy, CMT\nEASTERN RLY. JAMALPUR").split("\n");

  return (
    <div className="quotation-preview-container print-document" style={{
      background: '#fff',
      color: '#000',
      padding: '2.2rem 2.5rem',
      fontFamily: "'Courier New', Courier, 'Lucida Console', monospace",
      fontSize: '0.92rem',
      lineHeight: 1.4,
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
        {/* Top GSTIN, MSME & Mobile Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '0.6rem' }}>
          <div>
            GSTIN- 10JRHPK4490P1Z8<br />
            MSME- UDYAM-BR-22-4015162
          </div>
          <div style={{ textAlign: 'right' }}>
            <u>Mob:-</u> 8651757734
          </div>
        </div>

        {/* Center Header */}
        <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '0.05em', color: '#000' }}>
            M/S RAJU ENGINEERING WORKS
          </h1>
          <div style={{ fontSize: '0.92rem', fontWeight: 'bold', marginTop: '3px', color: '#111' }}>
            Railway Contractor
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 'bold', marginTop: '2px', color: '#222' }}>
            Fulka Gumti, Post-Jamalpur, Munger, Bihar, 811214
          </div>
          <div style={{ fontSize: '0.78rem', color: '#333', marginTop: '1px' }}>
            Email- rajuengineeringworksjmp@gmail.com
          </div>
        </div>

        {/* Ref & Date Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.98rem', margin: '0.75rem 0 0.5rem 0' }}>
          <div><u>REF.-</u> {rajuData.quotation_ref || 'REW/BQ/26-27'}</div>
          <div>DATE:- {rajuData.quotation_date || '02/06/2026'}</div>
        </div>

        <hr style={{ border: 'none', borderTop: '2px solid #000', margin: '0.5rem 0 1.25rem 0' }} />

        {/* Recipient Address */}
        <div style={{ fontWeight: 'bold', fontSize: '0.98rem', marginBottom: '1.25rem', lineHeight: 1.45 }}>
          To.<br />
          {consigneeLines.map((line, i) => (
            <div key={i} style={{ paddingLeft: '1.5rem' }}>{line}</div>
          ))}
        </div>

        {/* Tender Ref No & Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '0.98rem' }}>
          <div>REF. <u>No:-</u> {common.ref_no || 'Nil'}</div>
          <div>DATE:- {common.ref_date || 'Nil'}</div>
        </div>

        {/* Items Table - Heavy Monospace 2px Border Box */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ background: '#000', color: '#fff' }}>
              <th style={{ border: '1px solid #000', padding: '9px 6px', width: '10%', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.05em' }}>SR. NO</th>
              <th style={{ border: '1px solid #000', padding: '9px 10px', width: '60%', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.05em' }}>DESCRIPTION</th>
              <th style={{ border: '1px solid #000', padding: '9px 6px', width: '15%', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.05em' }}>QTY</th>
              <th style={{ border: '1px solid #000', padding: '9px 6px', width: '15%', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.05em' }}>RATE</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const sr = item.sr_no || (idx + 1);
              const rateVal = rates[sr] || rates[String(sr)] || '';
              const qtyNum = item.quantity ?? 1;
              const qtyDisplay = `${qtyNum} ${item.unit || 'NO'}`;

              return (
                <tr key={idx} style={{ height: '42px' }}>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '0.92rem' }}>{sr}</td>
                  <td style={{ border: '1px solid #000', padding: '8px 10px', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.description}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '0.92rem' }}>{qtyDisplay}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '0.92rem' }}>
                    {rateVal ? `₹${rateVal}/-` : '₹0/-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Intact Footer at Bottom Most */}
      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '2px solid #000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', lineHeight: 1.5, color: '#000' }}>
            (1) GST@18% Extra<br />
            (2) For Destination<br />
            (3) Delivery within 30 days<br />
            (4) Inspection by consignees<br />
            (5) Payment 100% against CRN
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              border: '2px dashed #000',
              borderRadius: '4px',
              padding: '0.75rem 1.25rem',
              textAlign: 'center',
              background: '#fafafa'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.88rem', color: '#000' }}>
                M/S RAJU ENGINEERING WORKS
              </div>
              <div style={{ fontSize: '0.82rem', color: '#111', marginTop: '1.5rem', fontWeight: 'bold' }}>
                Proprietor
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
