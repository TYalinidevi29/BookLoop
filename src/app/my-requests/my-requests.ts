import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css'
})
export class MyRequests implements OnInit {

  requests: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {

    setTimeout(() => {
      this.loadRequests();
    }, 500);

  }

  loadRequests() {

    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      alert('Please login first');
      return;
    }

    const user = JSON.parse(savedUser);

    const requesterId = user.id || user._id;

    console.log('Requester ID:', requesterId);

    this.http.get<any[]>(
      `http://localhost:5000/api/requests?requesterId=${requesterId}`
    )
    .subscribe({

      next: (data) => {

        console.log('Requests received:', data);

        this.requests = data;

      },

      error: (error) => {

        console.log('Request error:', error);

        alert('Failed to load requests');

      }

    });

  }

}