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
    if (!["deleteMany", "updateMany"].includes(method)) continue;

    const modelName = access.getExpression().getName();
    const callExpr = access.getParentIfKind(SyntaxKind.CallExpression);
    if (!callExpr) continue;

    const args = callExpr.getArguments();
    const argObj = args.length > 0 && args[0].getKind() === SyntaxKind.ObjectLiteralExpression ? args[0] : null;

    let chain = "";
    let isComplex = false;
    let dataInitText = "";
    
    if (argObj) {
      if (method === "updateMany") {
         const dataProp = argObj.getProperty("data");
         if (dataProp && dataProp.getKind() === SyntaxKind.PropertyAssignment) {
            dataInitText = dataProp.getInitializer().getText();
         } else {
            isComplex = true;
         }
      }

      const whereProp = argObj.getProperty("where");
      if (whereProp && whereProp.getKind() === SyntaxKind.PropertyAssignment) {
         const whereInit = whereProp.getInitializer();
         if (whereInit.getKind() === SyntaxKind.ObjectLiteralExpression) {
            for (const prop of whereInit.getProperties()) {
               if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                  const key = prop.getName();
                  const val = prop.getInitializer();
                  if (val.getKind() === SyntaxKind.ObjectLiteralExpression) {
                     const nestedProps = val.getProperties();
                     if (nestedProps.length === 1 && nestedProps[0].getKind() === SyntaxKind.PropertyAssignment) {
                        const nestedKey = nestedProps[0].getName();
                        const nestedVal = nestedProps[0].getInitializer().getText();
                        if (nestedKey === "in") {
                           chain += `.in("${key}", ${nestedVal})`;
                        } else {
                           isComplex = true;
                        }
                     } else {
                        isComplex = true;
                     }
                  } else {
                     chain += `.eq("${key}", ${val.getText()})`;
                  }
               } else {
                  isComplex = true;
               }
            }
         } else {
            isComplex = true;
         }
      }
    }

    if (isComplex) continue;

    let replacement = "";
    if (method === "deleteMany") {
      replacement = `(await supabaseAdmin.from("${modelName}").delete()${chain}).data`;
    } else if (method === "updateMany") {
      replacement = `(await supabaseAdmin.from("${modelName}").update(${dataInitText})${chain}).data`;
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
