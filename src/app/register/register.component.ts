import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username = '';
  password = '';
  full_name = '';
  email = '';
  phone = '';

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    const payload = {
      username: this.username,
      password: this.password,
      full_name: this.full_name,
      email: this.email || undefined,
      phone: this.phone || undefined,
    };
    this.auth.register(payload).subscribe({
      next: () => {
        alert('Account created successfully. You can now login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error', err);
        alert(err?.error?.detail || 'Registration failed.');
      }
    });
  }
}
