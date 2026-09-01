import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import * as contract from "@shisyamo4131/air-guard-v2-schemas/company-configuration";

const timestamp = Object.freeze({ seconds: 1_700_000_000, nanoseconds: 123_000_000 });
const metadata = () => ({
  schemaVersion: 1,
  revision: 1,
  createdAt: timestamp,
  createdBy: "actor-1",
  updatedAt: timestamp,
  updatedBy: "actor-1",
});

const profile = () => ({
  ...metadata(),
  companyName: "株式会社エアガード",
  companyNameKana: "エアガード　１２３",
  zipcode: "1234567",
  prefCode: "13",
  city: "千代田区",
  address: "丸の内1-1",
  building: null,
  tel: "03-1234-5678",
  fax: null,
});

const billing = () => ({
  ...metadata(),
  invoiceNumber: "1234567890123",
  bankName: "テスト銀行",
  branchName: "本店",
  accountType: "普通",
  accountNumber: "1234567",
  accountHolder: "エアガード",
});

const operations = () => ({
  ...metadata(),
  minuteInterval: 15,
  roundSetting: "ROUND",
  firstDayOfWeek: 0,
  attendanceSummaryMode: "LABOR_STANDARD",
});

const arrangement = () => ({
  ...metadata(),
  siteOrder: [{ siteId: "site-1", shiftType: "DAY" }],
  scheduleOrder: [{ siteId: "site-1", shiftType: "NIGHT" }],
});

const expectError = (callback, code, path) => {
  assert.throws(callback, (error) => {
    assert.equal(error.name, "CompanyConfigurationValidationError");
    assert.equal(error.code, code);
    assert.equal(error.path, path);
    assert.equal(error.message, `${code} at ${path}`);
    return true;
  });
};

test("public subpath exposes the exact pure contract without root re-export", async () => {
  const names = Object.keys(contract).sort();
  assert.deepEqual(names, [
    "ATTENDANCE_SUMMARY_MODE_VALUES",
    "COMPANY_CONFIGURATION_ERROR_CODES",
    "COMPANY_CONFIGURATION_SCHEMA_VERSION",
    "COMPANY_CONFIGURATION_STATE",
    "COMPANY_SETTING_TYPE_VALUES",
    "COMPANY_STATUS_VALUES",
    "CompanyConfigurationValidationError",
    "ROUND_SETTING_VALUES",
    "SHIFT_TYPE_VALUES",
    "assertCompanyMaintenancePairV1",
    "isTimestampLike",
    "parseCompanyArrangementV1",
    "parseCompanyBillingV1",
    "parseCompanyMaintenanceV1",
    "parseCompanyOperationsV1",
    "parseCompanyPrivateMaintenanceV1",
    "parseCompanyProfileV1",
    "parseCompanyRootProjectionV1",
    "parseCompanyRootV1",
    "parseCompanySettingAuditV1",
    "parseUpdateCompanyArrangementInputV1",
    "parseUpdateCompanyBillingInputV1",
    "parseUpdateCompanyOperationsInputV1",
    "parseUpdateCompanyProfileInputV1",
  ].sort());
  const root = await import("@shisyamo4131/air-guard-v2-schemas");
  assert.equal(Object.hasOwn(root, "parseCompanyRootV1"), false);
  for (const removedName of [
    "mapLegacyCompanyToConfigurationV1",
    "parseCompanyEntitlementV1",
    "parseCompanyPrivateEntitlementV1",
  ]) {
    assert.equal(Object.hasOwn(contract, removedName), false);
  }
  assert.equal(contract.COMPANY_CONFIGURATION_SCHEMA_VERSION, 1);
  assert.equal(contract.COMPANY_CONFIGURATION_STATE, "CCB_V1_ACTIVE");
  for (const value of [
    contract.COMPANY_STATUS_VALUES,
    contract.ROUND_SETTING_VALUES,
    contract.ATTENDANCE_SUMMARY_MODE_VALUES,
    contract.SHIFT_TYPE_VALUES,
    contract.COMPANY_SETTING_TYPE_VALUES,
    contract.COMPANY_CONFIGURATION_ERROR_CODES,
  ]) {
    assert.equal(Object.isFrozen(value), true);
  }
});

