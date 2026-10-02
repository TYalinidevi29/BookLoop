import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  constructor(private http: HttpClient) {}

  register() {

    if (
      this.name === '' ||
      this.email === '' ||
      this.password === '' ||
      this.confirmPassword === ''
    ) {
      alert('Please fill all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const user = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:5000/api/auth/register', user)
      .subscribe({
        next: (response: any) => {

          alert(response.message);

          this.name = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
        },

        error: (error) => {
          alert(error.error.message || 'Registration failed');
        }
      });
  }
}