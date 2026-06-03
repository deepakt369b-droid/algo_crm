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
  
  const prismadbAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter(node => {
      const expr = node.getExpression();
      return expr.getKind() === SyntaxKind.PropertyAccessExpression &&
             expr.getExpression().getText() === "prismadb";
    });

  for (const access of prismadbAccesses) {
    const method = access.getName();
    if (!["findMany", "findFirst", "findUnique", "count", "delete"].includes(method)) continue;

    const modelName = access.getExpression().getName();
    const callExpr = access.getParentIfKind(SyntaxKind.CallExpression);
    if (!callExpr) continue;

    const args = callExpr.getArguments();
    const argObj = args.length > 0 && args[0].getKind() === SyntaxKind.ObjectLiteralExpression ? args[0] : null;

    let chain = "";
    let selectStr = "*";
    
    if (argObj) {
      const selectProp = argObj.getProperty("select");
      if (selectProp && selectProp.getKind() === SyntaxKind.PropertyAssignment) {
         const val = selectProp.getInitializer();
         if (val.getKind() === SyntaxKind.ObjectLiteralExpression) {
            const fields = [];
            for (const prop of val.getProperties()) {
               if (prop.getKind() === SyntaxKind.PropertyAssignment && prop.getInitializer().getKind() === SyntaxKind.TrueKeyword) {
                  fields.push(prop.getName());
               }
            }
            if (fields.length > 0) selectStr = fields.join(", ");
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
                        if (nestedKey === "in") chain += `.in("${key}", ${nestedVal})`;
                        else if (nestedKey === "gte") chain += `.gte("${key}", ${nestedVal})`;
                        else if (nestedKey === "lte") chain += `.lte("${key}", ${nestedVal})`;
                        else if (nestedKey === "gt") chain += `.gt("${key}", ${nestedVal})`;
                        else if (nestedKey === "lt") chain += `.lt("${key}", ${nestedVal})`;
                        else if (nestedKey === "contains") chain += `.ilike("${key}", \`%\${${nestedVal}}%\`)`;
                     }
                  } else {
                     chain += `.eq("${key}", ${val.getText()})`;
                  }
               }
               // Ignore spread assignments (...scope)
            }
         }
      }

      const orderByProp = argObj.getProperty("orderBy");
      if (orderByProp && orderByProp.getKind() === SyntaxKind.PropertyAssignment) {
         const orderInit = orderByProp.getInitializer();
         if (orderInit.getKind() === SyntaxKind.ObjectLiteralExpression) {
            for (const prop of orderInit.getProperties()) {
               if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                  const key = prop.getName();
                  const val = prop.getInitializer().getText().replace(/['"]/g, '');
                  chain += `.order("${key}", { ascending: ${val === 'asc'} })`;
               }
            }
         } else if (orderInit.getKind() === SyntaxKind.ArrayLiteralExpression) {
            for (const elem of orderInit.getElements()) {
               if (elem.getKind() === SyntaxKind.ObjectLiteralExpression) {
                  for (const prop of elem.getProperties()) {
                     if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                        const key = prop.getName();
                        const val = prop.getInitializer().getText().replace(/['"]/g, '');
                        chain += `.order("${key}", { ascending: ${val === 'asc'} })`;
                     }
                  }
               }
            }
         }
      }
      
      const takeProp = argObj.getProperty("take");
      if (takeProp && takeProp.getKind() === SyntaxKind.PropertyAssignment) {
         chain += `.limit(${takeProp.getInitializer().getText()})`;
      }
    }

    let replacement = "";
    if (method === "findUnique" || method === "findFirst") {
      replacement = `(await supabaseAdmin.from("${modelName}").select("${selectStr}")${chain}.single()).data`;
    } else if (method === "findMany") {
      replacement = `(await supabaseAdmin.from("${modelName}").select("${selectStr}")${chain}).data`;
    } else if (method === "delete") {
      replacement = `(await supabaseAdmin.from("${modelName}").delete()${chain}.select("${selectStr}").single()).data`;
    } else if (method === "count") {
      replacement = `(await supabaseAdmin.from("${modelName}").select("*", { count: 'exact', head: true })${chain}).count`;
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
