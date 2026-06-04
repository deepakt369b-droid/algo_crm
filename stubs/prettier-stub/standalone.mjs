// Stub for `prettier/standalone`. The real implementation pulls in
// every parser plugin (typescript, babel, flow, estree, html, ...).
// All consumers in this repo (currently only `@react-email/render`)
// just want HTML formatting. The stub returns the input as-is, which
// is acceptable HTML output for email clients.
export const version = "3.8.3-stub";
export const format = async (text) => text;
export const formatWithCursor = async (text) => ({ formatted: text, cursorOffset: -1 });
export const check = async (text) => text === text;
export const getSupportInfo = async () => ({ languages: [], options: [] });
export const util = {};
export const __debug = {};
export default { version, format, formatWithCursor, check, getSupportInfo, util, __debug };
