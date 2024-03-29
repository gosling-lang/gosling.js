// @ts-check
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as tsj from "ts-json-schema-generator";

// Copied from `ts-json-schema-generator` to create
// identical schemas to the one previously generated by CLI.
// @ref: https://github.com/vega/ts-json-schema-generator/blob/aec8a25f366fa32ba9539adc5a91f4ff3b14d1e9/ts-json-schema-generator.ts#LL67C1-L68C1
import stableStringify from "safe-stable-stringify";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const SCHEMAS = [
  ["GoslingSpec", "gosling.schema.json", "../src/gosling-schema/"],
  ["HiGlassSpec", "higlass.schema.json", "../src/higlass-schema/"],
  ["Theme", "theme.schema.json", "../src/gosling-schema/"],
  ["TemplateTrackDef", "template.schema.json", "../src/gosling-schema/"],
];

const generator = tsj.createGenerator({
  path: path.resolve(__dirname, "../src/index.ts"),
  tsconfig: path.resolve(__dirname, "../tsconfig.json"),
  skipTypeCheck: true,
  encodeRefs: false,
});

for (const [type, filename, dir] of SCHEMAS) {
  const schema = generator.createSchema(type);
  fs.promises.writeFile(
      path.resolve(__dirname, `${dir}/${filename}`),
      stableStringify(schema, null, 2) + "\n",
  );
}
