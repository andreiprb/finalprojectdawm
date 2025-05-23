import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../enviorments/enviorments';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Get initial session
      const { data: { session } } = await this.supabase.auth.getSession();

      if (session?.user) {
        await this.setCurrentUser(session.user);
      }

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await this.setCurrentUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.currentUserSubject.next(null);
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  private async setCurrentUser(user: User): Promise<void> {
    try {
      // Get user profile from profiles table
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user profile:', error);
      }

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || ''
      };

      this.currentUserSubject.next(userProfile);
    } catch (error) {
      console.error('Error setting current user:', error);
      // Fallback to basic user info
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || ''
      };
      this.currentUserSubject.next(userProfile);
    }
  }

  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) {
        throw error;
      }

      // If user is created and confirmed, create profile
      if (data.user && !data.user.email_confirmed_at) {
        // Email confirmation required
        return;
      }

      if (data.user) {
        await this.createUserProfile(data.user.id, email, firstName, lastName);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  private async createUserProfile(userId: string, email: string, firstName: string, lastName: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  async signIn(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Handle remember me functionality
        if (rememberMe) {
          // Set session to persist across browser sessions
          localStorage.setItem('supabase.auth.persist', 'true');
        } else {
          // Remove persistence setting
          localStorage.removeItem('supabase.auth.persist');
        }

        await this.setCurrentUser(data.user);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Clear any remember me settings
      localStorage.removeItem('supabase.auth.persist');

      this.currentUserSubject.next(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const { error } = await this.supabase
        .from('profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }

      // Update local user state
      const updatedUser: UserProfile = {
        ...currentUser,
        ...updates
      };
      this.currentUserSubject.next(updatedUser);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }

  async refreshSession(): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      if (data.user) {
        await this.setCurrentUser(data.user);
      }
    } catch (error: any) {
      console.error('Refresh session error:', error);
      throw new Error(error.message || 'Failed to refresh session');
    }
  }
}
