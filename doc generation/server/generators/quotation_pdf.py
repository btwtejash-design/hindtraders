import os
import io
import zipfile
from xhtml2pdf import pisa
from typing import Dict, Any, List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SAMPLE_DIR = os.path.join(BASE_DIR, "sample")

def get_image_path(filename: str) -> str:
    path = os.path.join(SAMPLE_DIR, filename)
    if os.path.exists(path):
        return path.replace("\\", "/")
    if filename.endswith(".jpg"):
        alt_path = os.path.join(SAMPLE_DIR, filename[:-4] + ".jpeg")
        if os.path.exists(alt_path):
            return alt_path.replace("\\", "/")
    elif filename.endswith(".jpeg"):
        alt_path = os.path.join(SAMPLE_DIR, filename[:-5] + ".jpg")
        if os.path.exists(alt_path):
            return alt_path.replace("\\", "/")
    return ""

def html_to_pdf(html_content: str, output_path: str) -> str:
    dirname = os.path.dirname(output_path)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(output_path, "wb") as pdf_file:
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)
    if pisa_status.err:
        raise RuntimeError("PDF generation error occurred in xhtml2pdf")
    return output_path

def generate_hind_quotation_pdf(data: Dict[str, Any], output_path: str) -> str:
    """
    Generates Hind Traders Budgetary Quotation PDF matching Screenshot 1 exactly.
    """
    top_img = get_image_path("hindtraders-top.jpg")
    stamp_img = get_image_path("hind-stamp.jpg")

    common = data.get("common", {})
    hind_data = data.get("hind_traders", {})

    ref_no = common.get("ref_no", "F/DPS/MMC(D)/27")
    ref_date = common.get("ref_date", "05/2026")
    consignee_lines = common.get("consignee_address", "AWM (WHEEL)\nEASTERN RLY,\nJAMALPUR").split("\n")
    consignee_html = "<br/>".join(consignee_lines)

    org_ref = hind_data.get("quotation_ref", "HT/BQ/26-27")
    org_date = hind_data.get("quotation_date", "03/08/2026")

    items = common.get("items", [])
    rates = hind_data.get("rates", {})

    items_html = ""
    for idx, item in enumerate(items, 1):
        sr = item.get("sr_no", idx)
        desc = item.get("description", "")
        qty_num = item.get("quantity", 1)
        qty_num_str = int(qty_num) if float(qty_num).is_integer() else qty_num
        unit = item.get("unit", "mtr")
        qty_str = f"{qty_num_str} {unit}"
        
        rate_val = rates.get(str(sr)) or rates.get(sr) or 0
        rate_display = f"Rs. {rate_val}" if rate_val else "Rs. 0"

        items_html += f"""
        <tr style="height: 38px;">
            <td style="border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10pt;">{sr}</td>
            <td style="border: 1px solid #000; padding: 6px 10px; font-weight: bold; font-size: 10pt;">{desc}</td>
            <td style="border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10pt;">{qty_str}</td>
            <td style="border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10pt;">{rate_display}</td>
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
                    bottom: 8mm;
                    margin-left: 15mm;
                    margin-right: 15mm;
                    height: 25mm;
                }}
            }}
            body {{
                font-family: Helvetica, Arial, sans-serif;
                font-size: 9.5pt;
                line-height: 1.3;
                color: #000;
            }}
            .header-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 5px;
            }}
            .header-table td {{
                vertical-align: middle;
            }}
            .title-box {{
                border: 1.5px solid #000;
                padding: 4px 15px;
                font-size: 11pt;
                font-weight: bold;
                text-align: center;
                display: inline-block;
            }}
            .items-table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                margin-bottom: 15px;
            }}
            .items-table th {{
                border: 1px solid #000;
                background-color: #111111;
                color: #ffffff;
                padding: 6px 8px;
                font-weight: bold;
                font-size: 10pt;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td width="30%" style="vertical-align: top; font-size: 8.5pt; font-weight: bold;">
                    GSTIN - 10DFIPK1994B1ZS<br/>
                    TIN VAT No- 10564553025
                </td>
                <td width="40%" style="text-align: center; vertical-align: top;">
                    {"<img src='" + top_img + "' style='height: 48px;' />" if top_img else "<h2 style='margin:0; font-size:18pt;'>Hind Traders</h2>"}
                </td>
                <td width="30%" style="text-align: right; vertical-align: top; font-size: 8.5pt; font-weight: bold;">
                    <u>Engineering & Machineries</u><br/>
                    CHHOTI KESHOPUR<br/>
                    NAKKI NAGAR, JAMALPUR<br/>
                    <u>Mob:-</u> 7903235877
                </td>
            </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #000; margin: 4px 0 10px 0;" />

        <table style="width: 100%; margin-bottom: 15px;">
            <tr>
                <td style="font-weight: bold; font-style: italic; font-size: 10pt;">
                    Ref :- {org_ref}
                </td>
                <td style="text-align: center;">
                    <span class="title-box">BUDGETARY QUOTATION</span>
                </td>
                <td style="text-align: right; font-weight: bold; font-style: italic; font-size: 10pt;">
                    Date: {org_date}
                </td>
            </tr>
        </table>

        <div style="margin-top: 10px; margin-bottom: 15px; font-weight: bold; font-size: 10pt; line-height: 1.4;">
            TO,<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{consignee_html}
        </div>

        <table style="width: 100%; margin-bottom: 15px; font-weight: bold; font-style: italic; font-size: 9.5pt;">
            <tr>
                <td><u>Ref No:-</u> {ref_no}</td>
                <td style="text-align: right;"><u>Date:-</u> {ref_date}</td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th width="10%">Sl. No</th>
                    <th width="60%">Description</th>
                    <th width="15%">Qty</th>
                    <th width="15%">Rate</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>

        <div id="footerContent">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 60%; vertical-align: bottom; font-size: 8.5pt;">
                        <b>Terms & Condition</b><br/>
                        1. GST@18% Extra<br/>
                        2. For Destination<br/>
                        3. Delivery within 30 days<br/>
                        4. Material guaranteed as per IRS terms & conditions
                    </td>
                    <td style="width: 40%; text-align: right; vertical-align: bottom;">
                        {"<img src='" + stamp_img + "' style='max-width: 180px;' />" if stamp_img else "<b>HIND TRADERS<br/>Proprietor</b>"}
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    """
    return html_to_pdf(html, output_path)

