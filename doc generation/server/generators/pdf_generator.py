import os
import io
import base64
from xhtml2pdf import pisa
from typing import Dict, Any
try:
    from server.generators.num_to_words import amount_to_words
except ImportError:
    try:
        from generators.num_to_words import amount_to_words
    except ImportError:
        from num_to_words import amount_to_words

def html_to_pdf(html_content: str, output_path: str) -> str:
    """Converts HTML string to a PDF file on disk"""
    dirname = os.path.dirname(output_path)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(output_path, "wb") as pdf_file:
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)
    if pisa_status.err:
        raise RuntimeError("PDF generation error occurred in xhtml2pdf")
    return output_path

def generate_tax_invoice_pdf(data: Dict[str, Any], output_path: str) -> str:
    items = data.get("items", [])
    taxable_sum = sum(float(i.get("quantity", 0)) * float(i.get("rate", 0)) for i in items)
    gst_rate = items[0].get("gst_percent", 18.0) if items else 18.0
    sgst_rate = gst_rate / 2.0
    cgst_rate = gst_rate / 2.0
    sgst_amount = round(taxable_sum * (sgst_rate / 100.0), 2)
    cgst_amount = round(taxable_sum * (cgst_rate / 100.0), 2)
    grand_total = round(taxable_sum + sgst_amount + cgst_amount, 2)
    words_total = amount_to_words(grand_total)

    items_rows_html = ""
    for item in items:
        tot = round(float(item.get("quantity", 0)) * float(item.get("rate", 0)), 2)
        items_rows_html += f"""
        <tr style="height: 60px;">
            <td style="border: 1px solid #000; text-align: center; padding: 4px;">{item.get('sr_no', 1)}</td>
            <td style="border: 1px solid #000; padding: 4px;">{item.get('description', '')}</td>
            <td style="border: 1px solid #000; text-align: center; padding: 4px;">{item.get('hsn', '7318')}</td>
            <td style="border: 1px solid #000; text-align: center; padding: 4px;">{item.get('quantity', 1)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 4px;">{item.get('rate', 0):.2f}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 4px;">{tot:.2f}</td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @page {{
                size: A4 portrait;
                margin: 12mm 15mm 32mm 15mm;
                @frame footer_frame {{
                    -pdf-frame-content: footerContent;
                    bottom: 10mm;
                    margin-left: 15mm;
                    margin-right: 15mm;
                    height: 25mm;
                }}
            }}
            body {{
                font-family: Helvetica, Arial, sans-serif;
                font-size: 9pt;
                line-height: 1.25;
                color: #000;
            }}
            .title {{
                font-size: 16pt;
                font-weight: bold;
                text-align: right;
                margin-bottom: 8px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
            }}
            .details-table {{
                width: 45%;
                float: right;
                margin-bottom: 10px;
                border: 1px solid #000;
            }}
            .details-table td, .details-table th {{
                border: 1px solid #000;
                padding: 3px 5px;
            }}
            .box-table {{
                width: 100%;
                margin-bottom: 10px;
            }}
            .box-table td {{
                width: 50%;
                border: 1px solid #000;
                vertical-align: top;
                padding: 6px;
            }}
            .header-bg {{
                background-color: #d9d9d9;
                font-weight: bold;
            }}
            .items-table th {{
                border: 1px solid #000;
                background-color: #d9d9d9;
                padding: 4px;
            }}
        </style>
    </head>
    <body>
        <div class="title">TAX INVOICE</div>

        <div style="text-align: right; margin-bottom: 10px;">
            <table class="details-table" align="right">
                <tr class="header-bg"><td colspan="2">DETAILS</td></tr>
                <tr><td style="font-weight: bold;">INVOICE NO:</td><td>{data.get('invoice_no', '42')}</td></tr>
                <tr><td style="font-weight: bold;">DATE:</td><td>{data.get('invoice_date', '15-06-2026')}</td></tr>
                <tr><td style="font-weight: bold;">PO.NO:</td><td>{data.get('po_number', '')}</td></tr>
                <tr><td style="font-weight: bold;">DATE:</td><td>{data.get('po_date', '')}</td></tr>
                <tr><td style="font-weight: bold;">DELIVERY CHAALAN NO:</td><td>{data.get('challan_no', '44')}</td></tr>
                <tr><td style="font-weight: bold;">DATE:</td><td>{data.get('challan_date', '24-07-2026')}</td></tr>
                <tr><td style="font-weight: bold;">CRN.No- {data.get('crn_no', '')}</td><td style="font-weight: bold;">DATE: {data.get('crn_date', '')}</td></tr>
            </table>
        </div>

        <div style="clear: both; height: 5px;"></div>

        <table class="box-table">
            <tr>
                <td>
                    <div class="header-bg" style="padding: 2px 4px; margin-bottom: 4px;">FROM</div>
                    <b>COMPANY:</b> {data['vendor']['name']}<br/>
                    <b>ADDRESS:</b> {data['vendor']['address']}<br/>
                    <b>PHONE:</b> {data['vendor']['phone']}<br/>
                    <b>E-MAIL:</b> {data['vendor']['email']}<br/>
                    <b>GSTIN:</b> {data['vendor']['gstin']}
                </td>
                <td>
                    <div class="header-bg" style="padding: 2px 4px; margin-bottom: 4px;">BILL TO</div>
                    <b>TO:</b> {data['bill_to']['name']}<br/>
                    <b>DEPARTMENT:</b> {data['bill_to']['department']}<br/>
                    <b>LOCATION:</b> {data['bill_to']['location']}<br/>
                    <b>CONSIGNEE:</b> {data['bill_to']['consignee']}<br/>
                    <b>STATE CODE:</b> {data['bill_to']['state_code']}
                </td>
            </tr>
        </table>

        <table class="items-table" style="border: 1px solid #000;">
            <thead>
                <tr>
                    <th style="width: 6%;">Sr. No.</th>
                    <th style="width: 50%;">Description</th>
                    <th style="width: 10%;">HSN</th>
                    <th style="width: 10%;">Quantity (Nos)</th>
                    <th style="width: 12%;">Rate/ Unit (&#8377;)</th>
                    <th style="width: 12%;">Total (&#8377;)</th>
                </tr>
            </thead>
            <tbody>
                {items_rows_html}
            </tbody>
        </table>

        <table style="border: 1px solid #000; margin-top: -1px;">
            <tr>
                <td rowspan="4" style="width: 60%; border: 1px solid #000; padding: 6px; vertical-align: top;">
                    <b>Grand Total in Words:</b> {words_total}
                </td>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">Taxable Amount:</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">&#8377; {taxable_sum:.2f}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">SGST: {int(sgst_rate)}%</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">&#8377; {sgst_amount:.2f}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">CGST: {int(cgst_rate)}%</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">&#8377; {cgst_amount:.2f}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">Grand Total:</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">&#8377; {grand_total:.2f}</td>
            </tr>
        </table>

        <div id="footerContent" style="font-size: 9pt;">
            <div style="float: left;">
                <b>Account Details-</b><br/>
                Bank: {data['vendor']['bank_name']}<br/>
                Account No: {data['vendor']['account_no']}<br/>
                IFSC Code: {data['vendor']['ifsc']}<br/>
                Branch: {data['vendor']['branch']}
            </div>
            <div style="float: right; margin-top: 20px; font-weight: bold;">
                -Proprietor
            </div>
        </div>
    </body>
    </html>
    """
    return html_to_pdf(html, output_path)

