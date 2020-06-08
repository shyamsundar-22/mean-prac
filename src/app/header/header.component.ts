import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthendicated = false;
  private authListenerSubs: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userIsAuthendicated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuth) => {
        this.userIsAuthendicated = isAuth;
      });
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
