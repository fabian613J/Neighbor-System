import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

interface NeighborOut {
  neighbor_id: number;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
}

@Component({
  selector: 'app-neighbors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neighbors.html',
})
export class NeighborsComponent implements OnInit {
  neighbors: NeighborOut[] = [];
  loading = true;
  error = '';

  private readonly apiUrl = 'http://127.0.0.1:8000/neighbors';
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('[NEIGHBORS] Constructor called');
    // Recargar cada vez que navegamos A esta ruta
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/neighbors'),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        console.log('[NEIGHBORS] Navigation detected');
        // Usar setTimeout para asegurar que Angular ha terminado de procesar la navegación
        setTimeout(() => this.loadNeighbors(), 10);
      });
  }

  ngOnInit(): void {
    console.log('[NEIGHBORS] ngOnInit called - first initialization');
    this.loadNeighbors();
  }

  private loadNeighbors(): void {
    console.log('[NEIGHBORS] loadNeighbors() called, setting loading=true');
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();
    this.http.get<NeighborOut[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log('[NEIGHBORS] Neighbors loaded:', data.length, 'neighbors');
        this.neighbors = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[NEIGHBORS] Error loading neighbors:', err);
        this.error = 'Could not load neighbors. Make sure the backend is running.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
