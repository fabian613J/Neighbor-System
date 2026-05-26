import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item';
import { NeighborhoodItem } from '../../product';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loans.html',
})
export class LoansComponent implements OnInit {
  items: NeighborhoodItem[] = [];
  returnLoanId: number | null = null;
  returnNotes = '';
  returnLoading = false;
  returnError = '';
  returnSuccess = '';
  loadError = '';

  constructor(private itemService: ItemService) {}

  ngOnInit(): void { this.cargarItems(); }

  cargarItems(): void {
    this.loadError = '';
    this.itemService.getItems().subscribe({
      next: (data) => (this.items = data),
      error: () => (this.loadError = 'Could not load items. Is the backend running?'),
    });
  }

  get itemsOnLoan(): NeighborhoodItem[] {
    return this.items.filter(i => i.available_stock < i.total_stock);
  }

  openReturn(loanId: number): void {
    this.returnLoanId = loanId > 0 ? loanId : null;
    this.returnNotes = '';
    this.returnError = '';
    this.returnSuccess = '';
  }

  cancelReturn(): void { this.returnLoanId = null; this.returnError = ''; }

  confirmReturn(): void {
    this.returnError = '';
    this.returnSuccess = '';
    if (!this.returnLoanId || this.returnLoanId < 1) { this.returnError = 'Please enter a valid Loan ID.'; return; }
    this.returnLoading = true;
    this.itemService.returnLoan(this.returnLoanId, {
      actual_return_date: new Date().toISOString(),
      notes: this.returnNotes || undefined,
    }).subscribe({
      next: () => { this.returnLoading = false; this.returnLoanId = null; this.returnSuccess = 'Return registered successfully. Stock updated.'; this.cargarItems(); },
      error: (err) => { this.returnLoading = false; this.returnError = err?.error?.detail ?? 'Could not process the return. Please try again.'; },
    });
  }
}
