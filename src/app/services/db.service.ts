import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../enviorments/enviorments';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private static supabaseClient: SupabaseClient | null = null;

  constructor() {
    if (!DatabaseService.supabaseClient) {
      DatabaseService.supabaseClient = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );
    }
  }

  getClient(): SupabaseClient {
    if (!DatabaseService.supabaseClient) {
      DatabaseService.supabaseClient = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey
      );
    }
    return DatabaseService.supabaseClient;
  }

  get auth() {
    return this.getClient().auth;
  }

  from(tableName: string) {
    return this.getClient().from(tableName);
  }
}
