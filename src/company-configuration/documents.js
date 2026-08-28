import {
  ATTENDANCE_SUMMARY_MODE_VALUES,
  COMPANY_CONFIGURATION_ERROR_CODES,
  COMPANY_CONFIGURATION_SCHEMA_VERSION,
  COMPANY_CONFIGURATION_STATE,
  COMPANY_SETTING_TYPE_VALUES,
  COMPANY_STATUS_VALUES,
  ROUND_SETTING_VALUES,
  SHIFT_TYPE_VALUES,
} from "./constants.js";
import {
  SETTINGS_METADATA_KEYS,
  assertExactKeys,
  assertPlainRecord,
  fail,
  parseActorId,
  parseBoolean,
  parseEnum,
  parseInteger,
  parseNullableString,
  parseSettingsMetadata,
  parseString,
  parseTimestampLike,
} from "./validation.js";

const ROOT_KEYS = Object.freeze([
  "schemaVersion",
  "configurationState",
  "status",
  "createdAt",
  "createdBy",
  "updatedAt",
  "updatedBy",
]);
const ROOT_LEGACY_EXTRA_KEYS = Object.freeze([
  "companyName",
  "companyNameKana",
  "zipcode",
  "prefCode",
  "city",
  "address",
  "building",
  "tel",
  "fax",
  "invoiceNumber",
  "bankName",
  "branchName",
  "accountType",
  "accountNumber",
  "accountHolder",
  "minuteInterval",
  "roundSetting",
  "firstDayOfWeek",
  "attendanceManagementMode",
  "siteOrder",
  "scheduleOrder",
  "maintenanceMode",
  "maintenanceReason",
  "maintenanceStartAt",
  "maintenanceStartedBy",
  "stripeCustomerId",
  "subscription",
  "agreementsV2",
  "location",
  "geopoint",
  "docId",
  "uid",
  "fullAddress",
  "prefecture",
  "hasBankInfo",
  "isCompleteRequiredFields",
]);

const PROFILE_BUSINESS_KEYS = Object.freeze([
  "companyName",
  "companyNameKana",
  "zipcode",
  "prefCode",
  "city",
  "address",
  "building",
  "tel",
  "fax",
]);

const BILLING_BUSINESS_KEYS = Object.freeze([
  "invoiceNumber",
  "bankName",
  "branchName",
  "accountType",
  "accountNumber",
  "accountHolder",
]);

const OPERATIONS_BUSINESS_KEYS = Object.freeze([
  "minuteInterval",
  "roundSetting",
  "firstDayOfWeek",
  "attendanceSummaryMode",
]);

const ARRANGEMENT_BUSINESS_KEYS = Object.freeze([
  "siteOrder",
  "scheduleOrder",
]);

const ENTITLEMENT_KEYS = Object.freeze([
  ...SETTINGS_METADATA_KEYS,
  "entitlementState",
  "planCode",
  "featureCodes",
  "employeeLimit",
]);

const MAINTENANCE_KEYS = Object.freeze([
  ...SETTINGS_METADATA_KEYS,
  "maintenanceMode",
  "maintenanceReason",
  "maintenanceStartAt",
]);

const PRIVATE_ENTITLEMENT_KEYS = Object.freeze([
  ...SETTINGS_METADATA_KEYS,
  "stripeCustomerId",
  "stripeSubscriptionId",
  "stripeSubscriptionStatus",
  "currentPeriodEnd",
]);

const PRIVATE_MAINTENANCE_KEYS = Object.freeze([
  ...SETTINGS_METADATA_KEYS,
  "maintenanceMode",
  "internalReason",
  "scope",
  "maintenanceStartAt",
  "maintenanceStartedBy",
  "operationId",
  "lastErrorCode",
  "lastErrorAt",
]);

const AUDIT_KEYS = Object.freeze([
  "schemaVersion",
  "settingType",
  "fromRevision",
  "toRevision",
  "actorUid",
  "createdAt",
  "changes",
]);

const CALLABLE_KEYS = Object.freeze(["expectedRevision", "value"]);
const ARRANGEMENT_CALLABLE_KEYS = Object.freeze([
  "expectedRevision",
  "field",
  "order",
]);

