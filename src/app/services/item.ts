import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of, retry } from 'rxjs';
import { Category, NeighborhoodItem, ItemLoan, ItemLoanCreate, ReturnUpdate } from '../product';
@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly base = 'http://127.0.0.1:8000';
  private readonly itemsUrl = `${this.base}/neighborhood-items`;
  private readonly loansUrl = `${this.base}/item-loans`;
  private readonly categoriesUrl = `${this.base}/categories`;

  constructor(private http: HttpClient) {}

  // ── Categories ──────────────────────────────────────────────────────────────

  /** GET /categories — list all active categories */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl).pipe(
      catchError(error => {
        console.error('ItemService.getCategories error:', error);
        return of([]);
      })
    );
  }

  // ── Neighborhood Items ──────────────────────────────────────────────────────

  /** GET /neighborhood-items — optionally filter by category or availability */
  getItems(filters?: { category_id?: number; is_available?: boolean }): Observable<NeighborhoodItem[]> {
    let params = new HttpParams();
    if (filters?.category_id != null) params = params.set('category_id', filters.category_id);
    if (filters?.is_available != null) params = params.set('is_available', filters.is_available);

    return this.http.get<NeighborhoodItem[]>(this.itemsUrl, { params }).pipe(
      retry(1),
      map(response => (Array.isArray(response) ? response : [])),
    );
  }

  /** POST /neighborhood-items — register a new community item */
  addItem(item: Omit<NeighborhoodItem, 'item_id' | 'category_name'>): Observable<NeighborhoodItem> {
    return this.http.post<NeighborhoodItem>(this.itemsUrl, item);
  }

  // ── Item Loans ──────────────────────────────────────────────────────────────

  /** POST /item-loans — register a new loan */
  createLoan(loan: ItemLoanCreate): Observable<ItemLoan> {
    return this.http.post<ItemLoan>(this.loansUrl, loan);
  }

  /** PUT /item-loans/{id}/return — mark a loan as returned */
  returnLoan(loanId: number, payload: ReturnUpdate): Observable<ItemLoan> {
    return this.http.put<ItemLoan>(`${this.loansUrl}/${loanId}/return`, payload);
  }
}
