from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import Invoice
from schemas import InvoiceCreate, InvoiceResponse, InvoiceListResult

router = APIRouter()


@router.post("/", response_model=InvoiceListResult)
def create_invoice(data: InvoiceCreate, db: Session = Depends(get_db)):
    try:
        invoice = Invoice(**data.model_dump())
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        return {"status": "success", "data": [invoice]}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=InvoiceListResult)
def get_invoices(db: Session = Depends(get_db)):
    return {"status": "success", "data": db.query(Invoice).all()}


@router.patch("/{invoice_id}/pay", response_model=InvoiceListResult)
def pay_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = "paid"
    db.commit()
    db.refresh(invoice)
    return {"status": "success", "data": [invoice]}