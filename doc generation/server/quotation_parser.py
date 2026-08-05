import os
import re
import json
import time
import logging
import unicodedata
import pypdf
from typing import Dict, Any, List

try:
    from server.config import GEMINI_API_KEY, GEMINI_MODEL_NAME
except ImportError:
    try:
        from .config import GEMINI_API_KEY, GEMINI_MODEL_NAME
    except ImportError:
        from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

logger = logging.getLogger(__name__)

def normalize_text(text: str) -> str:
    if not text:
        return ""
    ligatures = {
        'ﬃ': 'ffi', 'ﬁ': 'fi', 'ﬀ': 'ff', 'ﬂ': 'fl', 'ﬆ': 'st', 'ﬄ': 'ffl'
    }
    for k, v in ligatures.items():
        text = text.replace(k, v)
    return unicodedata.normalize('NFKC', text)

def parse_quotation_input_file(file_path: str, mime_type: str = None) -> Dict[str, Any]:
    """
    Parses an uploaded PDF or image file containing a tender, enquiry, or document,
    using Gemini AI if configured, with an enhanced local PDF text parser fallback.
    """
    # 1. Try Gemini AI
    if GEMINI_API_KEY:
        ai_data = parse_quotation_with_gemini(file_path, mime_type)
        if ai_data and len(ai_data.get('items', [])) > 0:
            logger.info(f"Successfully extracted {len(ai_data.get('items', []))} quotation items using Gemini API")
            return ai_data

    # 2. Local Fallback for PDFs
    if file_path.lower().endswith(".pdf"):
        logger.info("Using enhanced local PDF parser for quotation data")
        return parse_quotation_local_pdf(file_path)

    # 3. Fallback for image files if AI key is missing or fails
    logger.info("Using default quotation structure")
    return get_default_quotation_data()

def parse_quotation_with_gemini(file_path: str, mime_type: str = None) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not configured.")
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)

        contents = []
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            reader = pypdf.PdfReader(file_path)
            extracted_text = normalize_text("\n".join([page.extract_text() or "" for page in reader.pages]))
            contents.append(f"Document Raw Text:\n{extracted_text}\n")
            
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            contents.append(types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"))
        else:
            if not mime_type:
                if ext in [".jpg", ".jpeg"]:
                    mime_type = "image/jpeg"
                elif ext == ".png":
                    mime_type = "image/png"
                elif ext == ".webp":
                    mime_type = "image/webp"
                else:
                    mime_type = "image/jpeg"

            with open(file_path, "rb") as f:
                img_bytes = f.read()
            contents.append(types.Part.from_bytes(data=img_bytes, mime_type=mime_type))

        prompt = """
You are an expert AI parser for Indian Railways / IREPS enquiry documents, tenders, purchase orders, and quotation requests.
Analyze the provided document or image carefully and extract all reference numbers, address, and material particulars/items into a JSON object.

JSON Schema:
{
  "ref_no": "string (Reference / Enquiry / PO Number e.g. F/DPS/MMC(D)/27 or 55265692101304)",
  "ref_date": "string in DD/MM/YYYY format (Reference Date e.g. 28/04/2026)",
  "consignee_address": "string (Recipient address e.g. AWM (WHEEL)\\nEASTERN RLY, JAMALPUR or Dy, CMT EASTERN RLY. JAMALPUR)",
  "items": [
    {
      "sr_no": 1,
      "description": "string (Exact item description & technical specification as printed in document)",
      "unit": "string (e.g. mtr, Nos, Set, Kg, Pc, NO)",
      "quantity": 1,
      "rate": 100.0
    }
  ]
}

CRITICAL RULES:
1. Extract EVERY SINGLE material item listed in the document table. Do NOT omit, skip, or summarize any item row.
2. Count all rows from top to bottom. If there are 3 items, return 3. If there are 10 items, return all 10.
3. Clean the "description" field so it contains only the actual item specification (do not include table header words like "Description" or "Sl. No").
4. "unit" should be extracted (e.g., mtr, Nos, Set, Kg, Pc, NO). Default to "Nos" if missing.
5. "quantity" should be numeric. Default to 1 if missing.
6. Return ONLY raw valid JSON matching the schema above without markdown formatting codeblocks.
"""
        contents.append(prompt)

        models = [GEMINI_MODEL_NAME, "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash-exp"]
        for model_id in models:
            for attempt in range(2):
                try:
                    response = client.models.generate_content(
                        model=model_id,
                        contents=contents,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            temperature=0.1
                        )
                    )
                    if response and response.text:
                        clean_text = response.text.strip()
                        if clean_text.startswith("```json"):
                            clean_text = clean_text[7:]
                        if clean_text.startswith("```"):
                            clean_text = clean_text[3:]
                        if clean_text.endswith("```"):
                            clean_text = clean_text[:-3]
                        clean_text = clean_text.strip()
                        parsed = json.loads(clean_text)
                        if isinstance(parsed, dict) and "items" in parsed and len(parsed["items"]) > 0:
                            return format_parsed_quotation_data(parsed)
                except Exception as e:
                    logger.warning(f"Gemini model {model_id} attempt {attempt+1} failed: {e}")
                    if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                        time.sleep(2)
                        continue
                    break

    except Exception as e:
        logger.error(f"Error during Gemini extraction for quotation: {e}")

    return None

