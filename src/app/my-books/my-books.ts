import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-my-books',
  standalone: true,

  imports: [
    FormsModule,
    CommonModule
  ],

  templateUrl: './my-books.html',
  styleUrl: './my-books.css'
})


export class MyBooks implements OnInit {

  title = '';
  author = '';
  category = '';

  books: any[] = [];

  currentUserId = '';


  constructor(
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef
  ) {}


  ngOnInit() {

    this.loadBooks();

  }


  loadBooks() {

    const savedUser = localStorage.getItem('user');


    if (!savedUser) {

      alert('Please login first');

      return;

    }


    const user = JSON.parse(savedUser);


    this.currentUserId =
      user.id || user._id;


    this.http.get<any[]>(
      `http://localhost:5000/api/books?ownerId=${this.currentUserId}`
    )
    .subscribe({

      next: (data) => {

        this.books = [...data];

        this.changeDetector.detectChanges();

      },


      error: () => {

        alert('Books loading error');

      }

    });

  }


  addBook() {

    if (
      this.title.trim() === '' ||
      this.author.trim() === '' ||
      this.category.trim() === ''
    ) {

      alert('Please fill all fields');

      return;

    }


    const savedUser =
      localStorage.getItem('user');


    if (!savedUser) {

      alert('Please login first');

      return;

    }


    const user =
      JSON.parse(savedUser);


    const userId =
      user.id || user._id;


    const book = {

      title: this.title,

      author: this.author,

      category: this.category,

      ownerId: userId

    };


    this.http.post<any>(
      'http://localhost:5000/api/books',
      book
    )
    .subscribe({

      next: (response) => {

        alert(response.message);


        this.title = '';
        this.author = '';
        this.category = '';


        this.books = [
          ...this.books,
          response.book
        ];


        this.changeDetector.detectChanges();

      },


      error: (error) => {

        alert(
          error.error?.message ||
          'Failed to add book'
        );

      }

    });

  }


  deleteBook(id: string) {

    this.http.delete(
      `http://localhost:5000/api/books/${id}`
    )
    .subscribe({

      next: () => {

        alert('Book deleted successfully');


        this.books =
          this.books.filter(
            book => book._id !== id
          );


        this.changeDetector.detectChanges();

      },


      error: () => {

        alert('Failed to delete book');

      }

    });

  }

}