def generate_challan_pdf(data: Dict[str, Any], output_path: str) -> str:
    items = data.get("items", [])
    consignee_str = data.get("consignee", "SSE / DPS")

    items_rows_html = ""
    for item in items:
        qty_str = item.get("quantity_display", f"{item.get('quantity', 1)}Nos")
        items_rows_html += f"""
        <tr style="height: 70px;">
            <td style="border: 1px solid #000; text-align: center; padding: 6px;">{item.get('sr_no', 1)}</td>
            <td style="border: 1px solid #000; padding: 6px;">{item.get('description', '')}</td>
            <td style="border: 1px solid #000; text-align: center; padding: 6px;">{qty_str}</td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @page {{
                size: A4 portrait;
                margin: 12mm 15mm;
            }}
            body {{
                font-family: Helvetica, Arial, sans-serif;
                font-size: 9.5pt;
                line-height: 1.3;
                color: #000;
            }}
            .header-meta {{
                font-weight: bold;
                font-size: 9pt;
            }}
            .main-title {{
                font-size: 18pt;
                font-weight: bold;
                text-align: center;
                margin-top: 10px;
                margin-bottom: 2px;
            }}
            .sub-title {{
                font-size: 10pt;
                font-weight: bold;
                text-align: center;
                margin-bottom: 4px;
            }}
            .badge-box {{
                text-align: center;
                border: 1px solid #000;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 8pt;
                margin: 0 auto 6px auto;
                width: 90%;
            }}
            .address {{
                text-align: center;
                font-weight: bold;
                font-size: 9.5pt;
                margin-bottom: 15px;
            }}
            .meta-line {{
                font-weight: bold;
                margin-bottom: 12px;
            }}
            .to-block {{
                font-weight: bold;
                margin-left: 30px;
                margin-bottom: 15px;
                line-height: 1.4;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
            }}
            th {{
                border: 1px solid #000;
                background-color: #f0f0f0;
                padding: 6px;
            }}
        </style>
    </head>
    <body>
        <table style="width: 100%;">
            <tr>
                <td style="font-weight: bold;">GSTIN:- {data['vendor']['gstin']}</td>
                <td style="text-align: center; font-weight: bold; text-decoration: underline; font-size: 11pt;">CHALLAN</td>
                <td style="text-align: right; font-weight: bold;">Mob:- {data['vendor']['phone']}</td>
            </tr>
        </table>

        <div class="main-title">{data['vendor']['name'].upper()}</div>
        <div class="sub-title">RAILWAY CONTRACTOR & SUPPLIER</div>
        <div class="badge-box">Manufactures:- Diesel Locomotives Spare Parts, Ferrous & Non Ferrous Components and General Order Suppliers</div>
        <div class="address">{data['vendor']['address'].upper()}</div>

        <table style="width: 100%; font-weight: bold; margin-bottom: 12px;">
            <tr>
                <td>Challan No:- {data.get('invoice_no', data.get('challan_no', '42'))}</td>
                <td style="text-align: right;">Date:- {data.get('challan_date', '11/04/2026')}</td>
            </tr>
        </table>

        <div class="to-block">
            To,<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{consignee_str}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Eastern Rly. Jamalpur<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JAMALPUR, 811214
        </div>

        <table style="width: 100%; font-weight: bold; margin-bottom: 12px;">
            <tr>
                <td>Purchase order No. {data.get('po_number', '')}</td>
                <td style="text-align: right;">Date:- {data.get('po_date', '')}</td>
            </tr>
        </table>

        <table style="border: 1px solid #000;">
            <thead>
                <tr>
                    <th style="width: 10%;">Sr. No</th>
                    <th style="width: 70%;">Particulars</th>
                    <th style="width: 20%;">Quantity</th>
                </tr>
            </thead>
            <tbody>
                {items_rows_html}
            </tbody>
        </table>

        <div style="margin-top: 80px;">
            <div style="font-weight: bold; font-style: italic; margin-bottom: 20px;">Receiver Signature</div>
            <div style="font-size: 8pt;">
                1. All legal proceeding by or against us shall be instituted in Munger County only.<br/>
                2. Goods once sold can not be returned or Exchange.
            </div>
        </div>
    </body>
    </html>
    """
    return html_to_pdf(html, output_path)

