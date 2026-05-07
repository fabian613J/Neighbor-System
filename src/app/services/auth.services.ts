import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000'; // URL de tu FastAPI

  constructor(private http: HttpClient) { }

  // Enviamos las credenciales al endpoint /login que creamos en Python
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        // Si el login es exitoso, guardamos el token y el nombre en el navegador
        if (res.access_token) {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('username', res.user);
        }
      })
    );
  }

  // Método para verificar si el vecino está autenticado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Limpiar la sesión
  logout() {
    localStorage.clear();
  }
}