test("TimestampLike is structural and retained without Firebase identity", () => {
  assert.equal(contract.isTimestampLike(timestamp), true);
  assert.equal(contract.isTimestampLike({ seconds: 1, nanoseconds: 1_000_000_000 }), false);
  assert.equal(contract.isTimestampLike(new Date()), false);
  class AdapterTimestamp {
    constructor(seconds, nanoseconds) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
  }
  assert.equal(contract.isTimestampLike(new AdapterTimestamp(1, 2)), true);
  const parsed = contract.parseCompanyRootV1({
    schemaVersion: 1,
    configurationState: "CCB_V1_ACTIVE",
    status: "ACTIVE",
    createdAt: timestamp,
    createdBy: "actor-1",
    updatedAt: timestamp,
    updatedBy: "actor-1",
  });
  assert.equal(parsed.createdAt, timestamp);
  expectError(
    () => contract.parseCompanyRootV1({ ...parsed, extra: true }),
    "UNKNOWN_FIELD",
    "$.extra",
  );
  assert.deepEqual(
    contract.parseCompanyRootProjectionV1({
      ...parsed,
      companyName: "legacy",
      docId: "company-1",
      uid: "company-1",
      fullAddress: "legacy computed address",
      prefecture: "東京都",
      hasBankInfo: false,
      isCompleteRequiredFields: true,
      stripeCustomerId: "cus_legacy",
      subscription: { employeeLimit: 99 },
    }),
    parsed,
  );
  for (const field of [
    "docId",
    "uid",
    "fullAddress",
    "prefecture",
    "hasBankInfo",
    "isCompleteRequiredFields",
    "stripeCustomerId",
    "subscription",
  ]) {
    expectError(
      () => contract.parseCompanyRootV1({ ...parsed, [field]: "legacy" }),
      "UNKNOWN_FIELD",
      `$.${field}`,
    );
  }
  expectError(
    () => contract.parseCompanyRootProjectionV1({ ...parsed, unknownPhysicalField: true }),
    "UNKNOWN_FIELD",
    "$.unknownPhysicalField",
  );
});

test("profile enforces exact keys, UEGC lengths, kana and contact constraints", () => {
  assert.deepEqual(contract.parseCompanyProfileV1(profile()), profile());
  assert.equal(contract.parseCompanyProfileV1({
    ...profile(),
    companyNameKana: "カ\u3099",
  }).companyNameKana, "カ\u3099");
  expectError(
    () => contract.parseCompanyProfileV1({ ...profile(), companyNameKana: "か\u3099" }),
    "INVALID_VALUE",
    "$.companyNameKana",
  );
  expectError(
    () => contract.parseCompanyProfileV1({ ...profile(), tel: "03/1234" }),
    "INVALID_VALUE",
    "$.tel",
  );
  const secret = "do-not-echo";
  assert.throws(
    () => contract.parseCompanyProfileV1({ ...profile(), companyName: `${secret}\n` }),
    (error) => !error.message.includes(secret),
  );
});

test("billing, operations and arrangement enforce correlation, enums and uniqueness", () => {
  assert.deepEqual(contract.parseCompanyBillingV1(billing()), billing());
  const emptyBank = {
    ...billing(),
    bankName: null,
    branchName: null,
    accountType: null,
    accountNumber: null,
    accountHolder: null,
  };
  assert.deepEqual(contract.parseCompanyBillingV1(emptyBank), emptyBank);
  expectError(
    () => contract.parseCompanyBillingV1({ ...emptyBank, bankName: "銀行" }),
    "CONFLICT",
    "$.bankAccount",
  );
  assert.deepEqual(contract.parseCompanyOperationsV1(operations()), operations());
  expectError(
    () => contract.parseCompanyOperationsV1({ ...operations(), minuteInterval: 7 }),
    "INVALID_VALUE",
    "$.minuteInterval",
  );
  assert.deepEqual(contract.parseCompanyArrangementV1(arrangement()), arrangement());
  expectError(
    () => contract.parseCompanyArrangementV1({
      ...arrangement(),
      siteOrder: [
        { siteId: "site-1", shiftType: "DAY" },
        { siteId: "site-1", shiftType: "DAY" },
      ],
    }),
    "DUPLICATE_VALUE",
    "$.siteOrder[1]",
  );
});

