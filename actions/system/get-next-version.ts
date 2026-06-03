export default async function getNextVersion() {
  try {
    const packageJson = require("../../package.json");
    const version = packageJson.dependencies["next"] || "0";
    return version;
  } catch (error) {
    console.error("Error reading package.json:", error);
    return "0";
  }
}
