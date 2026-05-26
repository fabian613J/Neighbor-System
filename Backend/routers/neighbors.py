# routers/neighbors.py
# Endpoints: GET /neighbors — list all neighbors (catalog)

from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Neighbor

router = APIRouter(prefix="/neighbors", tags=["Neighbors"])


class NeighborOut(BaseModel):
    neighbor_id: int
    username: str
    full_name: str
    email: Optional[str]
    phone: Optional[str]
    role: str
    is_verified: bool
    is_active: bool

    model_config = {"from_attributes": True}


@router.get("/", response_model=List[NeighborOut])
def list_neighbors(db: Session = Depends(get_db)):
    """Return all neighbors."""
    return db.query(Neighbor).filter(Neighbor.is_active == True).all()
