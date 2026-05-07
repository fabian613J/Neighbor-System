import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../product';

@Component({
  selector: 'app-tabla-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-inventario.html',
  styleUrl: './tabla-inventario.css',
})
export class TablaInventario {
  // Recibimos la lista global del componente padre
  @Input() misProductos: Item[] = [];
  
  // Avisamos al padre (app.ts) qué ID queremos eliminar
  @Output() productoEliminado = new EventEmitter<number>();

  notificarEliminacion(id: any) {
    // Validación de seguridad: solo emitimos si el ID es válido
    if (id !== undefined && id !== null) {
      console.log('1. Child component clicked. ID to delete:', id);
      this.productoEliminado.emit(Number(id));
    } else {
      console.warn('Attempted to delete an item without a valid ID');
    }
  }
}