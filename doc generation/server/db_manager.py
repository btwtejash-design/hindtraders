import os
import json
import time
from typing import Dict, Any, List, Optional

DB_FILE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "records.json"))

def _ensure_db_exists():
    os.makedirs(os.path.dirname(DB_FILE_PATH), exist_ok=True)
    if not os.path.exists(DB_FILE_PATH):
        with open(DB_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)

def get_all_records() -> List[Dict[str, Any]]:
    _ensure_db_exists()
    try:
        with open(DB_FILE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def get_record(record_id: str) -> Optional[Dict[str, Any]]:
    records = get_all_records()
    for rec in records:
        if rec.get("id") == record_id or rec.get("po_number") == record_id or rec.get("ref_no") == record_id:
            return rec
    return None

def save_record(data: Dict[str, Any]) -> Dict[str, Any]:
    _ensure_db_exists()
    records = get_all_records()
    
    # Identify whether PO or Quotation
    is_quotation = "common" in data or "quotation_ref" in data or data.get("record_type") == "quotation"
    if is_quotation:
        data["record_type"] = "quotation"
        ref_no = data.get("common", {}).get("ref_no") or data.get("ref_no", "HT-BQ")
        clean_ref = str(ref_no).replace("/", "_").replace("\\", "_")
        record_id = data.get("id") or f"QUOT-{clean_ref}"
    else:
        data["record_type"] = "po"
        po_no = data.get("po_number", "55265692101304")
        record_id = data.get("id") or f"REC-{po_no}"
    
    data["id"] = record_id
    data["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")

    # Check if record already exists and update
    existing_index = -1
    for idx, rec in enumerate(records):
        if rec.get("id") == record_id:
            existing_index = idx
            break

    if existing_index >= 0:
        records[existing_index] = data
    else:
        records.insert(0, data)

    with open(DB_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    return data

def get_quotation_records() -> List[Dict[str, Any]]:
    all_recs = get_all_records()
    return [r for r in all_recs if r.get("record_type") == "quotation" or "common" in r]

def save_quotation_record(data: Dict[str, Any]) -> Dict[str, Any]:
    data["record_type"] = "quotation"
    return save_record(data)

def delete_record(record_id: str) -> bool:
    _ensure_db_exists()
    records = get_all_records()
    new_records = [r for r in records if r.get("id") != record_id and r.get("po_number") != record_id]
    if len(new_records) < len(records):
        with open(DB_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(new_records, f, indent=2, ensure_ascii=False)
        return True
    return False

def update_crn_details(record_id: str, crn_no: str, crn_date: str) -> Optional[Dict[str, Any]]:
    _ensure_db_exists()
    records = get_all_records()
    updated_rec = None

    for rec in records:
        if rec.get("id") == record_id or rec.get("po_number") == record_id:
            rec["crn_no"] = crn_no
            rec["crn_date"] = crn_date
            rec["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
            updated_rec = rec
            break

    if updated_rec:
        with open(DB_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, ensure_ascii=False)

    return updated_rec

