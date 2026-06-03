const fs = require('fs');

const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

let output = `// Auto-generated types to replace @prisma/client\n\n`;

// Extract enums
const enumRegex = /enum\s+(\w+)\s+\{([^}]+)\}/g;
let match;
while ((match = enumRegex.exec(schema)) !== null) {
  const enumName = match[1];
  const enumValues = match[2].split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'));
  
  output += `export enum ${enumName} {\n`;
  for (const val of enumValues) {
    const cleanVal = val.split('@')[0].split('//')[0].trim();
    if (cleanVal) {
      output += `  ${cleanVal} = "${cleanVal}",\n`;
    }
  }
  output += `}\n\n`;
}

// Extract models
const modelRegex = /model\s+(\w+)\s+\{([^}]+)\}/g;
while ((match = modelRegex.exec(schema)) !== null) {
  const modelName = match[1];
  const fields = match[2].split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//') && !line.startsWith('@@'));
  
  output += `export type ${modelName} = {\n`;
  for (const field of fields) {
    const parts = field.split(/\s+/);
    if (parts.length >= 2) {
      const fieldName = parts[0];
      let fieldType = parts[1];
      const isOptional = fieldType.endsWith('?');
      if (isOptional) fieldType = fieldType.slice(0, -1);
      
      let tsType = 'any';
      if (fieldType === 'String') tsType = 'string';
      else if (fieldType === 'Int' || fieldType === 'Float') tsType = 'number';
      else if (fieldType === 'Boolean') tsType = 'boolean';
      else if (fieldType === 'DateTime') tsType = 'Date';
      else if (fieldType === 'Json') tsType = 'any';
      else if (fieldType === 'Decimal') tsType = 'any'; // We'll map Decimal to string or number, or use any
      else if (fieldType === 'BigInt') tsType = 'bigint';
      else tsType = fieldType; // For enums or relations
      
      if (fieldType.endsWith('[]')) {
         tsType = tsType.replace('[]', '') + '[]';
      }

      output += `  ${fieldName}${isOptional ? '?' : ''}: ${tsType};\n`;
    }
  }
  output += `};\n\n`;
}

// Also add a mock for PrismaClient
output += `export type PrismaClient = any;\n`;
output += `export type PrismaClientPG = any;\n`;

fs.writeFileSync('lib/prisma-types.ts', output);
console.log("Types generated at lib/prisma-types.ts");
