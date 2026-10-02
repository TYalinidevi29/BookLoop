import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './books.html',
  styleUrl: './books.css'
})
export class Books implements OnInit {

  searchText = '';

  books: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {

    this.http.get<any[]>(
      'http://localhost:5000/api/books'
    ).subscribe({

      next: (data) => {
        this.books = data;
      },

      error: () => {
        alert('Failed to load books');
      }

    });

  }

  requestBook(book: any) {

    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      alert('Please login first');
      return;
    }

    const user = JSON.parse(savedUser);

    const requesterId = user.id || user._id;

    const request = {
      bookId: book._id,
      bookTitle: book.title,
      requesterId: requesterId
    };

    this.http.post<any>(
      'http://localhost:5000/api/requests',
      request
    ).subscribe({

      next: (response) => {
        alert(response.message);
      },

      error: (error) => {
        alert(
          error.error?.message ||
          'Failed to send request'
        );
      }

    });

  }

}