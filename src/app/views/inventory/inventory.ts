import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablaInventario } from '../../tabla-inventario/tabla-inventario';
import { FormularioprodComponent } from '../../formularioprod/formularioprod';
import { ItemService } from '../../services/item';
import { NeighborhoodItem } from '../../product';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, TablaInventario, FormularioprodComponent],
  templateUrl: './inventory.html',
})
export class InventoryComponent implements OnInit {
  items: NeighborhoodItem[] = [];
  loadError = '';
  addError = '';

  constructor(private itemService: ItemService) {}

  ngOnInit(): void { this.cargarInventario(); }

  cargarInventario(): void {
    this.loadError = '';
    this.itemService.getItems().subscribe({
      next: (data) => (this.items = [...data]),
      error: () => (this.loadError = 'Could not load inventory. Is the backend running?'),
    });
  }

  onProductoAgregado(newItem: Omit<NeighborhoodItem, 'item_id' | 'category_name'>): void {
    this.addError = '';
    this.itemService.addItem(newItem).subscribe({
      next: () => this.cargarInventario(),
      error: (err) => (this.addError = err?.error?.detail ?? 'Could not save the item. Please try again.'),
    });
  }
}
