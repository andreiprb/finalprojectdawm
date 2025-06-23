import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, switchMap, timer } from 'rxjs';
import { AuthService } from '../services/auth.service';

abstract class BaseAuthGuard implements CanActivate {
  constructor(
    protected authService: AuthService,
    protected router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.waitForAuthInit().pipe(
      switchMap(() => this.authService.currentUser$),
      map(user => this.checkAccess(!!user))
    );
  }

  protected abstract checkAccess(isAuthenticated: boolean): boolean;

  private waitForAuthInit(): Observable<boolean> {
    return timer(0, 100).pipe(
      switchMap(async () => {
        await this.authService.waitForInitialization();
        return true;
      }),
      map(() => true),
    )
  }
}

@Injectable({ providedIn: 'root' })
export class AuthGuard extends BaseAuthGuard {
  protected checkAccess(isAuthenticated: boolean): boolean {
    if (isAuthenticated) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class LoginGuard extends BaseAuthGuard {
  protected checkAccess(isAuthenticated: boolean): boolean {
    if (!isAuthenticated) {
      return true;
    } else {
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
