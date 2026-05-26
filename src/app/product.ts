// Matches CategoryOut from the FastAPI router
export interface Category {
  category_id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

// Matches NeighborhoodItemOut from the FastAPI router
export interface NeighborhoodItem {
  item_id?: number;
  category_id: number;
  category_name?: string;
  name: string;
  description?: string;
  total_stock: number;
  available_stock: number;
  condition?: 'new' | 'good' | 'fair' | 'poor';
  location_notes?: string;
  is_available: boolean;
}

// Matches ItemLoanOut from the FastAPI router
export interface ItemLoan {
  loan_id?: number;
  item_id: number;
  item_name?: string;
  borrower_id: number;
  borrower_name?: string;
  approved_by_id?: number;
  loan_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  status: 'pending' | 'active' | 'returned' | 'overdue';
  quantity_borrowed: number;
  notes?: string;
  created_at?: string;
}

// Payload sent to POST /item-loans
export interface ItemLoanCreate {
  item_id: number;
  borrower_id: number;
  approved_by_id?: number;
  loan_date: string;
  expected_return_date: string;
  quantity_borrowed: number;
  notes?: string;
}

// Payload sent to PUT /item-loans/{id}/return
export interface ReturnUpdate {
  actual_return_date: string;
  notes?: string;
}

// Legacy interface — kept for backward compatibility with /items endpoints
/** @deprecated Use NeighborhoodItem instead */
export interface Item {
  id?: number;
  vecino: string;
  objeto: string;
  cantidad: number;
  intercambio: string;
}