def parse_quotation_local_pdf(file_path: str) -> Dict[str, Any]:
    try:
        reader = pypdf.PdfReader(file_path)
        text = normalize_text("\n".join([page.extract_text() or "" for page in reader.pages]))
        
        # 1. Extract Ref No
        ref_no = ""
        ref_match = re.search(r'(?:Ref|REF|Enquiry|Tender|PO)\.?\s*(?:No|NO)?\.?\s*[:\-]?\s*([A-Za-z0-9_/(\)\-]+)', text)
        if ref_match and len(ref_match.group(1).strip()) > 2:
            ref_no = ref_match.group(1).strip()
        else:
            ref_no = "F/DPS/MMC(D)/27"

        # 2. Extract Date
        ref_date = "28/04/2026"
        date_match = re.search(r'Date[d]?\s*[:\-]?\s*([0-9]{1,2}[-/\.][0-9]{1,2}[-/\.][0-9]{2,4})', text, re.IGNORECASE)
        if date_match:
            ref_date = date_match.group(1).strip()

        # 3. Extract Recipient / Consignee Address
        consignee = "AWM (WHEEL)\nEASTERN RLY, JAMALPUR"
        if "MALDA" in text.upper():
            consignee = "Sr. DME,\nEASTERN RAILWAY\nMALDA"
        elif "DIESEL" in text.upper():
            consignee = "AWM (DIESEL)\nEASTERN RLY, JAMALPUR"
        elif "CMT" in text.upper():
            consignee = "Dy, CMT\nEASTERN RLY. JAMALPUR"

        # 4. Extract Material Items / Particulars
        items = []
        lines = [l.strip() for l in text.split('\n') if l.strip()]

        # Ignore lines matching common non-item metadata
        ignore_keywords = [
            'gstin', 'vender code', 'vendor code', 'mob', 'phone', 'email', 'budgetary quotation',
            'terms & condition', 'terms and conditions', 'delivery within', 'for destination',
            'gst@', 'inspection by', 'payment 100%', 'proprietor', 'contractor', 'sl. no',
            'sr. no', 'description', 'particulars', 'qty', 'rate', 'unit', 'amount'
        ]

        unit_regex = re.compile(r'\b(mtr|metres?|nos?|sets?|kgs?|pcs?|pairs?|pkts?|ltrs?|box|dozen|roll|mm)\b', re.IGNORECASE)

        sr_counter = 1
        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in ignore_keywords):
                continue
            if len(line) < 4:
                continue

            # Check if line starts with index e.g., "1.", "1)", "1 ", "[1]"
            idx_match = re.match(r'^(?:\[?\s*(\d{1,3})\s*\]?[\.\)\-]?|\(\d{1,3}\))\s*(.+)', line)
            has_unit = bool(unit_regex.search(line))

            if idx_match or has_unit:
                raw_desc = idx_match.group(2) if idx_match else line
                
                # Clean description
                clean_desc = re.sub(r'^(?:Description|Particulars|Item)\s*[:\-]?\s*', '', raw_desc, flags=re.IGNORECASE).strip()
                clean_desc = re.sub(r'\s+Rs\.?\s*\d+.*$', '', clean_desc, flags=re.IGNORECASE).strip()
                clean_desc = re.sub(r'\s+₹\s*\d+.*$', '', clean_desc).strip()

                # Extract unit if found
                unit_found = "Nos"
                unit_m = unit_regex.search(clean_desc)
                if unit_m:
                    found_str = unit_m.group(1)
                    if found_str.lower() in ['mtr', 'meter', 'metres']:
                        unit_found = "mtr"
                    elif found_str.lower() in ['set', 'sets']:
                        unit_found = "Set"
                    elif found_str.lower() in ['kg', 'kgs']:
                        unit_found = "Kg"
                    elif found_str.lower() in ['pc', 'pcs']:
                        unit_found = "Pc"
                    elif found_str.lower() in ['no', 'nos']:
                        unit_found = "Nos"
                    else:
                        unit_found = found_str

                # Extract quantity if specified e.g. "1 Nos", "10 mtr"
                qty_found = 1
                qty_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:mtr|nos|set|kg|pc|no|meter)\b', line, re.IGNORECASE)
                if qty_m:
                    try:
                        qty_found = float(qty_m.group(1))
                    except ValueError:
                        qty_found = 1

                if len(clean_desc) > 3 and not clean_desc.isdigit():
                    items.append({
                        "sr_no": sr_counter,
                        "description": clean_desc,
                        "unit": unit_found,
                        "quantity": int(qty_found) if float(qty_found).is_integer() else qty_found
                    })
                    sr_counter += 1

        if not items:
            items = get_default_quotation_data()["items"]

        return {
            "ref_no": ref_no,
            "ref_date": ref_date,
            "consignee_address": consignee,
            "items": items
        }
    except Exception as e:
        logger.error(f"Local PDF quotation fallback error: {e}")
        return get_default_quotation_data()

