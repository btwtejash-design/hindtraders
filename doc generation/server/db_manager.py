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
        if rec.get("id") == record_id or rec.get("po_number") == record_id:
            return rec
    return None

def save_record(data: Dict[str, Any]) -> Dict[str, Any]:
    _ensure_db_exists()
    records = get_all_records()
    
    po_no = data.get("po_number", "55265692101304")
    record_id = data.get("id") or f"REC-{po_no}"
    
    data["id"] = record_id
    data["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")

    # Check if record already exists and update
    existing_index = -1
    for idx, rec in enumerate(records):
        if rec.get("id") == record_id or rec.get("po_number") == po_no:
            existing_index = idx
            break

    if existing_index >= 0:
        records[existing_index] = data
    else:
        records.insert(0, data)

    with open(DB_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    return data

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
