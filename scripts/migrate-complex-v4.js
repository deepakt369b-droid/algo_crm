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
  
  const prismadbAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter(node => {
      const expr = node.getExpression();
      return expr.getKind() === SyntaxKind.PropertyAccessExpression &&
             expr.getExpression().getText() === "prismadb";
    });

  for (const access of prismadbAccesses) {
    const method = access.getName();
    // Safely migrate create and update
    if (!["create", "update"].includes(method)) continue;

    const modelName = access.getExpression().getName();
    const callExpr = access.getParentIfKind(SyntaxKind.CallExpression);
    if (!callExpr) continue;

    const args = callExpr.getArguments();
    const argObj = args.length > 0 && args[0].getKind() === SyntaxKind.ObjectLiteralExpression ? args[0] : null;
    if (!argObj) continue;

    const dataProp = argObj.getProperty("data");
    if (!dataProp || dataProp.getKind() !== SyntaxKind.PropertyAssignment) continue;
    
    const dataInit = dataProp.getInitializer();
    if (!dataInit) continue;
    
    // Check if data has any nested objects (relations)
    let hasNested = false;
    if (dataInit.getKind() === SyntaxKind.ObjectLiteralExpression) {
       for (const prop of dataInit.getProperties()) {
          if (prop.getKind() === SyntaxKind.PropertyAssignment) {
             const val = prop.getInitializer();
             if (val.getKind() === SyntaxKind.ObjectLiteralExpression || val.getKind() === SyntaxKind.ArrayLiteralExpression) {
                hasNested = true;
                break;
             }
          }
       }
    } else {
       hasNested = true; // Can't be sure if it's a variable reference, assume unsafe
    }
    
    if (hasNested) continue;

    let chain = "";
    
    if (method === "update") {
       const whereProp = argObj.getProperty("where");
       if (!whereProp || whereProp.getKind() !== SyntaxKind.PropertyAssignment) continue;
       const whereInit = whereProp.getInitializer();
       
       if (whereInit.getKind() === SyntaxKind.ObjectLiteralExpression) {
          for (const prop of whereInit.getProperties()) {
             if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                chain += `.eq("${prop.getName()}", ${prop.getInitializer().getText()})`;
             } else if (prop.getKind() === SyntaxKind.ShorthandPropertyAssignment) {
                chain += `.eq("${prop.getName()}", ${prop.getName()})`;
             } else {
                hasNested = true;
             }
          }
       } else {
          hasNested = true;
       }
    }
    
    if (hasNested) continue;
    
    let selectStr = "*";
    const selectProp = argObj.getProperty("select");
    const includeProp = argObj.getProperty("include");
    
    if (selectProp || includeProp) {
        // If they ask for select/include, but it's an insert/update without nested data, we just return *
        // to simplify. We can't guarantee related fields are fetched, so if they wanted include, it's unsafe.
        if (includeProp) hasNested = true;
        // if selectProp, they might just want specific fields, but * is fine
    }
    
    if (hasNested) continue;
    
    let replacement = "";
    if (method === "create") {
      replacement = `(await supabaseAdmin.from("${modelName}").insert(${dataInit.getText()}).select("*").single()).data`;
    } else if (method === "update") {
      replacement = `(await supabaseAdmin.from("${modelName}").update(${dataInit.getText()})${chain}.select("*").single()).data`;
    }

    if (replacement) {
      try {
        const parentAwait = callExpr.getParentIfKind(SyntaxKind.AwaitExpression);
        if (parentAwait) {
          parentAwait.replaceWithText(replacement);
        } else {
          callExpr.replaceWithText(replacement);
        }
        queriesMigrated++;
        hasChanges = true;
      } catch (e) {
        console.log(`Failed at ${sourceFile.getFilePath()}: ${e.message}`);
      }
    }
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
