import { Component, signal, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TablaInventario } from './tabla-inventario/tabla-inventario';
import { FormularioprodComponent } from './formularioprod/formularioprod';
import { LoginComponent } from './login/login.component'; // Importamos el nuevo Login
import { Item } from './product';
import { ItemService } from './services/item';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TablaInventario, FormularioprodComponent, LoginComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Neighborhood Lending Network');
  
  listaGlobal: Item[] = [];
  
  // Señal para rastrear al usuario actual. Si es null, mostramos el Login.
  currentUser = signal<string | null>(null);

  constructor(
    private itemService: ItemService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Verificamos si estamos en el navegador para acceder al localStorage
    if (isPlatformBrowser(this.platformId)) {
      this.checkSession();
      this.fetchInventory();
    }
  }

  // Comprueba si hay un nombre de usuario guardado de una sesión previa
  checkSession() {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      this.currentUser.set(savedUser);
    }
  }

  fetchInventory() {
    this.itemService.getItems().subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.listaGlobal = [...data];
          this.cd.detectChanges();
        }
      },
      error: (err) => console.error('Error fetching data:', err)
    });
  }

  onProductoAgregado(newItem: Item) {
    this.itemService.addItem(newItem).subscribe({
      next: () => this.fetchInventory(),
      error: (err) => console.error('Add error:', err)
    });
  }

  onEliminarProducto(id: any) {
    if (id !== undefined && id !== null) {
      this.itemService.deleteItem(Number(id)).subscribe({
        next: () => this.fetchInventory(),
        error: (err) => console.error('Delete error:', err)
      });
    }
  }

  // Método para salir del sistema y limpiar la "llave" (Token)
  logout() {
    localStorage.clear(); // Borra el token y el usuario
    this.currentUser.set(null);
    console.log('Session closed successfully');
  }
}