def generate_yasha_quotation_pdf(data: Dict[str, Any], output_path: str) -> str:
    """
    Generates Yasha Enterprises Budgetary Quotation PDF matching Screenshot 2 exactly.
    """
    logo_img = get_image_path("yasha-logo.jpg")
    stamp_img = get_image_path("yasha-stamp.jpg")

    common = data.get("common", {})
    yasha_data = data.get("yasha_enterprises", {})

    ref_no = common.get("ref_no", "F/DPS/MMC(D)/27")
    ref_date = common.get("ref_date", "08/2026")
    consignee_lines = common.get("consignee_address", "Thc, Sr. DME,\nEASTERN RAILWAY\nMALDA").split("\n")
    consignee_html = "<br/>".join(consignee_lines)

    org_ref = yasha_data.get("quotation_ref", "YE/BQ/26-27")
    org_date = yasha_data.get("quotation_date", "04/08/2026")

    items = common.get("items", [])
    rates = yasha_data.get("rates", {})

    items_html = ""
    for idx, item in enumerate(items, 1):
        sr = item.get("sr_no", idx)
        desc = item.get("description", "")
        qty_num = item.get("quantity", 1)
        qty_num_str = int(qty_num) if float(qty_num).is_integer() else qty_num
        unit = item.get("unit", "Mtr")
        qty_str = f"{qty_num_str} {unit}"

        rate_val = rates.get(str(sr)) or rates.get(sr) or 0
        rate_display = f"{rate_val}/-" if rate_val else "0/-"

        items_html += f"""
        <tr style="height: 35px;">
            <td style="padding: 4px 6px; font-weight: bold; font-size: 10pt; vertical-align: top;">
                {sr}. {desc}
            </td>
            <td style="text-align: center; font-weight: bold; font-size: 10pt; vertical-align: top; padding-top: 4px;">
                {qty_str}
            </td>
            <td style="text-align: center; font-weight: bold; font-size: 10pt; vertical-align: top; padding-top: 4px; border-left: 1px dashed #666; border-right: 1px dashed #666;">
                {rate_display}
            </td>
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
                margin: 10mm 12mm 32mm 12mm;
                @frame footer_frame {{
                    -pdf-frame-content: footerContent;
                    bottom: 8mm;
                    margin-left: 12mm;
                    margin-right: 12mm;
                    height: 25mm;
                }}
            }}
            body {{
                font-family: Courier, 'Courier New', sans-serif;
                font-size: 9.5pt;
                line-height: 1.3;
                color: #000;
            }}
            .header-box-table {{
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #000;
            }}
            .header-box-table td {{
                border: 1px solid #000;
                padding: 6px;
                vertical-align: top;
            }}
        </style>
    </head>
    <body>
        <table class="header-box-table">
            <tr>
                <td width="32%" style="font-size: 8pt; line-height: 1.35;">
                    <u><b>Approvals / Registrations:</b></u><br/>
                    MSME UDYAM No: UDYAM-BR-22-0002215<br/>
                    IREPS VENDOR ID: 1060881<br/>
                    GSTIN: 10AOCPS5660Q1ZK
                </td>
                <td width="36%" style="text-align: center; line-height: 1.2;">
                    {"<img src='" + logo_img + "' style='height: 42px; margin-bottom: 2px;' /><br/>" if logo_img else ""}
                    <b style="font-size: 12pt; color: #880e4f;">YASHA ENTERPRISES</b><br/>
                    <span style="font-size: 7.5pt; font-weight: bold;">Manufacturer of Wagon Components for Indian Railways</span>
                </td>
                <td width="32%" style="font-size: 8pt; line-height: 1.35;">
                    <u><b>Address:</b></u><br/>
                    Yash Academy Building, East Shivaji Chawk<br/>
                    Bekapur Munger- 811201 Bihar<br/>
                    Phone: +91 9234915997<br/>
                    Email : pankaj23272@gmail.com
                </td>
            </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #000; margin: 6px 0 10px 0;" />

        <table style="width: 100%; margin-bottom: 12px; font-weight: bold; font-style: italic; font-size: 10pt;">
            <tr>
                <td>Ref :- {org_ref}</td>
                <td style="text-align: right;">Date;- {org_date}</td>
            </tr>
        </table>

        <div style="margin-bottom: 12px; font-weight: bold; font-size: 10pt; line-height: 1.4;">
            TO,<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{consignee_html}
        </div>

        <table style="width: 100%; margin-bottom: 15px; font-weight: bold; font-style: italic; font-size: 9.5pt;">
            <tr>
                <td>Ref:- {ref_no}</td>
                <td style="text-align: right;">Dated:- {ref_date}</td>
            </tr>
        </table>

        <div style="font-style: italic; font-weight: bold; margin-bottom: 15px; font-size: 10pt;">
            Dear Sir,<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;We are submitting our best competitive price for this subject material,<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;hope you may consider it.
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <thead>
                <tr>
                    <th width="65%" style="text-align: left; padding: 6px; font-size: 10pt; font-weight: bold;">Description</th>
                    <th width="18%" style="text-align: center; padding: 6px; font-size: 10pt; font-weight: bold;">QTY</th>
                    <th width="17%" style="text-align: center; padding: 6px; font-size: 10pt; font-weight: bold; border-left: 1px dashed #666; border-right: 1px dashed #666;">RATE</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>

        <div id="footerContent">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td width="60%" style="vertical-align: bottom; font-size: 8pt; font-style: italic; line-height: 1.35;">
                        (1) GST@18% Extra<br/>
                        (2) For Destination<br/>
                        (3) Delivery within 30 days<br/>
                        (4) Inspection by consignee<br/>
                        (5) Payment 100% against CRN<br/>
                        (6) As per IRS terms & conditions
                    </td>
                    <td style="width: 40%; text-align: right; vertical-align: bottom;">
                        {"<img src='" + stamp_img + "' style='max-width: 180px;' />" if stamp_img else "<b>YASHA ENTERPRISES<br/>Proprietor</b>"}
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    """
    return html_to_pdf(html, output_path)