test("maintenance public/private documents remain correlated", () => {
  const maintenance = {
    ...metadata(),
    maintenanceMode: true,
    maintenanceReason: "planned",
    maintenanceStartAt: timestamp,
  };
  const privateMaintenance = {
    ...metadata(),
    maintenanceMode: true,
    internalReason: "operator work",
    scope: ["company-settings"],
    maintenanceStartAt: timestamp,
    maintenanceStartedBy: "actor-1",
    operationId: null,
    lastErrorCode: null,
    lastErrorAt: null,
  };
  assert.deepEqual(
    contract.assertCompanyMaintenancePairV1(maintenance, privateMaintenance),
    { maintenance, privateMaintenance },
  );
  expectError(
    () => contract.assertCompanyMaintenancePairV1(
      {
        ...metadata(),
        maintenanceMode: false,
        maintenanceReason: null,
        maintenanceStartAt: null,
      },
      privateMaintenance,
    ),
    "CONFLICT",
    "$.maintenance",
  );
});

test("audit documents require ordered unique fields and masked bank values", () => {
  const audit = {
    schemaVersion: 1,
    settingType: "BILLING",
    fromRevision: 1,
    toRevision: 2,
    actorUid: "actor-1",
    createdAt: timestamp,
    changes: [
      { field: "accountNumber", before: "***", after: "***" },
      { field: "invoiceNumber", before: null, after: "1234567890123" },
    ],
  };
  assert.deepEqual(contract.parseCompanySettingAuditV1(audit), audit);
  expectError(
    () => contract.parseCompanySettingAuditV1({
      ...audit,
      changes: [{ field: "accountNumber", before: "1234567", after: "***" }],
    }),
    "INVALID_VALUE",
    "$.changes[0].before",
  );
  expectError(
    () => contract.parseCompanySettingAuditV1({ ...audit, changes: [...audit.changes].reverse() }),
    "INVALID_VALUE",
    "$.changes",
  );
});

test("callable inputs accept only expectedRevision and the exact value document", () => {
  const { schemaVersion, revision, createdAt, createdBy, updatedAt, updatedBy, ...business } =
    operations();
  assert.equal(schemaVersion + revision + createdAt.seconds + updatedAt.seconds > 0, true);
  assert.equal(createdBy, updatedBy);
  const input = { expectedRevision: 2, value: business };
  assert.deepEqual(contract.parseUpdateCompanyOperationsInputV1(input), input);
  expectError(
    () => contract.parseUpdateCompanyOperationsInputV1({ ...input, companyId: "company-1" }),
    "UNKNOWN_FIELD",
    "$.companyId",
  );
  const arrangementInput = {
    expectedRevision: 2,
    field: "siteOrder",
    order: [{ key: undefined, siteId: "site-1", shiftType: "DAY" }],
  };
  expectError(
    () => contract.parseUpdateCompanyArrangementInputV1(arrangementInput),
    "UNKNOWN_FIELD",
    "$.order[0].key",
  );
  assert.deepEqual(contract.parseUpdateCompanyArrangementInputV1({
    expectedRevision: 2,
    field: "siteOrder",
    order: [{ siteId: "site-1", shiftType: "DAY" }],
  }), {
    expectedRevision: 2,
    field: "siteOrder",
    order: [{ siteId: "site-1", shiftType: "DAY" }],
  });
});

test("company-configuration source has no Firebase, AirFirebase, Vue, Vuetify or FireModel dependency", () => {
  assert.equal(
    fs.existsSync(new URL("./src/company-configuration/legacy.js", import.meta.url)),
    false,
  );
  for (const file of ["constants.js", "validation.js", "documents.js", "index.js"]) {
    const source = fs.readFileSync(new URL(`./src/company-configuration/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /firebase|air-firebase|vue|vuetify|FireModel/iu);
  }
});
