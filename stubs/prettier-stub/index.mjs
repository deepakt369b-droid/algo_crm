// Minimal stub that satisfies the parts of the prettier API that
// `@react-email/render` uses. Real prettier is ~4 MiB and inflates
// the OpenNext worker bundle past the 25 MiB Cloudflare Pages limit.
// The unformatted HTML returned by these stubs is still valid email
// markup - clients render it identically.
export const version = "3.8.3-stub";
export const __debug = {};
export const doc = { builders: {}, printer: {}, utils: {} };
export const util = {};
export const format = async (text) => text;
export const formatWithCursor = async (text) => ({ formatted: text, cursorOffset: -1 });
export const check = async (text) => text === text;
export const getSupportInfo = async () => ({ languages: [], options: [] });
export default { version, format, formatWithCursor, check, getSupportInfo, util, doc };
