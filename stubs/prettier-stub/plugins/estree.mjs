// Stub for `prettier/plugins/estree` (~0.20 MiB in the real package).
const languages = [];
const parsers = {};
const printers = { estree: { print: () => "", printDocToString: (d) => String(d ?? "") } };
export { languages, parsers, printers };
export default { languages, parsers, printers };
