import React from 'react';
import gcHeaderImage from '../../assets/picture.png';

export default function GcPreview({ poData }) {
  if (!poData) return null;

  const items = poData.items || [];
  const consigneeName = (poData.consignee || 'SSE/DPS').trim().replace(/\.$/, '') + '.';

  return (
    <div className="document-paper" id="gc-document" style={{ color: '#000000' }}>
      {/* Header Image replacing Hind Traders text heading */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <img
          src={gcHeaderImage || '/picture.png'}
          alt="Hind Traders"
          style={{ height: '55px', objectFit: 'contain', margin: '0 auto 6px auto', display: 'block' }}
        />
        <div style={{ fontSize: '9.5pt', fontWeight: 'bold', color: '#000000' }}>
          Address: - {poData.vendor.address}
        </div>
      </div>

      {/* Contact Line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', fontWeight: 'bold', color: '#000000', marginBottom: '4px' }}>
        <div>Mob No: {poData.vendor.phone}</div>
        <div>Email Id: {poData.vendor.email.toUpperCase()}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', fontWeight: 'bold', color: '#000000', marginBottom: '8px' }}>
        <div>TIN VAT No: 1056553025</div>
        <div>GSTIN: {poData.vendor.gstin}</div>
      </div>

      {/* Horizontal Line */}
      <div style={{ borderBottom: '1.5px solid #000', marginBottom: '15px' }}></div>

      {/* Doc Title */}
      <div style={{ textAlign: 'center', fontSize: '12pt', fontWeight: 'bold', color: '#000000', marginBottom: '18px', letterSpacing: '0.03em' }}>
        WARRANTY / GUARANTEE CERTIFICATE
      </div>

      {/* Meta File & Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', fontWeight: 'bold', color: '#000000', marginBottom: '15px' }}>
        <div>File No.:- {poData.gc_file_no || 'HT/GC-WC/26-27'}</div>
        <div>Date: {poData.gc_date || poData.challan_date || '24/07/2026'}</div>
      </div>

      {/* Dynamic To Section */}
      <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#000000', marginBottom: '18px', lineHeight: '1.4' }}>
        To,<br />
        The,<br />
        {consigneeName}<br />
        Eastern Railway, Jamalpur
      </div>

      {/* Boxed Certificate Details */}
      <div style={{ border: '1px solid #000', padding: '15px', fontSize: '9.5pt', color: '#000000', minHeight: '380px' }}>
        <p style={{ margin: '0 0 15px 0', lineHeight: '1.4' }}>
          This is to certify that the materials supplied under the following purchase order are guaranteed as per IRS Terms & Conditions against any manufacturing defect or poor workmanship.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontWeight: 'bold', marginBottom: '15px', fontSize: '10pt' }}>
          <div>PO No.: {poData.po_number}</div>
          <div>Dated: {poData.po_date}</div>
          <div>Delivery Challan No.: {poData.challan_no || '44'}</div>
          <div>Dated: {poData.challan_date || '24/07/2026'}</div>
        </div>

        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Material Description:
        </div>

        {items.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '12px', lineHeight: '1.4' }}>
            <div>{item.sr_no}. {item.description}</div>
            <div style={{ fontWeight: 'bold', marginTop: '2px' }}>
              Quantity: {item.quantity_display || `${item.quantity} Nos`}
            </div>
          </div>
        ))}

        <div style={{ marginTop: '25px', fontSize: '9pt' }}>
          The warranty/guarantee shall remain valid as per the IRS terms and conditions.
        </div>
      </div>

      {/* Signatures */}
      <div style={{ marginTop: '35px', display: 'flex', justifyContent: 'space-between', fontSize: '9.5pt', fontWeight: 'bold', color: '#000000' }}>
        <div>
          Receiver Signature
        </div>
        <div style={{ textAlign: 'right' }}>
          For Hind Traders<br /><br /><br />
          Proprietor / Authorized Signatory
        </div>
      </div>
    </div>
  );
}
