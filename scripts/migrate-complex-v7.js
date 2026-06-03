const { Project, SyntaxKind } = require("ts-morph");
const fs = require("fs");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles();
console.log(`Loaded ${sourceFiles.length} source files.`);

let filesModified = 0;
let queriesMigrated = 0;

for (const sourceFile of sourceFiles) {
  let hasChanges = false;
  if (sourceFile.getFilePath().includes('__tests__')) continue;
  
  // Handle prismadb.$transaction
  const transactions = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter(node => node.getText() === "prismadb.$transaction");
  
  for (const trans of transactions) {
    const callExpr = trans.getParentIfKind(SyntaxKind.CallExpression);
    if (callExpr) {
      trans.replaceWithText("Promise.all");
      hasChanges = true;
      queriesMigrated++;
    }
  }

  // Handle prismadb.$queryRaw
  const rawQueries = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter(node => node.getText() === "prismadb.$queryRaw");
  
  for (const raw of rawQueries) {
    raw.replaceWithText("supabaseAdmin.rpc('raw_query', {}) // TODO: fix");
    hasChanges = true;
    queriesMigrated++;
  }

  // Handle remaining prismadb.X.Y
  const prismadbAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter(node => {
      const expr = node.getExpression();
      return expr.getKind() === SyntaxKind.PropertyAccessExpression &&
             expr.getExpression().getText() === "prismadb";
    });

  for (const access of prismadbAccesses) {
    const method = access.getName();
    const modelName = access.getExpression().getName();
    const callExpr = access.getParentIfKind(SyntaxKind.CallExpression);
    if (!callExpr) continue;
    
    // Very naive fallback for the rest to just strip prismadb
    let fallback = `supabaseAdmin.from("${modelName}").${method === "create" ? "insert" : method === "deleteMany" ? "delete" : method === "updateMany" ? "update" : method}`;
    access.replaceWithText(fallback);
    hasChanges = true;
    queriesMigrated++;
  }

  if (hasChanges) {
    const supabaseImports = sourceFile.getImportDeclarations().filter(i => 
      i.getModuleSpecifierValue().includes("supabase-admin")
    );
    if (supabaseImports.length === 0) {
      sourceFile.addImportDeclaration({
        namedImports: ["supabaseAdmin"],
        moduleSpecifier: "@/lib/supabase-admin"
      });
    }
    sourceFile.saveSync();
    filesModified++;
  }
}

console.log(`Summary: ${filesModified} files modified, ${queriesMigrated} queries migrated.`);
