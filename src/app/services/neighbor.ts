import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface Neighbor {
  neighbor_id: number;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NeighborService {
  private readonly base = 'http://127.0.0.1:8000';
  private readonly neighborsUrl = `${this.base}/neighbors`;

  constructor(private http: HttpClient) {}

  /** GET /neighbors — list all active neighbors */
  getNeighbors(): Observable<Neighbor[]> {
    return this.http.get<Neighbor[]>(this.neighborsUrl).pipe(
      catchError(error => {
        console.error('NeighborService.getNeighbors error:', error);
        return of([]);
      })
    );
  }
}
