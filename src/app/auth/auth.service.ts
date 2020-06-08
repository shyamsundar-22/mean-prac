import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token;
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();
  private isAuthendicated = false;
  private userId: string;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthendicated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const data: AuthData = { email: email, password: password };
    this.http.post(BACKEND_URL + '/signup', data).subscribe(
      () => {
        this.router.navigate(['/']);
      },
      (error) => {
        this.authStatusListener.next(false);
      }
    );
  }

  login(email: string, password: string) {
    const data: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        BACKEND_URL + '/login',
        data
      )
      .subscribe(
        (response) => {
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthendicated = true;
            this.userId = response.userId;
            this.authStatusListener.next(true);
            const now = new Date();
            const expData = new Date(now.getTime() + expiresInDuration * 1000);
            this.saveAuthData(token, expData, this.userId);
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.authStatusListener.next(false);
        }
      );
  }

  autoAuthUser() {
    const autoInfo = this.getAuthDate();
    if (autoInfo) {
      const now = new Date();
      const isFuture = autoInfo.expirationDate > now;
      const expiresIn = autoInfo.expirationDate.getTime() - now.getTime();
      if (expiresIn > 0) {
        this.token = autoInfo.token;
        this.isAuthendicated = true;
        this.userId = autoInfo.userId;
        this.authStatusListener.next(true);
        this.setAuthTimer(expiresIn / 1000);
      }
    }
  }

  logout() {
    this.token = null;
    this.isAuthendicated = false;
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.authStatusListener.next(false);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthDate() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expiration) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expiration),
      userId,
    };
  }
}
