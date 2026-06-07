import { supabaseAdmin } from './lib/supabase-admin';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const { data, error } = await supabaseAdmin.from('Users').select('*').order('created_on', { ascending: false });
  console.log('Error:', error);
  console.log('Data count:', data?.length);
}
run();
