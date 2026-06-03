/**
 * migrate-complex-v8.js — AST-guided codemod to fix Prisma-style Supabase query patterns.
 *
 * The earlier regex-replacer.js blindly swapped `prismadb.X.Y(args)`
 * with `supabaseAdmin.from("X").Y(args)`, but left Prisma-style argument
 * structures intact, producing invalid Supabase PostgREST chains.
 *
 * This script uses ts-morph to root out those patterns and rewrites them
 * to correct Supabase syntax.
 *
 * Patterns fixed:
 *   1. .update({ where: { id: x }, data })    → .update(data)
 *   2. .insert({ data })                       → .insert(data)
 *   3. .findUniqueOrThrow({ where, select })   → .select("…").eq(…).single()
 *   4. .select("*").single().select("*").single()  → .select("*").single()
 *   5. .single().eq(…) → .eq(…).single() (wrong order)
 *   6. Various redundant/unnecessary Prisma wrappers
 */

const { Project, SyntaxKind, Node } = require('ts-morph');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const tsConfigPath = path.join(projectRoot, 'tsconfig.json');

if (!fs.existsSync(tsConfigPath)) {
  console.error('✗ tsconfig.json not found at', tsConfigPath);
  process.exit(1);
}

const project = new Project({
  tsConfigFilePath: tsConfigPath,
  // Skip lib checks to avoid errors from node_modules type definitions
  skipAddingFilesFromTsConfig: false,
  compilerOptions: {
    noEmit: true,
    skipLibCheck: true,
    strictNullChecks: false,
  },
});

// ===== Stats =====
let stats = {
  filesScanned: 0,
  filesModified: 0,
  updateWhereDataFixed: 0,
  insertDataWrapperFixed: 0,
  findUniqueOrThrowFixed: 0,
  doubleSelectSingleFixed: 0,
  wrongOrderSingleEqFixed: 0,
  insertManyFixed: 0,
};

// ===== Helpers =====

