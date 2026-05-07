import { Component, signal, OnInit, ChangeDetectorRef } from '@angular/core'; // Agregamos ChangeDetectorRef
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TablaInventario } from './tabla-inventario/tabla-inventario';
import { FormularioprodComponent } from './formularioprod/formularioprod';
import { Item } from './product';
import { ItemService } from './services/item';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TablaInventario, FormularioprodComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Neighborhood Lending Network');
  listaGlobal: Item[] = [];

  // Inyectamos ChangeDetectorRef para solucionar el error NG0100
  constructor(
    private itemService: ItemService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.fetchInventory();
  }

  fetchInventory() {
    this.itemService.getItems().subscribe({
      next: (data) => {
        // Validación ultra-segura
        if (data && Array.isArray(data)) {
          this.listaGlobal = [...data];
          // Forzamos a Angular a reconocer el cambio de forma segura
          this.cd.detectChanges(); 
        } else {
          this.listaGlobal = [];
        }
      },
      error: (err) => {
        console.error('Error fetching inventory:', err);
        this.listaGlobal = [];
      }
    });
  }

  onProductoAgregado(newItem: Item) {
    this.itemService.addItem(newItem).subscribe({
      next: () => {
        this.fetchInventory();
      },
      error: (err) => console.error('Registration error:', err)
    });
  }

  onEliminarProducto(id: any) {
    if (id !== undefined && id !== null) {
      this.itemService.deleteItem(Number(id)).subscribe({
        next: () => {
          this.fetchInventory();
        },
        error: (err) => console.error('Delete error:', err)
      });
    }
  }
}