def generate_gc_pdf(data: Dict[str, Any], output_path: str) -> str:
    items = data.get("items", [])
    consignee_name = data.get("consignee", "SSE/DPS").strip()
    if not consignee_name.endswith('.'):
        consignee_name += "."

    items_html = ""
    for item in items:
        qty_str = item.get("quantity_display", f"{item.get('quantity', 1)} Nos")
        items_html += f"""
        <div style="margin-bottom: 10px;">
            <div>{item.get('sr_no', 1)}. {item.get('description', '')}</div>
            <div style="font-weight: bold; margin-top: 2px;">Quantity: {qty_str}</div>
        </div>
        """

    candidate_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample", "picture.png")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample", "picture.png")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "client", "src", "assets", "picture.png")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "client", "public", "picture.png")),
    ]
    picture_path = None
    for p in candidate_paths:
        if os.path.exists(p):
            picture_path = p
            break

    if picture_path and os.path.exists(picture_path):
        with open(picture_path, "rb") as img_file:
            b64_img = base64.b64encode(img_file.read()).decode('utf-8')
        header_html = f'<div style="text-align: center; margin-bottom: 4px;"><img src="data:image/png;base64,{b64_img}" style="height: 52px;" /></div>'
    else:
        header_html = f'<div class="company-name">{data["vendor"]["name"]}</div>'

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @page {{
                size: A4 portrait;
                margin: 12mm 15mm;
            }}
            body {{
                font-family: Helvetica, Arial, sans-serif;
                font-size: 9.5pt;
                line-height: 1.3;
                color: #000;
            }}
            .company-name {{
                font-size: 24pt;
                font-style: italic;
                font-weight: bold;
                text-align: center;
                margin-bottom: 2px;
            }}
            .company-address {{
                font-size: 9.5pt;
                font-weight: bold;
                text-align: center;
                margin-bottom: 6px;
            }}
            .meta-row {{
                font-size: 8.5pt;
                font-weight: bold;
            }}
            .divider {{
                border-bottom: 1.5px solid #000;
                margin: 8px 0 15px 0;
            }}
            .doc-title {{
                font-size: 12pt;
                font-weight: bold;
                text-align: center;
                margin-bottom: 15px;
            }}
            .boxed-content {{
                border: 1px solid #000;
                padding: 12px;
                min-height: 350px;
            }}
        </style>
    </head>
    <body>
        {header_html}
        <div class="company-address">Address: - {data['vendor']['address']}</div>

        <table class="meta-row" style="width: 100%;">
            <tr>
                <td>Mob No: {data['vendor']['phone']}</td>
                <td style="text-align: right;">Email Id: {data['vendor']['email'].upper()}</td>
            </tr>
            <tr>
                <td>TIN VAT No: 1056553025</td>
                <td style="text-align: right;">GSTIN: {data['vendor']['gstin']}</td>
            </tr>
        </table>

        <div class="divider"></div>

        <div class="doc-title">WARRANTY / GUARANTEE CERTIFICATE</div>

        <table style="width: 100%; font-weight: bold; margin-bottom: 12px;">
            <tr>
                <td>File No.:- {data.get('gc_file_no', 'HT/GC-WC/26-27')}</td>
                <td style="text-align: right;">Date: {data.get('gc_date', '24/07/2026')}</td>
            </tr>
        </table>

        <div style="font-weight: bold; margin-bottom: 15px; line-height: 1.4;">
            To,<br/>
            The,<br/>
            {consignee_name}<br/>
            Eastern Railway, Jamalpur
        </div>

        <div class="boxed-content">
            <p style="margin-bottom: 12px;">
                This is to certify that the materials supplied under the following purchase order are guaranteed as per IRS Terms & Conditions against any manufacturing defect or poor workmanship.
            </p>

            <table style="width: 100%; font-weight: bold; margin-bottom: 12px;">
                <tr>
                    <td>PO No.: {data.get('po_number', '')}</td>
                    <td>Dated: {data.get('po_date', '')}</td>
                </tr>
                <tr>
                    <td>Delivery Challan No.: {data.get('challan_no', '44')}</td>
                    <td>Dated: {data.get('challan_date', '24/07/2026')}</td>
                </tr>
            </table>

            <div style="font-weight: bold; margin-bottom: 8px;">Material Description:</div>

            {items_html}

            <div style="margin-top: 20px; font-size: 9pt;">
                The warranty/guarantee shall remain valid as per the IRS terms and conditions.
            </div>
        </div>
    </body>
    </html>
    """
    return html_to_pdf(html, output_path)
