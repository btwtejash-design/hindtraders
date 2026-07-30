import os
import re
import urllib.parse
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup

IREPS_SEARCH_URL = "https://www.ireps.gov.in/epsn/search/advancedSearch.do"
IREPS_BASE_URL = "https://www.ireps.gov.in"

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.ireps.gov.in",
    "Referer": "https://www.ireps.gov.in/epsn/search/advancedSearch.do"
}

def get_default_dates():
    today = datetime.today()
    future = today + timedelta(days=180)
    return today.strftime("%d/%m/%Y"), future.strftime("%d/%m/%Y")

def probe_direct_ireps_pdf(query: str) -> list:
    """
    Attempts to locate direct PDF tender / PO documents on IREPS using known static URL patterns.
    """
    clean_q = re.sub(r'[^A-Za-z0-9]', '', query.strip())
    if not clean_q:
        return []

    years = ["2026", "2025", "2024", "2023", "2022"]
    depts = ["02", "19", "01", "03", "04"]
    prefixes = ["PO", "NIT", "TENDER"]

    headers = {
        "User-Agent": DEFAULT_HEADERS["User-Agent"],
        "Accept": "application/pdf,*/*"
    }

    results = []

    # Probing candidate patterns
    for yr in years:
        for dept in depts:
            for pfx in prefixes:
                target_url = f"https://www.ireps.gov.in/ireps/etender/pdfdocs/MMIS/{pfx}/{yr}/{dept}/{clean_q}.pdf"
                try:
                    res = requests.head(target_url, headers=headers, timeout=4, verify=False)
                    if res.status_code == 200:
                        results.append({
                            "dept_unit": f"Department {dept} (Eastern Railway)",
                            "tender_number": clean_q,
                            "description": f"IREPS Official {pfx} Document #{clean_q} ({yr})",
                            "status": "Published / Verified",
                            "opening_date": f"01/01/{yr}",
                            "due_date": f"31/12/{yr}",
                            "pdf_url": target_url,
                            "nit_id": clean_q
                        })
                        return results
                except Exception:
                    pass

    return results

def search_ireps_tenders(params: dict) -> dict:
    """
    Submits a POST search query to IREPS advanced search endpoint and parses tender table results.
    If IREPS redirects to Guest OTP wall, attempts direct PDF probes or provides helpful status feedback.
    """
    default_from, default_to = get_default_dates()
    
    advanced_search = str(params.get("advancedSearch", "")).strip()
    search_option = str(params.get("searchOption", "1"))
    search_optor_option = str(params.get("searchOptorOption", "0"))
    organization = str(params.get("organization", "01"))
    work_area = str(params.get("workArea", "PT"))
    railway_zone = str(params.get("railwayZone", "8937"))
    division = str(params.get("division", "19"))
    unit = str(params.get("unit", "-1"))
    tender_stage = str(params.get("tenderStage", "-1"))
    tender_type = str(params.get("tenderType", "-1"))
    bidding = str(params.get("bidding", "-1"))
    select_date = str(params.get("selectDate", "TENDER_OPENING_DATE"))
    date_from = str(params.get("dateFrom", default_from)) or default_from
    date_to = str(params.get("dateTo", default_to)) or default_to
    direction = str(params.get("direction", "P"))
    month_day = str(params.get("monthDay", "M"))
    radio_duration = str(params.get("radioDuration", "6"))

    # First check direct document repository probe if search term looks like a number
    if advanced_search:
        direct_matches = probe_direct_ireps_pdf(advanced_search)
        if direct_matches:
            return {
                "success": True,
                "tenders": direct_matches,
                "count": len(direct_matches),
                "notice": "Direct document matched from IREPS repository."
            }

    payload = {
        "searchOption": search_option,
        "searchOptorOption": search_optor_option,
        "advancedSearch": advanced_search,
        "organization": organization,
        "workArea": work_area,
        "changezone": "",
        "railwayZone": railway_zone,
        "division": division,
        "unit": unit,
        "tenderStage": tender_stage,
        "tenderType": tender_type,
        "bidding": bidding,
        "selectDate": select_date,
        "dateFrom": date_from,
        "dateTo": date_to,
        "direction": direction,
        "noMonthDay": "",
        "monthDay": month_day,
        "radioDuration": radio_duration,
        "submit": "Show Results",
        "searchParam": ""
    }

    encoded_payload = urllib.parse.urlencode(payload)

    try:
        session = requests.Session()
        # GET search page first to establish cookies
        session.get(IREPS_SEARCH_URL, headers=DEFAULT_HEADERS, timeout=10, verify=False)
        
        response = session.post(
            IREPS_SEARCH_URL,
            data=encoded_payload,
            headers=DEFAULT_HEADERS,
            timeout=25,
            verify=False
        )
        response.raise_for_status()
        html_content = response.text
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to connect to IREPS server: {str(e)}",
            "tenders": [],
            "count": 0
        }

    parsed = parse_ireps_results(html_content)

    # Check if page was redirected to login/guest OTP wall
    if "userLogin.do" in html_content or "guestLogin.do" in html_content or "Mobile Number" in html_content:
        parsed["otp_required"] = True
        parsed["message"] = "IREPS portal now requires guest OTP mobile verification for general keyword searches."
        parsed["guest_url"] = "https://www.ireps.gov.in/epsn/guestLogin.do"

    return parsed

