# seed.py – Populates the Gestor Vecinal database with rich demo data.
# Run from the Backend folder:  python seed.py
#
# WARNING: This script CLEARS existing data before inserting.
# Safe to re-run at any time to reset to a clean demo state.

from datetime import datetime, timedelta
from passlib.context import CryptContext
from models import Base, Neighbor, Property, Category, NeighborhoodItem, ItemLoan
from database import engine, SessionLocal

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_pw(plain: str) -> str:
    return pwd_context.hash(plain)

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Clear existing data (order matters for FK constraints) ────────────
        print("🗑  Clearing existing data...")
        db.query(ItemLoan).delete()
        db.query(NeighborhoodItem).delete()
        db.query(Property).delete()
        db.query(Category).delete()
        db.query(Neighbor).delete()
        db.commit()

        # ── 1. NEIGHBORS (15 total: 2 admins + 13 neighbors) ─────────────────
        neighbors_data = [
            ("admin",       "admin123",     "Alice Admin",      "alice@neighborhood.com",   "555-0100", "admin",    True),
            ("bob_admin",   "admin123",     "Bob Manager",      "bob@neighborhood.com",     "555-0101", "admin",    True),
            ("john_doe",    "neighbor123",  "John Doe",         "john@neighborhood.com",    "555-0102", "neighbor", True),
            ("maria_g",     "neighbor123",  "Maria Garcia",     "maria@neighborhood.com",   "555-0103", "neighbor", True),
            ("carlos_r",    "neighbor123",  "Carlos Rivera",    "carlos@neighborhood.com",  "555-0104", "neighbor", True),
            ("linda_m",     "neighbor123",  "Linda Martinez",   "linda@neighborhood.com",   "555-0105", "neighbor", True),
            ("peter_k",     "neighbor123",  "Peter Kim",        "peter@neighborhood.com",   "555-0106", "neighbor", True),
            ("sara_w",      "neighbor123",  "Sara Wilson",      "sara@neighborhood.com",    "555-0107", "neighbor", False),
            ("tom_b",       "neighbor123",  "Tom Brown",        "tom@neighborhood.com",     "555-0108", "neighbor", True),
            ("ana_l",       "neighbor123",  "Ana Lopez",        "ana@neighborhood.com",     "555-0109", "neighbor", True),
            ("mike_t",      "neighbor123",  "Mike Thompson",    "mike@neighborhood.com",    "555-0110", "neighbor", True),
            ("julia_s",     "neighbor123",  "Julia Santos",     "julia@neighborhood.com",   "555-0111", "neighbor", False),
            ("david_n",     "neighbor123",  "David Nguyen",     "david@neighborhood.com",   "555-0112", "neighbor", True),
            ("emma_p",      "neighbor123",  "Emma Patel",       "emma@neighborhood.com",    "555-0113", "neighbor", True),
            ("lucas_f",     "neighbor123",  "Lucas Fernandez",  "lucas@neighborhood.com",   "555-0114", "neighbor", True),
        ]

        neighbor_objs = []
        for username, pw, full_name, email, phone, role, verified in neighbors_data:
            n = Neighbor(
                username=username,
                password_hash=hash_pw(pw),
                full_name=full_name,
                email=email,
                phone=phone,
                role=role,
                is_verified=verified,
                is_active=True,
            )
            db.add(n)
            neighbor_objs.append(n)

        db.flush()
        print(f"✔  {len(neighbor_objs)} neighbors seeded.")

        # ── 2. PROPERTIES (one per neighbor) ─────────────────────────────────
        addresses = [
            ("1 Maple Street",          "A-01", "A", "house"),
            ("2 Maple Street",          "A-02", "A", "house"),
            ("3 Maple Street",          "A-03", "A", "house"),
            ("7 Oak Avenue, Apt 2B",    "B-07", "B", "apartment"),
            ("9 Oak Avenue",            "B-09", "B", "house"),
            ("12 Pine Road",            "C-12", "C", "house"),
            ("14 Pine Road",            "C-14", "C", "house"),
            ("5 Elm Court",             "D-05", "D", "apartment"),
            ("8 Elm Court",             "D-08", "D", "house"),
            ("20 Cedar Lane",           "E-20", "E", "house"),
            ("22 Cedar Lane",           "E-22", "E", "house"),
            ("3 Birch Blvd, Apt 1A",    "F-03", "F", "apartment"),
            ("6 Birch Blvd",            "F-06", "F", "house"),
            ("10 Willow Way",           "G-10", "G", "house"),
            ("15 Willow Way",           "G-15", "G", "house"),
        ]

        for neighbor, (addr, lot, block, ptype) in zip(neighbor_objs, addresses):
            db.add(Property(
                owner_id=neighbor.neighbor_id,
                internal_address=addr,
                lot_number=lot,
                block=block,
                property_type=ptype,
                is_active=True,
            ))

        db.flush()
        print(f"✔  {len(addresses)} properties seeded.")

        # ── 3. CATEGORIES ─────────────────────────────────────────────────────
        cat_data = [
            ("Tools",       "Hand tools, power tools and hardware"),
            ("Events",      "Tables, chairs, tents and event supplies"),
            ("Gardening",   "Shovels, hoses, planters and garden gear"),
            ("Maintenance", "Ladders, paint rollers and repair equipment"),
            ("Sports",      "Balls, nets, cones and recreational gear"),
        ]
        cat_objs = {}
        for name, desc in cat_data:
            c = Category(name=name, description=desc, is_active=True)
            db.add(c)
            cat_objs[name] = c

        db.flush()
        print(f"✔  {len(cat_objs)} categories seeded.")

        # ── 4. NEIGHBORHOOD ITEMS (15 items) ──────────────────────────────────
        items_data = [
            # (category, name, description, total, available, condition, location)
            ("Tools",       "Electric Drill",       "Cordless 18V drill, 2 battery packs",          2,  1, "good", "Storage A, shelf 1"),
            ("Tools",       "Circular Saw",         "7-1/4 inch corded circular saw",               1,  1, "good", "Storage A, shelf 2"),
            ("Tools",       "Jigsaw",               "Variable speed jigsaw with blades",             1,  0, "fair", "Storage A, shelf 2"),
            ("Tools",       "Toolbox Set",          "Complete 120-piece hand tool set",              2,  2, "new",  "Storage A, cabinet"),
            ("Events",      "Folding Table",        "6-foot plastic folding table",                  8,  5, "good", "Community hall, back room"),
            ("Events",      "Folding Chair",        "Standard metal folding chair",                 30, 22, "fair", "Community hall, back room"),
            ("Events",      "Party Tent (10x10)",   "Pop-up canopy tent with stakes",                2,  2, "good", "Storage B, corner"),
            ("Events",      "Bluetooth Speaker",    "Portable waterproof speaker, 20h battery",     1,  1, "good", "Office cabinet"),
            ("Gardening",   "Garden Hose (50ft)",   "Rubber hose with spray nozzle",                 3,  3, "good", "Storage B"),
            ("Gardening",   "Lawn Mower",           "Electric push mower, 20-inch deck",             1,  1, "good", "Storage B, large bay"),
            ("Gardening",   "Wheelbarrow",          "Steel tray, pneumatic tire",                    2,  2, "fair", "Storage B, large bay"),
            ("Maintenance", "Extension Ladder",     "24-foot aluminum extension ladder",             1,  0, "good", "Storage A, wall mount"),
            ("Maintenance", "Pressure Washer",      "1800 PSI electric pressure washer",             1,  1, "good", "Storage B"),
            ("Maintenance", "Paint Roller Set",     "9-inch roller frames, trays and covers",        4,  4, "new",  "Storage A, shelf 3"),
            ("Sports",      "Volleyball Net Set",   "Regulation net with poles and boundary lines",  1,  1, "good", "Sports shed"),
        ]

        item_objs = {}
        for cat_name, name, desc, total, avail, cond, loc in items_data:
            item = NeighborhoodItem(
                category_id=cat_objs[cat_name].category_id,
                name=name,
                description=desc,
                total_stock=total,
                available_stock=avail,
                condition=cond,
                location_notes=loc,
                is_available=avail > 0,
            )
            db.add(item)
            item_objs[name] = item

        db.flush()
        print(f"✔  {len(item_objs)} neighborhood items seeded.")

        # ── 5. ITEM LOANS (10 loans: mix of statuses) ─────────────────────────
        now    = datetime.utcnow()
        admin  = db.query(Neighbor).filter_by(username="admin").first()

        def neighbor(username):
            return db.query(Neighbor).filter_by(username=username).first()

        def item(name):
            return db.query(NeighborhoodItem).filter_by(name=name).first()

        loans = [
            # returned
            ItemLoan(item_id=item("Electric Drill").item_id,      borrower_id=neighbor("john_doe").neighbor_id,   approved_by_id=admin.neighbor_id, loan_date=now-timedelta(days=15), expected_return_date=now-timedelta(days=10), actual_return_date=now-timedelta(days=11), status="returned",  quantity_borrowed=1, notes="Returned clean."),
            ItemLoan(item_id=item("Toolbox Set").item_id,          borrower_id=neighbor("carlos_r").neighbor_id,  approved_by_id=admin.neighbor_id, loan_date=now-timedelta(days=20), expected_return_date=now-timedelta(days=15), actual_return_date=now-timedelta(days=14), status="returned",  quantity_borrowed=1, notes="All tools accounted for."),
            ItemLoan(item_id=item("Paint Roller Set").item_id,     borrower_id=neighbor("linda_m").neighbor_id,   approved_by_id=admin.neighbor_id, loan_date=now-timedelta(days=8),  expected_return_date=now-timedelta(days=5),  actual_return_date=now-timedelta(days=6),  status="returned",  quantity_borrowed=2, notes="Used for bedroom repaint."),
            # active
            ItemLoan(item_id=item("Folding Table").item_id,        borrower_id=neighbor("maria_g").neighbor_id,   approved_by_id=admin.neighbor_id, loan_date=now-timedelta(days=2),  expected_return_date=now+timedelta(days=3),  actual_return_date=None,                   status="active",    quantity_borrowed=3, notes="Block party Saturday."),
            ItemLoan(item_id=item("Folding Chair").item_id,        borrower_id=neighbor("peter_k").neighbor_id,   approved_by_id=admin.neighbor_id, loan_date=now-timedelta(days=1),  expected_return_date=now+timedelta(days=4),  actual_return_date=None,                   status="active",    quantity_borrowed=8, notes="Community meeting."),
            ItemLoan(item_id=item("Electric Drill").item_id,       borrower_id=neighbor("tom_b").neighbor_id,     approved_by_id=admin.neighbor_id, loan_date=now-timedelta(days=3),  expected_return_date=now+timedelta(days=2),  actual_return_date=None,                   status="active",    quantity_borrowed=1, notes="Fence repair."),
            ItemLoan(item_id=item("Jigsaw").item_id,               borrower_id=neighbor("ana_l").neighbor_id,     approved_by_id=admin.neighbor_id, loan_date=now-timedelta(days=4),  expected_return_date=now+timedelta(days=1),  actual_return_date=None,                   status="active",    quantity_borrowed=1, notes="Shelf installation."),
            # overdue
            ItemLoan(item_id=item("Extension Ladder").item_id,     borrower_id=neighbor("john_doe").neighbor_id,  approved_by_id=admin.neighbor_id, loan_date=now-timedelta(days=14), expected_return_date=now-timedelta(days=7),  actual_return_date=None,                   status="overdue",   quantity_borrowed=1, notes="Reminder sent day 8."),
            ItemLoan(item_id=item("Circular Saw").item_id,         borrower_id=neighbor("david_n").neighbor_id,   approved_by_id=admin.neighbor_id, loan_date=now-timedelta(days=12), expected_return_date=now-timedelta(days=5),  actual_return_date=None,                   status="overdue",   quantity_borrowed=1, notes="No response to reminder."),
            # pending
            ItemLoan(item_id=item("Lawn Mower").item_id,           borrower_id=neighbor("emma_p").neighbor_id,    approved_by_id=None,              loan_date=now,                    expected_return_date=now+timedelta(days=7),  actual_return_date=None,                   status="pending",   quantity_borrowed=1, notes="Awaiting admin approval."),
        ]

        db.add_all(loans)
        db.flush()
        print(f"✔  {len(loans)} item loans seeded.")

        db.commit()
        print("\n✅  Seed complete. Database is ready with full demo data.")
        print("\n📋  Login credentials:")
        print("    admin / admin123  (role: admin)")
        print("    john_doe / neighbor123  (role: neighbor)")

    except Exception as e:
        db.rollback()
        print(f"\n❌  Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
