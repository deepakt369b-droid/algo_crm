const fs = require('fs');

let t = fs.readFileSync('lib/authz/scopes/crm.ts', 'utf8');

const prefix = `import { AuthzUser } from '../session';
import { AuthorizationError } from '../errors';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function tryScopedUpdateContact(user: AuthzUser, contactId: string, data: Record<string, string>): Promise<boolean> {
  const row = await findContactInScope(user, contactId);
  if (!row) return false;
  const result = await supabaseAdmin.from('crm_Contacts').update({ ...data, updatedBy: user.id }).eq('id', contactId);
  return result.error == null;
}

export async function tryScopedUpdateTarget(user: AuthzUser, targetId: string, data: Record<string, string>): Promise<boolean> {
  const row = await findTargetInScope(user, targetId);
  if (!row) return false;
  const result = await supabaseAdmin.from('crm_Targets').update({ ...data, updatedBy: user.id }).eq('id', targetId);
  return result.error == null;
}

// Phase B1 write scope helper
async function findContactInScope(user: AuthzUser, contactId: string) {
  if (user.role === "admin" || user.role === "manager") {
`;

t = prefix + t.split('if (user.role === "admin" || user.role === "manager") {')[1];

fs.writeFileSync('lib/authz/scopes/crm.ts', t);
