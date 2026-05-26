# routers/item_loans.py
# Endpoints: POST /item-loans          – register a new loan
#            PUT  /item-loans/{id}/return – mark a loan as returned

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, model_validator
from sqlalchemy.orm import Session

from database import get_db
from models import ItemLoan, NeighborhoodItem, Neighbor

router = APIRouter(prefix="/item-loans", tags=["Item Loans"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class ItemLoanCreate(BaseModel):
    item_id:              int      = Field(..., gt=0)
    borrower_id:          int      = Field(..., gt=0)
    approved_by_id:       Optional[int] = Field(None, gt=0)
    loan_date:            datetime
    expected_return_date: datetime
    quantity_borrowed:    int      = Field(1, ge=1)
    notes:                Optional[str] = Field(None, max_length=500)

    @model_validator(mode="after")
    def return_date_after_loan_date(self):
        if self.expected_return_date <= self.loan_date:
            raise ValueError("expected_return_date must be after loan_date.")
        return self


class ItemLoanOut(BaseModel):
    loan_id:              int
    item_id:              int
    item_name:            Optional[str] = None
    borrower_id:          int
    borrower_name:        Optional[str] = None
    approved_by_id:       Optional[int]
    loan_date:            datetime
    expected_return_date: datetime
    actual_return_date:   Optional[datetime]
    status:               str
    quantity_borrowed:    int
    notes:                Optional[str]
    created_at:           datetime

    model_config = {"from_attributes": True}


class ReturnUpdate(BaseModel):
    actual_return_date: datetime = Field(default_factory=datetime.utcnow)
    notes:              Optional[str] = Field(None, max_length=500)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/", response_model=ItemLoanOut, status_code=201)
def create_loan(payload: ItemLoanCreate, db: Session = Depends(get_db)):
    """Register a new item loan request."""
    # Validate item exists and has enough stock
    item = db.query(NeighborhoodItem).filter(
        NeighborhoodItem.item_id == payload.item_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {payload.item_id} not found.")
    if not item.is_available or item.available_stock < payload.quantity_borrowed:
        raise HTTPException(
            status_code=409,
            detail=f"Not enough stock. Available: {item.available_stock}, requested: {payload.quantity_borrowed}.",
        )

    # Validate borrower exists
    borrower = db.query(Neighbor).filter(
        Neighbor.neighbor_id == payload.borrower_id
    ).first()
    if not borrower:
        raise HTTPException(status_code=404, detail=f"Neighbor {payload.borrower_id} not found.")

    # Validate approver if provided
    if payload.approved_by_id:
        approver = db.query(Neighbor).filter(
            Neighbor.neighbor_id == payload.approved_by_id
        ).first()
        if not approver:
            raise HTTPException(status_code=404, detail=f"Approver {payload.approved_by_id} not found.")

    # Create loan record
    loan = ItemLoan(**payload.model_dump(), status="active")
    db.add(loan)

    # Decrement available stock
    item.available_stock -= payload.quantity_borrowed
    if item.available_stock == 0:
        item.is_available = False

    db.commit()
    db.refresh(loan)

    out = ItemLoanOut.model_validate(loan)
    out.item_name     = item.name
    out.borrower_name = borrower.full_name
    return out


@router.put("/{loan_id}/return", response_model=ItemLoanOut)
def return_loan(loan_id: int, payload: ReturnUpdate, db: Session = Depends(get_db)):
    """Mark a loan as returned and restore the item's available stock."""
    loan = db.query(ItemLoan).filter(ItemLoan.loan_id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail=f"Loan {loan_id} not found.")

    if loan.status == "returned":
        raise HTTPException(status_code=409, detail="This loan has already been returned.")

    # Update loan record
    loan.actual_return_date = payload.actual_return_date
    loan.status = "returned"
    if payload.notes:
        loan.notes = payload.notes

    # Restore stock
    item = db.query(NeighborhoodItem).filter(
        NeighborhoodItem.item_id == loan.item_id
    ).first()
    if item:
        item.available_stock += loan.quantity_borrowed
        item.is_available = True

    db.commit()
    db.refresh(loan)

    out = ItemLoanOut.model_validate(loan)
    out.item_name     = item.name if item else None
    out.borrower_name = loan.borrower.full_name if loan.borrower else None
    return out


@router.get("/neighbor/{neighbor_id}", response_model=list)
def get_loans_by_neighbor(neighbor_id: int, db: Session = Depends(get_db)):
    """Get all loans (active and returned) for a specific neighbor as borrower."""
    # Validate neighbor exists
    neighbor = db.query(Neighbor).filter(
        Neighbor.neighbor_id == neighbor_id
    ).first()
    if not neighbor:
        raise HTTPException(status_code=404, detail=f"Neighbor {neighbor_id} not found.")

    # Get all loans for this neighbor
    loans = db.query(ItemLoan).filter(
        ItemLoan.borrower_id == neighbor_id
    ).order_by(ItemLoan.loan_date.desc()).all()

    result = []
    for loan in loans:
        out = ItemLoanOut.model_validate(loan)
        out.item_name = loan.item.name if loan.item else None
        out.borrower_name = loan.borrower.full_name if loan.borrower else None
        result.append(out)

    return result
