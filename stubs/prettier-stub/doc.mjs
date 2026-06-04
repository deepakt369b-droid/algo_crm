// Stub for `prettier/doc`. The real module is a few hundred KiB and
// the Cloudflare worker only uses the top-level export indirectly.
const builders = new Proxy({}, { get: () => () => "" });
const printer = { printDocToString: (doc) => String(doc ?? "") };
const utils = { willBreak: () => false, traverseDoc: () => {}, findInDoc: () => null, mapDoc: (d) => d, removeLines: (d) => d, stripTrailingHardline: (d) => d, replaceEndOfLine: (d) => d, canBreak: () => false };
export { builders, printer, utils };
export default { builders, printer, utils };
