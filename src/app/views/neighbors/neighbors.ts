import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<NeighborOut[]>(this.apiUrl).subscribe({
      next: (data) => { this.neighbors = data; this.loading = false; },
      error: () => { this.error = 'Could not load neighbors. Make sure the backend is running.'; this.loading = false; },
    });
  }
}
