import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login() {

    if (
      this.email.trim() === '' ||
      this.password.trim() === ''
    ) {
      alert('Please enter email and password');
      return;
    }

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>(
      'http://localhost:5000/api/auth/login',
      loginData
    ).subscribe({

      next: (response) => {

        const userId =
          response.user.id || response.user._id;

        const loggedInUser = {
          id: userId,
          name: response.user.name,
          email: response.user.email
        };

        localStorage.setItem(
          'user',
          JSON.stringify(loggedInUser)
        );

        alert(response.message);

        this.router.navigate(['/']);

      },

      error: (error) => {

        alert(
          error.error?.message ||
          'Login failed'
        );

      }

    });

  }

}