const KANA_ALLOWED = /^[\u30A0-\u30FF\u3000\uFF10-\uFF19\p{Zs}\u3099\u309A]*$/u;
const KATAKANA_BASE = /[\u30A0-\u30FF]/u;
const CONTACT_ALLOWED = /^[0-9+\-().\s]*$/u;
const SITE_ID_ALLOWED = /^[^/\p{Cc}]+$/u;
const AUDIT_FIELDS = Object.freeze({
  PROFILE: Object.freeze([...PROFILE_BUSINESS_KEYS]),
  BILLING: Object.freeze([...BILLING_BUSINESS_KEYS]),
  OPERATIONS: Object.freeze([...OPERATIONS_BUSINESS_KEYS]),
});

const parseRoot = (value, exact) => {
  assertPlainRecord(value, "$");
  if (exact) {
    assertExactKeys(value, ROOT_KEYS, "$");
  } else {
    const allowed = new Set([...ROOT_KEYS, ...ROOT_LEGACY_EXTRA_KEYS]);
    for (const key of Object.keys(value)) {
      if (!allowed.has(key)) {
        fail(COMPANY_CONFIGURATION_ERROR_CODES.UNKNOWN_FIELD, `$.${key}`);
      }
    }
    for (const key of ROOT_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        fail(COMPANY_CONFIGURATION_ERROR_CODES.MISSING_FIELD, `$.${key}`);
      }
    }
  }
  return {
    schemaVersion: parseInteger(value.schemaVersion, "$.schemaVersion", {
      min: COMPANY_CONFIGURATION_SCHEMA_VERSION,
      max: COMPANY_CONFIGURATION_SCHEMA_VERSION,
    }),
    configurationState: parseEnum(
      value.configurationState,
      [COMPANY_CONFIGURATION_STATE],
      "$.configurationState",
    ),
    status: parseEnum(value.status, COMPANY_STATUS_VALUES, "$.status"),
    createdAt: parseTimestampLike(value.createdAt, "$.createdAt"),
    createdBy: parseActorId(value.createdBy, "$.createdBy"),
    updatedAt: parseTimestampLike(value.updatedAt, "$.updatedAt"),
    updatedBy: parseActorId(value.updatedBy, "$.updatedBy"),
  };
};

export const parseCompanyRootV1 = (value) => parseRoot(value, true);

export const parseCompanyRootProjectionV1 = (value) => parseRoot(value, false);

const parseKana = (value, path) => {
  const parsed = parseString(value, path, { min: 1, max: 200 });
  if (!KANA_ALLOWED.test(parsed)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, path);
  }
  const graphemes = [...new Intl.Segmenter("und", { granularity: "grapheme" }).segment(parsed)];
  for (const { segment } of graphemes) {
    if (/[\u3099\u309A]/u.test(segment) && !KATAKANA_BASE.test(segment)) {
      fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, path);
    }
  }
  return parsed;
};

const parseNullableMax = (value, path, max) =>
  parseNullableString(value, path, { max });

const parseProfileBusiness = (value, path) => {
  assertPlainRecord(value, path);
  assertExactKeys(value, PROFILE_BUSINESS_KEYS, path);
  const zipcode = parseNullableString(value.zipcode, `${path}.zipcode`, {
    pattern: /^\d{7}$/,
  });
  const prefCode = parseNullableString(value.prefCode, `${path}.prefCode`, {
    pattern: /^(0[1-9]|[1-3][0-9]|4[0-7])$/,
  });
  const parseContact = (field) =>
    parseNullableString(value[field], `${path}.${field}`, {
      max: 32,
      pattern: CONTACT_ALLOWED,
    });
  return {
    companyName: parseString(value.companyName, `${path}.companyName`, {
      min: 1,
      max: 100,
    }),
    companyNameKana: parseKana(value.companyNameKana, `${path}.companyNameKana`),
    zipcode,
    prefCode,
    city: parseNullableMax(value.city, `${path}.city`, 100),
    address: parseNullableMax(value.address, `${path}.address`, 200),
    building: parseNullableMax(value.building, `${path}.building`, 200),
    tel: parseContact("tel"),
    fax: parseContact("fax"),
  };
};

