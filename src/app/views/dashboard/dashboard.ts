import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ItemService } from '../../services/item';
import { NeighborhoodItem } from '../../product';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  allItems: NeighborhoodItem[] = [];
  loading = true;

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.allItems = items;
        this.loading = false;
      },
      error: () => (this.loading = false),
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
