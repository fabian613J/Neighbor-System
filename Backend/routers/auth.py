from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database import get_db
from models import Neighbor

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterIn(BaseModel):
    username: str
    password: str
    full_name: str
    email: EmailStr | None = None
    phone: str | None = None


class NeighborOut(BaseModel):
    neighbor_id: int
    username: str
    full_name: str
    email: str | None
    phone: str | None
    role: str
    is_verified: bool
    is_active: bool

    model_config = {"from_attributes": True}


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


@router.post("/register", response_model=NeighborOut)
def register_user(payload: RegisterIn, db: Session = Depends(get_db)):
    # Unique username and email checks
    if db.query(Neighbor).filter(Neighbor.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if payload.email and db.query(Neighbor).filter(Neighbor.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_neighbor = Neighbor(
        username=payload.username,
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        role="neighbor",
        is_verified=False,
        is_active=True,
    )

    db.add(new_neighbor)
    db.commit()
    db.refresh(new_neighbor)

    return new_neighbor