const parseProfileValue = (value, path = "$") => {
  assertPlainRecord(value, path);
  assertExactKeys(value, [...SETTINGS_METADATA_KEYS, ...PROFILE_BUSINESS_KEYS], path);
  const business = Object.fromEntries(
    PROFILE_BUSINESS_KEYS.map((key) => [key, value[key]]),
  );
  return { ...parseSettingsMetadata(value, path), ...parseProfileBusiness(business, path) };
};

export const parseCompanyProfileV1 = (value) => parseProfileValue(value);

const parseBillingBusiness = (value, path, { acceptInvoicePrefix = false } = {}) => {
  assertPlainRecord(value, path);
  assertExactKeys(value, BILLING_BUSINESS_KEYS, path);
  const invoiceInput =
    acceptInvoicePrefix && typeof value.invoiceNumber === "string"
      ? value.invoiceNumber.trim().replace(/^[Tt]/u, "")
      : value.invoiceNumber;
  const invoiceNumber = parseNullableString(
    invoiceInput,
    `${path}.invoiceNumber`,
    { pattern: /^\d{13}$/ },
  );
  const bankName = parseNullableMax(value.bankName, `${path}.bankName`, 100);
  const branchName = parseNullableMax(value.branchName, `${path}.branchName`, 100);
  const accountType =
    value.accountType === null
      ? null
      : parseEnum(value.accountType, ["普通", "当座"], `${path}.accountType`);
  const accountNumber = parseNullableString(
    value.accountNumber,
    `${path}.accountNumber`,
    { min: 1, max: 7, pattern: /^\d+$/ },
  );
  const accountHolder = parseNullableMax(
    value.accountHolder,
    `${path}.accountHolder`,
    200,
  );
  const bankValues = [bankName, branchName, accountType, accountNumber, accountHolder];
  if (!bankValues.every((item) => item === null) && !bankValues.every((item) => item !== null)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.CONFLICT, `${path}.bankAccount`);
  }
  return {
    invoiceNumber,
    bankName,
    branchName,
    accountType,
    accountNumber,
    accountHolder,
  };
};

const parseBillingValue = (value, path = "$") => {
  assertPlainRecord(value, path);
  assertExactKeys(value, [...SETTINGS_METADATA_KEYS, ...BILLING_BUSINESS_KEYS], path);
  const business = Object.fromEntries(
    BILLING_BUSINESS_KEYS.map((key) => [key, value[key]]),
  );
  return { ...parseSettingsMetadata(value, path), ...parseBillingBusiness(business, path) };
};

export const parseCompanyBillingV1 = (value) => parseBillingValue(value);

const parseOperationsBusiness = (value, path) => {
  assertPlainRecord(value, path);
  assertExactKeys(value, OPERATIONS_BUSINESS_KEYS, path);
  const minuteInterval = parseInteger(value.minuteInterval, `${path}.minuteInterval`, {
    min: 5,
    max: 30,
  });
  if (minuteInterval % 5 !== 0) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, `${path}.minuteInterval`);
  }
  return {
    minuteInterval,
    roundSetting: parseEnum(
      value.roundSetting,
      ROUND_SETTING_VALUES,
      `${path}.roundSetting`,
    ),
    firstDayOfWeek: parseInteger(value.firstDayOfWeek, `${path}.firstDayOfWeek`, {
      min: 0,
      max: 6,
    }),
    attendanceSummaryMode: parseEnum(
      value.attendanceSummaryMode,
      ATTENDANCE_SUMMARY_MODE_VALUES,
      `${path}.attendanceSummaryMode`,
    ),
  };
};

const parseOperationsValue = (value, path = "$") => {
  assertPlainRecord(value, path);
  assertExactKeys(value, [...SETTINGS_METADATA_KEYS, ...OPERATIONS_BUSINESS_KEYS], path);
  const business = Object.fromEntries(
    OPERATIONS_BUSINESS_KEYS.map((key) => [key, value[key]]),
  );
  return { ...parseSettingsMetadata(value, path), ...parseOperationsBusiness(business, path) };
};

export const parseCompanyOperationsV1 = (value) => parseOperationsValue(value);

