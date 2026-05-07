import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Item } from '../product';

@Component({
  selector: 'app-formularioprod',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './formularioprod.html',
  styleUrl: './formularioprod.css'
})
export class FormularioprodComponent {
  
  @Output() productoCreado = new EventEmitter<Item>();

  nuevoProd: Item = {
    id: 0, // El ID se asignará en el backend
    vecino: '',
    objeto: '',
    cantidad: 1,
    intercambio: ''
  };

  agregar() {
    // Basic validation to avoid empty fields
    if (this.nuevoProd.vecino.trim() && this.nuevoProd.objeto.trim()) {
      
      this.productoCreado.emit({ ...this.nuevoProd });

      // Reset form
      this.nuevoProd = { 
        id: 0, // El ID se asignará en el backend
        vecino: '', 
        objeto: '', 
        cantidad: 1, 
        intercambio: '' 
      };
      
      console.log('Event emitted: Item ready for API');
    } else {
      alert("Please enter both the neighbor's name and the item to be lent.");
    }
  }
}