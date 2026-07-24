import React from 'react';
import challanHeaderImage from '../../assets/picture.png';

export default function ChallanPreview({ poData }) {
  if (!poData) return null;

  const items = poData.items || [];

  return (
    <div className="document-paper" id="challan-document">
      {/* Top Meta Line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', fontWeight: 'bold' }}>
        <div>GSTIN:- {poData.vendor.gstin}</div>
        <div style={{ textDecoration: 'underline', fontSize: '11pt' }}>CHALLAN</div>
        <div>Mob:- {poData.vendor.phone}</div>
      </div>

      {/* Header Title */}
      <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '15px' }}>
        <img
          src={challanHeaderImage || '/picture.png'}
          alt="Hind Traders"
          style={{ height: '55px', objectFit: 'contain', margin: '0 auto 6px auto', display: 'block' }}
        />
        <div style={{ fontSize: '10pt', fontWeight: 'bold', margin: '2px 0' }}>
          RAILWAY CONTRACTOR & SUPPLIER
        </div>
        <div style={{ display: 'inline-block', border: '1px solid #000', borderRadius: '5px', padding: '2px 8px', fontSize: '8pt' }}>
          Manufactures:- Diesel Locomotives Spare Parts, Ferrous & Non Ferrous Components and General Order Suppliers
        </div>
        <div style={{ fontSize: '10pt', fontWeight: 'bold', marginTop: '4px' }}>
          {poData.vendor.address.toUpperCase()}
        </div>
      </div>

      {/* Challan No & Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', fontWeight: 'bold', marginBottom: '15px' }}>
        <div>Challan No:- {poData.invoice_no || poData.challan_no || '42'}</div>
        <div>Date:- {poData.challan_date || '11/04/2026'}</div>
      </div>

      {/* Dynamic To Section (Consignee from PO) */}
      <div style={{ fontSize: '10pt', fontWeight: 'bold', marginLeft: '50px', marginBottom: '20px', lineHeight: '1.4' }}>
        To,<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{poData.consignee}<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Eastern Rly. Jamalpur<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JAMALPUR, 811214
      </div>

      {/* PO No & Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', fontWeight: 'bold', marginBottom: '15px' }}>
        <div>Purchase order No. {poData.po_number}</div>
        <div>Date:- {poData.po_date}</div>
      </div>

      {/* Particulars Table */}
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #000', fontSize: '9.5pt', marginBottom: '120px' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ border: '1px solid #000', padding: '6px', width: '10%' }}>Sr. No</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '70%' }}>Particulars</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '20%' }}>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ height: '90px', verticalAlign: 'top' }}>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{item.sr_no}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>
                {item.description}
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                {item.quantity_display || `${item.quantity} ${item.unit || 'Nos'}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '15mm', left: '15mm', right: '15mm' }}>
        <div style={{ fontSize: '11pt', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '25px' }}>
          Receiver Signature
        </div>
        <div style={{ fontSize: '8.5pt' }}>
          1. All legal proceeding by or against us shall be instituted in Munger County only.<br />
          2. Goods once sold can not be returned or Exchange.
        </div>
      </div>
    </div>
  );
}
