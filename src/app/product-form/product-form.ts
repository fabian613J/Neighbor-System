import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category, NeighborhoodItem } from '../product';
import { ItemService } from '../services/item';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductFormComponent implements OnInit {
  @Output() productCreated = new EventEmitter<Omit<NeighborhoodItem, 'item_id' | 'category_name'>>();

  categories: Category[] = [];
  newItem: Omit<NeighborhoodItem, 'item_id' | 'category_name'> = this.emptyItem();

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.itemService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: () => (this.errorMsg = 'Could not load categories. Is the backend running?'),
    });
  }

  add(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.newItem.name.trim() || this.newItem.category_id < 1) {
      this.errorMsg = 'Please enter an item name and select a valid category.';
      return;
    }
    if (this.newItem.available_stock > this.newItem.total_stock) {
      this.errorMsg = 'Available stock cannot exceed total stock.';
      return;
    }

    this.isLoading = true;
    this.productCreated.emit({ ...this.newItem });

    this.newItem = this.emptyItem();
    this.successMsg = 'Item submitted successfully.';
    this.isLoading = false;
  }

  dismissError(): void  { this.errorMsg = ''; }
  dismissSuccess(): void { this.successMsg = ''; }

  private emptyItem(): Omit<NeighborhoodItem, 'item_id' | 'category_name'> {
    return {
      category_id: 0,
      name: '',
      description: '',
      total_stock: 1,
      available_stock: 1,
      condition: 'good',
      location_notes: '',
      is_available: true,
    };
  }
}
