import { COMPANY_CONFIGURATION_ERROR_CODES } from "./constants.js";
import { INTERNAL_DOCUMENT_PARSERS } from "./documents.js";
import {
  CompanyConfigurationValidationError,
  assertAllowedKeys,
  assertExactKeys,
  assertPlainRecord,
  fail,
  parseActorId,
  parseTimestampLike,
} from "./validation.js";

const LEGACY_KEYS = Object.freeze([
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
  "docId",
  "uid",
  "createdAt",
  "updatedAt",
  "fullAddress",
  "prefecture",
  "hasBankInfo",
  "isCompleteRequiredFields",
  "geopoint",
]);

const nullIfEmpty = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const normalizeOrder = (value) => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return value;
  return value.map((item) =>
    item !== null && typeof item === "object"
      ? { siteId: item.siteId, shiftType: item.shiftType }
      : item,
  );
};

const conflict = (path) => ({
  ok: false,
  conflict: Object.freeze({
    code: COMPANY_CONFIGURATION_ERROR_CODES.CONFLICT,
    path,
  }),
});

export const mapLegacyCompanyToConfigurationV1 = (
  legacy,
  options,
) => {
  try {
    assertPlainRecord(legacy, "$");
    assertAllowedKeys(legacy, LEGACY_KEYS, "$");
    assertPlainRecord(options, "$.options");
    assertExactKeys(options, ["actorUid", "timestamp"], "$.options");
    const { actorUid, timestamp } = options;
    const actor = parseActorId(actorUid, "$.actorUid");
    const at = parseTimestampLike(timestamp, "$.timestamp");
    const hasMaintenanceDetail = [
      legacy.maintenanceReason,
      legacy.maintenanceStartAt,
      legacy.maintenanceStartedBy,
    ].some((value) => value !== undefined && value !== null && value !== "");
    if (legacy.maintenanceMode === true || hasMaintenanceDetail) {
      return conflict("$.maintenanceMode");
    }
    if (legacy.maintenanceMode !== undefined && legacy.maintenanceMode !== false) {
      return conflict("$.maintenanceMode");
    }
    const attendanceSummaryMode =
      legacy.attendanceManagementMode === undefined ||
      legacy.attendanceManagementMode === null ||
      legacy.attendanceManagementMode === ""
        ? "LABOR_STANDARD"
        : legacy.attendanceManagementMode === "ACTUAL_DATE"
          ? "LABOR_STANDARD"
          : legacy.attendanceManagementMode === "OPERATION_DATE"
            ? "OPERATION_COUNT"
            : fail(COMPANY_CONFIGURATION_ERROR_CODES.CONFLICT, "$.attendanceManagementMode");
    const metadata = {
      schemaVersion: 1,
      revision: 1,
      createdAt: at,
      createdBy: actor,
      updatedAt: at,
      updatedBy: actor,
    };
    const bankValues = [
      legacy.bankName,
      legacy.branchName,
      legacy.accountType,
      legacy.accountNumber,
      legacy.accountHolder,
    ].map(nullIfEmpty);
    const hasLegacyOrdinaryDefaultOnly =
      bankValues[2] === "普通" &&
      [bankValues[0], bankValues[1], bankValues[3], bankValues[4]].every(
        (value) => value === null,
      );
    if (hasLegacyOrdinaryDefaultOnly) {
      bankValues[2] = null;
    }
    const allBankNull = bankValues.every((value) => value === null);
    if (!allBankNull && bankValues.some((value) => value === null)) {
      return conflict("$.bankAccount");
    }
    const profile = INTERNAL_DOCUMENT_PARSERS.profile({
      ...metadata,
      companyName: legacy.companyName,
      companyNameKana: legacy.companyNameKana,
      zipcode: nullIfEmpty(legacy.zipcode),
      prefCode: nullIfEmpty(legacy.prefCode),
      city: nullIfEmpty(legacy.city),
      address: nullIfEmpty(legacy.address),
      building: nullIfEmpty(legacy.building),
      tel: nullIfEmpty(legacy.tel),
      fax: nullIfEmpty(legacy.fax),
    });
    const invoice = nullIfEmpty(legacy.invoiceNumber);
    const billing = INTERNAL_DOCUMENT_PARSERS.billing({
      ...metadata,
      invoiceNumber:
        typeof invoice === "string"
          ? invoice.trim().replace(/^[Tt]/u, "")
          : invoice,
      bankName: bankValues[0],
      branchName: bankValues[1],
      accountType: bankValues[2],
      accountNumber: bankValues[3],
      accountHolder: bankValues[4],
    });
    const operations = INTERNAL_DOCUMENT_PARSERS.operations({
      ...metadata,
      minuteInterval: legacy.minuteInterval ?? 15,
      roundSetting: nullIfEmpty(legacy.roundSetting) ?? "ROUND",
      firstDayOfWeek: legacy.firstDayOfWeek ?? 0,
      attendanceSummaryMode,
    });
    const arrangement = INTERNAL_DOCUMENT_PARSERS.arrangement({
      ...metadata,
      siteOrder: normalizeOrder(legacy.siteOrder),
      scheduleOrder: normalizeOrder(legacy.scheduleOrder),
    });
    const entitlement = INTERNAL_DOCUMENT_PARSERS.entitlement({
      ...metadata,
      entitlementState: "DISABLED",
      planCode: null,
      featureCodes: [],
      employeeLimit: null,
    });
    const maintenance = INTERNAL_DOCUMENT_PARSERS.maintenance({
      ...metadata,
      maintenanceMode: false,
      maintenanceReason: null,
      maintenanceStartAt: null,
    });
    const privateEntitlement = INTERNAL_DOCUMENT_PARSERS.privateEntitlement({
      ...metadata,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
      currentPeriodEnd: null,
    });
    const privateMaintenance = INTERNAL_DOCUMENT_PARSERS.privateMaintenance({
      ...metadata,
      maintenanceMode: false,
      internalReason: null,
      scope: [],
      maintenanceStartAt: null,
      maintenanceStartedBy: null,
      operationId: null,
      lastErrorCode: null,
      lastErrorAt: null,
    });
    return {
      ok: true,
      value: {
        root: {
          schemaVersion: 1,
          configurationState: "CCB_V1_ACTIVE",
          status: "ACTIVE",
          createdAt: at,
          createdBy: actor,
          updatedAt: at,
          updatedBy: actor,
        },
        profile,
        billing,
        operations,
        arrangement,
        entitlement,
        maintenance,
        privateEntitlement,
        privateMaintenance,
      },
    };
  } catch (error) {
    if (error instanceof CompanyConfigurationValidationError) {
      return conflict(error.path);
    }
    throw error;
  }
};