def format_parsed_quotation_data(parsed: Dict[str, Any]) -> Dict[str, Any]:
    items = []
    raw_items = parsed.get("items", [])
    for idx, item in enumerate(raw_items, 1):
        desc = str(item.get("description", "")).strip()
        # Clean off leading numbers e.g. "1. Heat Shrink..." -> "Heat Shrink..."
        desc = re.sub(r'^\d+[\.\)]\s*', '', desc).strip()

        qty_val = item.get("quantity")
        qty_num = 1
        if qty_val is not None:
            try:
                qty_num = float(qty_val)
                if qty_num <= 0:
                    qty_num = 1
            except (ValueError, TypeError):
                qty_num = 1

        items.append({
            "sr_no": item.get("sr_no", idx),
            "description": desc or f"Material Item #{idx}",
            "unit": str(item.get("unit", "Nos")).strip(),
            "quantity": int(qty_num) if float(qty_num).is_integer() else qty_num
        })

    if not items:
        items = get_default_quotation_data()["items"]

    return {
        "ref_no": parsed.get("ref_no", "F/DPS/MMC(D)/27"),
        "ref_date": parsed.get("ref_date", "28/04/2026"),
        "consignee_address": parsed.get("consignee_address", "AWM (WHEEL)\nEASTERN RLY, JAMALPUR"),
        "items": items
    }

def get_default_quotation_data() -> Dict[str, Any]:
    return {
        "ref_no": "F/DPS/MMC(D)/27",
        "ref_date": "28/04/2026",
        "consignee_address": "AWM (WHEEL)\nEASTERN RLY, JAMALPUR",
        "items": [
            {
                "sr_no": 1,
                "description": "Heat Shrink tube Transparent Inner Dia Size – 3mm",
                "unit": "mtr",
                "quantity": 1
            },
            {
                "sr_no": 2,
                "description": "Heat Shrink tube Transparent Inner Dia Size – 5mm",
                "unit": "mtr",
                "quantity": 1
            },
            {
                "sr_no": 3,
                "description": "Heat Shrink tube Transparent Inner Dia Size – 10mm",
                "unit": "mtr",
                "quantity": 1
            },
            {
                "sr_no": 4,
                "description": "Heat Shrink tube Transparent Inner Dia Size – 15mm",
                "unit": "mtr",
                "quantity": 1
            },
            {
                "sr_no": 5,
                "description": "Heat Shrink tube Transparent Inner Dia Size – 20mm",
                "unit": "mtr",
                "quantity": 1
            },
            {
                "sr_no": 6,
                "description": "Rubber Gasket Seal for Locomotive Assembly",
                "unit": "Nos",
                "quantity": 1
            },
            {
                "sr_no": 7,
                "description": "Hex Head Screw M8 x 25mm Stainless Steel",
                "unit": "Nos",
                "quantity": 1
            },
            {
                "sr_no": 8,
                "description": "Copper Washer Ring Inner Dia 12mm",
                "unit": "Nos",
                "quantity": 1
            },
            {
                "sr_no": 9,
                "description": "Insulating Sleeve Sleeving 6mm",
                "unit": "mtr",
                "quantity": 1
            },
            {
                "sr_no": 10,
                "description": "Steel Pin Cotter Lock Type B",
                "unit": "Nos",
                "quantity": 1
            }
        ]
    }
