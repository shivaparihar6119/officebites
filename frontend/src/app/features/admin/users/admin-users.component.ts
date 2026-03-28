import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSnackBarModule, MatIconModule, MatDialogModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>User Management</h1>
        <p>View and manage all system users</p>
      </div>

      <div class="section-card">
        <table class="data-table" *ngIf="users.length">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.fullName }}</td>
              <td><code>{{ user.username }}</code></td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge"
                  [class.badge-danger]="user.role === 'ADMIN'"
                  [class.badge-warning]="user.role === 'VENDOR'"
                  [class.badge-success]="user.role === 'EMPLOYEE'">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <button mat-icon-button color="warn"
                        (click)="deleteUser(user)"
                        [disabled]="user.role === 'ADMIN'"
                        title="Delete user">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="!users.length" class="empty">No users found.</p>
      </div>
    </div>
  `,
  styles: [`
    .section-card {
      background: #1e293b; border: 1px solid rgba(99,102,241,0.2);
      border-radius: 16px; padding: 24px; overflow: auto;
    }
    .empty { color: #64748b; text-align: center; padding: 32px; }
    code { background: rgba(99,102,241,0.1); padding: 2px 8px; border-radius: 6px; color: #a5b4fc; font-size: 12px; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];

  constructor(private adminService: AdminService, 
              private snackBar: MatSnackBar, 
              private dialog: MatDialog) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.adminService.getAllUsers().subscribe(users => this.users = users);
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
        confirmText: 'Delete User'
      },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('User deleted', 'OK', { duration: 3000, panelClass: 'snack-success' });
            this.loadUsers();
          },
          error: () => this.snackBar.open('Error deleting user', 'OK', { duration: 3000, panelClass: 'snack-error' })
        });
      }
    });
  }
}