const parseOrder = (value, path) => {
  if (!Array.isArray(value)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_TYPE, path);
  }
  if (value.length > 2_000) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.OUT_OF_RANGE, path);
  }
  const seen = new Set();
  return value.map((item, index) => {
    const itemPath = `${path}[${index}]`;
    assertPlainRecord(item, itemPath);
    assertExactKeys(item, ["siteId", "shiftType"], itemPath);
    const siteId = parseString(item.siteId, `${itemPath}.siteId`, {
      min: 1,
      max: 128,
      pattern: SITE_ID_ALLOWED,
    });
    const shiftType = parseEnum(item.shiftType, SHIFT_TYPE_VALUES, `${itemPath}.shiftType`);
    const identity = `${siteId}\u0000${shiftType}`;
    if (seen.has(identity)) {
      fail(COMPANY_CONFIGURATION_ERROR_CODES.DUPLICATE_VALUE, itemPath);
    }
    seen.add(identity);
    return { siteId, shiftType };
  });
};

const parseArrangementBusiness = (value, path) => {
  assertPlainRecord(value, path);
  assertExactKeys(value, ARRANGEMENT_BUSINESS_KEYS, path);
  return {
    siteOrder: parseOrder(value.siteOrder, `${path}.siteOrder`),
    scheduleOrder: parseOrder(value.scheduleOrder, `${path}.scheduleOrder`),
  };
};

const parseArrangementValue = (value, path = "$") => {
  assertPlainRecord(value, path);
  assertExactKeys(value, [...SETTINGS_METADATA_KEYS, ...ARRANGEMENT_BUSINESS_KEYS], path);
  const business = Object.fromEntries(
    ARRANGEMENT_BUSINESS_KEYS.map((key) => [key, value[key]]),
  );
  return { ...parseSettingsMetadata(value, path), ...parseArrangementBusiness(business, path) };
};

export const parseCompanyArrangementV1 = (value) => parseArrangementValue(value);

const parseEntitlementValue = (value, path = "$") => {
  assertPlainRecord(value, path);
  assertExactKeys(value, ENTITLEMENT_KEYS, path);
  if (
    value.entitlementState !== "DISABLED" ||
    value.planCode !== null ||
    !Array.isArray(value.featureCodes) ||
    value.featureCodes.length !== 0 ||
    value.employeeLimit !== null
  ) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.CONFLICT, path);
  }
  return {
    ...parseSettingsMetadata(value, path),
    entitlementState: "DISABLED",
    planCode: null,
    featureCodes: [],
    employeeLimit: null,
  };
};

export const parseCompanyEntitlementV1 = (value) => parseEntitlementValue(value);

const parseMaintenanceValue = (value, path = "$") => {
  assertPlainRecord(value, path);
  assertExactKeys(value, MAINTENANCE_KEYS, path);
  const maintenanceMode = parseBoolean(value.maintenanceMode, `${path}.maintenanceMode`);
  const maintenanceReason = parseNullableString(
    value.maintenanceReason,
    `${path}.maintenanceReason`,
    { max: 200 },
  );
  const maintenanceStartAt = value.maintenanceStartAt === null
    ? null
    : parseTimestampLike(value.maintenanceStartAt, `${path}.maintenanceStartAt`);
  if (maintenanceMode !== (maintenanceReason !== null && maintenanceStartAt !== null)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.CONFLICT, path);
  }
  return {
    ...parseSettingsMetadata(value, path),
    maintenanceMode,
    maintenanceReason,
    maintenanceStartAt,
  };
};

export const parseCompanyMaintenanceV1 = (value) => parseMaintenanceValue(value);

const parsePrivateEntitlementValue = (value, path = "$") => {
  assertPlainRecord(value, path);
  assertExactKeys(value, PRIVATE_ENTITLEMENT_KEYS, path);
  if (
    value.stripeCustomerId !== null ||
    value.stripeSubscriptionId !== null ||
    value.stripeSubscriptionStatus !== null ||
    value.currentPeriodEnd !== null
  ) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.CONFLICT, path);
  }
  return {
    ...parseSettingsMetadata(value, path),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripeSubscriptionStatus: null,
    currentPeriodEnd: null,
  };
};

export const parseCompanyPrivateEntitlementV1 = (value) =>
  parsePrivateEntitlementValue(value);

