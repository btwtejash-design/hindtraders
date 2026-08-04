import React from 'react';

export default function TaxInvoicePreview({ poData }) {
  if (!poData) return null;

  const items = poData.items || [];
  const taxableSum = items.reduce((acc, item) => acc + (parseFloat(item.quantity) * parseFloat(item.rate)), 0);
  const gstRate = items[0]?.gst_percent || 18;
  const sgstRate = gstRate / 2;
  const cgstRate = gstRate / 2;
  const sgstAmount = roundVal(taxableSum * (sgstRate / 100));
  const cgstAmount = roundVal(taxableSum * (cgstRate / 100));
  const grandTotal = roundVal(taxableSum + sgstAmount + cgstAmount);

  function roundVal(v) {
    return Math.round(v * 100) / 100;
  }

  const wordsTotal = numToWords(grandTotal);

  return (
    <div className="document-paper" id="tax-invoice-document" style={{ position: 'relative', paddingBottom: '45mm' }}>
      {/* Document Header */}
      <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18pt', marginBottom: '12px' }}>
        TAX INVOICE
      </div>

      {/* Top Section Details Box - Compact Width aligned right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <table style={{ borderCollapse: 'collapse', border: '1px solid #000', fontSize: '8.5pt', width: '45%' }}>
          <thead>
            <tr style={{ background: '#d9d9d9' }}>
              <th colSpan="2" style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'left', fontWeight: 'bold' }}>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', width: '50%' }}>INVOICE NO:</td>
              <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{poData.invoice_no || '42'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>DATE:</td>
              <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{poData.invoice_date || '15-06-2026'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>PO.NO:</td>
              <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{poData.po_number}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>DATE:</td>
              <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{poData.po_date}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>DELIVERY CHAALAN NO:</td>
              <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{poData.challan_no || '42'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>DATE:</td>
              <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{poData.challan_date || '15-06-2026'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>CRN.No- {poData.crn_no || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>DATE: {poData.crn_date || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FROM & BILL TO BOXES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <table style={{ borderCollapse: 'collapse', border: '1px solid #000', fontSize: '9pt', width: '100%' }}>
          <thead>
            <tr style={{ background: '#d9d9d9' }}>
              <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>FROM</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px', height: '90px', verticalAlign: 'top' }}>
                <strong>COMPANY:</strong> {poData.vendor.name}<br />
                <strong>ADDRESS:</strong> {poData.vendor.address}<br />
                <strong>PHONE:</strong> {poData.vendor.phone}<br />
                <strong>E-MAIL:</strong> {poData.vendor.email}<br />
                <strong>GSTIN:</strong> {poData.vendor.gstin}
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ borderCollapse: 'collapse', border: '1px solid #000', fontSize: '9pt', width: '100%' }}>
          <thead>
            <tr style={{ background: '#d9d9d9' }}>
              <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>BILL TO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px', height: '90px', verticalAlign: 'top' }}>
                <strong>TO:</strong> {poData.bill_to.name}<br />
                <strong>DEPARTMENT:</strong> {poData.bill_to.department}<br />
                <strong>LOCATION:</strong> {poData.bill_to.location}<br />
                <strong>CONSIGNEE:</strong> {poData.bill_to.consignee}<br />
                <strong>STATE CODE:</strong> {poData.bill_to.state_code}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ITEMS TABLE */}
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #000', fontSize: '9pt', marginBottom: '0' }}>
        <thead>
          <tr style={{ background: '#d9d9d9' }}>
            <th style={{ border: '1px solid #000', padding: '5px', width: '6%' }}>Sr. No.</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '50%' }}>Description</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '10%' }}>HSN</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '10%' }}>Quantity (Nos)</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '12%' }}>Rate/ Unit (₹)</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '12%' }}>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const rowTot = roundVal(parseFloat(item.quantity) * parseFloat(item.rate));
            return (
              <tr key={index} style={{ height: '65px', verticalAlign: 'top' }}>
                <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{item.sr_no}</td>
                <td style={{ border: '1px solid #000', padding: '5px' }}>{item.description}</td>
                <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{item.hsn}</td>
                <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>₹ {parseFloat(item.rate).toFixed(2)}</td>
                <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>₹ {rowTot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* SUMMARY CALCULATIONS TABLE */}
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #000', fontSize: '9.5pt' }}>
        <tbody>
          <tr>
            <td rowSpan="4" style={{ border: '1px solid #000', padding: '8px', width: '60%', verticalAlign: 'top' }}>
              <strong>Grand Total in Words:</strong> {wordsTotal}
            </td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Taxable Amount:</td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>₹ {taxableSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>SGST: {sgstRate}%</td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>CGST: {cgstRate}%</td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Grand Total:</td>
            <td style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      {/* FOOTER BANK DETAILS - ANCHORED AT FIXED BOTTOM POSITION */}
      <div style={{ position: 'absolute', bottom: '15mm', left: '15mm', right: '15mm', display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
        <div>
          <strong>Account Details-</strong><br />
          Bank: {poData.vendor.bank_name}<br />
          Account No: {poData.vendor.account_no}<br />
          IFSC Code: {poData.vendor.ifsc}<br />
          Branch: {poData.vendor.branch}
        </div>
        <div style={{ textAlign: 'right', alignSelf: 'flex-end', fontWeight: 'bold' }}>
          -Proprietor
        </div>
      </div>
    </div>
  );
}

function numToWords(n) {
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(num) {
    if (num < 20) return units[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + units[num % 10] : "");
    if (num < 1000) return units[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "");
    if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
    if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
    return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
  }

  const intPart = Math.floor(n);
  const words = convert(intPart);
  return words ? words + " Only" : "Zero Only";
}
