import Ajv from 'ajv';

import { HiGlassLiteSpec } from "./higlass-lite.schema";
import { HiGlassSpec } from "./higlass.schema";
import HiGlassSchema from "./higlass.schema.json";

export function compile(spec: HiGlassLiteSpec): HiGlassSpec {

  return spec;
}

export function validateHG(spec: Object): boolean {

  const validate = new Ajv({ extendRefs: true }).compile(HiGlassSchema);
  const valid = validate(spec);

  if (validate.errors) {
    console.warn(JSON.stringify(validate.errors, null, 2));
  }

  const hg = spec as HiGlassSpec;

  // TODO: check types such as default values and locationLocks

  return valid as boolean;
}