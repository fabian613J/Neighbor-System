import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item';
import { AuthService } from '../../services/auth.services';
import { NeighborService } from '../../services/neighbor';
import { NeighborhoodItem, ItemLoan } from '../../product';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loans.html',
})
export class LoansComponent implements OnInit {
  items: NeighborhoodItem[] = [];
  currentUserId: number | null = null;
  currentUserName: string | null = null;
  loans: ItemLoan[] = [];
  returnLoanId: number | null = null;
  selectedReturnLoanId: number | null = null;
  selectedReturnItemId: number | null = null;
  selectedReturnItemName: string | null = null;
  activeReturnLoans: Record<number, ItemLoan[] | undefined> = {};
  returnNotes = '';
  returnLoading = false;
  returnLoansLoading = false;
  returnError = '';
  returnSuccess = '';
  loadError = '';
  loansLoading = false;
  loansError = '';

  private itemService = inject(ItemService);
  private authService = inject(AuthService);
  private neighborService = inject(NeighborService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('[LOANS] Constructor called');
    // Reload every time we navigate to this route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/loans'),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        console.log('[LOANS] Navigation detected');
        setTimeout(() => {
          this.cargarItems();
          this.cargarMyLoans();
        }, 10);
      });
  }

  ngOnInit(): void {
    console.log('[LOANS] ngOnInit called - first initialization');
    this.cargarItems();
    this.cargarMyLoans();
  }

  cargarItems(): void {
    console.log('[LOANS] cargarItems() called');
    this.loadError = '';
    this.cdr.markForCheck();
    this.itemService.getItems().subscribe({
      next: (data) => {
        console.log('[LOANS] Items loaded:', data.length, 'items');
        this.items = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[LOANS] Error loading items:', err);
        this.loadError = 'Could not load items. Is the backend running?';
        this.cdr.markForCheck();
      },
    });
  }

  cargarMyLoans(): void {
    console.log('[LOANS] cargarMyLoans() called');
    this.currentUserId = this.authService.getCurrentUserId();
    this.currentUserName = this.authService.getCurrentUserName();
    this.loansError = '';

    const loadLoansForId = (userId: number | null) => {
      if (!userId) {
        this.loans = [];
        this.loansError = 'Could not determine the current user. Please log in again.';
        this.cdr.markForCheck();
        return;
      }

      console.log('[LOANS] Loading loans for current user', userId);
      this.loansLoading = true;
      this.cdr.markForCheck();
      this.itemService.getLoansByNeighbor(userId).subscribe({
        next: (data) => {
          this.loans = data;
          this.loansLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[LOANS] Error loading current user loans:', err);
          this.loansError = 'Could not load loans for your account.';
          this.loansLoading = false;
          this.cdr.markForCheck();
        },
      });
    };

    if (this.currentUserId) {
      loadLoansForId(this.currentUserId);
      return;
    }

    const username = this.currentUserName;
    if (!username) {
      loadLoansForId(null);
      return;
    }

    this.neighborService.getNeighbors().subscribe({
      next: (neighbors) => {
        const match = neighbors.find(n => n.username === username);
        if (match) {
          this.currentUserId = match.neighbor_id;
          localStorage.setItem('user_id', String(match.neighbor_id));
          loadLoansForId(match.neighbor_id);
        } else {
          loadLoansForId(null);
        }
      },
      error: (err) => {
        console.error('[LOANS] Error resolving current user id by username:', err);
        this.loansError = 'Could not determine the current user. Please log in again.';
        this.cdr.markForCheck();
      },
    });
  }

  get itemsOnLoan(): NeighborhoodItem[] {
    const activeItemIds = new Set(
      this.loans
        .filter(loan => loan.status === 'active' || loan.status === 'overdue')
        .map(loan => loan.item_id)
    );
    return this.items.filter(item => activeItemIds.has(item.item_id!));
  }

  activeLoansForItem(itemId: number): ItemLoan[] {
    return this.activeReturnLoans[itemId] ?? [];
  }

  openReturn(itemId: number, itemName: string): void {
    this.returnLoanId = null;
    this.selectedReturnLoanId = null;
    this.selectedReturnItemId = itemId;
    this.selectedReturnItemName = itemName;
    this.returnNotes = '';
    this.returnError = '';
    this.returnSuccess = '';
    this.returnLoansLoading = false;

    const localUserLoans = this.loans.filter(loan =>
      loan.item_id === itemId && (loan.status === 'active' || loan.status === 'overdue')
    );

    if (localUserLoans.length > 0) {
      this.activeReturnLoans[itemId] = localUserLoans;
      this.selectedReturnLoanId = localUserLoans[0].loan_id ?? null;
      this.returnLoanId = localUserLoans[0].loan_id ?? null;
      return;
    }

    this.returnLoansLoading = true;
    this.itemService.getActiveLoansByItem(itemId).subscribe({
      next: (loans) => {
        this.returnLoansLoading = false;
        const userLoans = loans.filter(loan => loan.borrower_id === this.currentUserId);
        this.activeReturnLoans[itemId] = userLoans;
        if (userLoans.length > 0) {
          this.selectedReturnLoanId = userLoans[0].loan_id ?? null;
          this.returnLoanId = userLoans[0].loan_id ?? null;
        } else {
          this.returnLoanId = null;
          this.returnError = 'No active loans found for this item under your account.';
        }
      },
      error: (err) => {
        this.returnLoansLoading = false;
        console.error('[LOANS] Error loading active loans for item:', err);
        this.returnError = 'Could not load active loans for this item.';
      },
    });
  }

  cancelReturn(): void {
    this.returnLoanId = null;
    this.returnError = '';
    this.selectedReturnLoanId = null;
    this.selectedReturnItemName = null;
    this.selectedReturnItemId = null;
  }

  confirmReturn(): void {
    this.returnError = '';
    this.returnSuccess = '';
    if (!this.returnLoanId || this.returnLoanId < 1) { this.returnError = 'No active loan selected for return.'; return; }
    this.returnLoading = true;
    this.itemService.returnLoan(this.returnLoanId, {
      actual_return_date: new Date().toISOString(),
      notes: this.returnNotes || undefined,
    }).subscribe({
      next: () => {
        this.returnLoading = false;
        this.returnLoanId = null;
        this.selectedReturnLoanId = null;
        this.selectedReturnItemName = null;
        this.returnSuccess = 'Return registered successfully. Stock updated.';
        this.cargarItems();
        this.cargarMyLoans();
      },
      error: (err) => {
        this.returnLoading = false;
        this.returnError = err?.error?.detail ?? 'Could not process the return. Please try again.';
      },
    });
  }
}
