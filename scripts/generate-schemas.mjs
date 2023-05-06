// @ts-check
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as tsj from "ts-json-schema-generator";

// Copied from: https://github.com/vega/ts-json-schema-generator/blob/aec8a25f366fa32ba9539adc5a91f4ff3b14d1e9/ts-json-schema-generator.ts#LL67C1-L68C1
import stableStringify from "safe-stable-stringify";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const SCHEMAS = [
  ["GoslingSpec", "gosling.schema.json"],
  ["HiGlassSpec", "higlass.schema.json"],
  ["Theme", "theme.schema.json"],
  ["TemplateTrackDef", "template.schema.json"],
];

const generator = tsj.createGenerator({
  path: path.resolve(__dirname, "../src/index.ts"),
  tsconfig: path.resolve(__dirname, "../tsconfig.json"),
  skipTypeCheck: true,
  encodeRefs: false,
});

for (const [type, filename] of SCHEMAS) {
  const schema = generator.createSchema(type);
  fs.promises.writeFile(
      path.resolve(__dirname, `../schema/${filename}`),
      stableStringify(schema, null, 2) + "\n",
  );
}
