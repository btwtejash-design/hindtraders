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
    Parses an uploaded PDF or image file containing a tender, enquiry, or document.
    Runs local text extraction on PDFs first for fast & accurate parsing,
    and falls back to Gemini AI if local extraction returns no items or for images.
    """
    # 1. Local extraction for PDFs (fast & 100% offline reliable)
    if file_path.lower().endswith(".pdf"):
        local_data = parse_quotation_local_pdf(file_path)
        if local_data and len(local_data.get("items", [])) > 0:
            logger.info(f"Successfully extracted {len(local_data['items'])} quotation items using local PDF parser")
            return local_data

    # 2. Gemini AI extraction (for images or complex PDFs)
    if GEMINI_API_KEY:
        ai_data = parse_quotation_with_gemini(file_path, mime_type)
        if ai_data and len(ai_data.get('items', [])) > 0:
            logger.info(f"Successfully extracted {len(ai_data.get('items', []))} quotation items using Gemini API")
            return ai_data

    # 3. Fallback empty structure
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
      "quantity": 1
    }
  ]
}

CRITICAL RULES:
1. Extract ONLY actual material items / particulars listed in the item table.
2. DO NOT include footer terms & conditions (e.g., "(1) GST@18% Extra", "(2) For Destination", "(3) Delivery within 30 days", "(4) Inspection", "(5) Payment 100%"). Those are terms, NOT material particulars!
3. If the document lists 10 material items, extract ALL 10 items accurately without truncating or omitting any row.
4. Clean the "description" field so it contains only the actual item specification.
5. "unit" should be extracted (e.g., mtr, Nos, Set, Kg, Pc, NO). Default to "Nos" if missing.
6. "quantity" should be numeric. Default to 1 if missing.
7. Return ONLY raw valid JSON matching the schema above without markdown formatting codeblocks.
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
        raw_pages_text = [normalize_text(page.extract_text() or "") for page in reader.pages]
        full_text = "\n".join(raw_pages_text)
        
        # 1. Extract Ref No
        ref_no = ""
        ref_patterns = [
            r'(?:Ref|REF|Enquiry|Tender|PO|File|Letter)\.?\s*(?:No|NO)?\.?\s*[:\-]?\s*([A-Za-z0-9_/(\)\-]+)',
            r'([A-Z0-9]+/[A-Z0-9_\-]+/[A-Z0-9_\-]+/\d+)',
            r'No\.?\s*([A-Za-z0-9_/(\)\-]+)'
        ]
        for pat in ref_patterns:
            m = re.search(pat, full_text)
            if m and len(m.group(1).strip()) > 3:
                ref_no = m.group(1).strip()
                break

        # 2. Extract Date
        ref_date = ""
        date_m = re.search(r'Date[d]?\s*[:\-]?\s*([0-9]{1,2}[-/\.][0-9]{1,2}[-/\.][0-9]{2,4})', full_text, re.IGNORECASE)
        if date_m:
            ref_date = date_m.group(1).strip()

        # 3. Extract Recipient / Consignee Address
        consignee = ""
        if "MALDA" in full_text.upper():
            consignee = "Sr. DME,\nEASTERN RAILWAY\nMALDA"
        elif "DIESEL" in full_text.upper():
            consignee = "AWM (DIESEL)\nEASTERN RLY, JAMALPUR"
        elif "CMT" in full_text.upper():
            consignee = "Dy, CMT\nEASTERN RLY. JAMALPUR"
        elif "WHEEL" in full_text.upper():
            consignee = "AWM (WHEEL)\nEASTERN RLY, JAMALPUR"

        # 4. Extract Material Items / Particulars
        items = []
        lines = [l.strip() for l in full_text.split('\n') if l.strip()]

        skip_keywords = [
            'gstin', 'vender code', 'vendor code', 'mob', 'phone', 'email',
            'budgetary quotation', 'terms & condition', 'terms and conditions',
            'delivery within', 'for destination', 'gst@', 'inspection by',
            'payment 100%', 'proprietor', 'contractor', 'sl. no', 'sr. no',
            'description', 'particulars', 'qty', 'rate', 'unit', 'amount',
            'railway contractor', 'm/s raju', 'lovely general', 'hind traders',
            'yasha enterprises', 'madhu enterprises'
        ]

        unit_pattern = re.compile(r'\b(mtr|metres?|nos?|sets?|kgs?|pcs?|pairs?|pkts?|ltrs?|box|dozen|roll)\b', re.IGNORECASE)

        sr_counter = 1
        current_item = None

        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in skip_keywords):
                continue
            if len(line) < 3:
                continue

            # Check if line starts with an item serial number e.g. "1.", "1)", "1 ", "[1]", "01.", "1-"
            idx_match = re.match(r'^(?:\[?\s*(\d{1,3})\s*\]?[\.\)\-]?)\s+(.+)', line)

            # Check for footer terms like "(1) GST@18% Extra" or "(2) For Destination"
            is_footer_term = bool(re.search(r'\(\d\)\s*(?:GST|For Destination|Delivery|Inspection|Payment|CRN)', line, re.IGNORECASE))

            if idx_match and not is_footer_term and int(idx_match.group(1)) <= 100:
                raw_desc = idx_match.group(2).strip()

                clean_desc = re.sub(r'^(?:Description|Particulars|Item)\s*[:\-]?\s*', '', raw_desc, flags=re.IGNORECASE).strip()
                clean_desc = re.sub(r'\s+Rs\.?\s*\d+.*$', '', clean_desc, flags=re.IGNORECASE).strip()
                clean_desc = re.sub(r'\s+₹\s*\d+.*$', '', clean_desc).strip()

                unit_found = "Nos"
                unit_m = unit_pattern.search(clean_desc)
                if unit_m:
                    found_str = unit_m.group(1).lower()
                    if found_str in ['mtr', 'meter', 'metres']:
                        unit_found = "mtr"
                    elif found_str in ['set', 'sets']:
                        unit_found = "Set"
                    elif found_str in ['kg', 'kgs']:
                        unit_found = "Kg"
                    elif found_str in ['pc', 'pcs']:
                        unit_found = "Pc"
                    elif found_str in ['no', 'nos']:
                        unit_found = "Nos"
                    else:
                        unit_found = found_str.capitalize()

                qty_found = 1
                qty_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:mtr|nos|set|kg|pc|no|meter)\b', line, re.IGNORECASE)
                if qty_m:
                    try:
                        qty_found = float(qty_m.group(1))
                    except ValueError:
                        qty_found = 1

                if current_item:
                    items.append(current_item)

                current_item = {
                    "sr_no": sr_counter,
                    "description": clean_desc,
                    "unit": unit_found,
                    "quantity": int(qty_found) if float(qty_found).is_integer() else qty_found
                }
                sr_counter += 1
            elif current_item and not is_footer_term:
                if len(line) > 2 and not line_lower.startswith('ref') and not line_lower.startswith('date'):
                    current_item["description"] += " " + line

        if current_item:
            items.append(current_item)

        return {
            "ref_no": ref_no,
            "ref_date": ref_date,
            "consignee_address": consignee,
            "items": items
        }
    except Exception as e:
        logger.error(f"Local PDF quotation parser error: {e}")
        return get_default_quotation_data()

def format_parsed_quotation_data(parsed: Dict[str, Any]) -> Dict[str, Any]:
    items = []
    raw_items = parsed.get("items", [])
    for idx, item in enumerate(raw_items, 1):
        desc = str(item.get("description", "")).strip()
        desc = re.sub(r'^\d+[\.\)]\s*', '', desc).strip()

        if re.search(r'(?:GST@|For Destination|Delivery within|Inspection by|Payment 100%|against CRN)', desc, re.IGNORECASE):
            continue

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
            "sr_no": idx,
            "description": desc or f"Material Item #{idx}",
            "unit": str(item.get("unit", "Nos")).strip(),
            "quantity": int(qty_num) if float(qty_num).is_integer() else qty_num
        })

    return {
        "ref_no": parsed.get("ref_no", ""),
        "ref_date": parsed.get("ref_date", ""),
        "consignee_address": parsed.get("consignee_address", ""),
        "items": items
    }

def get_default_quotation_data() -> Dict[str, Any]:
    return {
        "ref_no": "",
        "ref_date": "",
        "consignee_address": "",
        "items": []
    }