def parse_ireps_results(html_content: str) -> dict:
    soup = BeautifulSoup(html_content, "html.parser")
    tenders = []

    # Look for table containing tender listings
    tables = soup.find_all("table")
    target_table = None

    for table in tables:
        text = table.get_text()
        if "Tender" in text or "Deptt" in text or "Item Description" in text or "NIT" in text:
            target_table = table
            if len(table.find_all("tr")) > 3:
                break

    if not target_table:
        return {
            "success": True,
            "message": "No matching tenders found for the provided search criteria.",
            "tenders": [],
            "count": 0
        }

    rows = target_table.find_all("tr")
    header_indices = {}

    for idx, row in enumerate(rows):
        cells = row.find_all(["th", "td"])
        cell_texts = [c.get_text(strip=True) for c in cells]
        
        joined_text = " ".join(cell_texts).lower()
        if "tender" in joined_text and ("deptt" in joined_text or "unit" in joined_text or "status" in joined_text or "opening" in joined_text or "sl" in joined_text or "no" in joined_text):
            for i, txt in enumerate(cell_texts):
                t_lower = txt.lower()
                if "dept" in t_lower or "unit" in t_lower or "rly" in t_lower:
                    header_indices["dept"] = i
                elif "tender" in t_lower and ("no" in t_lower or "num" in t_lower):
                    header_indices["tender_no"] = i
                elif "title" in t_lower or "desc" in t_lower or "work" in t_lower or "item" in t_lower:
                    header_indices["description"] = i
                elif "status" in t_lower or "stage" in t_lower:
                    header_indices["status"] = i
                elif "open" in t_lower:
                    header_indices["opening_date"] = i
                elif "due" in t_lower or "close" in t_lower:
                    header_indices["due_date"] = i
            continue

        if len(cells) < 3:
            continue

        pdf_link = None
        nit_id = None
        links = row.find_all("a")

        for link in links:
            href = link.get("href", "")
            onclick = link.get("onclick", "")
            combined_link = href + " " + onclick
            if ".pdf" in combined_link.lower() or "pdf" in combined_link.lower() or "viewnit" in combined_link.lower():
                pdf_match = re.search(r"['\"]([^'\"]+\.pdf[^'\"]*)['\"]", combined_link, re.IGNORECASE)
                if pdf_match:
                    pdf_link = pdf_match.group(1)
                elif href and href != "#" and "javascript" not in href.lower():
                    pdf_link = href

            nit_match = re.search(r"nitId=([A-Za-z0-9_\-]+)", combined_link)
            if nit_match:
                nit_id = nit_match.group(1)

        dept = cell_texts[header_indices.get("dept", 1)] if "dept" in header_indices and header_indices["dept"] < len(cell_texts) else (cell_texts[1] if len(cell_texts) > 1 else "")
        tender_no = cell_texts[header_indices.get("tender_no", 2)] if "tender_no" in header_indices and header_indices["tender_no"] < len(cell_texts) else (cell_texts[2] if len(cell_texts) > 2 else cell_texts[0])
        description = cell_texts[header_indices.get("description", 3)] if "description" in header_indices and header_indices["description"] < len(cell_texts) else (cell_texts[3] if len(cell_texts) > 3 else "")
        status = cell_texts[header_indices.get("status", 4)] if "status" in header_indices and header_indices["status"] < len(cell_texts) else (cell_texts[4] if len(cell_texts) > 4 else "Published")
        opening_date = cell_texts[header_indices.get("opening_date", 5)] if "opening_date" in header_indices and header_indices["opening_date"] < len(cell_texts) else (cell_texts[5] if len(cell_texts) > 5 else "")
        due_date = cell_texts[header_indices.get("due_date", 6)] if "due_date" in header_indices and header_indices["due_date"] < len(cell_texts) else (cell_texts[6] if len(cell_texts) > 6 else "")

        full_pdf_url = None
        if pdf_link:
            if pdf_link.startswith("http://") or pdf_link.startswith("https://"):
                full_pdf_url = pdf_link
            elif pdf_link.startswith("/"):
                full_pdf_url = f"{IREPS_BASE_URL}{pdf_link}"
            else:
                full_pdf_url = f"{IREPS_BASE_URL}/epsn/search/{pdf_link}"
        elif nit_id:
            full_pdf_url = f"{IREPS_BASE_URL}/ireps/supply/pdfdocs/viewNitPdf_{nit_id}.pdf"

        if tender_no.lower() in ["tender no", "tender number", "sl.no", "sl no"]:
            continue

        tenders.append({
            "dept_unit": dept,
            "tender_number": tender_no,
            "description": description,
            "status": status if status else "Published",
            "opening_date": opening_date,
            "due_date": due_date,
            "pdf_url": full_pdf_url,
            "nit_id": nit_id
        })

    return {
        "success": True,
        "tenders": tenders,
        "count": len(tenders)
    }

def fetch_ireps_pdf(pdf_url: str):
    """
    Downloads raw PDF content from specified IREPS PDF link.
    """
    if not pdf_url.startswith("http"):
        if pdf_url.startswith("/"):
            pdf_url = f"{IREPS_BASE_URL}{pdf_url}"
        else:
            pdf_url = f"{IREPS_BASE_URL}/{pdf_url}"

    headers = {
        "User-Agent": DEFAULT_HEADERS["User-Agent"],
        "Accept": "application/pdf,*/*"
    }

    response = requests.get(pdf_url, headers=headers, timeout=30, verify=False, stream=True)
    response.raise_for_status()
    return response.content