def generate_madhu_quotation_pdf(data: Dict[str, Any], output_path: str) -> str:
    """
    Generates Madhu Enterprises Budgetary Quotation PDF matching Screenshot 3 exactly.
    """
    stamp_img = get_image_path("madhu-stamp.jpg")

    common = data.get("common", {})
    madhu_data = data.get("madhu_enterprises", {})

    ref_no = common.get("ref_no", "F/DPS/MMC(D)/27")
    ref_date = common.get("ref_date", "28/04/2026")
    consignee_lines = common.get("consignee_address", "The, AWM (DIESEL)\nEASTERN RLY, JAMALPUR").split("\n")
    consignee_html = "<br/>".join(consignee_lines)

    org_ref = madhu_data.get("quotation_ref", "ME/12/26-27")
    org_date = madhu_data.get("quotation_date", "06/05/2026")

    items = common.get("items", [])
    rates = madhu_data.get("rates", {})

    items_html = ""
    for idx, item in enumerate(items, 1):
        sr = item.get("sr_no", idx)
        desc = item.get("description", "")
        qty_num = item.get("quantity", 1)
        qty_num_str = int(qty_num) if float(qty_num).is_integer() else qty_num
        unit = item.get("unit", "Nos")
        qty_str = f"{qty_num_str} {unit}"

        rate_val = rates.get(str(sr)) or rates.get(sr) or 0
        rate_display = f"Rs. {rate_val}" if rate_val else "Rs. 0"

        items_html += f"""
        <tr style="height: 38px;">
            <td style="border: 1px solid #2e7d32; text-align: center; font-weight: bold; font-size: 10pt;">{sr}</td>
            <td style="border: 1px solid #2e7d32; padding: 6px 10px; font-weight: bold; font-size: 9.5pt;">{desc}</td>
            <td style="border: 1px solid #2e7d32; text-align: center; font-weight: bold; font-size: 10pt;">{qty_str}</td>
            <td style="border: 1px solid #2e7d32; text-align: center; font-weight: bold; font-size: 10pt;">{rate_display}</td>
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
                    bottom: 8mm;
                    margin-left: 15mm;
                    margin-right: 15mm;
                    height: 25mm;
                }}
            }}
            body {{
                font-family: Georgia, 'Times New Roman', serif;
                font-size: 9.5pt;
                line-height: 1.3;
                color: #000;
            }}
            .green-text {{
                color: #2e7d32;
            }}
            .header-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 5px;
            }}
            .sub-box {{
                border: 1px solid #2e7d32;
                padding: 3px 6px;
                font-size: 7.5pt;
                font-family: Helvetica, Arial, sans-serif;
                margin-top: 4px;
                display: inline-block;
                color: #2e7d32;
            }}
            .items-table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                margin-bottom: 15px;
            }}
            .items-table th {{
                border: 1px solid #2e7d32;
                color: #2e7d32;
                padding: 6px 8px;
                font-weight: bold;
                font-size: 10pt;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td width="55%" style="vertical-align: top;">
                    <b style="font-size: 20pt; letter-spacing: 1px;" class="green-text">MADHU ENTERPRISES</b><br/>
                    <div class="sub-box">
                        <b>Supplier Of :</b> All Types of Mechanical Spare, Fabrication Work, Hydraulic Related Job & General Order Supplier
                    </div>
                </td>
                <td width="45%" style="text-align: right; vertical-align: top; font-size: 8.5pt; font-family: Helvetica, Arial, sans-serif;" class="green-text">
                    <b>GSTIN No. : 10AXZPS6246GIZ0</b><br/>
                    <b>Vender Code : 62402</b><br/>
                    <b>Mobile No. : 9471903155</b><br/>
                    <b>email : rsharma19711@gmail.com</b>
                </td>
            </tr>
        </table>

        <div style="text-align: center; font-size: 8.5pt; font-weight: bold; font-family: Helvetica, Arial, sans-serif; margin-top: 6px; margin-bottom: 15px;" class="green-text">
            MADHOPUR, NAYA TOLA, MUNGER - 811202 (BIHAR)
        </div>

        <table style="width: 100%; margin-bottom: 15px; font-weight: bold; font-style: italic; font-size: 10pt;" class="green-text">
            <tr>
                <td>Ref. No :- <span style="border-bottom: 1px dotted #2e7d32;">{org_ref}</span></td>
                <td style="text-align: right;">Date . <span style="border-bottom: 1px dotted #2e7d32;">{org_date}</span></td>
            </tr>
        </table>

        <div style="margin-bottom: 15px; font-weight: bold; font-size: 10pt; line-height: 1.4;" class="green-text">
            TO,<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{consignee_html}
        </div>

        <table style="width: 100%; margin-bottom: 15px; font-weight: bold; font-style: italic; font-size: 9.5pt;" class="green-text">
            <tr>
                <td>Ref. No :- {ref_no}</td>
                <td style="text-align: right;">Date:- {ref_date}</td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th width="10%">Sl. No</th>
                    <th width="60%">Description</th>
                    <th width="15%">Qty</th>
                    <th width="15%">Rate</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>

        <div id="footerContent">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td width="55%" style="vertical-align: bottom; font-size: 9pt; font-weight: bold; font-style: italic;" class="green-text">
                        Terms & Condition<br/>
                        1. GST@18% Extra<br/>
                        2. For Destination<br/>
                        3. Delivery within 30 days<br/>
                        4. As per IRS terms & conditions
                    </td>
                    <td width="45%" style="text-align: right; vertical-align: bottom;">
                        <div style="font-family: 'Brush Script MT', cursive, Georgia, serif; font-size: 16pt; color: #1565c0; font-weight: bold; margin-bottom: 2px;">
                            Yours Sincerely
                        </div>
                        {"<img src='" + stamp_img + "' style='max-width: 180px;' />" if stamp_img else "<b style='color:#1565c0;'>MADHU ENTERPRISES</b>"}
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    """
    return html_to_pdf(html, output_path)


