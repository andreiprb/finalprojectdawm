import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { STORAGE_KEYS } from '../constants/app.constants';

class CustomStorageAdapter {
  getItem(key: string): string | null {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME_KEY) === 'true';

    if (rememberMe) {
      localStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private static supabaseClient: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        storageKey: STORAGE_KEYS.AUTH_TOKEN_KEY,
        storage: new CustomStorageAdapter(),
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  getClient(): SupabaseClient {
    return DatabaseService.supabaseClient;
  }

  get auth() {
    return this.getClient().auth;
  }

  from(tableName: string) {
    return this.getClient().from(tableName);
  }
}
