import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemLoan, ItemLoanCreate, NeighborhoodItem } from '../product';
import { ItemService } from '../services/item';
import { AuthService } from '../services/auth.services';

interface LoanForm {
  borrower_id: number | null;
  expected_return_date: string;
  quantity_borrowed: number;
  notes: string;
}

interface ReturnForm {
  loan_id: number | null;
  notes: string;
}

@Component({
  selector: 'app-inventory-table, app-tabla-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-table.html',
  styleUrl: './inventory-table.css',
})
export class InventoryTableComponent {
  @Input() items: NeighborhoodItem[] = [];
  @Output() productDeleted = new EventEmitter<number>();
  @Output() inventoryUpdated = new EventEmitter<void>();

  loanPanelItemId: number | null = null;
  returnPanelItemId: number | null = null;

  loanForm: LoanForm = this.emptyLoanForm();
  returnForm: ReturnForm = this.emptyReturnForm();

  loanLoading = false;
  loanError = '';

  constructor(
    private itemService: ItemService,
    private authService: AuthService
  ) {}

  openLoanPanel(itemId: number): void {
    this.loanPanelItemId = itemId;
    this.returnPanelItemId = null;
    this.loanError = '';
    this.loanForm = this.emptyLoanForm();
    this.loanForm.borrower_id = this.authService.getCurrentUserId();
  }

  closeLoanPanel(): void {
    this.loanPanelItemId = null;
    this.loanError = '';
  }

  submitLoan(item: NeighborhoodItem): void {
    this.loanError = '';

    if (!this.loanForm.borrower_id || this.loanForm.borrower_id < 1) {
      this.loanError = 'Unable to determine your Neighbor ID. Please log in again.';
      return;
    }
    if (!this.loanForm.expected_return_date) {
      this.loanError = 'Please select an expected return date.';
      return;
    }

    const payload: ItemLoanCreate = {
      item_id: item.item_id!,
      borrower_id: this.loanForm.borrower_id,
      loan_date: new Date().toISOString(),
      expected_return_date: new Date(this.loanForm.expected_return_date).toISOString(),
      quantity_borrowed: this.loanForm.quantity_borrowed,
      notes: this.loanForm.notes || undefined,
    };

    this.loanLoading = true;
    this.itemService.createLoan(payload).subscribe({
      next: () => {
        this.loanLoading = false;
        this.closeLoanPanel();
        this.inventoryUpdated.emit();
      },
      error: (err) => {
        this.loanLoading = false;
        this.loanError = err?.error?.detail ?? 'Could not register the loan. Please try again.';
      },
    });
  }

  notifyDeletion(id: number | undefined): void {
    if (id != null) this.productDeleted.emit(id);
  }

  private emptyLoanForm(): LoanForm {
    return { borrower_id: null, expected_return_date: '', quantity_borrowed: 1, notes: '' };
  }

  private emptyReturnForm(): ReturnForm {
    return { loan_id: null, notes: '' };
  }
}
