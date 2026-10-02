import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Books } from './books/books';
import { Login } from './login/login';
import { Register } from './register/register';
import { MyBooks } from './my-books/my-books';
import { MyRequests } from './my-requests/my-requests';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'books', component: Books },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'my-books', component: MyBooks },
  { path: 'my-requests', component: MyRequests }
];