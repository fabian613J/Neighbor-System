# models.py – SQLAlchemy ORM models for Gestor Vecinal
# Based on the ERD: 3 catalog tables + 2 transactional tables
# Compatible with the existing SQLite setup in main.py

from sqlalchemy import (
    Column, Integer, String, Boolean, Text,
    ForeignKey, DateTime, func
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


# ─────────────────────────────────────────
# CATALOG TABLES
# ─────────────────────────────────────────

class Neighbor(Base):
    """
    Core user entity. Stores every resident and admin in the neighborhood.
    role: 'admin' | 'neighbor'
    """
    __tablename__ = "neighbors"

    neighbor_id     = Column(Integer, primary_key=True, index=True)
    username        = Column(String(50),  unique=True, nullable=False, index=True)
    password_hash   = Column(String(255), nullable=False)
    full_name       = Column(String(100), nullable=False)
    email           = Column(String(100), unique=True, nullable=True)
    phone           = Column(String(20),  nullable=True)
    role            = Column(String(20),  nullable=False, default="neighbor")  # 'admin' | 'neighbor'
    is_verified     = Column(Boolean, default=False, nullable=False)
    is_active       = Column(Boolean, default=True,  nullable=False)
    created_at      = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at      = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    property        = relationship("Property", back_populates="owner", uselist=False)
    loans_requested = relationship("ItemLoan", foreign_keys="ItemLoan.borrower_id",    back_populates="borrower")
    loans_approved  = relationship("ItemLoan", foreign_keys="ItemLoan.approved_by_id", back_populates="approved_by")


class Property(Base):
    """
    Physical lot or unit in the neighborhood.
    Each property has one primary owner (Neighbor).
    """
    __tablename__ = "properties"

    property_id      = Column(Integer, primary_key=True, index=True)
    owner_id         = Column(Integer, ForeignKey("neighbors.neighbor_id"), nullable=True)
    internal_address = Column(String(150), nullable=False)
    lot_number       = Column(String(20),  nullable=False, unique=True)
    block            = Column(String(20),  nullable=True)
    property_type    = Column(String(50),  nullable=True, default="house")  # 'house' | 'apartment' | 'lot'
    is_active        = Column(Boolean, default=True, nullable=False)
    created_at       = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    owner            = relationship("Neighbor", back_populates="property")


class Category(Base):
    """
    Catalog for classifying community inventory items.
    e.g. 'Gardening Tools', 'Event Equipment', 'Maintenance'
    """
    __tablename__ = "categories"

    category_id  = Column(Integer, primary_key=True, index=True)
    name         = Column(String(100), unique=True, nullable=False)
    description  = Column(Text, nullable=True)
    is_active    = Column(Boolean, default=True, nullable=False)

    # Relationships
    items        = relationship("NeighborhoodItem", back_populates="category")


# ─────────────────────────────────────────
# TRANSACTIONAL TABLES
# ─────────────────────────────────────────

class NeighborhoodItem(Base):
    """
    Community inventory. Tracks physical stock of shared resources.
    available_stock is updated on every loan/return event.
    """
    __tablename__ = "neighborhood_items"

    item_id         = Column(Integer, primary_key=True, index=True)
    category_id     = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    name            = Column(String(100), nullable=False)
    description     = Column(Text, nullable=True)
    total_stock     = Column(Integer, default=1, nullable=False)
    available_stock = Column(Integer, default=1, nullable=False)
    condition       = Column(String(50), nullable=True, default="good")  # 'new' | 'good' | 'fair' | 'poor'
    location_notes  = Column(String(200), nullable=True)
    is_available    = Column(Boolean, default=True, nullable=False)
    created_at      = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at      = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    category        = relationship("Category", back_populates="items")
    loans           = relationship("ItemLoan", back_populates="item")


class ItemLoan(Base):
    """
    Loan transaction record. Full lifecycle of a borrow request.
    status: 'pending' | 'active' | 'returned' | 'overdue'
    """
    __tablename__ = "item_loans"

    loan_id              = Column(Integer, primary_key=True, index=True)
    item_id              = Column(Integer, ForeignKey("neighborhood_items.item_id"), nullable=False)
    borrower_id          = Column(Integer, ForeignKey("neighbors.neighbor_id"),      nullable=False)
    approved_by_id       = Column(Integer, ForeignKey("neighbors.neighbor_id"),      nullable=True)
    loan_date            = Column(DateTime, nullable=False)
    expected_return_date = Column(DateTime, nullable=False)
    actual_return_date   = Column(DateTime, nullable=True)
    status               = Column(String(20), nullable=False, default="pending")  # 'pending' | 'active' | 'returned' | 'overdue'
    quantity_borrowed    = Column(Integer, default=1, nullable=False)
    notes                = Column(Text, nullable=True)
    created_at           = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at           = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    item                 = relationship("NeighborhoodItem", back_populates="loans")
    borrower             = relationship("Neighbor", foreign_keys=[borrower_id],    back_populates="loans_requested")
    approved_by          = relationship("Neighbor", foreign_keys=[approved_by_id], back_populates="loans_approved")