const parsePrivateMaintenanceValue = (value, path = "$") => {
  assertPlainRecord(value, path);
  assertExactKeys(value, PRIVATE_MAINTENANCE_KEYS, path);
  const maintenanceMode = parseBoolean(value.maintenanceMode, `${path}.maintenanceMode`);
  if (!Array.isArray(value.scope) || value.scope.length > 50) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.OUT_OF_RANGE, `${path}.scope`);
  }
  const scope = value.scope.map((item, index) =>
    parseString(item, `${path}.scope[${index}]`, { min: 1, max: 100 }),
  );
  const parseOptional = (field, max) =>
    parseNullableString(value[field], `${path}.${field}`, { max });
  const internalReason = parseOptional("internalReason", 500);
  const maintenanceStartAt =
    value.maintenanceStartAt === null
      ? null
      : parseTimestampLike(value.maintenanceStartAt, `${path}.maintenanceStartAt`);
  const maintenanceStartedBy =
    value.maintenanceStartedBy === null
      ? null
      : parseActorId(value.maintenanceStartedBy, `${path}.maintenanceStartedBy`);
  const operationId = parseOptional("operationId", 128);
  const lastErrorCode = parseOptional("lastErrorCode", 100);
  const lastErrorAt =
    value.lastErrorAt === null
      ? null
      : parseTimestampLike(value.lastErrorAt, `${path}.lastErrorAt`);
  const errorPairValid = (lastErrorCode === null) === (lastErrorAt === null);
  const offValid =
    scope.length === 0 &&
    internalReason === null &&
    maintenanceStartAt === null &&
    maintenanceStartedBy === null &&
    operationId === null &&
    lastErrorCode === null &&
    lastErrorAt === null;
  const onValid =
    scope.length > 0 &&
    internalReason !== null &&
    maintenanceStartAt !== null &&
    maintenanceStartedBy !== null &&
    errorPairValid;
  if ((!maintenanceMode && !offValid) || (maintenanceMode && !onValid)) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.CONFLICT, path);
  }
  return {
    ...parseSettingsMetadata(value, path),
    maintenanceMode,
    internalReason,
    scope,
    maintenanceStartAt,
    maintenanceStartedBy,
    operationId,
    lastErrorCode,
    lastErrorAt,
  };
};

export const parseCompanyPrivateMaintenanceV1 = (value) =>
  parsePrivateMaintenanceValue(value);

export const assertCompanyMaintenancePairV1 = (maintenance, privateMaintenance) => {
  const publicValue = parseMaintenanceValue(maintenance, "$.maintenance");
  const privateValue = parsePrivateMaintenanceValue(
    privateMaintenance,
    "$.privateMaintenance",
  );
  if (publicValue.maintenanceMode !== privateValue.maintenanceMode) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.CONFLICT, "$.maintenance");
  }
  return { maintenance: publicValue, privateMaintenance: privateValue };
};

