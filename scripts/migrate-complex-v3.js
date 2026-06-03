const { Project, SyntaxKind } = require("ts-morph");
const fs = require("fs");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const filesList = fs.readFileSync("skipped-files.txt", "utf16le").split("\n").map(s => s.trim().replace(/\0/g, '')).filter(Boolean);
for (const file of filesList) {
  project.addSourceFileAtPath(file);
}

const sourceFiles = project.getSourceFiles();
console.log(`Loaded ${sourceFiles.length} source files.`);

let filesModified = 0;
let queriesMigrated = 0;

function parseSelectOrInclude(node, isInclude) {
  if (!node) return isInclude ? "*" : "*";
  if (node.getKind() !== SyntaxKind.ObjectLiteralExpression) return null;
  
  const fields = [];
  for (const prop of node.getProperties()) {
    if (prop.getKind() === SyntaxKind.PropertyAssignment) {
      const key = prop.getName();
      const val = prop.getInitializer();
      if (val.getKind() === SyntaxKind.TrueKeyword) {
        fields.push(key);
      } else if (val.getKind() === SyntaxKind.ObjectLiteralExpression) {
         const nestedSelect = val.getProperty("select");
         const nestedInclude = val.getProperty("include");
         
         if (nestedSelect) {
            const nestedParsed = parseSelectOrInclude(nestedSelect.getInitializer(), false);
            if (nestedParsed) fields.push(`${key}(${nestedParsed})`);
            else return null;
         } else if (nestedInclude) {
            const nestedParsed = parseSelectOrInclude(nestedInclude.getInitializer(), true);
            if (nestedParsed) fields.push(`${key}(${nestedParsed})`);
            else return null;
         } else {
            return null; 
         }
      } else {
         return null;
      }
    }
  }
  
  if (isInclude) {
     return ["*", ...fields].join(", ");
  }
  return fields.join(", ");
}

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
    // Only safely migrate read operations and single delete
    if (!["findMany", "findFirst", "findUnique", "count", "delete"].includes(method)) continue;

    const modelName = access.getExpression().getName();
    const callExpr = access.getParentIfKind(SyntaxKind.CallExpression);
    if (!callExpr) continue;

    const args = callExpr.getArguments();
    const argObj = args.length > 0 && args[0].getKind() === SyntaxKind.ObjectLiteralExpression ? args[0] : null;
    if (!argObj && args.length > 0) continue;

    let selectStr = "*";
    let isSelectOrIncludeValid = true;

    if (argObj) {
      const selectProp = argObj.getProperty("select");
      const includeProp = argObj.getProperty("include");

      if (selectProp) {
         const parsed = parseSelectOrInclude(selectProp.getInitializer(), false);
         if (parsed) selectStr = parsed;
         else isSelectOrIncludeValid = false;
      } else if (includeProp) {
         const parsed = parseSelectOrInclude(includeProp.getInitializer(), true);
         if (parsed) selectStr = parsed;
         else isSelectOrIncludeValid = false;
      }
    }

    if (!isSelectOrIncludeValid) continue;

    let chain = "";
    let isComplex = false;

    if (argObj) {
      const whereProp = argObj.getProperty("where");
      if (whereProp) {
        const whereInit = whereProp.getKind() === SyntaxKind.PropertyAssignment ? whereProp.getInitializer() : null;
        if (whereInit) {
          if (whereInit.getKind() === SyntaxKind.CallExpression && whereInit.getExpression().getText().includes("Scope")) {
            // Ignore auth scopes completely
          } else if (whereInit.getKind() === SyntaxKind.ObjectLiteralExpression) {
            for (const prop of whereInit.getProperties()) {
              if (prop.getKind() === SyntaxKind.SpreadAssignment) {
                const expr = prop.getExpression();
                if (expr.getKind() === SyntaxKind.CallExpression && expr.getExpression().getText().includes("Scope")) {
                  continue;
                }
                isComplex = true;
              } else if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                const key = prop.getName();
                const val = prop.getInitializer();
                
                if (val.getKind() === SyntaxKind.StringLiteral || val.getKind() === SyntaxKind.NumericLiteral || val.getKind() === SyntaxKind.Identifier || val.getKind() === SyntaxKind.PropertyAccessExpression || val.getKind() === SyntaxKind.CallExpression || val.getKind() === SyntaxKind.NullKeyword || val.getKind() === SyntaxKind.TrueKeyword || val.getKind() === SyntaxKind.FalseKeyword) {
                   if (val.getKind() === SyntaxKind.ObjectLiteralExpression) {
                      const nestedProps = val.getProperties();
                      if (nestedProps.length === 1 && nestedProps[0].getKind() === SyntaxKind.PropertyAssignment) {
                         const nestedKey = nestedProps[0].getName();
                         const nestedVal = nestedProps[0].getInitializer().getText();
                         if (nestedKey === "in") {
                            chain += `.in("${key}", ${nestedVal})`;
                         } else if (nestedKey === "contains") {
                            chain += `.ilike("${key}", \`%\${${nestedVal}}%\`)`;
                         } else {
                            isComplex = true;
                         }
                      } else {
                         isComplex = true;
                      }
                   } else {
                      chain += `.eq("${key}", ${val.getText()})`;
                   }
                } else if (val.getKind() === SyntaxKind.ObjectLiteralExpression) {
                   isComplex = true;
                } else {
                   chain += `.eq("${key}", ${val.getText()})`;
                }
              } else if (prop.getKind() === SyntaxKind.ShorthandPropertyAssignment) {
                chain += `.eq("${prop.getName()}", ${prop.getName()})`;
              } else {
                isComplex = true;
              }
            }
          } else {
            isComplex = true;
          }
        }
      }

      // Handle orderBy
      const orderByProp = argObj.getProperty("orderBy");
      if (orderByProp) {
        const orderInit = orderByProp.getKind() === SyntaxKind.PropertyAssignment ? orderByProp.getInitializer() : null;
        if (orderInit) {
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
           } else {
              isComplex = true;
           }
        }
      }

      // Handle take/skip
      const takeProp = argObj.getProperty("take");
      if (takeProp && takeProp.getKind() === SyntaxKind.PropertyAssignment) {
         chain += `.limit(${takeProp.getInitializer().getText()})`;
      }

      const skipProp = argObj.getProperty("skip");
      if (skipProp && skipProp.getKind() === SyntaxKind.PropertyAssignment) {
         chain += `.range(${skipProp.getInitializer().getText()}, ${skipProp.getInitializer().getText()} + (${takeProp ? takeProp.getInitializer().getText() : '10'} - 1))`;
      }
    }

    if (isComplex) continue;

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
