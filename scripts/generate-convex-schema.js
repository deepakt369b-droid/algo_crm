const fs = require('fs');
const path = require('path');

const prismaSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
const convexSchemaPath = path.join(process.cwd(), 'convex/schema.ts');

const prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');

const modelRegex = /model\s+(\w+)\s+{([\s\S]*?)}/g;

let convexSchemaContent = `import { defineSchema, defineTable } from "convex/server";\nimport { v } from "convex/values";\n\nexport default defineSchema({\n`;

let match;
while ((match = modelRegex.exec(prismaSchema)) !== null) {
  const modelName = match[1];
  const modelBody = match[2];

  convexSchemaContent += `  ${modelName}: defineTable({\n`;
  convexSchemaContent += `    tenantId: v.optional(v.string()), // Added for multi-tenancy\n`;

  const lines = modelBody.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('@@')) continue;

    const parts = trimmedLine.split(/\s+/);
    if (parts.length < 2) continue;

    const fieldName = parts[0];
    let fieldType = parts[1];

    // Ignore relation fields (usually arrays or camelCase/PascalCase without primitive types)
    if (
      !fieldType.startsWith('String') &&
      !fieldType.startsWith('Int') &&
      !fieldType.startsWith('Float') &&
      !fieldType.startsWith('Boolean') &&
      !fieldType.startsWith('DateTime') &&
      !fieldType.startsWith('Json')
    ) {
      continue;
    }

    let isOptional = fieldType.endsWith('?');
    if (isOptional) {
      fieldType = fieldType.slice(0, -1);
    }
    let isArray = fieldType.endsWith('[]');
    if (isArray) {
        fieldType = fieldType.slice(0, -2);
    }

    let convexType = 'v.string()';
    if (fieldType === 'String') convexType = 'v.string()';
    else if (fieldType === 'Int' || fieldType === 'Float') convexType = 'v.number()';
    else if (fieldType === 'Boolean') convexType = 'v.boolean()';
    else if (fieldType === 'DateTime') convexType = 'v.string()'; // Or v.number() if we store timestamps
    else if (fieldType === 'Json') convexType = 'v.any()';

    if (isArray) convexType = `v.array(${convexType})`;
    if (isOptional) convexType = `v.optional(${convexType})`;

    // Skip id field if it's the primary key as Convex handles _id
    if (fieldName === 'id') continue;

    convexSchemaContent += `    ${fieldName}: ${convexType},\n`;
  }
  convexSchemaContent += `  }),\n\n`;
}

convexSchemaContent += `});\n`;

if (!fs.existsSync(path.join(process.cwd(), 'convex'))) {
  fs.mkdirSync(path.join(process.cwd(), 'convex'));
}

fs.writeFileSync(convexSchemaPath, convexSchemaContent, 'utf8');
console.log('Convex schema generated successfully.');
