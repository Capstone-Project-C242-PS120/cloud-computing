import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URI;
    const supabaseKey = process.env.SUPABASE_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or KEY is missing!');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    // console.log('Supabase client:', this.supabase);
  }
  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}
