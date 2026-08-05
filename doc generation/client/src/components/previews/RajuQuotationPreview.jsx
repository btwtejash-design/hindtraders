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
      padding: '2rem 2.5rem',
      fontFamily: "'Verdana', 'Geneva', sans-serif",
      fontSize: '0.92rem',
      lineHeight: 1.35,
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          <div>
            GSTIN- 10JRHPK4490P1Z8<br />
            MSME- UDYAM-BR-22-4015162
          </div>
          <div style={{ textAlign: 'right' }}>
            <u>Mob:-</u> 8651757734
          </div>
        </div>

        {/* Center Header */}
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.04em', color: '#111827' }}>
            M/S RAJU ENGINEERING WORKS
          </h1>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '2px', color: '#374151' }}>
            Railway Contractor
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 'bold', marginTop: '2px', color: '#4b5563' }}>
            Fulka Gumti, Post-Jamalpur, Munger, Bihar, 811214
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
            Email- rajuengineeringworksjmp@gmail.com
          </div>
        </div>

        {/* Ref & Date Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem', margin: '0.75rem 0 0.5rem 0' }}>
          <div><u>REF.-</u> {rajuData.quotation_ref || 'REW/BQ/26-27'}</div>
          <div>DATE:- {rajuData.quotation_date || '02/06/2026'}</div>
        </div>

        <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '0.5rem 0 1.25rem 0' }} />

        {/* Recipient Address */}
        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
          To.<br />
          {consigneeLines.map((line, i) => (
            <div key={i} style={{ paddingLeft: '1.5rem' }}>{line}</div>
          ))}
        </div>

        {/* Tender Ref No & Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          <div>REF. <u>No:-</u> {common.ref_no || 'Nil'}</div>
          <div>DATE:- {common.ref_date || 'Nil'}</div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ background: '#111827', color: '#fff' }}>
              <th style={{ border: '1px solid #000', padding: '8px', width: '10%', textAlign: 'center' }}>Sr. No</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '60%', textAlign: 'center' }}>DESCRIPTION</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '15%', textAlign: 'center' }}>QTY</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '15%', textAlign: 'center' }}>RATE</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const sr = item.sr_no || (idx + 1);
              const rateVal = rates[sr] || rates[String(sr)] || '';
              const qtyNum = item.quantity ?? 1;
              const qtyDisplay = `${qtyNum} ${item.unit || 'NO'}`;

              return (
                <tr key={idx} style={{ height: '40px' }}>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{sr}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 10px', fontWeight: 'bold' }}>{item.description}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{qtyDisplay}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>
                    {rateVal ? `₹${rateVal}/-` : '₹0/-'}
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
          <div style={{ fontSize: '0.82rem', fontWeight: 'bold', lineHeight: 1.5, color: '#1f2937' }}>
            (1) GST@18% Extra<br />
            (2) For Destination<br />
            (3) Delivery within 30 days<br />
            (4) Inspection by consignees<br />
            (5) Payment 100% against CRN
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              border: '2px dashed #374151',
              borderRadius: '6px',
              padding: '0.75rem 1.25rem',
              textAlign: 'center',
              background: '#f9fafb'
            }}>
              <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#111827' }}>
                M/S RAJU ENGINEERING WORKS
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '1.5rem', fontWeight: 'bold' }}>
                Proprietor
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
