import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { ItemService } from '../../services/item';
import { NeighborhoodItem } from '../../product';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  allItems: NeighborhoodItem[] = [];
  loading = true;
  private itemService = inject(ItemService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('[DASHBOARD] Constructor called');
    // Recargar cada vez que navegamos A esta ruta
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/dashboard'),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        console.log('[DASHBOARD] Navigation detected');
        // Usar setTimeout para asegurar que Angular ha terminado de procesar la navegación
        setTimeout(() => this.load(), 10);
      });
  }

  ngOnInit(): void {
    console.log('[DASHBOARD] ngOnInit called - first initialization');
    this.load();
  }

  load(): void {
    console.log('[DASHBOARD] load() called, setting loading=true');
    this.loading = true;
    this.cdr.markForCheck();
    this.itemService.getItems().subscribe({
      next: (items) => {
        console.log('[DASHBOARD] Items loaded:', items.length, 'items');
        this.allItems = items;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[DASHBOARD] Error loading items:', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  refresh(): void {
    this.load();
  }

  get totalItems(): number { return this.allItems.length; }
  get itemsOnLoan(): number { return this.allItems.filter(i => i.available_stock < i.total_stock).length; }
  get unitsOnLoan(): number { return this.allItems.reduce((s, i) => s + Math.max(0, i.total_stock - i.available_stock), 0); }
  get outOfStockItems(): NeighborhoodItem[] { return this.allItems.filter(i => i.available_stock === 0); }
  get outOfStockNames(): string { return this.outOfStockItems.slice(0, 3).map(i => i.name).join(', '); }
  get recentItems(): NeighborhoodItem[] { return this.allItems.slice(0, 5); }
  get availabilityPct(): number {
    if (!this.totalItems) return 0;
    return Math.round(this.allItems.filter(i => i.available_stock === i.total_stock).length / this.totalItems * 100);
  }
}
