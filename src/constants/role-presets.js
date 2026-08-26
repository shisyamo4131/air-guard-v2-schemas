const createPreset = (label, description, icon, permissions) =>
  Object.freeze({
    label,
    description,
    icon,
    permissions: Object.freeze(permissions),
  });

export const IDS = Object.freeze([
  "manager",
  "controller",
  "accountant",
  "human-resource",
  "labor",
  "legal",
]);

export const VALUES = Object.freeze(
  Object.assign(Object.create(null), {
    manager: createPreset("統括", "統括管理", "mdi-hammer-wrench", [
      "customers:write",
      "sites:write",
      "employees:write",
      "users:provision",
      "users:write",
      "outsourcers:write",
      "site-operation-schedules:write",
      "operation-results:write",
      "billings:write",
    ]),
    controller: createPreset(
      "管制",
      "現場・スケジュール管理",
      "mdi-hammer-wrench",
      [
        "customers:read",
        "sites:write",
        "employees:read",
        "outsourcers:read",
        "site-operation-schedules:write",
        "operation-results:write",
      ],
    ),
    accountant: createPreset("経理", "請求・集計管理", "mdi-calculator", [
      "customers:read",
      "sites:read",
      "employees:read",
      "outsourcers:read",
      "operation-results:read",
      "operation-billings:write",
      "billings:write",
    ]),
    "human-resource": createPreset("人事", "人事管理", "mdi-account-tie", [
      "customers:read",
      "sites:read",
      "employees:write",
      "employees:terminate",
      "users:provision",
      "operation-results:read",
    ]),
    labor: createPreset("労務", "労務管理", "mdi-clipboard-account", [
      "customers:read",
      "sites:read",
      "employees:read",
      "operation-results:read",
    ]),
    legal: createPreset("法務", "契約管理", "mdi-gavel", [
      "customers:write",
      "sites:write",
      "employees:read",
    ]),
  }),
);

export const isRolePresetId = (value) =>
  typeof value === "string" &&
  Object.prototype.hasOwnProperty.call(VALUES, value);
