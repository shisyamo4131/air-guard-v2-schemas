import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import * as constants from "@shisyamo4131/air-guard-v2-schemas/constants";
import {
  ROLE_PRESETS,
  ROLE_PRESET_IDS,
  isRolePresetId,
} from "@shisyamo4131/air-guard-v2-schemas/constants";

const EXPECTED_IDS = [
  "manager",
  "controller",
  "accountant",
  "human-resource",
  "labor",
  "legal",
];

const EXPECTED_PRESETS = {
  manager: {
    label: "統括",
    description: "統括管理",
    icon: "mdi-hammer-wrench",
    permissions: [
      "customers:write",
      "sites:write",
      "employees:write",
      "users:provision",
      "users:write",
      "outsourcers:write",
      "site-operation-schedules:write",
      "operation-results:write",
      "billings:write",
    ],
  },
  controller: {
    label: "管制",
    description: "現場・スケジュール管理",
    icon: "mdi-hammer-wrench",
    permissions: [
      "customers:read",
      "sites:write",
      "employees:read",
      "outsourcers:read",
      "site-operation-schedules:write",
      "operation-results:write",
    ],
  },
  accountant: {
    label: "経理",
    description: "請求・集計管理",
    icon: "mdi-calculator",
    permissions: [
      "customers:read",
      "sites:read",
      "employees:read",
      "outsourcers:read",
      "operation-results:read",
      "operation-billings:write",
      "billings:write",
    ],
  },
  "human-resource": {
    label: "人事",
    description: "人事管理",
    icon: "mdi-account-tie",
    permissions: [
      "customers:read",
      "sites:read",
      "employees:write",
      "employees:terminate",
      "users:provision",
      "operation-results:read",
    ],
  },
  labor: {
    label: "労務",
    description: "労務管理",
    icon: "mdi-clipboard-account",
    permissions: [
      "customers:read",
      "sites:read",
      "employees:read",
      "operation-results:read",
    ],
  },
  legal: {
    label: "法務",
    description: "契約管理",
    icon: "mdi-gavel",
    permissions: ["customers:write", "sites:write", "employees:read"],
  },
};

test("public constants subpath exposes the exact role preset API", () => {
  assert.equal(constants.ROLE_PRESETS, ROLE_PRESETS);
  assert.equal(constants.ROLE_PRESET_IDS, ROLE_PRESET_IDS);
  assert.equal(constants.isRolePresetId, isRolePresetId);

  for (const internalName of ["VALUES", "IDS"]) {
    assert.equal(Object.hasOwn(constants, internalName), false);
  }

  for (const authorizationName of [
    "hasPresetPermission",
    "resolveRolePermissions",
    "evaluateRoleAuthorization",
  ]) {
    assert.equal(Object.hasOwn(constants, authorizationName), false);
  }
});

test("catalog exactly matches the accepted records and order", () => {
  assert.deepEqual(ROLE_PRESET_IDS, EXPECTED_IDS);
  assert.deepEqual(Object.keys(ROLE_PRESETS), EXPECTED_IDS);

  for (const id of EXPECTED_IDS) {
    assert.deepEqual(ROLE_PRESETS[id], EXPECTED_PRESETS[id]);
    assert.deepEqual(Object.keys(ROLE_PRESETS[id]), [
      "label",
      "description",
      "icon",
      "permissions",
    ]);
  }

  assert.equal(ROLE_PRESETS.manager.permissions.includes("users:provision"), true);
  assert.equal(ROLE_PRESETS.manager.permissions.includes("users:write"), true);
  assert.equal(
    ROLE_PRESETS["human-resource"].permissions.includes("users:provision"),
    true,
  );
  assert.equal(
    ROLE_PRESETS["human-resource"].permissions.includes(
      "employees:terminate",
    ),
    true,
  );
});

test("catalog data is non-empty, normalized, and unique", () => {
  for (const id of ROLE_PRESET_IDS) {
    const preset = ROLE_PRESETS[id];

    for (const field of ["label", "description", "icon"]) {
      assert.equal(typeof preset[field], "string");
      assert.notEqual(preset[field].trim(), "");
    }

    assert.equal(new Set(preset.permissions).size, preset.permissions.length);
    for (const permission of preset.permissions) {
      assert.equal(typeof permission, "string");
      assert.notEqual(permission, "");
      assert.equal(permission, permission.trim());
    }
  }
});

test("catalog and all nested contract values are frozen", () => {
  assert.equal(Object.getPrototypeOf(ROLE_PRESETS), null);
  assert.equal(Object.isFrozen(ROLE_PRESET_IDS), true);
  assert.equal(Object.isFrozen(ROLE_PRESETS), true);

  for (const id of ROLE_PRESET_IDS) {
    assert.equal(Object.isFrozen(ROLE_PRESETS[id]), true);
    assert.equal(Object.isFrozen(ROLE_PRESETS[id].permissions), true);
  }

  const originalIds = [...ROLE_PRESET_IDS];
  const originalManager = {
    ...ROLE_PRESETS.manager,
    permissions: [...ROLE_PRESETS.manager.permissions],
  };

  assert.throws(() => ROLE_PRESET_IDS.push("unknown"), TypeError);
  assert.throws(() => {
    ROLE_PRESET_IDS[0] = "unknown";
  }, TypeError);
  assert.throws(() => {
    ROLE_PRESETS.unknown = ROLE_PRESETS.manager;
  }, TypeError);
  assert.throws(() => {
    delete ROLE_PRESETS.manager;
  }, TypeError);
  assert.throws(() => {
    ROLE_PRESETS.manager.label = "changed";
  }, TypeError);
  assert.throws(
    () => ROLE_PRESETS.manager.permissions.push("unknown:write"),
    TypeError,
  );

  assert.deepEqual(ROLE_PRESET_IDS, originalIds);
  assert.deepEqual(ROLE_PRESETS.manager, originalManager);
  assert.equal(Object.hasOwn(ROLE_PRESETS, "unknown"), false);
});

test("membership validation is string-only and prototype-safe", () => {
  for (const id of EXPECTED_IDS) {
    assert.equal(isRolePresetId(id), true);
  }

  for (const value of [
    "unknown",
    "",
    "toString",
    "constructor",
    "__proto__",
    null,
    undefined,
    0,
    {},
    [],
    Symbol("manager"),
  ]) {
    assert.equal(isRolePresetId(value), false);
  }
});

test("implementation has no runtime import or authorization helper", async () => {
  const source = await readFile(
    new URL("./src/constants/role-presets.js", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /^\s*import\s/m);
  assert.doesNotMatch(source, /vue|vuetify|firebase/i);
  assert.doesNotMatch(source, /hasPresetPermission|resolveRolePermissions/);
});