export const parseCompanySettingAuditV1 = (value) => {
  assertPlainRecord(value, "$");
  assertExactKeys(value, AUDIT_KEYS, "$");
  if (!Array.isArray(value.changes) || value.changes.length < 1 || value.changes.length > 9) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.OUT_OF_RANGE, "$.changes");
  }
  const settingType = parseEnum(
    value.settingType,
    COMPANY_SETTING_TYPE_VALUES,
    "$.settingType",
  );
  const parseAuditFieldValue = (field, entry, entryPath) => {
    if (settingType === "PROFILE") {
      if (field === "companyName") {
        return parseString(entry, entryPath, { min: 1, max: 100 });
      }
      if (field === "companyNameKana") {
        return parseKana(entry, entryPath);
      }
      if (field === "zipcode") {
        return parseNullableString(entry, entryPath, { pattern: /^\d{7}$/ });
      }
      if (field === "prefCode") {
        return parseNullableString(entry, entryPath, {
          pattern: /^(0[1-9]|[1-3][0-9]|4[0-7])$/,
        });
      }
      if (field === "city") return parseNullableMax(entry, entryPath, 100);
      if (field === "address" || field === "building") {
        return parseNullableMax(entry, entryPath, 200);
      }
      return parseNullableString(entry, entryPath, {
        max: 32,
        pattern: CONTACT_ALLOWED,
      });
    }
    if (settingType === "BILLING") {
      if (/^(bankName|branchName|accountType|accountNumber|accountHolder)$/u.test(field)) {
        if (entry !== null && entry !== "***") {
          fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, entryPath);
        }
        return entry;
      }
      return parseNullableString(entry, entryPath, { pattern: /^\d{13}$/ });
    }
    if (field === "minuteInterval") {
      const parsed = parseInteger(entry, entryPath, { min: 5, max: 30 });
      if (parsed % 5 !== 0) {
        fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, entryPath);
      }
      return parsed;
    }
    if (field === "roundSetting") {
      return parseEnum(entry, ROUND_SETTING_VALUES, entryPath);
    }
    if (field === "firstDayOfWeek") {
      return parseInteger(entry, entryPath, { min: 0, max: 6 });
    }
    return parseEnum(entry, ATTENDANCE_SUMMARY_MODE_VALUES, entryPath);
  };
  const changes = value.changes.map((change, index) => {
    const path = `$.changes[${index}]`;
    assertPlainRecord(change, path);
    assertExactKeys(change, ["field", "before", "after"], path);
    const field = parseString(change.field, `${path}.field`, { min: 1, max: 128 });
    if (!AUDIT_FIELDS[settingType].includes(field)) {
      fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, `${path}.field`);
    }
    return {
      field,
      before: parseAuditFieldValue(field, change.before, `${path}.before`),
      after: parseAuditFieldValue(field, change.after, `${path}.after`),
    };
  });
  const fields = changes.map(({ field }) => field);
  if (new Set(fields).size !== fields.length) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.DUPLICATE_VALUE, "$.changes");
  }
  const sorted = [...fields].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  if (!fields.every((field, index) => field === sorted[index])) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.INVALID_VALUE, "$.changes");
  }
  const fromRevision = parseInteger(value.fromRevision, "$.fromRevision", { min: 1 });
  const toRevision = parseInteger(value.toRevision, "$.toRevision", { min: 2 });
  if (toRevision !== fromRevision + 1) {
    fail(COMPANY_CONFIGURATION_ERROR_CODES.CONFLICT, "$.toRevision");
  }
  return {
    schemaVersion: parseInteger(value.schemaVersion, "$.schemaVersion", { min: 1, max: 1 }),
    settingType,
    fromRevision,
    toRevision,
    actorUid: parseActorId(value.actorUid, "$.actorUid"),
    createdAt: parseTimestampLike(value.createdAt, "$.createdAt"),
    changes,
  };
};

const parseUpdateInput = (value, parser) => {
  assertPlainRecord(value, "$");
  assertExactKeys(value, CALLABLE_KEYS, "$");
  return {
    expectedRevision: parseInteger(value.expectedRevision, "$.expectedRevision", { min: 1 }),
    value: parser(value.value, "$.value"),
  };
};

export const parseUpdateCompanyProfileInputV1 = (value) =>
  parseUpdateInput(value, parseProfileBusiness);

export const parseUpdateCompanyBillingInputV1 = (value) =>
  parseUpdateInput(value, (business, path) =>
    parseBillingBusiness(business, path, { acceptInvoicePrefix: true }));

export const parseUpdateCompanyOperationsInputV1 = (value) =>
  parseUpdateInput(value, parseOperationsBusiness);

export const parseUpdateCompanyArrangementInputV1 = (value) => {
  assertPlainRecord(value, "$");
  assertExactKeys(value, ARRANGEMENT_CALLABLE_KEYS, "$");
  return {
    expectedRevision: parseInteger(value.expectedRevision, "$.expectedRevision", { min: 1 }),
    field: parseEnum(value.field, ["siteOrder", "scheduleOrder"], "$.field"),
    order: parseOrder(value.order, "$.order"),
  };
};

export const INTERNAL_DOCUMENT_PARSERS = Object.freeze({
  profile: parseProfileValue,
  billing: parseBillingValue,
  operations: parseOperationsValue,
  arrangement: parseArrangementValue,
  entitlement: parseEntitlementValue,
  maintenance: parseMaintenanceValue,
  privateEntitlement: parsePrivateEntitlementValue,
  privateMaintenance: parsePrivateMaintenanceValue,
});
