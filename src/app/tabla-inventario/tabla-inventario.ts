import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemLoanCreate, NeighborhoodItem } from '../product';
import { ItemService } from '../services/item';

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
  selector: 'app-tabla-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tabla-inventario.html',
  styleUrl: './tabla-inventario.css',
})
export class TablaInventario {
  @Input() misProductos: NeighborhoodItem[] = [];
  @Output() productoEliminado = new EventEmitter<number>();
  @Output() inventarioActualizado = new EventEmitter<void>();

  loanPanelItemId: number | null = null;
  returnPanelItemId: number | null = null;

  loanForm: LoanForm = this.emptyLoanForm();
  returnForm: ReturnForm = this.emptyReturnForm();

  loanLoading = false;
  returnLoading = false;
  loanError = '';
  returnError = '';

  constructor(private itemService: ItemService) {}

  // ── Loan panel ──────────────────────────────────────────────────────────────

  openLoanPanel(itemId: number): void {
    this.loanPanelItemId = itemId;
    this.returnPanelItemId = null;
    this.loanForm = this.emptyLoanForm();
    this.loanError = '';
  }

  closeLoanPanel(): void {
    this.loanPanelItemId = null;
    this.loanError = '';
  }

  submitLoan(item: NeighborhoodItem): void {
    this.loanError = '';

    if (!this.loanForm.borrower_id || this.loanForm.borrower_id < 1) {
      this.loanError = 'Please enter a valid Neighbor ID.';
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
        this.inventarioActualizado.emit();
      },
      error: (err) => {
        this.loanLoading = false;
        this.loanError = err?.error?.detail ?? 'Could not register the loan. Please try again.';
      },
    });
  }

  // ── Return panel ─────────────────────────────────────────────────────────────

  openReturnPanel(itemId: number): void {
    this.returnPanelItemId = itemId;
    this.loanPanelItemId = null;
    this.returnForm = this.emptyReturnForm();
    this.returnError = '';
  }

  closeReturnPanel(): void {
    this.returnPanelItemId = null;
    this.returnError = '';
  }

  submitReturn(): void {
    this.returnError = '';

    if (!this.returnForm.loan_id || this.returnForm.loan_id < 1) {
      this.returnError = 'Please enter a valid Loan ID.';
      return;
    }

    this.returnLoading = true;
    this.itemService
      .returnLoan(this.returnForm.loan_id, {
        actual_return_date: new Date().toISOString(),
        notes: this.returnForm.notes || undefined,
      })
      .subscribe({
        next: () => {
          this.returnLoading = false;
          this.closeReturnPanel();
          this.inventarioActualizado.emit();
        },
        error: (err) => {
          this.returnLoading = false;
          this.returnError = err?.error?.detail ?? 'Could not process the return. Please try again.';
        },
      });
  }

  notificarEliminacion(id: number | undefined): void {
    if (id != null) this.productoEliminado.emit(id);
  }

  private emptyLoanForm(): LoanForm {
    return { borrower_id: null, expected_return_date: '', quantity_borrowed: 1, notes: '' };
  }

  private emptyReturnForm(): ReturnForm {
    return { loan_id: null, notes: '' };
  }
}
