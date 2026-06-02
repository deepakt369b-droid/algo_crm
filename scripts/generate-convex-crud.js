const fs = require('fs');
const path = require('path');

const models = [
  { name: 'Contacts', table: 'crm_Contacts', fields: ['first_name', 'last_name', 'email', 'mobile_phone'] },
  { name: 'Leads', table: 'crm_Leads', fields: ['firstName', 'lastName', 'email', 'phone', 'company'] },
  { name: 'Opportunities', table: 'crm_Opportunities', fields: ['name', 'description', 'sales_stage', 'currency'] },
];

for (const model of models) {
  const code = `import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create ${model.name}
export const create = mutation({
  args: {
    tenantId: v.string(),
    ${model.fields.map(f => `${f}: v.optional(v.string())`).join(',\n    ')}
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("${model.table}", {
      ...args,
      v: 1,
      createdAt: new Date().toISOString(),
    });
  },
});

// Read ${model.name}
export const list = query({
  args: {
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("${model.table}")
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
  },
});

// Read single ${model.name}
export const get = query({
  args: {
    id: v.id("${model.table}"),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item || item.tenantId !== args.tenantId) return null;
    return item;
  },
});

// Update ${model.name}
export const update = mutation({
  args: {
    id: v.id("${model.table}"),
    tenantId: v.string(),
    ${model.fields.map(f => `${f}: v.optional(v.string())`).join(',\n    ')}
  },
  handler: async (ctx, args) => {
    const { id, tenantId, ...updates } = args;
    const item = await ctx.db.get(id);
    if (!item || item.tenantId !== tenantId) throw new Error("Not found or unauthorized");
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
      v: item.v + 1,
    });
    return id;
  },
});

// Soft Delete ${model.name}
export const softDelete = mutation({
  args: {
    id: v.id("${model.table}"),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item || item.tenantId !== args.tenantId) throw new Error("Not found or unauthorized");
    
    await ctx.db.patch(args.id, {
      deletedAt: new Date().toISOString(),
      v: item.v + 1,
    });
    return args.id;
  },
});
`;

  fs.writeFileSync(path.join(process.cwd(), 'convex', `${model.name.toLowerCase()}.ts`), code, 'utf8');
}

console.log('CRUD files generated.');
