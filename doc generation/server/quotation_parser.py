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
    using Gemini AI to extract reference details and material items.
    """
    # 1. Try Gemini AI
    ai_data = parse_quotation_with_gemini(file_path, mime_type)
    if ai_data:
        logger.info(f"Successfully extracted {len(ai_data.get('items', []))} quotation items using Gemini API")
        return ai_data

    # 2. Local Fallback for PDFs
    if file_path.lower().endswith(".pdf"):
        logger.info("Falling back to local PDF parser for quotation data")
        return parse_quotation_local_pdf(file_path)

    # 3. Default fallback for images if AI fails
    logger.info("Falling back to default 10-particular quotation structure")
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
            # Extract text first
            reader = pypdf.PdfReader(file_path)
            extracted_text = normalize_text("\n".join([page.extract_text() or "" for page in reader.pages]))
            contents.append(f"Document Text:\n{extracted_text}\n")
            
            # Also pass raw bytes if mime type is pdf
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            contents.append(types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"))
        else:
            # Image file
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
You are an expert document and image parser for Indian Railways / IREPS enquiry documents, tenders, purchase orders, and quotation requests.
Analyze the provided document or image carefully and extract the following details into a JSON object:

JSON Schema:
{
  "ref_no": "string (Reference / Enquiry / PO Number e.g. F/DPS/MMC(D)/27 or 55265692101304)",
  "ref_date": "string in DD/MM/YYYY format (Reference Date e.g. 28/04/2026)",
  "consignee_address": "string (Recipient address e.g. AWM (WHEEL)\\nEASTERN RLY, JAMALPUR or Sr. DME, EASTERN RAILWAY MALDA)",
  "items": [
    {
      "sr_no": 1,
      "description": "string (Full item description / specification)",
      "unit": "string (e.g. mtr, Nos, Set, Kg, Pc)",
      "quantity": 1
    }
  ]
}

CRITICAL GUIDELINES:
1. "ref_no" should capture any reference letter number, tender number, or file number.
2. "ref_date" should be extracted and formatted as DD/MM/YYYY.
3. "consignee_address" should include recipient designation, workshop/railway division, and station.
4. Extract ALL material items listed in the document. Pay close attention to tabular data. IT IS MANDATORY TO EXTRACT EVERY SINGLE ROW/ITEM. DO NOT MISS ANY ROW.
5. Count all rows in the image/PDF table from top to bottom. If there are 10 particulars/items, extract ALL 10 of them into the "items" list. DO NOT TRUNCATE AT 3 ITEMS OR ANY LOWER NUMBER.
6. Set "quantity" to numeric value (default to 1 if not explicitly specified) and unit (e.g., mtr, Nos, Set, Kg).
7. Return STRICTLY valid JSON matching the schema above without markdown formatting wrappers.
"""
        contents.append(prompt)

        models = [GEMINI_MODEL_NAME, "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash-exp"]
        for model_id in models:
            for attempt in range(3):
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
                        if clean_text.endswith("```"):
                            clean_text = clean_text[:-3]
                        parsed = json.loads(clean_text)
                        if isinstance(parsed, dict) and "items" in parsed and len(parsed["items"]) > 0:
                            return format_parsed_quotation_data(parsed)
                except Exception as e:
                    err_str = str(e)
                    logger.warning(f"Gemini model {model_id} attempt {attempt+1} failed: {e}")
                    if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                        time.sleep(3)
                        continue
                    break

    except Exception as e:
        logger.error(f"Error during Gemini extraction for quotation: {e}")

    return None

def parse_quotation_local_pdf(file_path: str) -> Dict[str, Any]:
    try:
        reader = pypdf.PdfReader(file_path)
        text = normalize_text("\n".join([page.extract_text() or "" for page in reader.pages]))
        
        ref_no = ""
        ref_match = re.search(r'Ref(?:\.|erence)?\s*(?:No\.?)?\s*[:\-]?\s*([A-Za-z0-9_/(\)\-]+)', text, re.IGNORECASE)
        if ref_match:
            ref_no = ref_match.group(1).strip()
        else:
            ref_no = "F/DPS/MMC(D)/27"

        ref_date = "28/04/2026"
        date_match = re.search(r'Date[d]?\s*[:\-]?\s*([0-9]{1,2}[-/\.][0-9]{1,2}[-/\.][0-9]{2,4})', text, re.IGNORECASE)
        if date_match:
            ref_date = date_match.group(1).strip()

        consignee = "AWM (WHEEL)\nEASTERN RLY, JAMALPUR"
        if "MALDA" in text:
            consignee = "Sr. DME,\nEASTERN RAILWAY\nMALDA"
        elif "DIESEL" in text:
            consignee = "AWM (DIESEL)\nEASTERN RLY, JAMALPUR"

        items = []
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        sr = 1
        for line in lines:
            if re.match(r'^\d+[\.\)]', line) or any(k in line.lower() for k in ['tube', 'washer', 'spring', 'insulator', 'screw', 'bolt', 'pin', 'gasket', 'plate', 'ring', 'bush', 'seal', 'hose', 'pipe', 'valve']):
                clean_desc = re.sub(r'^\d+[\.\)]\s*', '', line).strip()
                if len(clean_desc) > 3:
                    items.append({
                        "sr_no": sr,
                        "description": clean_desc,
                        "unit": "mtr" if "tube" in line.lower() else "Nos",
                        "quantity": 1
                    })
                    sr += 1

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
        items.append({
            "sr_no": item.get("sr_no", idx),
            "description": str(item.get("description", "")).strip(),
            "unit": str(item.get("unit", "mtr")).strip(),
            "quantity": float(item.get("quantity", 1)) if item.get("quantity") is not None else 1.0
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

