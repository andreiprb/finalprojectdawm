import { Injectable } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from './db.service';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private dbService: DatabaseService) {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    const { data: { session } } = await this.dbService.auth.getSession();
    if (session?.user) {
      await this.setCurrentUser(session.user);
    }

    this.dbService.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.setCurrentUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUserSubject.next(null);
      }
    });
  }

  private async setCurrentUser(user: User): Promise<void> {
    // Use getUser() to get the most up-to-date user data including metadata
    const { data: { user: currentUser }, error } = await this.dbService.auth.getUser();

    if (error || !currentUser) {
      console.error('Error fetching user:', error);
      return;
    }

    // Construct display name from first_name and last_name
    const firstName = currentUser.user_metadata?.['first_name'] || '';
    const lastName = currentUser.user_metadata?.['last_name'] || '';
    const displayName = `${firstName} ${lastName}`.trim() || 'User';

    const userProfile: UserProfile = {
      id: currentUser.id,
      email: currentUser.email!,
      displayName: displayName
    };

    this.currentUserSubject.next(userProfile);
  }

  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    const { error } = await this.dbService.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (error) throw new Error(error.message);
  }

  async signIn(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    const { error } = await this.dbService.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(error.message);

    if (rememberMe) {
      localStorage.setItem('supabase.auth.persist', 'true');
    } else {
      localStorage.removeItem('supabase.auth.persist');
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.dbService.auth.signOut();
    if (error) throw new Error(error.message);
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Debug method to check what's actually in the user metadata
  async debugUserMetadata(): Promise<void> {
    const { data: { user }, error } = await this.dbService.auth.getUser();
    if (error) {
      console.error('Error fetching user for debug:', error);
      return;
    }
  }
}
