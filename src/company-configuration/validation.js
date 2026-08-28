import { COMPANY_CONFIGURATION_ERROR_CODES } from "./constants.js";

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const segmenter = new Intl.Segmenter("und", { granularity: "grapheme" });

export class CompanyConfigurationValidationError extends TypeError {
  constructor(code, path) {
    super(`${code} at ${path}`);
    this.name = "CompanyConfigurationValidationError";
    this.code = code;
    this.path = path;
  }
}

export const fail = (code, path) => {
  throw new CompanyConfigurationValidationError(code, path);
};

export const isPlainRecord = (value) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const assertPlainRecord = (value, path) => {
  if (!isPlainRecord(value)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_TYPE, path);
  }
  return value;
};

export const assertExactKeys = (value, keys, path) => {
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(COMPANY_CONFIGURATION_ERROR_CODES.UNKNOWN_FIELD, `${path}.${key}`);
    }
  }
  for (const key of keys) {
    if (!hasOwn(value, key)) {
      fail(COMPANY_CONFIGURATION_ERROR_CODES.MISSING_FIELD, `${path}.${key}`);
    }
  }
};

export const assertAllowedKeys = (value, keys, path) => {
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(COMPANY_CONFIGURATION_ERROR_CODES.UNKNOWN_FIELD, `${path}.${key}`);
    }
  }
};

export const countGraphemes = (value) => [...segmenter.segment(value)].length;

const hasDisallowedControl = (value) => /[\p{Cc}\p{Zl}\p{Zp}]/u.test(value);

export const parseString = (
  value,
  path,
  { min = 0, max = Number.POSITIVE_INFINITY, pattern } = {},
) => {
  if (typeof value !== "string") {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_TYPE, path);
  }
  if (hasDisallowedControl(value)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, path);
  }
  const parsed = value.trim();
  const length = countGraphemes(parsed);
  if (length < min || length > max) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.OUT_OF_RANGE, path);
  }
  if (pattern && !pattern.test(parsed)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, path);
  }
  return parsed;
};

export const parseNullableString = (value, path, options) =>
  value === null || (typeof value === "string" && value.trim() === "")
    ? null
    : parseString(value, path, options);

export const parseInteger = (
  value,
  path,
  { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {},
) => {
  if (!Number.isSafeInteger(value)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_TYPE, path);
  }
  if (value < min || value > max) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.OUT_OF_RANGE, path);
  }
  return value;
};

export const parseBoolean = (value, path) => {
  if (typeof value !== "boolean") {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_TYPE, path);
  }
  return value;
};

export const parseEnum = (value, values, path) => {
  if (typeof value !== "string") {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_TYPE, path);
  }
  if (!values.includes(value)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, path);
  }
  return value;
};

export const isTimestampLike = (value) =>
  value !== null &&
  typeof value === "object" &&
  Number.isSafeInteger(value.seconds) &&
  Number.isInteger(value.nanoseconds) &&
  value.nanoseconds >= 0 &&
  value.nanoseconds <= 999_999_999;

export const parseTimestampLike = (value, path) => {
  if (!isTimestampLike(value)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, path);
  }
  return value;
};

export const parseActorId = (value, path) =>
  parseString(value, path, { min: 1, max: 128 });

export const parseSettingsMetadata = (value, path = "$") => ({
  schemaVersion: parseInteger(value.schemaVersion, `${path}.schemaVersion`, {
    min: 1,
    max: 1,
  }),
  revision: parseInteger(value.revision, `${path}.revision`, { min: 1 }),
  createdAt: parseTimestampLike(value.createdAt, `${path}.createdAt`),
  createdBy: parseActorId(value.createdBy, `${path}.createdBy`),
  updatedAt: parseTimestampLike(value.updatedAt, `${path}.updatedAt`),
  updatedBy: parseActorId(value.updatedBy, `${path}.updatedBy`),
});

export const SETTINGS_METADATA_KEYS = Object.freeze([
  "schemaVersion",
  "revision",
  "createdAt",
  "createdBy",
  "updatedAt",
  "updatedBy",
]);
