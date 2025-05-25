import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

const lockNoOp = async <T>(
  _lockName: string,
  _acquireTimeout: number,
  fn: () => Promise<T>
): Promise<T> => {
  return await fn()
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
        lock: lockNoOp
      }
    }
  );

  constructor() {}

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