def generate_lovely_quotation_pdf(data: Dict[str, Any], output_path: str) -> str:
    """
    Generates Lovely General Order Supplier Budgetary Quotation PDF.
    """
    top_img = get_image_path("lovely-top.jpg")
    stamp_img = get_image_path("lovely-stamp.jpg")

    common = data.get("common", {})
    lovely_data = data.get("lovely_supplier", {})

    ref_no = common.get("ref_no", "F/DPS/MMC(D)/27")
    ref_date = common.get("ref_date", "28/04/2026")
    consignee_lines = common.get("consignee_address", "The, AWM (DIESEL)\nEASTERN RLY, JAMALPUR").split("\n")
    consignee_html = "<br/>".join(consignee_lines)

    org_ref = lovely_data.get("quotation_ref", "LV/23/26-27")
    org_date = lovely_data.get("quotation_date", "29/04/2026")

    items = common.get("items", [])
    rates = lovely_data.get("rates", {})

    items_html = ""
    for idx, item in enumerate(items, 1):
        sr = item.get("sr_no", idx)
        desc = item.get("description", "")
        qty_num = item.get("quantity", 1)
        qty_num_str = int(qty_num) if float(qty_num).is_integer() else qty_num
        unit = item.get("unit", "Nos")
        qty_str = f"{qty_num_str} {unit}"
        
        rate_val = rates.get(str(sr)) or rates.get(sr) or 0
        rate_display = f"{rate_val}/-" if rate_val else "0/-"

        items_html += f"""
        <tr style="height: 38px;">
            <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-size: 10pt;">{sr}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; font-size: 9.5pt;">{desc}</td>
            <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-size: 10pt;">{qty_str}</td>
            <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-size: 10pt;">{rate_display}</td>
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
                    bottom: 8mm;
                    margin-left: 15mm;
                    margin-right: 15mm;
                    height: 25mm;
                }}
            }}
            body {{
                font-family: 'Times New Roman', Times, Georgia, serif;
                font-size: 9.5pt;
                line-height: 1.35;
                color: #000;
            }}
            .header-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 5px;
            }}
            .items-table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                margin-bottom: 15px;
            }}
            .items-table th {{
                border: 1px solid #4a5568;
                background-color: #2d3748;
                color: #ffffff;
                padding: 6px 8px;
                font-weight: bold;
                font-size: 10pt;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td width="50%" style="vertical-align: top; font-size: 8.5pt; font-weight: bold; font-style: italic;">
                    <u>GSTIN-</u> 10EOBPK6340Q1ZU<br/>
                    <u>Vender Code:</u> 57722
                </td>
                <td width="50%" style="text-align: right; vertical-align: top; font-size: 8.5pt; font-weight: bold; font-style: italic;">
                    <u>Mob.:</u> 9852949143
                </td>
            </tr>
        </table>

        <div style="text-align: center; margin-bottom: 8px;">
            {"<img src='" + top_img + "' style='max-height: 90px; width: 100%;' />" if top_img else "<h2 style='margin:0; font-size:18pt;'>LOVELY GENERAL ORDER SUPPLIER</h2>"}
        </div>

        <table style="width: 100%; margin-bottom: 10px; font-weight: bold; font-style: italic; font-size: 10pt;">
            <tr>
                <td><u>Ref:-</u> {org_ref}</td>
                <td style="text-align: right;"><u>Date:-</u> {org_date}</td>
            </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #000; margin: 4px 0 12px 0;" />

        <div style="text-align: center; margin-bottom: 15px;">
            <u style="font-size: 12pt; font-weight: bold;">Budgetary Quotation</u>
        </div>

        <div style="margin-bottom: 15px; font-weight: bold; font-size: 10pt; line-height: 1.4;">
            TO,<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{consignee_html}
        </div>

        <table style="width: 100%; margin-bottom: 15px; font-weight: bold; font-style: italic; font-size: 9.5pt;">
            <tr>
                <td><u>Ref:-</u> {ref_no}</td>
                <td style="text-align: right;"><u>Date:-</u> {ref_date}</td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th width="10%">[Sl. No</th>
                    <th width="60%">Description</th>
                    <th width="15%">Qty</th>
                    <th width="15%">Rate</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>

        <div id="footerContent">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td width="55%" style="vertical-align: bottom; font-size: 9pt; font-style: italic;">
                        <u><b>Terms & Condition</b></u><br/>
                        1. GST@18% Extra<br/>
                        2. For Destination<br/>
                        3. Delivery within 30 days
                    </td>
                    <td width="45%" style="text-align: right; vertical-align: bottom;">
                        {"<img src='" + stamp_img + "' style='max-width: 180px;' />" if stamp_img else "<b style='color:#1e3a8a;'>LOVELY GENERAL ORDER SUPPLIER<br/>Manish Kumar (Proprietor)</b>"}
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    """
    return html_to_pdf(html, output_path)