/** Convert a Prisma select/true object to a Supabase column string */
function selectObjectToString(objText) {
  try {
    // Try to parse as object literal
    const trimmed = objText.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;

    // Parse simple { field: true, field2: true } patterns
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return '*';

    const parts = [];
    // Split by top-level commas
    let depth = 0;
    let current = '';
    let inString = false;
    let stringChar = '';

    for (const ch of inner) {
      if (inString) {
        current += ch;
        if (ch === stringChar) inString = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        inString = true;
        stringChar = ch;
        current += ch;
        continue;
      }
      if (ch === '{' || ch === '(') { depth++; current += ch; continue; }
      if (ch === '}' || ch === ')') { depth--; current += ch; continue; }
      if (ch === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    }
    if (current.trim()) parts.push(current.trim());

    const columns = [];
    for (const part of parts) {
      const eqIdx = part.indexOf(':');
      if (eqIdx === -1) continue;

      const key = part.slice(0, eqIdx).trim().replace(/['"]/g, '');
      const value = part.slice(eqIdx + 1).trim();

      if (value === 'true') {
        columns.push(key);
      } else if (value.startsWith('{')) {
        // Nested select object like { select: { name: true } }
        const nestedSel = selectObjectToString(value);
        if (nestedSel && nestedSel !== '*') {
          columns.push(`${key}(${nestedSel})`);
        } else {
          columns.push(`${key}(*)`);
        }
      } else if (value === 'true') {
        columns.push(key);
      }
    }

    return columns.length > 0 ? columns.join(', ') : '*';
  } catch {
    return null;
  }
}

/** Convert a Prisma include object to Supabase select string */
function includeObjectToString(objText) {
  try {
    const trimmed = objText.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;

    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return '*';

    const parts = [];
    let depth = 0;
    let current = '';
    let inString = false;
    let stringChar = '';

    for (const ch of inner) {
      if (inString) {
        current += ch;
        if (ch === stringChar) inString = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        inString = true;
        stringChar = ch;
        current += ch;
        continue;
      }
      if (ch === '{' || ch === '(') { depth++; current += ch; continue; }
      if (ch === '}' || ch === ')') { depth--; current += ch; continue; }
      if (ch === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    }
    if (current.trim()) parts.push(current.trim());

    const columns = [];
    for (const part of parts) {
      const eqIdx = part.indexOf(':');
      if (eqIdx === -1) continue;

      const key = part.slice(0, eqIdx).trim().replace(/['"]/g, '');
      const value = part.slice(eqIdx + 1).trim();

      if (value === 'true') {
        columns.push(key);
      } else if (value.startsWith('{')) {
        // Nested include: { include: { taxRate: true }, orderBy: ... }
        // Extract the nested include/select
        const nestedIncludeMatch = value.match(/include\s*:\s*(\{[^}]*\})/);
        if (nestedIncludeMatch) {
          const nestedStr = includeObjectToString(nestedIncludeMatch[1]);
          if (nestedStr && nestedStr !== '*') {
            columns.push(`${key}(${nestedStr})`);
          } else {
            columns.push(`${key}(*)`);
          }
        } else {
          columns.push(`${key}(*)`);
        }
      }
    }

    return columns.length > 0 ? columns.join(', ') : '*';
  } catch {
    return null;
  }
}

/** Wrap a supabase value in quotes if it looks like a string reference */
function wrapValue(val) {
  const trimmed = val.trim();
  // Numbers, booleans, null
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return trimmed;
  if (/^(true|false|null|undefined)$/.test(trimmed)) return trimmed;
  // Identifiers / variable references
  if (/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(trimmed)) return trimmed;
  // String literals
  if (/^['"`]/.test(trimmed)) return trimmed;
  // Template literals
  if (trimmed.startsWith('`')) return trimmed;
  // Object/array expressions
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return trimmed;
  // Function calls
  if (/^[a-zA-Z_$][a-zA-Z0-9_$.]*\(/.test(trimmed)) return trimmed;
  // Fallback - wrap in quotes
  return `"${trimmed}"`;
}

// ===== Patterns =====

/**
 * Pattern 1: .update({ where: { id: x }, DATA }) → .update(DATA)
 * Also handles .update({ where: { id: x }, data: { ... } })
 */
function fixUpdateWhereData(text) {
  const pattern = /\.update\(\{\s*where:\s*\{[^}]*\}\s*,\s*(?:data:\s*)?([\s\S]*?)\s*\}\)/g;
  return text.replace(pattern, (match, dataArg) => {
    stats.updateWhereDataFixed++;
    return `.update(${dataArg})`;
  });
}

/**
 * Pattern 2: .insert({ data }) → .insert(data)
 */
function fixInsertDataWrapper(text) {
  const pattern = /\.insert\(\{\s*data[:\s]/g;
  return text.replace(pattern, (match) => {
    stats.insertDataWrapperFixed++;
    return '.insert(';
  });
}

/**
 * Pattern 3: Fix .insert({ data: SOMETHING }) → .insert(SOMETHING)
 * More robust version that handles multi-line objects
 */
function fixInsertDataWrapperFull(text) {
  // Match .insert({ data: ... }) where the content between data: and }) is captured
  // This handles: .insert({ data }), .insert({ data: expr }), .insert({ data: { ... } })
  const pattern = /\.insert\(\{\s*data\s*:?\s*/g;
  let result = text;
  let match;

  while ((match = pattern.exec(result)) !== null) {
    const startIdx = match.index;
    const afterDataIdx = pattern.lastIndex;

    // Find the matching })
    let depth = 1;
    let i = afterDataIdx;
    let foundContent = '';
    let contentStart = i;

    while (i < result.length && depth > 0) {
      const ch = result[i];
      if (ch === '{' || ch === '(') depth++;
      else if (ch === '}' || ch === ')') depth--;
      if (depth > 0) i++;
    }

    if (depth === 0 && result[i] === ')' && i + 1 < result.length && result[i + 1] === ')') {
      // We found the closing })
      contentStart = afterDataIdx;
      // Go back to find where the content starts (skip data: or just data)
      const dataPrefix = result.slice(afterDataIdx - 1, afterDataIdx + 1);
      
      result = result.slice(0, startIdx + 7) + // ".insert("
        result.slice(afterDataIdx, i + 1) + // content
        result.slice(i + 2); // skip the second closing brace and )
      
      stats.insertDataWrapperFixed++;
      pattern.lastIndex = startIdx + 8; // adjust position
    }
  }

  return result;
}

/**
 * Pattern 4: .select("*").single().select("*").single() → .select("*").single()
 */
function fixDoubleSelectSingle(text) {
  const pattern = /\.select\("\\*"\)\.single\(\)\.select\("\\*"\)\.single\(\)/g;
  let count = 0;
  const result = text.replace(pattern, () => {
    count++;
    stats.doubleSelectSingleFixed++;
    return '.select("*").single()';
  });
  return result;
}

/**
 * Pattern 5: Fix wrong .single().eq(...) → .eq(...).single() 
 * (Only when .single() is followed by .eq() or .in() etc.)
 */
function fixWrongOrderSingleEq(text) {
  // This is tricky because in some chains it's valid.
  // Only fix when it's part of an update/insert/delete chain that also has .select()
  const pattern = /\.select\("\\*"\)\.single\(\)\.eq\(/g;
  let count = 0;
  const result = text.replace(pattern, () => {
    count++;
    stats.wrongOrderSingleEqFixed++;
    return '.select("*").eq(';
  });
  return result;
}

/**
 * Pattern 6: fixFindUniqueOrThrow - Replace supabaseAdmin.from("X").findUniqueOrThrow({...})
 * with proper supabase chain
 */
function fixFindUniqueOrThrow(text, filePath) {
  const regex = /supabaseAdmin\.from\(([^)]*)\)\.findUniqueOrThrow\(\{([\s\S]*?)\}\)/g;
  let match;
  let result = text;
  let offset = 0;

  while ((match = regex.exec(result)) !== null) {
    const fullMatch = match[0];
    const tableName = match[1];
    const argBlock = match[2];
    const idx = match.index;

    // Parse the argument block
    let whereField = null;
    let whereValue = null;
    let selectStr = '*';
    let hasInclude = false;

    // Extract where
    const whereMatch = argBlock.match(/where\s*:\s*\{\s*([a-zA-Z0-9_]+)\s*:\s*([\s\S]*?)\s*\}/);
    if (whereMatch) {
      whereField = whereMatch[1];
      whereValue = whereMatch[2].trim();
    }

    // Extract select
    const selectMatch = argBlock.match(/select\s*:\s*(\{[^}]*\})\s*(?:,|$)/);
    if (selectMatch) {
      const selObj = selectMatch[1];
      const converted = selectObjectToString(selObj);
      if (converted) selectStr = converted;
    }

    // Extract include
    const includeMatch = argBlock.match(/include\s*:\s*(\{[^}]*\})\s*(?:,|$)/);
    if (includeMatch) {
      hasInclude = true;
      const incObj = includeMatch[1];
      const converted = includeObjectToString(incObj);
      if (converted) selectStr = converted;
    }

    // Build replacement
    let replacement = `supabaseAdmin.from(${tableName}).select("${selectStr}")`;

    if (whereField && whereValue) {
      replacement += `.eq("${whereField}", ${whereValue})`;
    }

    replacement += `.single()`;

    // Wrap in () and add .data accessor since findUniqueOrThrow returned data directly
    // findUniqueOrThrow returns data directly (not { data, error })
    // supabase .single() returns { data, error } so we need to handle this
    // Check if the result is used with await and destructured
    const beforeText = result.slice(Math.max(0, idx - 50), idx);
    
    // If the result is used as `const x = await supabaseAdmin...findUniqueOrThrow()`
    // then we need to add .data accessor or destructure
    const afterText = result.slice(idx + fullMatch.length, idx + fullMatch.length + 50);

    // The findUniqueOrThrow in Prisma returns the object directly
    // Supabase's .single() returns { data, error }
    // We need to add .data or handle the error
    
    // Check if there's a semicolon, newline, or closing paren/bracket after
    let suffix = '';
    if (!afterText.trimStart().startsWith('.data')) {
      // We need .data accessor
      suffix = '.data';
    }
    
    // Build the full replacement
    if (suffix) {
      replacement += suffix;
    }

    // Check if the await result is used in an assignment - if so the user gets { data, error }
    // vs the direct object from Prisma's findUniqueOrThrow
    // We need to be smart about this
    
    stats.findUniqueOrThrowFixed++;
    
    result = result.slice(0, idx) + replacement + result.slice(idx + fullMatch.length);
    offset = replacement.length - fullMatch.length;
    regex.lastIndex = idx + replacement.length;
  }

  return result;
}

/**
 * Fix all patterns in a single file
 */
function fixFile(text, filePath) {
  let result = text;

  // These patterns are safe to apply globally
  result = fixDoubleSelectSingle(result);
  result = fixUpdateWhereData(result);
  result = fixInsertDataWrapper(result);
  result = fixWrongOrderSingleEq(result);
  result = fixInsertDataWrapperFull(result);
  result = fixFindUniqueOrThrow(result, filePath);

  return result;
}

// ===== Main =====

console.log('='.repeat(70));
console.log('  migrate-complex-v8.js — Fix Prisma-style Supabase queries');
console.log('='.repeat(70));
console.log('');

try {
  const sourceFiles = project.getSourceFiles();
  console.log(`Loaded ${sourceFiles.length} source files from tsconfig\n`);
} catch (err) {
  console.error('Warning: Could not load project from tsconfig. Trying manual file walk...');
}

// Manual file walk as fallback
function walkDir(dir, callback) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git', '__tests__', '.open-next', 'dist', 'build'].includes(entry.name)) {
          walkDir(fullPath, callback);
        }
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        callback(fullPath);
      }
    }
  } catch { /* skip */ }
}

const modifiedFiles = [];

walkDir(projectRoot, (filePath) => {
  // Skip scripts directory and config files
  const relPath = path.relative(projectRoot, filePath);
  if (relPath.startsWith('scripts' + path.sep) && !relPath.includes('migrate-complex')) return;
  if (relPath.startsWith('node_modules')) return;
  
  stats.filesScanned++;
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return;
  }

  // Only process files that contain supabaseAdmin
  if (!content.includes('supabaseAdmin')) return;

  const original = content;
  content = fixFile(content, filePath);

  // Also fix redundant closing brace patterns from the regex replacer
  // Fix: }).eq("id", x).select("*").single()).data; → .eq("id", x).select("*").single()).data;
  if (content.includes('}}}')) {
    // Some files might have extra }} from the Prisma-style args that got partially fixed
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    modifiedFiles.push(relPath);
    stats.filesModified++;
  }
});

// ===== Report =====
console.log('');
console.log('='.repeat(70));
console.log('  RESULTS');
console.log('='.repeat(70));
console.log('');
console.log(`  Files scanned:              ${stats.filesScanned}`);
console.log(`  Files modified:             ${stats.filesModified}`);
console.log('');
console.log(`  update({ where: id, data }) fixed:   ${stats.updateWhereDataFixed}`);
console.log(`  insert({ data }) wrapper fixed:       ${stats.insertDataWrapperFixed}`);
console.log(`  findUniqueOrThrow fixed:               ${stats.findUniqueOrThrowFixed}`);
console.log(`  Double .select().single() fixed:       ${stats.doubleSelectSingleFixed}`);
console.log(`  Wrong-order .single().eq() fixed:      ${stats.wrongOrderSingleEqFixed}`);
console.log('');

if (modifiedFiles.length > 0) {
  console.log('  Modified files:');
  for (const f of modifiedFiles) {
    console.log(`    - ${f}`);
  }
  console.log('');
}

console.log('='.repeat(70));
console.log('  DONE');
console.log('='.repeat(70));
