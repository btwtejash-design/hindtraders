import React from 'react';

export default function YashaQuotationPreview({ data }) {
  const common = data?.common || {};
  const yashaData = data?.yasha_enterprises || {};
  const items = common.items || [];
  const rates = yashaData.rates || {};

  const consigneeLines = (common.consignee_address || "Thc, Sr. DME,\nEASTERN RAILWAY\nMALDA").split("\n");

  return (
    <div className="quotation-preview-container print-document" style={{
      background: '#fff',
      color: '#000',
      padding: '2rem 2.5rem',
      fontFamily: "'Trebuchet MS', 'Segoe UI', 'Calibri', sans-serif",
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
        {/* 3 Box Header Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', border: '1px solid #000', borderRadius: '2px', marginBottom: '0.75rem' }}>
          <div style={{ borderRight: '1px solid #000', padding: '8px', fontSize: '0.75rem', lineHeight: 1.35 }}>
            <u><b>Approvals / Registrations:</b></u><br />
            MSME UDYAM No: UDYAM-BR-22-0002215<br />
            IREPS VENDOR ID: 1060881<br />
            GSTIN: 10AOCPS5660Q1ZK
          </div>

          <div style={{ padding: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/sample/yasha-logo.jpg"
              alt="Yasha Logo"
              style={{ maxHeight: '42px', objectFit: 'contain', marginBottom: '2px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <strong style={{ fontSize: '1.25rem', color: '#880e4f', letterSpacing: '0.02em', display: 'block' }}>
              YASHA ENTERPRISES
            </strong>
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
              Manufacturer of Wagon Components for Indian Railways
            </span>
          </div>

          <div style={{ borderLeft: '1px solid #000', padding: '8px', fontSize: '0.75rem', lineHeight: 1.35 }}>
            <u><b>Address:</b></u><br />
            Yash Academy Building, East Shivaji Chawk<br />
            Bekapur Munger- 811201 Bihar<br />
            Phone: +91 9234915997<br />
            Email : pankaj23272@gmail.com
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '0.5rem 0 1rem 0' }} />

        {/* Ref & Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '1rem', fontSize: '0.95rem' }}>
          <div>Ref :- {yashaData.quotation_ref || 'YE/BQ/26-27'}</div>
          <div>Date;- {yashaData.quotation_date || '04/08/2026'}</div>
        </div>

        {/* Recipient Address */}
        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.4 }}>
          TO,<br />
          {consigneeLines.map((line, i) => (
            <div key={i} style={{ paddingLeft: '1.5rem' }}>{line}</div>
          ))}
        </div>

        {/* Tender Ref No & Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          <div>Ref:- {common.ref_no || 'F/DPS/MMC(D)/27'}</div>
          <div>Dated:- {common.ref_date || '08/2026'}</div>
        </div>

        {/* Salutation Paragraph */}
        <div style={{ fontStyle: 'italic', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Dear Sir,<br />
          <span style={{ paddingLeft: '2rem', display: 'inline-block' }}>
            We are submitting our best competitive price for this subject material, hope you may consider it.
          </span>
        </div>

        {/* Items List Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', fontSize: '0.95rem', fontWeight: 'bold', width: '65%' }}>Description</th>
              <th style={{ textAlign: 'center', padding: '8px', fontSize: '0.95rem', fontWeight: 'bold', width: '18%' }}>QTY</th>
              <th style={{ textAlign: 'center', padding: '8px', fontSize: '0.95rem', fontWeight: 'bold', width: '17%', borderLeft: '1px dashed #666', borderRight: '1px dashed #666' }}>RATE</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const sr = item.sr_no || (idx + 1);
              const rateVal = rates[sr] || rates[String(sr)] || '';
              const qtyNum = item.quantity ?? 1;
              const qtyDisplay = `${qtyNum} ${item.unit || 'Mtr'}`;

              return (
                <tr key={idx} style={{ height: '38px' }}>
                  <td style={{ padding: '6px', fontWeight: 'bold', verticalAlign: 'top', fontSize: '0.95rem' }}>
                    {sr}. {item.description}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', verticalAlign: 'top', padding: '6px', fontSize: '0.95rem' }}>
                    {qtyDisplay}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', verticalAlign: 'top', padding: '6px', fontSize: '0.95rem', borderLeft: '1px dashed #666', borderRight: '1px dashed #666' }}>
                    {rateVal ? `${rateVal}/-` : '0/-'}
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
          <div style={{ fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.5 }}>
            (1) GST@18% Extra<br />
            (2) For Destination<br />
            (3) Delivery within 30 days<br />
            (4) Inspection by consignee<br />
            (5) Payment 100% against CRN<br />
            (6) As per IRS terms & conditions
          </div>

          <div style={{ textAlign: 'right' }}>
            <img
              src="/sample/yasha-stamp.jpg"
              alt="Yasha Enterprises Stamp"
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
              YASHA ENTERPRISES<br />Pankaj (Proprietor)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

