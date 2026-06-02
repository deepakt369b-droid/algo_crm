"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export type AddLanguageResult = {
  success: boolean;
  message: string;
  error?: string;
};

/**
 * Dynamically registers a new locale by copying the base en.json translation file
 * and updating the locales list in i18n/routing.ts.
 */
export async function addLanguage(
  code: string,
  name: string
): Promise<AddLanguageResult> {
  // 1. Validation
  const cleanCode = code.toLowerCase().trim();
  if (!/^[a-z]{2}$/.test(cleanCode)) {
    return {
      success: false,
      message: "Invalid language code. Must be a 2-letter lowercase code (e.g., 'es', 'fr').",
      error: "Invalid language code format.",
    };
  }

  try {
    const rootDir = process.cwd();
    const localesDir = path.join(rootDir, "locales");
    const routingFilePath = path.join(rootDir, "i18n", "routing.ts");

    // 2. Create the translation JSON file if it doesn't exist
    const targetJsonPath = path.join(localesDir, `${cleanCode}.json`);
    const sourceJsonPath = path.join(localesDir, "en.json");

    if (!fs.existsSync(targetJsonPath)) {
      if (fs.existsSync(sourceJsonPath)) {
        // Copy english as a starter base
        fs.copyFileSync(sourceJsonPath, targetJsonPath);
      } else {
        // Fallback to basic JSON outline
        fs.writeFileSync(
          targetJsonPath,
          JSON.stringify({ LanguageSelector: { name: name } }, null, 2)
        );
      }
    }

    // 3. Update i18n/routing.ts to include the new locale in the array
    if (fs.existsSync(routingFilePath)) {
      const routingContent = fs.readFileSync(routingFilePath, "utf8");

      // Extract the locales block: locales: [...]
      const localesMatch = routingContent.match(/locales:\s*\[([^\]]+)\]/);
      if (localesMatch) {
        const currentLocalesStr = localesMatch[1];
        // Parse current locale codes
        const currentLocales = currentLocalesStr
          .split(",")
          .map((item) => item.replace(/['"\s]/g, ""))
          .filter(Boolean);

        if (!currentLocales.includes(cleanCode)) {
          currentLocales.push(cleanCode);

          // Build replacement string
          const newLocalesStr = `locales: [${currentLocales.map((c) => `"${c}"`).join(", ")}]`;
          const updatedContent = routingContent.replace(
            /locales:\s*\[[^\]]+\]/,
            newLocalesStr
          );

          fs.writeFileSync(routingFilePath, updatedContent, "utf8");
        }
      }
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      message: `Language '${name}' (${cleanCode}) successfully created and registered!`,
    };
  } catch (error: any) {
    console.error("Failed to add language:", error);
    return {
      success: false,
      message: "Failed to dynamically append language configuration.",
      error: error.message || "Internal filesystem error",
    };
  }
}

/**
 * Returns all locales configured in i18n/routing.ts.
 */
export async function getLocales(): Promise<string[]> {
  try {
    const rootDir = process.cwd();
    const routingFilePath = path.join(rootDir, "i18n", "routing.ts");
    if (fs.existsSync(routingFilePath)) {
      const content = fs.readFileSync(routingFilePath, "utf8");
      const match = content.match(/locales:\s*\[([^\]]+)\]/);
      if (match) {
        return match[1]
          .split(",")
          .map((item) => item.replace(/['"\s]/g, "").trim())
          .filter(Boolean);
      }
    }
  } catch (err) {
    console.error(err);
  }
  return ["en", "ar"];
}
