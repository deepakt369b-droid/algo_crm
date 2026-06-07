import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const adminEmail = 'deepakt369b@gmail.com'; // Admin email to migrate
  
  // Find the admin user in Supabase
  const { data: appUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', adminEmail)
    .single();

  if (!appUser) {
    console.error(`User with email ${adminEmail} not found in database.`);
    return;
  }

  console.log(`Found app user: ${appUser.id}`);

  // Create user in Supabase Auth with the EXACT SAME ID
  const { data: user, error } = await supabase.auth.admin.createUser({
    email: appUser.email,
    password: 'TemporaryPassword123!', // You can reset this later or use magic links
    email_confirm: true, // Auto confirm
    user_metadata: {
      role: appUser.role,
      name: appUser.name
    }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists in Supabase Auth.');
    } else {
      console.error('Error creating user:', error.message);
    }
  } else {
    console.log('User created successfully in Supabase Auth.');
  }
}

main().catch(console.error);