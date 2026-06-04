// Stub for `prettier/plugins/html`. The real plugin is ~0.16 MiB and
// brings in the rest of prettier's plugin chain. Returning a parser
// descriptor that prettier's standalone can no-op against is enough
// for the @react-email/render code path.
const languages = [{ name: "HTML", parsers: ["html"], extensions: [".html"] }];
const parsers = {
  html: {
    parse: async (text) => ({ type: "root", children: [], source: text }),
    astFormat: "estree",
    locStart: () => 0,
    locEnd: () => 0,
  },
};
const printers = {
  estree: { print: () => "", printDocToString: (d) => String(d ?? "") },
};
export { languages, parsers, printers };
export default { languages, parsers, printers };