def generate_raju_quotation_pdf(data: Dict[str, Any], output_path: str) -> str:
    """
    Generates Raju Engineering Works Budgetary Quotation PDF.
    """
    common = data.get("common", {})
    raju_data = data.get("raju_engineering_works", {})

    ref_no = common.get("ref_no", "Nil")
    ref_date = common.get("ref_date", "Nil")
    consignee_lines = common.get("consignee_address", "Dy, CMT\nEASTERN RLY. JAMALPUR").split("\n")
    consignee_html = "<br/>".join(consignee_lines)

    org_ref = raju_data.get("quotation_ref", "REW/BQ/26-27")
    org_date = raju_data.get("quotation_date", "02/06/2026")

    items = common.get("items", [])
    rates = raju_data.get("rates", {})

    items_html = ""
    for idx, item in enumerate(items, 1):
        sr = item.get("sr_no", idx)
        desc = item.get("description", "")
        qty_num = item.get("quantity", 1)
        qty_num_str = int(qty_num) if float(qty_num).is_integer() else qty_num
        unit = item.get("unit", "NO")
        qty_str = f"{qty_num_str} {unit}"
        
        rate_val = rates.get(str(sr)) or rates.get(sr) or 0
        rate_display = f"Rs.{rate_val}/-" if rate_val else "Rs.0/-"

        items_html += f"""
        <tr style="height: 38px;">
            <td style="border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10pt;">{sr}</td>
            <td style="border: 1px solid #000; padding: 6px 10px; font-weight: bold; font-size: 9.5pt;">{desc}</td>
            <td style="border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10pt;">{qty_str}</td>
            <td style="border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10pt;">{rate_display}</td>
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
                    bottom: 8mm;
                    margin-left: 15mm;
                    margin-right: 15mm;
                    height: 25mm;
                }}
            }}
            body {{
                font-family: 'Courier New', Courier, monospace;
                font-size: 9.2pt;
                line-height: 1.4;
                color: #000;
            }}
            .header-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 5px;
            }}
            .items-table {{
                width: 100%;
                border-collapse: collapse;
                border: 2px solid #000;
                margin-top: 15px;
                margin-bottom: 15px;
            }}
            .items-table th {{
                border: 1px solid #000;
                background-color: #000000;
                color: #ffffff;
                padding: 6px 8px;
                font-weight: bold;
                font-size: 10pt;
                text-align: center;
                letter-spacing: 1px;
            }}
        </style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td width="60%" style="vertical-align: top; font-size: 8.5pt; font-weight: bold;">
                    GSTIN- 10JRHPK4490P1Z8<br/>
                    MSME- UDYAM-BR-22-4015162
                </td>
                <td width="40%" style="text-align: right; vertical-align: top; font-size: 8.5pt; font-weight: bold;">
                    <u>Mob:-</u> 8651757734
                </td>
            </tr>
        </table>

        <div style="text-align: center; margin-top: 5px; margin-bottom: 10px;">
            <b style="font-size: 17pt; letter-spacing: 1px; display: block;">M/S RAJU ENGINEERING WORKS</b>
            <div style="font-size: 9.5pt; font-weight: bold; margin-top: 2px;">Railway Contractor</div>
            <div style="font-size: 8.5pt; font-weight: bold; margin-top: 2px;">Fulka Gumti, Post-Jamalpur, Munger, Bihar, 811214</div>
            <div style="font-size: 8pt; color: #444;">Email- rajuengineeringworksjmp@gmail.com</div>
        </div>

        <table style="width: 100%; margin-bottom: 8px; font-weight: bold; font-size: 10pt;">
            <tr>
                <td><u>REF.-</u> {org_ref}</td>
                <td style="text-align: right;">DATE:- {org_date}</td>
            </tr>
        </table>

        <hr style="border: none; border-top: 2px solid #000; margin: 4px 0 12px 0;" />

        <div style="margin-bottom: 15px; font-weight: bold; font-size: 10pt; line-height: 1.4;">
            To.<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{consignee_html}
        </div>

        <table style="width: 100%; margin-bottom: 15px; font-weight: bold; font-size: 9.5pt;">
            <tr>
                <td>REF. <u>No:-</u> {ref_no}</td>
                <td style="text-align: right;">DATE:- {ref_date}</td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th width="10%">SR. NO</th>
                    <th width="60%">DESCRIPTION</th>
                    <th width="15%">QTY</th>
                    <th width="15%">RATE</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>

        <div id="footerContent">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td width="55%" style="vertical-align: bottom; font-size: 8.5pt; font-weight: bold;">
                        (1) GST@18% Extra<br/>
                        (2) For Destination<br/>
                        (3) Delivery within 30 days<br/>
                        (4) Inspection by consignees<br/>
                        (5) Payment 100% against CRN
                    </td>
                    <td width="45%" style="text-align: right; vertical-align: bottom;">
                        <div style="border: 2px dashed #000; padding: 8px; text-align: center; display: inline-block;">
                            <b>M/S RAJU ENGINEERING WORKS</b><br/><br/>
                            <span style="font-size: 8.5pt;">Proprietor</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    """
    return html_to_pdf(html, output_path)


