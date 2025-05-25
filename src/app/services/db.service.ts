import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private static supabaseClient: SupabaseClient;

  constructor() {
    DatabaseService.supabaseClient = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

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
