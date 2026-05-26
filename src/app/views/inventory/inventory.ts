import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryTableComponent } from '../../inventory-table/inventory-table';
import { ProductFormComponent } from '../../product-form/product-form';
import { ItemService } from '../../services/item';
import { NeighborhoodItem } from '../../product';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, InventoryTableComponent, ProductFormComponent],
  templateUrl: './inventory.html',
})
export class InventoryComponent implements OnInit {
  items: NeighborhoodItem[] = [];
  loadError = '';
  addError = '';
  private itemService = inject(ItemService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('[INVENTORY] Constructor called');
    // Recargar cada vez que navegamos A esta ruta
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/inventory'),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        console.log('[INVENTORY] Navigation detected');
        // Usar setTimeout para asegurar que Angular ha terminado de procesar la navegación
        setTimeout(() => this.cargarInventario(), 10);
      });
  }

  ngOnInit(): void {
    console.log('[INVENTORY] ngOnInit called - first initialization');
    this.cargarInventario();
  }

  cargarInventario(): void {
    console.log('[INVENTORY] cargarInventario() called');
    this.loadError = '';
    this.cdr.markForCheck();
    this.itemService.getItems().subscribe({
      next: (data) => {
        console.log('[INVENTORY] Items loaded:', data.length, 'items');
        this.items = [...data];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[INVENTORY] Error loading items:', err);
        this.loadError = 'Could not load inventory. Is the backend running?';
        this.cdr.markForCheck();
      },
    });
  }

  onProductAdded(newItem: Omit<NeighborhoodItem, 'item_id' | 'category_name'>): void {
    this.addError = '';
    this.itemService.addItem(newItem).subscribe({
      next: () => this.cargarInventario(),
      error: (err) => (this.addError = err?.error?.detail ?? 'Could not save the item. Please try again.'),
    });
  }
}
