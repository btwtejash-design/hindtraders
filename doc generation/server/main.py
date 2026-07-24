import os
import shutil
import zipfile
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException, Body, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import Dict, Any, List

try:
    from server.po_parser import parse_po_pdf
    from server.generators.tax_invoice import generate_tax_invoice_excel
    from server.generators.challan import generate_challan_excel
    from server.generators.gc import generate_gc_docx
    from server.generators.pdf_generator import (
        generate_tax_invoice_pdf,
        generate_challan_pdf,
        generate_gc_pdf
    )
    from server.db_manager import (
        get_all_records,
        get_record,
        save_record,
        update_crn_details
    )
except ImportError:
    from po_parser import parse_po_pdf
    from generators.tax_invoice import generate_tax_invoice_excel
    from generators.challan import generate_challan_excel
    from generators.gc import generate_gc_docx
    from generators.pdf_generator import (
        generate_tax_invoice_pdf,
        generate_challan_pdf,
        generate_gc_pdf
    )
    from db_manager import (
        get_all_records,
        get_record,
        save_record,
        update_crn_details
    )

app = FastAPI(title="IREPS Document Generation System", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
TEMP_DIR = os.path.join(tempfile.gettempdir(), "ireps_docs")
os.makedirs(TEMP_DIR, exist_ok=True)

SAMPLE_PO_PATH = os.path.join(BASE_DIR, "sample", "55265692101304.pdf")

@app.get("/api/ping")
@app.get("/health")
def ping_health():
    import datetime
    return {
        "status": "ok",
        "alive": True,
        "service": "Hind Traders App",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@app.get("/")
def root():
    root_index = os.path.join(ROOT_DIR, "index.html")
    if os.path.exists(root_index):
        return FileResponse(root_index)
    index_path = os.path.join(BASE_DIR, "client", "dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "status": "ok",
        "service": "IREPS Document Generation System",
        "version": "2.0.0"
    }

@app.get("/catalog.html")
def catalog_page():
    catalog_path = os.path.join(ROOT_DIR, "catalog.html")
    if os.path.exists(catalog_path):
        return FileResponse(catalog_path)
    raise HTTPException(status_code=404, detail="Catalog page not found")

@app.get("/documents")
@app.get("/documents.html")
def documents_page():
    index_path = os.path.join(BASE_DIR, "client", "dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="Documents page build not found")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "IREPS Document Generation Service Running v2.0"}

# --- DATABASE RECORD ENDPOINTS ---

@app.get("/api/records")
def list_saved_records():
    """Returns list of all saved document generations"""
    return get_all_records()

@app.get("/api/records/{record_id}")
def get_saved_record(record_id: str = Path(...)):
    """Retrieves a single saved document record"""
    rec = get_record(record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    return rec

@app.post("/api/records/save")
def save_document_record(data: Dict[str, Any] = Body(...)):
    """Saves or updates a document generation record in persistent storage"""
    saved = save_record(data)
    return {"status": "success", "message": "Record saved successfully", "record": saved}

@app.put("/api/records/{record_id}/crn")
def update_crn_endpoint(
    record_id: str = Path(...),
    payload: Dict[str, str] = Body(...)
):
    """Updates CRN Number and CRN Date for an existing saved record"""
    crn_no = payload.get("crn_no", "")
    crn_date = payload.get("crn_date", "")
    if not crn_no:
        raise HTTPException(status_code=400, detail="CRN Number is required")

    updated = update_crn_details(record_id, crn_no, crn_date)
    if not updated:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"status": "success", "message": "CRN details updated successfully", "record": updated}

# --- PARSING ENDPOINTS ---

@app.get("/api/sample-data")
def get_sample_data():
    """Parses sample PO file 55265692101304.pdf and returns saved/parsed data"""
    if os.path.exists(SAMPLE_PO_PATH):
        parsed = parse_po_pdf(SAMPLE_PO_PATH)
        # Check if saved in DB
        saved = get_record(parsed["po_number"])
        if saved:
            return saved
        parsed["id"] = f"REC-{parsed['po_number']}"
        save_record(parsed)
        return parsed
    else:
        raise HTTPException(status_code=404, detail="Sample PO file not found")

@app.post("/api/parse-po")
async def parse_po_endpoint(file: UploadFile = File(...)):
    """Uploads a PDF PO, parses data, and automatically saves record to database"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    temp_pdf_path = os.path.join(TEMP_DIR, file.filename)
    with open(temp_pdf_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        data = parse_po_pdf(temp_pdf_path)
        data["id"] = f"REC-{data['po_number']}"
        save_record(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PO PDF: {str(e)}")

# --- PDF GENERATION ENDPOINTS ---

@app.post("/api/generate/tax-invoice-pdf")
def generate_tax_invoice_pdf_endpoint(data: Dict[str, Any] = Body(...)):
    """Generates Tax Invoice PDF file"""
    try:
        save_record(data)
        inv_no = data.get("invoice_no", "42")
        out_filename = f"Tax_Invoice_{inv_no}.pdf"
        out_path = os.path.join(TEMP_DIR, out_filename)
        generate_tax_invoice_pdf(data, out_path)
        return FileResponse(out_path, filename=out_filename, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tax invoice PDF generation error: {str(e)}")

@app.post("/api/generate/challan-pdf")
def generate_challan_pdf_endpoint(data: Dict[str, Any] = Body(...)):
    """Generates Delivery Challan PDF file"""
    try:
        save_record(data)
        ch_no = data.get("challan_no", "44")
        out_filename = f"Delivery_Challan_{ch_no}.pdf"
        out_path = os.path.join(TEMP_DIR, out_filename)
        generate_challan_pdf(data, out_path)
        return FileResponse(out_path, filename=out_filename, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delivery challan PDF generation error: {str(e)}")

@app.post("/api/generate/gc-pdf")
def generate_gc_pdf_endpoint(data: Dict[str, Any] = Body(...)):
    """Generates Guarantee Certificate PDF file"""
    try:
        save_record(data)
        po_no = data.get("po_number", "55265692101304")
        out_filename = f"Guarantee_Certificate_{po_no}.pdf"
        out_path = os.path.join(TEMP_DIR, out_filename)
        generate_gc_pdf(data, out_path)
        return FileResponse(out_path, filename=out_filename, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GC PDF generation error: {str(e)}")

@app.post("/api/generate/bundle-pdf")
def generate_bundle_pdf_endpoint(data: Dict[str, Any] = Body(...)):
    """Generates ZIP bundle containing PDF, Excel, and Docx files for all 3 documents"""
    try:
        save_record(data)
        po_no = data.get("po_number", "55265692101304")
        
        pdf_inv = os.path.join(TEMP_DIR, f"Tax_Invoice_{data.get('invoice_no', '42')}.pdf")
        pdf_ch = os.path.join(TEMP_DIR, f"Delivery_Challan_{data.get('challan_no', '44')}.pdf")
        pdf_gc = os.path.join(TEMP_DIR, f"Guarantee_Certificate_{po_no}.pdf")
        
        xlsx_inv = os.path.join(TEMP_DIR, f"Tax_Invoice_{data.get('invoice_no', '42')}.xlsx")
        xlsx_ch = os.path.join(TEMP_DIR, f"Delivery_Challan_{data.get('challan_no', '44')}.xlsx")
        docx_gc = os.path.join(TEMP_DIR, f"Guarantee_Certificate_{po_no}.docx")

        generate_tax_invoice_pdf(data, pdf_inv)
        generate_challan_pdf(data, pdf_ch)
        generate_gc_pdf(data, pdf_gc)

        generate_tax_invoice_excel(data, xlsx_inv)
        generate_challan_excel(data, xlsx_ch)
        generate_gc_docx(data, docx_gc)

        zip_filename = f"Documents_Bundle_PO_{po_no}.zip"
        zip_path = os.path.join(TEMP_DIR, zip_filename)

        with zipfile.ZipFile(zip_path, 'w') as zipf:
            zipf.write(pdf_inv, arcname=os.path.basename(pdf_inv))
            zipf.write(pdf_ch, arcname=os.path.basename(pdf_ch))
            zipf.write(pdf_gc, arcname=os.path.basename(pdf_gc))
            zipf.write(xlsx_inv, arcname=os.path.basename(xlsx_inv))
            zipf.write(xlsx_ch, arcname=os.path.basename(xlsx_ch))
            zipf.write(docx_gc, arcname=os.path.basename(docx_gc))

        return FileResponse(zip_path, filename=zip_filename, media_type="application/zip")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bundle generation error: {str(e)}")

# --- EXCEL / DOCX ENDPOINTS ---

@app.post("/api/generate/tax-invoice")
def generate_tax_invoice_endpoint(data: Dict[str, Any] = Body(...)):
    inv_no = data.get("invoice_no", "42")
    out_filename = f"Tax_Invoice_{inv_no}.xlsx"
    out_path = os.path.join(TEMP_DIR, out_filename)
    generate_tax_invoice_excel(data, out_path)
    return FileResponse(out_path, filename=out_filename, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@app.post("/api/generate/challan")
def generate_challan_endpoint(data: Dict[str, Any] = Body(...)):
    ch_no = data.get("challan_no", "44")
    out_filename = f"Delivery_Challan_{ch_no}.xlsx"
    out_path = os.path.join(TEMP_DIR, out_filename)
    generate_challan_excel(data, out_path)
    return FileResponse(out_path, filename=out_filename, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@app.post("/api/generate/gc")
def generate_gc_endpoint(data: Dict[str, Any] = Body(...)):
    po_no = data.get("po_number", "55265692101304")
    out_filename = f"Guarantee_Certificate_{po_no}.docx"
    out_path = os.path.join(TEMP_DIR, out_filename)
    generate_gc_docx(data, out_path)
    return FileResponse(out_path, filename=out_filename, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")


# --- SERVE FRONTEND STATIC FILES & SPA FALLBACK ---

DIST_DIR = os.path.join(BASE_DIR, "client", "dist")
if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))


if __name__ == "__main__":
    import uvicorn
    module_path = "server.main:app" if os.path.basename(os.getcwd()) != "server" else "main:app"
    uvicorn.run(module_path, host="127.0.0.1", port=8000, reload=True)

