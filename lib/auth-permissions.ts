import { createAccessControl } from "better-auth/plugins/access";

const statements = {
  user: ["create", "read", "update", "delete", "changeRole", "activate", "deactivate"],
  crm: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  report: ["read", "export"],
  settings: ["read", "update"],
  tenant: ["create", "read", "update", "delete"],
  system: ["manage"],
} as const;

export const ac = createAccessControl(statements);

export const superadmin = ac.newRole({
  user: ["create", "read", "update", "delete", "changeRole", "activate", "deactivate"],
  crm: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  report: ["read", "export"],
  settings: ["read", "update"],
  tenant: ["create", "read", "update", "delete"],
  system: ["manage"],
});

export const admin = ac.newRole({
  user: ["create", "read", "update", "delete", "changeRole", "activate", "deactivate"],
  crm: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  report: ["read", "export"],
  settings: ["read", "update"],
  tenant: ["read"],
  system: [],
});

export const manager = ac.newRole({
  user: ["read"],
  crm: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  report: ["read", "export"],
  settings: ["read"],
  tenant: ["read"],
  system: [],
});

export const user = ac.newRole({
  user: ["read"],
  crm: ["read"],
  project: ["read"],
  report: ["read"],
  settings: ["read"],
  tenant: ["read"],
  system: [],
});
