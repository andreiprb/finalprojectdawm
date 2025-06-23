import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from './db.service';
import { AuthService } from './auth.service';

export interface TableEntry {
  id?: string;
  name: string;
  author: string;
  description: string;
  date: Date;
  repository_link: string;
  go_to_link: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private entriesSubject = new BehaviorSubject<TableEntry[]>([]);
  public entries$ = this.entriesSubject.asObservable();

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService
  ) {}

  async loadEntries(): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await this.dbService
        .from('user_entries')
        .select('*')
        .eq('author', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const entries = data.map(entry => ({
        ...entry,
        date: new Date(entry.date)
      }));

      this.entriesSubject.next(entries);
    } catch (error: any) {
      console.error('Error loading entries:', error);
      throw new Error(error.message || 'Failed to load entries');
    }
  }

  async createEntry(entry: Omit<TableEntry, 'id' | 'author' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const { error } = await this.dbService
        .from('user_entries')
        .insert({
          name: entry.name,
          author: currentUser.id,
          description: entry.description,
          date: entry.date.toISOString(),
          repository_link: entry.repository_link,
          go_to_link: entry.go_to_link,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      await this.loadEntries();
    } catch (error: any) {
      console.error('Error creating entry:', error);
      throw new Error(error.message || 'Failed to create entry');
    }
  }

  async updateEntry(id: string, updates: Partial<Omit<TableEntry, 'id' | 'author' | 'created_at'>>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (updates.date) {
        updateData.date = updates.date.toISOString();
      }

      const { error } = await this.dbService
        .from('user_entries')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      await this.loadEntries();
    } catch (error: any) {
      console.error('Error updating entry:', error);
      throw new Error(error.message || 'Failed to update entry');
    }
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      const { error } = await this.dbService
        .from('user_entries')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await this.loadEntries();
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      throw new Error(error.message || 'Failed to delete entry');
    }
  }
}
