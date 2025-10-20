import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { UserService } from '@app/core/services/user.service';
import { AppUser, UserRoleView } from '@app/core/models/database.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  currentUser: AppUser | null = null;
  userRoles: UserRoleView[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      this.currentUser = await this.authService.getCurrentAppUser();
      if (this.currentUser) {
        this.userRoles = await this.userService.getUserRoles(this.currentUser.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      this.loading = false;
    }
  }

  async signOut() {
    await this.authService.signOut();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