def generate_quotation_bundle(data: Dict[str, Any], output_path: str) -> str:
    """
    Generates all 5 organization quotation PDFs and packages them into a ZIP file.
    """
    temp_dir = os.path.dirname(output_path)
    ref_no_clean = data.get("common", {}).get("ref_no", "REF").replace("/", "_").replace("\\", "_")
    
    hind_pdf = os.path.join(temp_dir, f"Quotation_Hind_Traders_{ref_no_clean}.pdf")
    yasha_pdf = os.path.join(temp_dir, f"Quotation_Yasha_Enterprises_{ref_no_clean}.pdf")
    madhu_pdf = os.path.join(temp_dir, f"Quotation_Madhu_Enterprises_{ref_no_clean}.pdf")
    lovely_pdf = os.path.join(temp_dir, f"Quotation_Lovely_Supplier_{ref_no_clean}.pdf")
    raju_pdf = os.path.join(temp_dir, f"Quotation_Raju_Engineering_{ref_no_clean}.pdf")

    generate_hind_quotation_pdf(data, hind_pdf)
    generate_yasha_quotation_pdf(data, yasha_pdf)
    generate_madhu_quotation_pdf(data, madhu_pdf)
    generate_lovely_quotation_pdf(data, lovely_pdf)
    generate_raju_quotation_pdf(data, raju_pdf)

    with zipfile.ZipFile(output_path, "w") as zipf:
        zipf.write(hind_pdf, arcname=os.path.basename(hind_pdf))
        zipf.write(yasha_pdf, arcname=os.path.basename(yasha_pdf))
        zipf.write(madhu_pdf, arcname=os.path.basename(madhu_pdf))
        zipf.write(lovely_pdf, arcname=os.path.basename(lovely_pdf))
        zipf.write(raju_pdf, arcname=os.path.basename(raju_pdf))

    return output_path

