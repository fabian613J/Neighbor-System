import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, delay, retry } from 'rxjs';
import { Item } from '../product';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  // Cambiamos a 127.0.0.1 para evitar problemas de resolución de DNS de localhost en Windows
  private apiUrl = 'http://127.0.0.1:8000/items';

  constructor(private http: HttpClient) { }

  /**
   * GET: Fetch items with high availability logic
   */
  getItems(): Observable<Item[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      // Reintentamos una vez si la conexión falla momentáneamente
      retry(1), 
      map(response => {
        console.log('Service Layer - Raw Response:', response);

        // Caso 1: La respuesta es el arreglo directo (Lo más probable en tu FastAPI)
        if (Array.isArray(response)) {
          return response;
        }

        // Caso 2: La respuesta viene envuelta (e.g., FastAPI devolviendo un JSON con llave 'data')
        if (response && typeof response === 'object' && Array.isArray(response.data)) {
          return response.data;
        }

        // Caso 3: Respuesta inesperada o vacía
        console.warn('Service Layer - Response is not an array, returning empty list');
        return [];
      }),
      catchError(error => {
        console.error('Service Layer - Critical Connection Error:', error);
        // Retornamos un 'Observable' de un arreglo vacío para que el componente no se rompa
        return of([]);
      })
    );
  }

  addItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}