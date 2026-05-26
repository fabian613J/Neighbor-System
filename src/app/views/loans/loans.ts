import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item';
import { NeighborhoodItem } from '../../product';
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
  returnLoanId: number | null = null;
  returnNotes = '';
  returnLoading = false;
  returnError = '';
  returnSuccess = '';
  loadError = '';
  private itemService = inject(ItemService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('[LOANS] Constructor called');
    // Recargar cada vez que navegamos A esta ruta
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/loans'),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        console.log('[LOANS] Navigation detected');
        // Usar setTimeout para asegurar que Angular ha terminado de procesar la navegación
        setTimeout(() => this.cargarItems(), 10);
      });
  }

  ngOnInit(): void {
    console.log('[LOANS] ngOnInit called - first initialization');
    this.cargarItems();
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
